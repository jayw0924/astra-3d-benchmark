import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { validateCaseStudies } from './validate-case-studies.mjs';

const root = path.resolve(import.meta.dirname, '..');

test('repository case index and pending intake validate without manufacturing evidence', async () => {
  const result = await validateCaseStudies(root);
  assert.equal(result.caseCount, 2);
});

async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'case-index-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const relative of ['research/case-studies', 'research/schemas/case-studies.schema.json', 'research/asset-manifest.json']) {
    await cp(path.join(root, relative), path.join(directory, relative), { recursive: true });
  }
  const registry = JSON.parse(await readFile(path.join(directory, 'research/case-studies/index.json')));
  for (const id of registry.cases[0].runIds) {
    await mkdir(path.join(directory, 'research/runs', id), { recursive: true });
    await cp(path.join(root, 'research/runs', id, 'run.json'), path.join(directory, 'research/runs', id, 'run.json'));
  }
  return { directory, registry, save: () => writeFile(path.join(directory, 'research/case-studies/index.json'), JSON.stringify(registry)) };
}

test('rejects an entire case directory symlinked outside the repository', async (t) => {
  const { directory } = await fixture(t);
  const outside = await mkdtemp(path.join(tmpdir(), 'outside-case-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await writeFile(path.join(outside, 'README.md'), 'outside');
  await rm(path.join(directory, 'research/case-studies/case01'), { recursive: true });
  await symlink(outside, path.join(directory, 'research/case-studies/case01'));
  await assert.rejects(validateCaseStudies(directory), /escapes/);
});

for (const [label, mutate, expected] of [
  ['duplicate cases', (r) => r.cases.push(r.cases[0]), /Duplicate case/],
  ['unknown assets', (r) => r.cases[0].assetIds.push('unknown'), /Unknown asset/],
  ['unknown runs', (r) => r.cases[0].runIds.push('unknown'), /ENOENT/],
  ['pending evidence', (r) => r.cases[1].runIds.push('invented'), /case index/],
  ['traversal', (r) => { r.cases[0].overviewPath = 'research/../README.md'; }, /case index/],
  ['absolute paths', (r) => { r.cases[0].overviewPath = '/etc/passwd'; }, /case index/],
  ['cross-case paths', (r) => { r.cases[0].overviewPath = r.cases[1].overviewPath; }, /Invalid reference/],
]) {
  test(`rejects ${label}`, async (t) => {
    const { directory, registry, save } = await fixture(t);
    mutate(registry);
    await save();
    await assert.rejects(validateCaseStudies(directory), expected);
  });
}

for (const [label, mutate] of [
  ['invented source ID', (i) => { i.sourceBlendAssetId = 'fake'; }],
  ['unapproved promotion', (i) => { i.promotion = 'accepted'; }],
  ['role substitution', (i) => { i.roles.author = 'Sol'; }],
  ['case mismatch', (i) => { i.caseId = 'case03'; }],
  ['missing budget field', (i) => { delete i.attemptBudget; }],
]) {
  test(`rejects intake ${label}`, async (t) => {
    const { directory } = await fixture(t);
    const file = path.join(directory, 'research/case-studies/case02/intake.json');
    const intake = JSON.parse(await readFile(file));
    mutate(intake);
    await writeFile(file, JSON.stringify(intake));
    await assert.rejects(validateCaseStudies(directory), /intake/i);
  });
}

test('rejects a run record whose identity differs from the linked directory', async (t) => {
  const { directory, registry } = await fixture(t);
  const file = path.join(directory, 'research/runs', registry.cases[0].runIds[0], 'run.json');
  await writeFile(file, JSON.stringify({ id: 'wrong' }));
  await assert.rejects(validateCaseStudies(directory), /Run ID mismatch/);
});
