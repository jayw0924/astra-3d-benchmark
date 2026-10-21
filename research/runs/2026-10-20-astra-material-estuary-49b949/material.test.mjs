import { test } from 'node:test';
import assert from 'node:assert/strict';
import { link, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));

test('Author atomically replaces a hardlinked candidate without altering its target', async () => {
  const guard = path.join(here, 'hardlink-guard.tmp');
  const output = path.join(here, 'candidate.glb');
  const original = Buffer.from('protected target');
  await writeFile(guard, original);
  await rm(output, { force: true });
  await link(guard, output);
  try {
    const result = spawnSync(process.execPath, [path.join(here, 'author-material.mjs')], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(await readFile(guard), original);
    const authored = JSON.parse(result.stdout);
    assert.equal(authored.sha256, 'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f');
  } finally {
    await rm(guard, { force: true });
  }
});
