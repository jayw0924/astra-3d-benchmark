import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');

async function createRoot(prefix = 'astra-research-') {
  const root = await mkdtemp(path.join(tmpdir(), prefix));
  await mkdir(path.join(root, 'research', 'schemas'), { recursive: true });
  await mkdir(path.join(root, 'research', 'runs'), { recursive: true });
  for (const name of ['asset-manifest.schema.json', 'run.schema.json']) {
    const source = await readFile(
      path.join(projectRoot, 'research', 'schemas', name),
      'utf8',
    );
    await writeFile(path.join(root, 'research', 'schemas', name), source);
  }
  return root;
}

function validate(root) {
  return spawnSync(
    process.execPath,
    [path.join(projectRoot, 'scripts', 'validate-research.mjs'), '--root', root],
    { encoding: 'utf8' },
  );
}

function asset(overrides = {}) {
  return {
    id: 'asset-one',
    title: 'Asset one',
    kind: 'model',
    sourceUrl: 'https://example.com/source',
    immutableUrl: 'https://example.com/asset.glb',
    author: 'Author',
    license: 'CC0-1.0',
    licenseUrl: 'https://example.com/license',
    retrievedAt: '2026-01-01T00:00:00Z',
    bytes: 5,
    sha256: createHash('sha256').update('hello').digest('hex'),
    localPath: 'public/asset.glb',
    status: 'planned',
    ...overrides,
  };
}

function runRecord(overrides = {}) {
  return {
    id: 'run-one',
    title: 'Run one',
    startedAt: '2026-01-01T00:00:00Z',
    endedAt: '2026-01-01T00:01:00Z',
    model: 'gpt-6-astra',
    provider: 'openai-codex',
    interface: 'Hermes',
    reasoningMode: 'high',
    tools: [],
    workPackage: 'inspect',
    inputAssets: ['asset-one'],
    promptPath: 'research/runs/run-one/prompt.md',
    outputPaths: ['research/runs/run-one/notes.md'],
    provenance: {
      lane: 'astra_authored',
      outputs: [
        {
          path: 'research/runs/run-one/notes.md',
          lane: 'astra_authored',
          sourceAssets: ['asset-one'],
        },
      ],
    },
    elapsedSeconds: 60,
    cost: { amount: null, currency: 'USD', basis: 'not exposed' },
    interventionLevel: 0,
    outcome: 'pass',
    failureNotes: '',
    reviewer: 'Reviewer',
    ...overrides,
  };
}

async function writeManifest(root, assets) {
  await writeFile(
    path.join(root, 'research', 'asset-manifest.json'),
    JSON.stringify({ assets }),
  );
}

async function writeRun(root, record, relativeDirectory = record.id) {
  const directory = path.join(root, 'research', 'runs', relativeDirectory);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'prompt.md'), '# Prompt\n');
  await writeFile(path.join(directory, 'notes.md'), '# Notes\n');
  await writeFile(path.join(directory, 'run.json'), JSON.stringify(record));
}

test('rejects invalid URI and date-time formats', async () => {
  const root = await createRoot();
  await writeManifest(root, [
    asset({ sourceUrl: 'not a uri', retrievedAt: 'not-a-date' }),
  ]);
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /format.*(uri|date-time)/i);
});

test('rejects duplicate asset IDs', async () => {
  const root = await createRoot();
  await writeManifest(root, [asset(), asset({ title: 'Duplicate' })]);
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /duplicate asset id/i);
});

test('verifies byte count and SHA-256 for available assets', async () => {
  const root = await createRoot();
  await mkdir(path.join(root, 'public'), { recursive: true });
  await writeFile(path.join(root, 'public', 'asset.glb'), 'wrong');
  await writeManifest(root, [asset({ status: 'available' })]);
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /(byte count|sha-256) mismatch/i);
});

test('rejects unknown input assets, invalid timing, and missing output provenance', async () => {
  const root = await createRoot();
  await writeManifest(root, [asset()]);
  await writeRun(
    root,
    runRecord({
      inputAssets: ['missing-asset'],
      endedAt: '2025-12-31T23:59:00Z',
      provenance: { lane: 'astra_authored', outputs: [] },
    }),
  );
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /(unknown input asset|endedAt.*before|missing provenance)/i,
  );
});

test('discovers nested run records and requires notes', async () => {
  const root = await createRoot();
  await writeManifest(root, [asset()]);
  const record = runRecord({ model: '' });
  await writeRun(root, record, 'group/run-one');
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /model/i);
});

test('rejects Astra attribution without persisted provider evidence', async () => {
  const root = await createRoot();
  await writeManifest(root, [asset()]);
  await writeRun(root, runRecord());
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /session evidence/i);
});

test('parses persisted Hermes session evidence instead of trusting repeated fields', async () => {
  const root = await createRoot();
  await writeManifest(root, [asset()]);
  await writeRun(root, runRecord({
    sessionEvidence: {
      path: 'research/runs/run-one/session.jsonl',
      sessionId: 'session-one',
    },
  }));
  await writeFile(
    path.join(root, 'research', 'runs', 'run-one', 'session.jsonl'),
    'arbitrary text\n',
  );
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /session evidence.*valid json/i);
});

test('requires evidence for a run-level Astra provenance claim', async () => {
  const root = await createRoot();
  await writeManifest(root, [asset()]);
  await writeRun(root, runRecord({
    model: 'baseline-model',
    provider: 'baseline-provider',
    provenance: {
      lane: 'astra_authored',
      outputs: [
        {
          path: 'research/runs/run-one/notes.md',
          lane: 'sourced_baseline',
          sourceAssets: ['asset-one'],
        },
      ],
    },
  }));
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /session evidence/i);
});

test('requires the run directory to match the run ID', async () => {
  const root = await createRoot();
  await writeManifest(root, [asset()]);
  await writeRun(
    root,
    runRecord({
      model: 'baseline-model',
      provider: 'baseline-provider',
      provenance: {
        lane: 'sourced_baseline',
        outputs: [
          {
            path: 'research/runs/run-one/notes.md',
            lane: 'sourced_baseline',
            sourceAssets: ['asset-one'],
          },
        ],
      },
    }),
    'different-directory',
  );
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /directory.*run id/i);
});
