import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { isDeepStrictEqual } from 'node:util';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {
  readHermesSessionEvidence,
  verifyAstraSession,
} from './lib/session-evidence.mjs';

function parseRoot(argv) {
  const index = argv.indexOf('--root');
  return index >= 0 ? path.resolve(argv[index + 1]) : process.cwd();
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function formatErrors(label, errors = []) {
  return errors
    .map((error) => `${label}${error.instancePath || '/'} ${error.message}`)
    .join('\n');
}

async function existingResearchFiles(root, fileName) {
  const runsRoot = path.join(root, 'research', 'runs');

  async function findFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => findFiles(path.join(directory, entry.name))),
    );
    const files = entries
      .filter((entry) => entry.isFile() && entry.name === fileName)
      .map((entry) => path.join(directory, entry.name));
    return [...files, ...nested.flat()];
  }

  try {
    return await findFiles(runsRoot);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function assertExists(root, relativePath, label) {
  const absolutePath = path.resolve(root, relativePath);
  const relative = path.relative(root, absolutePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} escapes the project root: ${relativePath}`);
  }
  await access(absolutePath);
  return absolutePath;
}

function assertUnique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

async function main() {
  const root = parseRoot(process.argv.slice(2));
  const schemaRoot = path.join(root, 'research', 'schemas');
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const assetSchema = await readJson(path.join(schemaRoot, 'asset-manifest.schema.json'));
  const runSchema = await readJson(path.join(schemaRoot, 'run.schema.json'));
  const geometrySchema = await readJson(path.join(schemaRoot, 'geometry-report.schema.json'));
  const validateAssets = ajv.compile(assetSchema);
  const validateRun = ajv.compile(runSchema);
  const validateGeometry = ajv.compile(geometrySchema);

  const manifest = await readJson(path.join(root, 'research', 'asset-manifest.json'));
  if (!validateAssets(manifest)) {
    throw new Error(formatErrors('asset-manifest', validateAssets.errors));
  }

  assertUnique(
    manifest.assets.map((asset) => asset.id),
    'asset ID',
  );
  const assetIds = new Set(manifest.assets.map((asset) => asset.id));
  const assetsById = new Map(manifest.assets.map((asset) => [asset.id, asset]));

  for (const asset of manifest.assets) {
    if (asset.status === 'available') {
      const assetPath = await assertExists(root, asset.localPath, `asset ${asset.id}`);
      const metadata = await stat(assetPath);
      if (metadata.size !== asset.bytes) {
        throw new Error(
          `Asset ${asset.id} byte count mismatch: expected ${asset.bytes}, got ${metadata.size}`,
        );
      }
      const digest = createHash('sha256')
        .update(await readFile(assetPath))
        .digest('hex');
      if (digest !== asset.sha256) {
        throw new Error(
          `Asset ${asset.id} SHA-256 mismatch: expected ${asset.sha256}, got ${digest}`,
        );
      }
    }
  }

  const geometryFiles = await existingResearchFiles(root, 'geometry-report.json');
  for (const geometryFile of geometryFiles) {
    const report = await readJson(geometryFile);
    if (!validateGeometry(report)) {
      throw new Error(
        formatErrors(path.relative(root, geometryFile), validateGeometry.errors),
      );
    }
    if (!assetsById.has(report.assetId)) {
      throw new Error(
        `Geometry report ${report.id} references unknown asset: ${report.assetId}`,
      );
    }
    const asset = assetsById.get(report.assetId);
    if (report.sourcePath !== asset.localPath) {
      throw new Error(
        `Geometry report ${report.id} sourcePath does not match manifest asset ${asset.id}`,
      );
    }
    if (report.bytes !== asset.bytes) {
      throw new Error(
        `Geometry report ${report.id} bytes do not match manifest asset ${asset.id}`,
      );
    }
    if (report.sha256 !== asset.sha256) {
      throw new Error(
        `Geometry report ${report.id} SHA-256 does not match manifest asset ${asset.id}`,
      );
    }
    if (asset.status !== 'available') {
      throw new Error(`Geometry report ${report.id} requires an available manifest asset`);
    }
    const regenerated = spawnSync(
      process.execPath,
      [
        path.join(import.meta.dirname, 'report-geometry.mjs'),
        '--asset-id',
        report.assetId,
        '--role',
        report.role,
        report.sourcePath,
      ],
      { cwd: root, encoding: 'utf8' },
    );
    if (regenerated.status !== 0) {
      throw new Error(
        `Geometry report ${report.id} could not be regenerated: ${regenerated.stderr.trim()}`,
      );
    }
    let measuredReport;
    try {
      measuredReport = JSON.parse(regenerated.stdout);
    } catch {
      throw new Error(`Geometry report ${report.id} regeneration returned invalid JSON`);
    }
    if (!isDeepStrictEqual(report, measuredReport)) {
      throw new Error(
        `Geometry report ${report.id} measured values do not match the pinned asset`,
      );
    }
  }

  const runFiles = await existingResearchFiles(root, 'run.json');
  const runIds = [];
  for (const runFile of runFiles) {
    const run = await readJson(runFile);
    if (!validateRun(run)) {
      throw new Error(formatErrors(path.relative(root, runFile), validateRun.errors));
    }
    if (path.basename(path.dirname(runFile)) !== run.id) {
      throw new Error(
        `Run directory must match run ID: ${path.basename(path.dirname(runFile))} != ${run.id}`,
      );
    }
    runIds.push(run.id);
    for (const inputAsset of run.inputAssets) {
      if (!assetIds.has(inputAsset)) {
        throw new Error(`Run ${run.id} references unknown input asset: ${inputAsset}`);
      }
    }
    const startedAt = Date.parse(run.startedAt);
    const endedAt = Date.parse(run.endedAt);
    if (endedAt < startedAt) {
      throw new Error(`Run ${run.id} endedAt is before startedAt`);
    }
    const expectedElapsed = (endedAt - startedAt) / 1000;
    if (Math.abs(expectedElapsed - run.elapsedSeconds) > 1) {
      throw new Error(
        `Run ${run.id} elapsedSeconds mismatch: expected ${expectedElapsed}, got ${run.elapsedSeconds}`,
      );
    }
    const astraLanes = ['astra_authored', 'astra_orchestrated_external'];
    const claimsAstra =
      run.model === 'gpt-6-astra' ||
      astraLanes.includes(run.provenance.lane) ||
      run.provenance.outputs.some((output) =>
        astraLanes.includes(output.lane),
      );
    if (claimsAstra) {
      if (!run.sessionEvidence) {
        throw new Error(`Run ${run.id} is missing persisted Astra session evidence`);
      }
      const evidence = await readHermesSessionEvidence(root, run.sessionEvidence);
      if (!evidence.valid) {
        throw new Error(`Run ${run.id} session evidence invalid: ${evidence.reason}`);
      }
      if (!verifyAstraSession(run, run.sessionEvidence, evidence.session)) {
        throw new Error(`Run ${run.id} Astra session evidence does not match model/provider/session`);
      }
    }

    await assertExists(root, run.promptPath, `run ${run.id} prompt`);
    await access(path.join(path.dirname(runFile), 'notes.md'));
    const provenanceByPath = new Map(
      run.provenance.outputs.map((output) => [output.path, output]),
    );
    for (const outputPath of run.outputPaths) {
      await assertExists(root, outputPath, `run ${run.id} output`);
      if (!provenanceByPath.has(outputPath)) {
        throw new Error(`Run ${run.id} output is missing provenance: ${outputPath}`);
      }
    }
    for (const output of run.provenance.outputs) {
      if (!run.outputPaths.includes(output.path)) {
        throw new Error(`Run ${run.id} provenance references undeclared output: ${output.path}`);
      }
      for (const sourceAsset of output.sourceAssets) {
        if (!assetIds.has(sourceAsset)) {
          throw new Error(
            `Run ${run.id} output ${output.path} references unknown source asset: ${sourceAsset}`,
          );
        }
      }
    }
  }
  assertUnique(runIds, 'run ID');

  console.log(`Research validation passed: ${manifest.assets.length} assets, ${runFiles.length} runs`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
