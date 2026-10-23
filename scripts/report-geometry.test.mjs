import assert from 'node:assert/strict';
import { mkdtemp, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');

test('reports exact geometry metrics for the integrated Estuary asset', () => {
  const result = spawnSync(
    process.execPath,
    [
      path.join(projectRoot, 'scripts', 'report-geometry.mjs'),
      '--asset-id',
      'web-product-estuary',
      '--role',
      'baseline',
      'public/assets/models/product-estuary.glb',
    ],
    { cwd: projectRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.assetId, 'web-product-estuary');
  assert.equal(report.role, 'baseline');
  assert.equal(report.sourcePath, 'public/assets/models/product-estuary.glb');
  assert.equal(report.bytes, 10_191_496);
  assert.equal(
    report.sha256,
    'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f',
  );
  assert.deepEqual(report.counts, {
    scenes: 1,
    nodes: 99,
    reachableNodes: 99,
    meshes: 95,
    primitives: 107,
    materials: 30,
    textures: 14,
    images: 14,
    cameras: 0,
    animations: 0,
    skins: 0,
    triangles: 213_195,
    submittedTriangleIndices: 639_585,
    positionAccessorEntries: 162_646,
  });
  assert.deepEqual(
    report.variants.map(({ name, mappedPrimitives }) => ({ name, mappedPrimitives })),
    [
      { name: 'Carmine Candy', mappedPrimitives: 25 },
      { name: 'Pearly Swirly', mappedPrimitives: 25 },
      { name: 'Torched Graphite', mappedPrimitives: 25 },
      { name: 'Estuary Enamel', mappedPrimitives: 25 },
    ],
  );
  assert.deepEqual(report.checks.forbiddenNodesPresent, []);
  assert.match(report.checks.parserValidation, /passed/i);
});

test('rejects a project-relative symlink that escapes the project root', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'geometry-symlink-'));
  await symlink(
    path.join(projectRoot, 'public', 'assets', 'models', 'product-estuary.glb'),
    path.join(root, 'linked.glb'),
  );
  const result = spawnSync(
    process.execPath,
    [
      path.join(projectRoot, 'scripts', 'report-geometry.mjs'),
      '--asset-id',
      'escaped-asset',
      '--role',
      'baseline',
      'linked.glb',
    ],
    { cwd: root, encoding: 'utf8' },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /escape the project root/i);
});
