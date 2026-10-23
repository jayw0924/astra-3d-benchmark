import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import validator from 'gltf-validator';

const root = path.resolve(import.meta.dirname, '../../..');
const runRoot = import.meta.dirname;
const scratchRoot = path.join(root, '.cache', 'geometry-preflight');
const sourcePath = 'public/assets/models/product-estuary.glb';
const passA = '.cache/geometry-preflight/pass-a.glb';
const passB = '.cache/geometry-preflight/pass-b.glb';
const reportPath = '.cache/geometry-preflight/geometry-report.json';
const env = {
  ...process.env,
  PLAYWRIGHT_BROWSERS_PATH: path.join(root, '.cache', 'ms-playwright'),
  npm_config_cache: path.join(root, '.cache', 'npm'),
};
const commands = [];

function run(argv, { expectedExitCode = 0, stdoutPath } = {}) {
  const startedAt = new Date();
  const result = spawnSync(argv[0], argv.slice(1), {
    cwd: root,
    encoding: 'utf8',
    env,
    maxBuffer: 20 * 1024 * 1024,
  });
  const endedAt = new Date();
  const record = {
    argv,
    cwd: root,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    elapsedSeconds: (endedAt - startedAt) / 1000,
    exitCode: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
  commands.push(record);
  if (result.status !== expectedExitCode) {
    throw new Error(`${argv.join(' ')} exited ${result.status}: ${result.stderr}`);
  }
  if (stdoutPath) return writeFile(path.join(root, stdoutPath), result.stdout).then(() => record);
  return record;
}

function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

await rm(scratchRoot, { recursive: true, force: true });
await mkdir(scratchRoot, { recursive: true });

run(['npx', 'playwright', 'install', 'chromium']);
run(['node', '--test', 'scripts/geometry-toolchain.test.mjs']);
run([
  './node_modules/.bin/gltf-transform',
  'simplify',
  sourcePath,
  passA,
  '--ratio',
  '0.95',
  '--error',
  '0.001',
  '--lock-border',
  'true',
]);
run([
  './node_modules/.bin/gltf-transform',
  'simplify',
  sourcePath,
  passB,
  '--ratio',
  '0.95',
  '--error',
  '0.001',
  '--lock-border',
  'true',
]);
await run([
  'node',
  'scripts/report-geometry.mjs',
  '--asset-id',
  'preflight-scratch',
  '--role',
  'safe-webgl',
  passA,
], { stdoutPath: reportPath });
const browserCommand = run([
  'node',
  'research/runs/2026-10-21-sol-geometry-toolchain-preflight/browser-probe.mjs',
]);
const productionAuditCommand = run(
  ['npm', 'audit', '--omit=dev', '--json'],
);
const developmentAuditCommand = run(
  ['npm', 'audit', '--json'],
  { expectedExitCode: 1 },
);

const [sourceBytes, passABytes, passBBytes, geometryReport] = await Promise.all([
  readFile(path.join(root, sourcePath)),
  readFile(path.join(root, passA)),
  readFile(path.join(root, passB)),
  readFile(path.join(root, reportPath), 'utf8').then(JSON.parse),
]);
const validatorReport = await validator.validateBytes(new Uint8Array(passABytes), {
  uri: passA,
  writeTimestamp: false,
  maxIssues: 0,
});
const browser = JSON.parse(browserCommand.stdout);
const productionAudit = JSON.parse(productionAuditCommand.stdout);
const developmentAudit = JSON.parse(developmentAuditCommand.stdout);
const verification = {
  source: {
    path: sourcePath,
    bytes: (await stat(path.join(root, sourcePath))).size,
    sha256: digest(sourceBytes),
  },
  scratch: {
    deterministicExactBytes: Buffer.compare(passABytes, passBBytes) === 0,
    bytes: passABytes.length,
    sha256: digest(passABytes),
    geometry: geometryReport.counts,
    variants: geometryReport.variants,
    forbiddenNodesPresent: geometryReport.checks.forbiddenNodesPresent,
  },
  browser,
  validator: {
    version: validator.version(),
    numErrors: validatorReport.issues.numErrors,
    numWarnings: validatorReport.issues.numWarnings,
    numInfos: validatorReport.issues.numInfos,
    issueCodes: [...new Set(validatorReport.issues.messages.map(({ code }) => code))],
  },
  productionAudit: {
    exitCode: productionAuditCommand.exitCode,
    vulnerabilities: productionAudit.metadata.vulnerabilities,
  },
  developmentAudit: {
    exitCode: developmentAuditCommand.exitCode,
    vulnerabilities: developmentAudit.metadata.vulnerabilities,
  },
};
await Promise.all([
  writeFile(path.join(runRoot, 'commands.json'), `${JSON.stringify(commands, null, 2)}\n`),
  writeFile(path.join(runRoot, 'verification.json'), `${JSON.stringify(verification, null, 2)}\n`),
]);
process.stdout.write(`${JSON.stringify(verification, null, 2)}\n`);
