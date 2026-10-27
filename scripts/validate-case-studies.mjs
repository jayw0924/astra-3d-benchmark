import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

export async function validateCaseStudies(root) {
  root = await realpath(root);
  const schema = await readJson(path.join(root, 'research/schemas/case-studies.schema.json'));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validateIndex = ajv.compile(schema);
  const validateIntake = ajv.getSchema(`${schema.$id}#/$defs/intake`);
  const registry = await readJson(path.join(root, 'research/case-studies/index.json'));
  function check(validate, value, label) {
    if (!validate(value)) throw new Error(`${label}: ${ajv.errorsText(validate.errors)}`);
  }
  check(validateIndex, registry, 'case index');
  const manifest = await readJson(path.join(root, 'research/asset-manifest.json'));
  const assets = new Set(manifest.assets.map((asset) => asset.id));
  const seen = new Set();
  async function containedFile(relative, prefix) {
    if (!relative.startsWith(prefix) || relative.includes('\\') || relative.split('/').includes('..')) {
      throw new Error(`Invalid reference path: ${relative}`);
    }
    const file = await realpath(path.resolve(root, relative));
    const scope = path.join(root, prefix);
    const rel = path.relative(scope, file);
    if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error(`Reference escapes scope: ${relative}`);
    if (!(await stat(file)).isFile()) throw new Error(`Reference is not a file: ${relative}`);
    return file;
  }
  for (const entry of registry.cases) {
    if (seen.has(entry.id)) throw new Error(`Duplicate case ID: ${entry.id}`);
    seen.add(entry.id);
    await containedFile(entry.overviewPath, `research/case-studies/${entry.id}/`);
    for (const id of entry.assetIds) {
      if (!assets.has(id)) throw new Error(`Unknown asset ID: ${id}`);
    }
    for (const id of entry.runIds) {
      const run = await readJson(await containedFile(`research/runs/${id}/run.json`, 'research/runs/'));
      if (run.id !== id) throw new Error(`Run ID mismatch: ${id}`);
    }
    if (entry.intakePath) {
      const intake = await readJson(await containedFile(entry.intakePath, `research/case-studies/${entry.id}/`));
      check(validateIntake, intake, 'intake');
      if (intake.caseId !== entry.id || intake.status !== entry.status) throw new Error('Intake case/status mismatch');
    }
  }
  return { caseCount: registry.cases.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const index = process.argv.indexOf('--root');
  validateCaseStudies(index >= 0 ? process.argv[index + 1] : process.cwd())
    .then(({ caseCount }) => console.log(`Validated ${caseCount} case studies (index/intake only; not evidence acceptance)`))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}
