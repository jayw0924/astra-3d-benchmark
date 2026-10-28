import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const base = 'research/runs/2026-10-27-sol-qwen-angle-comparison';
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const hash = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

test('two-angle registration retains exact inputs, embedded graphs and separate public PNG identities', () => {
  const inventory = json(`${base}/image-inventory.json`);
  assert.equal(inventory.images.length, 4);
  const manifest = json('research/asset-manifest.json').assets.filter((a) => a.localPath.includes('/ai-imagery/angles/'));
  assert.equal(manifest.length, 4);
  const expected = [
    ['front-source.png', 'a23adfe1d1ba992ce736f55ca6915f62f7b54d8afa96e9600a6181d8437c1c3b', 850, 778],
    ['front-generated-seed42.png', 'd23e3fb01812bcdf6a74f79f1bbd2cd586393596bedb601505c3f17be55bc615', 864, 768],
    ['rear-source.png', '6511901c87c30a79318e24c881ec5f1c000f2e374292223b97c57ad905157b15', 850, 778],
    ['rear-generated-seed42.png', '11dbc760c7b561d766d550867ccc6e6b686cca821575b6ab04b78892fb4f8432', 864, 768],
  ];
  for (const [file, sha, width, height] of expected) {
    const archived = `${base}/${file}`;
    const publicPath = `public/assets/study/ai-imagery/angles/${file}`;
    assert.equal(hash(archived), sha);
    assert.deepEqual(readFileSync(publicPath), readFileSync(archived));
    const bytes = readFileSync(archived);
    assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], [width, height]);
    assert.equal(manifest.find((a) => a.localPath === publicPath).sha256, sha);
  }
  const side = json('research/runs/2026-10-27-sol-qwen-imagery/followup-seed42/prompt.json');
  for (const angle of ['front', 'rear']) {
    const graph = json(`${base}/${angle}-prompt.json`);
    assert.equal(graph['459:458'].inputs.seed, 42);
    assert.deepEqual(graph['470'].is_changed, [hash(`${base}/${angle}-source.png`)]);
    assert.notEqual(graph['470'].inputs.image.replace('.png', ''), hash(`${base}/${angle}-source.png`));
    graph['470'] = side['470'];
    assert.deepEqual(graph, side, 'all other submitted graph fields must match side seed 42');
  }
  const run = json(`${base}/run.json`);
  assert.equal(run.provenance.lane, 'non_astra_authored_baseline');
  assert.equal(run.cost.amount, null);
  assert.match(run.cost.basis, /registration/i);
  const cases = json('research/case-studies/index.json').cases;
  assert.ok(cases.find((c) => c.id === 'case01').runIds.includes(run.id));
  assert.deepEqual(cases.find((c) => c.id === 'case02').runIds, []);
  const preserved = json(`${base}/before.json`).files;
  for (const [p, sha] of Object.entries(preserved)) assert.equal(hash(p), sha, p);
});
