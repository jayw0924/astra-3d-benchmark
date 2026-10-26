import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('historical handoffs explicitly stop Mobile reruns and link current lighting acceptance', async () => {
  for (const file of ['ASTRA_HANDOFF.md', 'ASTRA_MOBILE_LOD_HANDOFF.md']) {
    const text = await readFile(`research/${file}`, 'utf8');
    assert.match(text, /Current notice.*historical/i);
    assert.match(text, /low-benefit.*stopped/i);
    assert.match(text, /no authority to rerun/i);
    assert.doesNotMatch(text, /active next research package/);
  }
  const safe = await readFile('research/SAFE_WEBGL_INTEGRATION.md', 'utf8');
  assert.match(safe, /^# Historical/);
  assert.match(safe, /2026-10-26-sol-lighting-integration/);
  assert.doesNotMatch(safe, /remain part of the uncommitted working tree/);
  assert.match(await readFile('research/protocol.md', 'utf8'), /protocols\/viewer-lighting-v1.md/);
});
