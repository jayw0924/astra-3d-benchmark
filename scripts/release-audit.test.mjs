import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import test from 'node:test';

for (const name of ['Basis-Universal-APACHE-2.0.txt', 'Basis-Universal-NOTICE.md']) {
  test(`ships an exact upstream ${name} copy`, async () => {
    assert.deepEqual(await readFile(`public/licenses/${name}`), await readFile(`licenses/upstream/${name}`));
  });
}

test('registers the exact native current viewer preview separately from historical renders', async () => {
  const manifest = JSON.parse(await readFile('research/asset-manifest.json', 'utf8'));
  const asset = manifest.assets.find((entry) => entry.id === 'refined-viewer-preview');
  assert.ok(asset);
  const body = await readFile(asset.localPath);
  assert.equal(body.length, 244385);
  assert.equal(createHash('sha256').update(body).digest('hex'), '81679125d519c638705adbf02d860da1f1fbc1c0bb56d979bdffbed48f0991f6');
  assert.equal(body.readUInt32BE(16), 850);
  assert.equal(body.readUInt32BE(20), 778);
  assert.match(asset.author, /Sol/);
  assert.match(asset.license, /CC-BY-4.0/);
});

test('inspection commands distinguish current Safe runtime from historical control', async () => {
  const { scripts } = JSON.parse(await readFile('package.json', 'utf8'));
  assert.equal(scripts['asset:inspect-integrated'], 'gltf-transform inspect public/assets/models/product-estuary-safe.glb');
  assert.equal(scripts['asset:inspect-control'], 'gltf-transform inspect public/assets/models/product-estuary.glb');
});
