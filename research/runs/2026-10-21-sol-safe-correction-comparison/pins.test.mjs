import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('corrected candidate pin, not prior rejected bytes',async()=>{
 const {models}=await import('./plan.mjs');const c=models.find(x=>x.id==='safe');
 assert.equal(c.path,'research/runs/2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b/candidate.glb');
 assert.equal(c.bytes,9198676);assert.equal(c.sha256,'a30deb208c7c1c4b23859edbb57d2c9d1cb1ad828e00c9431d4ebc29a47d9bce');
 for(const m of models){const b=await readFile(m.path);assert.equal(b.length,m.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),m.sha256);}
});
