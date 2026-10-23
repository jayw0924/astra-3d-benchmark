import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('FINAL candidate pin, never prior candidate bytes',async()=>{
 const {models}=await import('./plan.mjs');const c=models.find(x=>x.id==='safe');
 assert.equal(c.path,'research/runs/2026-10-22-astra-geometry-safe-final-d0bf6e206c92/candidate.glb');
 assert.equal(c.bytes,9239404);assert.equal(c.sha256,'01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4');
 for(const m of models){const b=await readFile(m.path);assert.equal(b.length,m.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),m.sha256);}
});
