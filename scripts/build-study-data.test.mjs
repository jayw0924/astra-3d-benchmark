import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');

function runScript(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [
      path.join(projectRoot, 'scripts', 'build-study-data.mjs'),
      ...args,
    ]);
    let stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('close', (code) => resolve({ code, stderr }));
  });
}

test('sorts public run summaries deterministically', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'astra-study-'));
  const runs = path.join(root, 'research', 'runs');
  await mkdir(path.join(runs, 'later'), { recursive: true });
  await mkdir(path.join(runs, 'earlier'), { recursive: true });
  const base = {
    title: 'Run', model: 'model', provider: 'provider', tools: [],
    workPackage: 'baseline', interventionLevel: 0, outcome: 'partial',
    failureNotes: '', outputPaths: [], publicSummary: 'Summary', scores: {},
  };
  await writeFile(path.join(runs, 'later', 'run.json'), JSON.stringify({
    ...base, id: 'later', startedAt: '2026-01-02T00:00:00Z',
  }));
  await writeFile(path.join(runs, 'earlier', 'run.json'), JSON.stringify({
    ...base, id: 'earlier', startedAt: '2026-01-01T00:00:00Z',
  }));
  const output = path.join(root, 'study.json');

  const result = await runScript(['--root', root, '--output', output]);
  assert.equal(result.code, 0, result.stderr);
  const generated = JSON.parse(await readFile(output, 'utf8'));
  assert.deepEqual(generated.runs.map((run) => run.id), ['later', 'earlier']);
});

test('rejects secret-bearing run records', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'astra-study-secret-'));
  const runRoot = path.join(root, 'research', 'runs', 'secret');
  await mkdir(runRoot, { recursive: true });
  await writeFile(path.join(runRoot, 'run.json'), JSON.stringify({
    id: 'secret', apiKey: 'do-not-publish',
  }));

  const result = await runScript([
    '--root', root,
    '--output', path.join(root, 'study.json'),
  ]);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /secret-bearing field/i);
});

test('does not count an unverified Astra model claim', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'astra-study-attribution-'));
  const runRoot = path.join(root, 'research', 'runs', 'unverified');
  await mkdir(runRoot, { recursive: true });
  await writeFile(path.join(runRoot, 'run.json'), JSON.stringify({
    id: 'unverified',
    title: 'Unverified model claim',
    startedAt: '2026-01-01T00:00:00Z',
    model: 'gpt-6-astra',
    provider: 'bogus-provider',
    tools: [],
    workPackage: 'inspect',
    interventionLevel: 0,
    outcome: 'pass',
    failureNotes: '',
    outputPaths: [],
  }));
  const output = path.join(root, 'study.json');

  const result = await runScript(['--root', root, '--output', output]);
  assert.equal(result.code, 0, result.stderr);
  const generated = JSON.parse(await readFile(output, 'utf8'));
  assert.equal(generated.summary.astraRunCount, 0);
  assert.equal(generated.summary.completedAstraRuns, 0);
});

test('does not count repeated Astra fields when the session export is invalid', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'astra-study-evidence-'));
  const runRoot = path.join(root, 'research', 'runs', 'forged');
  await mkdir(runRoot, { recursive: true });
  await writeFile(path.join(runRoot, 'session.jsonl'), 'arbitrary text\n');
  await writeFile(path.join(runRoot, 'run.json'), JSON.stringify({
    id: 'forged', title: 'Forged', startedAt: '2026-01-01T00:00:00Z',
    model: 'gpt-6-astra', provider: 'openai-codex', tools: [],
    workPackage: 'inspect', interventionLevel: 0, outcome: 'pass',
    failureNotes: '', outputPaths: [],
    sessionEvidence: {
      path: 'research/runs/forged/session.jsonl',
      sessionId: 'session-one',
      requestedModel: 'gpt-6-astra',
      requestedProvider: 'openai-codex',
      billingProvider: 'openai-codex',
    },
  }));
  const output = path.join(root, 'study.json');

  const result = await runScript(['--root', root, '--output', output]);
  assert.equal(result.code, 0, result.stderr);
  const generated = JSON.parse(await readFile(output, 'utf8'));
  assert.equal(generated.summary.astraRunCount, 0);
});
