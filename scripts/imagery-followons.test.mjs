import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
const base = 'research/runs/2026-10-28-sol-imagery-followons';
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const hash = (b) => createHash('sha256').update(b).digest('hex');
test('four actual conditions have native public copies, reviewed metadata, source pins and case01-only lineage', () => {
  const inv = json(`${base}/public-assets.json`);
  assert.equal(inv.length, 9);
  assert.equal(readdirSync('public/assets/study/ai-imagery/followons').length, 9);
  const manifest = json('research/asset-manifest.json');
  for (const item of inv) {
    const bytes = readFileSync(item.publicPath);
    assert.equal(hash(bytes), item.sha256);
    assert.equal(bytes.length, item.bytes);
    assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], item.dimensions);
    assert.deepEqual(bytes, readFileSync(item.archivePath));
    const asset = manifest.assets.find((a) => a.id === item.id);
    assert.equal(asset.localPath, item.publicPath);
    assert.equal(asset.sha256, item.sha256);
    assert.equal(asset.bytes, item.bytes);
    assert.match(asset.license, /CC-BY-4.0/);
    assert.match(asset.notes, /not.*certification/i);
  }
  const run = json(`${base}/run.json`);
  assert.equal(run.provenance.lane, 'non_astra_authored_baseline');
  assert.equal(run.cost.amount, null);
  assert.match(run.cost.basis, /unknown/i);
  const status = json(`${base}/conditions.json`);
  assert.equal(status.conditions.length, 4);
  assert.ok(status.conditions.every((c) => c.status === 'completed'));
  assert.equal(status.cloudJobId, null);
  assert.equal(status.cloudRuntimeSeconds, null);
  assert.equal(status.registrationOnly, true);
  const cases = json('research/case-studies/index.json');
  assert.ok(cases.cases.find((c) => c.id === 'case01').runIds.includes(run.id));
  assert.deepEqual(cases.cases.find((c) => c.id === 'case02').runIds, []);
  assert.equal(hash(readFileSync('public/assets/models/product-estuary-safe.glb')), '01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4');
  assert.equal(hash(readFileSync('public/assets/study/ai-imagery/Qwen_image_2.1_00001.png')), 'a8276bf9432f8d8d3b4fdfee189a7801333749608a9f2ab3a8c7647f796f9e03');
});
test('independent pixel/graph checks retain exact repeat and protected core/edge invariants with cache caveat', () => {
  const result = spawnSync('python', [`${base}/verify-pixels.py`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const metrics = JSON.parse(result.stdout);
  assert.equal(metrics.repeat.changedRGBPixels, 0);
  assert.equal(metrics.repeat.decodedRGBAIdentical, true);
  assert.equal(metrics.repeat.executionGraphIdentical, true);
  assert.equal(metrics.repeat.freshSamplingProven, false);
  assert.match(metrics.repeat.caveat, /cache/);
  assert.deepEqual(metrics.protected, { protectedPixels: 107603, corePixels: 106452, boundaryPixels: 1151, changedProtectedPixels: 0, changedVs01: 11502, changedOutsideSupport: 0 });
  assert.deepEqual(metrics, json(`${base}/pixel-verification.json`));
});

test('publication keeps fixed native identities and metadata privacy boundaries', () => {
  for (const [file, sha, bytes, dimensions] of [
    ['location', '752fedb6c920ca04e4a98e4fd66740c35f29f5ad2f3c3b5435de07995049475b', 1062092, [864, 768]],
    ['flux', 'd6e2fabf684871007c8471a6d2379ddbe7a8e6cf45b791610d91d0cfe3e41f1d', 1079545, [1104, 944]],
    ['repeat', 'b734db7e01d2d632b8b83239b3165753d3e6907483e9fcdc9fbdbd57d338157b', 881269, [864, 768]],
    ['composite-02', '96eda7c1547fb20084f7cd9123669821c656ff05c25a66d341b2f64efbef8599', 589791, [850, 778]],
  ]) {
    const data = readFileSync(`public/assets/study/ai-imagery/followons/${file}.png`);
    assert.equal(hash(data), sha);
    assert.equal(data.length, bytes);
    assert.deepEqual([data.readUInt32BE(16), data.readUInt32BE(20)], dimensions);
  }
  const privacy = json(`${base}/privacy-review.json`);
  assert.equal(privacy.length, 9);
  assert.ok(privacy.every((p) => p.credentialOrPrivatePathMatches.length === 0));
  const scan = spawnSync('python', ['-c', 'from pathlib import Path; from PIL import Image; import json,re; files=list(Path("public/assets/study/ai-imagery/followons").glob("*")); assert len(files)==9; [Image.open(p).load() for p in files]; text=json.dumps([Image.open(p).info for p in files]); assert not re.search(r"/(?:home|Users|workspace)/|Bearer\\s+[A-Za-z0-9._-]+|[\\w.+-]+@[\\w.-]+\\.[A-Za-z]{2,}", text); assert all(p.suffix==".png" for p in files)'], { encoding: 'utf8' });
  assert.equal(scan.status, 0, scan.stderr);
});
