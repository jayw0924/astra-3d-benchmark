import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const runRoot = import.meta.dirname;

async function readJson(name) {
  return JSON.parse(await readFile(path.join(runRoot, name), 'utf8'));
}

test('preflight rerun preserves exact commands and verified outcomes', async () => {
  const [commands, verification] = await Promise.all([
    readJson('commands.json'),
    readJson('verification.json'),
  ]);

  assert.equal(commands.length, 8);
  assert.ok(commands.every(({ argv, cwd, startedAt, endedAt, exitCode }) =>
    Array.isArray(argv)
      && cwd === '/workspace'
      && Date.parse(startedAt) <= Date.parse(endedAt)
      && Number.isInteger(exitCode),
  ));
  assert.equal(verification.source.sha256,
    'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f');
  assert.equal(verification.scratch.deterministicExactBytes, true);
  assert.equal(verification.scratch.sha256,
    'f067a32c42f4018fb7011693207b2b97909eeb8b6d60c9b230fc904bab2cd2c5');
  assert.equal(verification.scratch.geometry.triangles, 202_687);
  assert.equal(verification.scratch.geometry.submittedTriangleIndices, 608_061);
  assert.equal(verification.scratch.geometry.positionAccessorEntries, 156_572);
  assert.equal(verification.browser.version, '156.0.8078.4');
  assert.equal(verification.browser.revision, '1248');
  assert.equal(verification.validator.numErrors, 0);
  assert.equal(verification.productionAudit.exitCode, 0);
  assert.equal(verification.developmentAudit.exitCode, 1);
});
