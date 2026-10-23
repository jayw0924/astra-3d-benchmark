import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
test('balanced fixed 108-case hash-pinned matrix', async () => {
  const { buildPlan, models, targets } = await import('./plan.mjs');
  const plan = buildPlan();
  assert.equal(targets.length,9); assert.equal(plan.length,108);
  assert.equal(new Set(plan.map(x=>x.id)).size,108);
  for(const model of models){
    const b=await readFile(model.path);assert.equal(b.length,model.bytes);
    assert.equal(createHash('sha256').update(b).digest('hex'),model.sha256);
    const cases=plan.filter(x=>x.model===model.id);assert.equal(cases.length,54);
    for(const target of targets) for(const variant of ['Estuary Enamel','Carmine Candy'])
      for(const mode of ['shaded','wireframe','silhouette']) assert.equal(cases.filter(x=>x.target===target&&x.variant===variant&&x.mode===mode).length,1);
  }
  for(const x of plan) assert.deepEqual([x.width,x.height,x.dpr],[600,400,1]);
});
