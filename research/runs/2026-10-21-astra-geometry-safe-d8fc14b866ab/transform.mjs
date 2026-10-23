import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const run = 'research/runs/2026-10-21-astra-geometry-safe-d8fc14b866ab';
const source = 'public/assets/models/product-estuary.glb';
assert.equal(process.cwd(), '/workspace');
const bytes = readFileSync(source);
assert.equal(bytes.length, 10191496);
assert.equal(createHash('sha256').update(bytes).digest('hex'), 'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f');
for (const name of ['cli','core','extensions','functions']) assert.equal(JSON.parse(readFileSync(`node_modules/@gltf-transform/${name}/package.json`)).version, '4.5.1');
assert.equal(JSON.parse(readFileSync('node_modules/meshoptimizer/package.json')).version, '1.2.0');
for (const name of ['candidate.glb','repeat.glb']) {
  const output = `${run}/${name}`;
  assert(!existsSync(output), `Refusing to overwrite ${output}; preserve attempts`);
  const result = spawnSync('python', [`${run}/command.py`, 'node_modules/.bin/gltf-transform', 'simplify', source, output, '--ratio', '0.80', '--error', '0.0001', '--lock-border', 'true'], {encoding:'utf8'});
  process.stdout.write(result.stdout); process.stderr.write(result.stderr);
  assert.equal(result.status, 0);
}
assert(readFileSync(`${run}/candidate.glb`).equals(readFileSync(`${run}/repeat.glb`)), 'Independent outputs must match exact bytes');
console.log('Deterministic reproduction: exact bytes PASS');
