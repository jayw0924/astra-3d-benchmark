import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  readHermesSessionEvidence,
  verifyAstraSession,
} from './lib/session-evidence.mjs';

function option(argv, name, fallback) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : fallback;
}

function findSecretField(value, trail = []) {
  if (!value || typeof value !== 'object') return null;
  for (const [key, nested] of Object.entries(value)) {
    const nextTrail = [...trail, key];
    if (/^(api[-_]?key|password|secret|access[-_]?token|refresh[-_]?token)$/i.test(key)) {
      return nextTrail.join('.');
    }
    const found = findSecretField(nested, nextTrail);
    if (found) return found;
  }
  return null;
}

async function readRuns(root) {
  const runsRoot = path.join(root, 'research', 'runs');
  const entries = await readdir(runsRoot, { withFileTypes: true });
  const runs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const run = JSON.parse(
      await readFile(path.join(runsRoot, entry.name, 'run.json'), 'utf8'),
    );
    const secretField = findSecretField(run);
    if (secretField) {
      throw new Error(`Secret-bearing field rejected in ${run.id ?? entry.name}: ${secretField}`);
    }
    runs.push({
      id: run.id,
      title: run.title,
      startedAt: run.startedAt,
      model: run.model,
      provider: run.provider,
      tools: run.tools,
      workPackage: run.workPackage,
      interventionLevel: run.interventionLevel,
      outcome: run.outcome,
      failureNotes: run.failureNotes,
      outputPaths: run.outputPaths,
      sessionEvidence: run.sessionEvidence ?? null,
      publicSummary: run.publicSummary ?? '',
      scores: run.scores ?? {},
    });
  }
  return runs.sort(
    (left, right) =>
      Date.parse(right.startedAt ?? 0) - Date.parse(left.startedAt ?? 0) ||
      String(left.id).localeCompare(String(right.id)),
  );
}

async function main() {
  const argv = process.argv.slice(2);
  const root = path.resolve(option(argv, '--root', process.cwd()));
  const output = path.resolve(
    option(argv, '--output', path.join(root, 'src', 'generated', 'study-data.json')),
  );
  const runs = await readRuns(root);
  const astraVerification = await Promise.all(
    runs.map(async (run) => {
      const evidence = await readHermesSessionEvidence(root, run.sessionEvidence);
      return evidence.valid &&
        verifyAstraSession(run, run.sessionEvidence, evidence.session);
    }),
  );
  const astraRuns = runs.filter((_, index) => astraVerification[index]);
  const publicRuns = runs.map((run) => {
    const publicRun = { ...run };
    delete publicRun.sessionEvidence;
    return publicRun;
  });
  const data = {
    schemaVersion: 1,
    summary: {
      runCount: runs.length,
      astraRunCount: astraRuns.length,
      completedAstraRuns: astraRuns.filter((run) =>
        ['pass', 'pass_with_intervention', 'partial', 'fail'].includes(run.outcome),
      ).length,
    },
    runs: publicRuns,
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Generated ${path.relative(root, output)} from ${runs.length} runs`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
