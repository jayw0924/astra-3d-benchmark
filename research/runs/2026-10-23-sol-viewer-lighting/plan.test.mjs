import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matrix, targets, finishes, rigs, model } from './plan.mjs';
test('balanced 72 cases with unique outputs and immutable pins',()=>{
 assert.equal(matrix.length,72); assert.equal(new Set(matrix.map(x=>x.id)).size,72);
 for(const rig of rigs) for(const finish of finishes) assert.deepEqual(matrix.filter(x=>x.rig===rig&&x.finish===finish).map(x=>x.target),targets);
 assert.equal(model.bytes,9239404);assert.equal(model.sha256,'01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4');
});
