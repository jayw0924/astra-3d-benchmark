import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildPlan,models,targets} from './plan.mjs';
const here=new URL('./',import.meta.url),json=async name=>JSON.parse(await readFile(new URL(name,here))),hash=b=>createHash('sha256').update(b).digest('hex');
test('all 108 PNG identities, bytes, dimensions, balanced cases, nonblank pixels, identical control cameras',async()=>{
 const m=await json('capture-manifest.json'),spec=await json('control-spec.json');assert.equal(spec.controlSha256,models[0].sha256);
 assert.equal(m.images.length,108);assert.equal(m.remaining,0);
 assert.deepEqual(m.images.map(x=>x.id).sort(),buildPlan().map(x=>x.id).sort());
 assert.equal((await readdir(new URL('rendered/',here))).length,108);
 for(const x of m.images){const b=await readFile(new URL(x.path,here));assert.equal(b.length,x.bytes);assert.equal(hash(b),x.sha256);assert.equal(b.readUInt32BE(16),600);assert.equal(b.readUInt32BE(20),400);assert(x.changedPixels>=200);assert(x.counts.calls>0);assert.equal(x.repeatReadbackIdentical,true);assert.deepEqual(x.camera,spec.cameras[x.target]);assert.equal(x.assignments.length,25);assert(x.assignments.every(a=>a.verified));}
});
test('four actual ABBA sessions, 30 raw warmed samples each, 16 all-pairs transitions with exact stable assignments',async()=>{
 const order=['control','safe','safe','control'];
 for(const [i,id]of order.entries()){
  const r=await json(`raw/measure-${i}-${id}.json`),m=r.metrics;assert.equal(r.model,id);assert.equal(r.order,i);assert.deepEqual(r.errors,[]);assert.equal(m.warmSamples.length,30);assert.equal(m.transitions.length,16);assert.equal(new Set(m.transitions.map(x=>x.source+'--'+x.target)).size,16);
  const signatures=new Map();for(const t of m.transitions){assert.equal(t.assignments.length,25);assert(t.assignments.every(a=>a.verified));const sig=JSON.stringify(t.assignments.map(a=>[a.object,a.materialIndex,a.materialName]));if(signatures.has(t.target))assert.equal(signatures.get(t.target),sig);signatures.set(t.target,sig);}
  const model=models.find(x=>x.id===id);assert.equal(m.resourceTiming.encodedBodySize,model.bytes);assert.equal(m.resourceTiming.decodedBodySize,model.bytes);assert.equal(m.resourceTiming.contentEncoding,'');assert(m.coldCompileMs>0);assert(m.gpu.renderer.includes('SwiftShader'));
 }
});
test('all target sheets visually reviewed, hashed, and gallery decoded',async()=>{
 const review=await json('visual-review.json');assert.equal(review.status,'unaccepted');assert.deepEqual(review.targets.map(x=>x.target).sort(),[...targets].sort());assert(review.targets.every(x=>x.reviewedPanels===12&&x.notes));
 const sheets=await json('sheet-manifest.json');assert.equal(sheets.length,9);for(const x of sheets){const b=await readFile(new URL(x.path,here));assert.equal(b.length,x.bytes);assert.equal(hash(b),x.sha256);}
 const gallery=await json('gallery-check.json');assert.equal(gallery.count,108);assert.deepEqual(gallery.errors,[]);assert.deepEqual(gallery.bad,[]);
});
