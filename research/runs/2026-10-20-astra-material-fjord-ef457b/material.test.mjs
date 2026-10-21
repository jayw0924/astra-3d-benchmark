import { test } from 'node:test';
import assert from 'node:assert/strict';
import { link, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here=path.dirname(fileURLToPath(import.meta.url));
const bytes=await readFile(path.join(here,'candidate.glb'));
const j=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
const primitives=j.meshes.flatMap(m=>m.primitives);
const apply=(state,v)=>primitives.map((p,i)=>p.extensions?.KHR_materials_variants?.mappings.find(m=>m.variants.includes(v))?.material ?? state[i]);
const initial=primitives.map(p=>p.material);
test('All sixteen ordered variant transitions have history-independent assignments',()=>{
  for(let from=0;from<4;from++) for(let to=0;to<4;to++) assert.deepEqual(apply(apply(initial,from),to),apply(initial,to));
});
test('Original enamel has bounded, opaque dielectric clearcoat parameters',()=>{
  const m=j.materials[28],p=m.pbrMetallicRoughness,c=m.extensions.KHR_materials_clearcoat;
  assert.equal(p.metallicFactor,0); assert.equal(p.baseColorFactor[3],1);
  assert.equal(m.alphaMode,'OPAQUE');
  for(const v of [...p.baseColorFactor,p.roughnessFactor,c.clearcoatFactor,c.clearcoatRoughnessFactor]) assert(v>=0 && v<=1);
  assert.equal(m.normalTexture,undefined);
});
test('Author refuses output paths outside fixed run-local candidates',()=>{
  for(const output of ['../../../../public/assets/models/product.glb','/tmp/forbidden.glb','other.glb']) {
    const p=spawnSync(process.execPath,[path.join(here,'author-material.mjs'),output],{encoding:'utf8'});
    assert.notEqual(p.status,0); assert.match(p.stderr,/AssertionError/);
  }
});
test('Author atomically replaces a hardlinked candidate without altering its target',async()=>{
  const guard=path.join(here,'hardlink-guard.tmp');
  const output=path.join(here,'candidate-repeat.glb');
  const original=Buffer.from('protected target');
  await writeFile(guard,original);
  await rm(output,{force:true});
  await link(guard,output);
  try {
    const p=spawnSync(process.execPath,[path.join(here,'author-material.mjs'),'candidate-repeat.glb'],{encoding:'utf8'});
    assert.equal(p.status,0,p.stderr);
    assert.deepEqual(await readFile(guard),original);
    assert.deepEqual(await readFile(output),bytes);
  } finally {
    await rm(guard,{force:true});
  }
});
