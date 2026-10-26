import test from 'node:test';
import assert from 'node:assert/strict';
import {matrix,rigs,finishes,targets,settings,model} from './plan.mjs';
import {validateEvidence} from './verify.mjs';
test('bounded 16 paired cases retain frozen source, exposure and explicit identities',()=>{
 assert.equal(matrix.length,32);assert.equal(new Set(matrix.map(x=>x.id)).size,32);
 assert.deepEqual(rigs,['grounded-studio','grounded-studio-refined']);assert.equal(finishes.length,4);
 assert.deepEqual(targets,['front-three-quarter','side','rear-three-quarter','glass']);
 for(const finish of finishes)for(const target of targets)assert.deepEqual(matrix.filter(x=>x.finish===finish&&x.target===target).map(x=>x.rig),rigs);
 assert.equal(settings.exposure,1.05);assert.equal(settings.width,600);assert.equal(settings.height,400);assert.equal(settings.dpr,1);
 assert.equal(model.sha256,'01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4');
});
test('incomplete and duplicate evidence rejected (not synthetic rendered evidence)',()=>{
 assert.throws(()=>validateEvidence({images:[]}));
 assert.throws(()=>validateEvidence({images:Array(32).fill({id:matrix[0].id})}));
});
