import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const base = 'research/runs/2026-10-27-sol-qwen-imagery';
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

test('first Qwen image is archived losslessly with effective graph settings and case01 lineage', () => {
  const metadata = json(`${base}/metadata.json`);
  const graph = json(`${base}/prompt.json`);
  const output = readFileSync(`${base}/Qwen_image_2.1_00001.png`);
  assert.equal(hash(output), 'a8276bf9432f8d8d3b4fdfee189a7801333749608a9f2ab3a8c7647f796f9e03');
  assert.equal(output.length, 881194);
  assert.deepEqual(metadata.output.dimensions, [864, 768]);
  assert.deepEqual(metadata.input.dimensions, [850, 778]);
  assert.equal(metadata.input.sha256, '79adecb53eddb16c5d7eb6478d8ef1ad0e6f0e68dc78d6d06eef0c59f017b252');
  assert.equal(hash(readFileSync(`${base}/after-Carmine-side.png`)), metadata.input.sha256);
  assert.deepEqual(readFileSync(`${base}/after-Carmine-side.png`), readFileSync(metadata.input.path));
  assert.deepEqual(graph['470'].is_changed, [metadata.input.sha256]);
  assert.notEqual(metadata.input.sha256, graph['470'].inputs.image.replace('.png', ''));
  assert.equal(metadata.effectivePositivePrompt, graph['459:484'].inputs.on_false);
  assert.equal(graph['459:484'].inputs.switch, false);
  assert.equal(metadata.sampler.seed, 891836227295375);
  assert.equal(readFileSync(`${base}/effective-positive.txt`, 'utf8'), metadata.effectivePositivePrompt);
  assert.equal(metadata.generation.startedAt, null);
  assert.equal(metadata.generation.cost, null);
  const decode = spawnSync('python', ['-c', 'from PIL import Image; import sys; [Image.open(p).load() for p in sys.argv[1:]]', `${base}/after-Carmine-side.png`, `${base}/Qwen_image_2.1_00001.png`], { encoding: 'utf8' });
  assert.equal(decode.status, 0, decode.stderr);
  for (const file of ['after-Carmine-side.png', 'Qwen_image_2.1_00001.png']) {
    assert.deepEqual(readFileSync(`public/assets/study/ai-imagery/${file}`), readFileSync(`${base}/${file}`));
  }
  const index = json('research/case-studies/index.json');
  assert.ok(index.cases.find((c) => c.id === 'case01').runIds.includes('2026-10-27-sol-qwen-imagery'));
  assert.deepEqual(index.cases.find((c) => c.id === 'case02').runIds, []);
  const protocol = json(`${base}/continuation.json`);
  assert.equal(protocol.maxAdditionalGenerations, 2);
  assert.equal(protocol.executedAdditionalGenerations, 2);
  assert.equal(protocol.actualAdditionalOutputs.length, 2);
  assert.equal(protocol.reportedFailedAdditionalAttempts, 1);
  assert.equal(protocol.attemptedJobsFromUserSequence, 4);
  assert.equal(protocol.status, 'completed_bounded_comparison');
  const run = json(`${base}/run.json`);
  assert.equal(run.provenance.lane, 'non_astra_authored_baseline');
  assert.ok(run.outputPaths.includes(`${base}/workflow.json`));
});

test('completed bounded comparison retains all four image identities, graph differences and historical inventory', () => {
  const inventory = json(`${base}/finalization/output-inventory.json`);
  assert.equal(inventory.displayedImageCount, 4);
  assert.deepEqual(readFileSync(`${base}/output-inventory.json`), readFileSync(`${base}/finalization/previous-output-inventory.json`));
  const manifest = json('research/asset-manifest.json');
  assert.equal(manifest.assets.filter((a) => a.localPath.startsWith('public/assets/study/ai-imagery/') && !a.localPath.includes('/angles/')).length, 4);
  const first = json(`${base}/prompt.json`);
  for (const [seed, expectedHash, bytes] of [
    [42, '2aa56bf1c84163a1c0b39e9584d7b1d69413a1dff63298fac5b0a081e76492dd', 872620],
    [12345, 'e83966d523d0036451dfd7dcd3d7c5755dca38bc9fb3348e78b42721c83c0597', 897076],
  ]) {
    const folder = `${base}/followup-seed${seed}`;
    const file = `Qwen_image_2.1_seed${seed}.png`;
    const png = readFileSync(`${folder}/${file}`);
    assert.equal(hash(png), expectedHash);
    assert.equal(png.length, bytes);
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [864, 768]);
    assert.deepEqual(readFileSync(`public/assets/study/ai-imagery/${file}`), png);
    const graph = json(`${folder}/prompt.json`);
    assert.equal(graph['459:458'].inputs.seed, seed);
    assert.equal(graph['459:500'].inputs['sampling_mode.seed'], seed);
    graph['459:458'].inputs.seed = first['459:458'].inputs.seed;
    graph['459:500'].inputs['sampling_mode.seed'] = first['459:500'].inputs['sampling_mode.seed'];
    assert.deepEqual(graph, first, 'all non-seed submitted graph fields must match, not merely sampler defaults');
    const inspect = spawnSync('python', ['-c', 'from PIL import Image; import json,sys; im=Image.open(sys.argv[1]); im.load(); assert im.size==(864,768); assert json.loads(im.info["prompt"])==json.load(open(sys.argv[2])); assert json.loads(im.info["workflow"])==json.load(open(sys.argv[3]))', `${folder}/${file}`, `${folder}/prompt.json`, `${folder}/workflow.json`], { encoding: 'utf8' });
    assert.equal(inspect.status, 0, inspect.stderr);
  }
});
