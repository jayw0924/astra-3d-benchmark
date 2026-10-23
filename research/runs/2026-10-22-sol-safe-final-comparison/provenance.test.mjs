import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {models} from './plan.mjs';
const here=new URL('./',import.meta.url),old=new URL('../2026-10-21-sol-safe-webgl-comparison/',import.meta.url),json=async(n,base=here)=>JSON.parse(await readFile(new URL(n,base))),hash=b=>createHash('sha256').update(b).digest('hex');
test('54 reused controls exactly source-verified; candidate frames are fresh; frozen harness identity',async()=>{
 const m=await json('capture-manifest.json'),source=await json('capture-manifest.json',old),reuse=await json('reuse-verification.json');
 assert.equal(reuse.controlImages,54);assert.equal(reuse.candidateImagesReused,0);assert.deepEqual(source.activeCaptureErrors,[]);
 for(const h of source.harnessInputs)assert.equal(hash(await readFile(new URL(h.path,old))),h.sha256);
 for(const name of ['page.js','page.html','control-spec.json'])assert.deepEqual(await readFile(new URL(name,here)),await readFile(new URL(name,old)));
 for(const pin of m.inputPins)assert.deepEqual(pin,(({url,...x})=>x)(models.find(x=>x.id===pin.id)));
 const controls=m.images.filter(x=>x.model==='control');assert.equal(controls.length,54);
 for(const im of controls){const original=source.images.find(x=>x.id===im.id);assert.equal(im.sha256,original.sha256);assert(im.reuse);assert.equal(hash(await readFile(new URL(original.path,old))),im.sha256);}
 assert.equal(m.images.filter(x=>x.model==='safe'&&!x.reuse).length,54);assert.deepEqual(m.activeCaptureErrors,[]);
 for(const s of m.sessions)assert.deepEqual((await json(s)).errors,[]);
 for(const h of m.harnessInputs)assert.equal(hash(await readFile(new URL(h.path,here))),h.sha256);
});
test('64 actual ordered pairs, expected four variants, cross-context stable assignments, raw HTTP encoding',async()=>{
 const variants=['Carmine Candy','Pearly Swirly','Torched Graphite','Estuary Enamel'];const canonical=new Map();let count=0;
 for(const [i,id] of ['control','safe','safe','control'].entries()){
  const r=await json(`raw/measure-${i}-${id}.json`),model=models.find(x=>x.id===id);assert.deepEqual([...new Set(r.metrics.transitions.map(x=>x.source))].sort(),[...variants].sort());
  for(const a of variants)for(const b of variants)assert.equal(r.metrics.transitions.filter(x=>x.source===a&&x.target===b).length,1);
  for(const t of r.metrics.transitions){count++;const sig=JSON.stringify(t.assignments);if(canonical.has(t.target))assert.equal(sig,canonical.get(t.target));canonical.set(t.target,sig);}
  const net=r.network.filter(x=>new URL(x.url).pathname===model.url);assert.equal(net.length,1);assert.equal(net[0].status,200);assert.equal(net[0].headers['Content-Length'],String(model.bytes));assert.equal(net[0].headers['Content-Encoding'],undefined);assert.equal(net[0].fromDiskCache,false);assert(net[0].encodedDataLength>model.bytes);
 }
 assert.equal(count,64);
});
