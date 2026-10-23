import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {compactPrimitive,simplifyPrimitive} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';
const run='/workspace/research/runs/2026-10-22-astra-geometry-mobile-bd8abb4a578f';
const source='public/assets/models/product-estuary.glb';
const hash=b=>createHash('sha256').update(b).digest('hex');
const protectedMeshes=[1, 2, 3, 4, 30, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 45, 50, 51, 52, 53, 54, 69, 70, 71, 72, 73, 87, 89, 91, 93];

for(const n of ['core','extensions','functions','cli'])assert.equal(JSON.parse(readFileSync(`node_modules/@gltf-transform/${n}/package.json`)).version,'4.5.1');
assert.equal(JSON.parse(readFileSync('node_modules/meshoptimizer/package.json')).version,'1.2.0');
await MeshoptSimplifier.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const bytes=readFileSync(source);assert.equal(bytes.length,10191496);assert.equal(hash(bytes),'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f');
const arr=a=>({type:a.getType(),normalized:a.getNormalized(),componentType:a.getComponentType(),count:a.getCount(),sha256:hash(Buffer.from(a.getArray().buffer,a.getArray().byteOffset,a.getArray().byteLength))});
const snapshot=p=>({indices:arr(p.getIndices()),attributes:Object.fromEntries(p.listSemantics().sort().map(k=>[k,arr(p.getAttribute(k))]))});
for(const name of ['candidate','repeat']){
 assert(!existsSync(`${run}/${name}.glb`),'Never overwrite an attempt');
 const doc=await io.read(source),meshes=doc.getRoot().listMeshes();
 const protectedRecords=protectedMeshes.flatMap(mi=>meshes[mi].listPrimitives().map((p,pi)=>({mesh:mi,primitive:pi,nodeNames:doc.getRoot().listNodes().filter(n=>n.getMesh()===meshes[mi]).map(n=>n.getName()),before:snapshot(p)})));
 const protectedAccessors=new Set(protectedMeshes.flatMap(mi=>meshes[mi].listPrimitives().flatMap(p=>[p.getIndices(),...p.listAttributes()])));
 let processed=0;
 for(const [mi,m] of meshes.entries())for(const p of m.listPrimitives()){
  if(protectedMeshes.includes(mi))continue;
  assert.equal(p.getMode(),4);assert.equal(p.listTargets().length,0);
  compactPrimitive(p);
  assert([p.getIndices(),...p.listAttributes()].every(a=>!protectedAccessors.has(a)),'Accessor isolation failed');
  simplifyPrimitive(p,{simplifier:MeshoptSimplifier,ratio:[88,90,92,94].includes(mi)?0.65:0.50,error:[88,90,92,94].includes(mi)?0.00005:0.0001,lockBorder:true});processed++;
 }
 for(const r of protectedRecords){r.after=snapshot(meshes[r.mesh].listPrimitives()[r.primitive]);assert.deepEqual(r.before,r.after);}
 await io.write(`${run}/${name}.glb`,doc);
 writeFileSync(`${run}/${name}-authoring.json`,JSON.stringify({source,sourceSha256:hash(bytes),protectedRecords,processed,globalSimplifyInvoked:false,globalWeldInvoked:false},null,2)+'\n',{flag:'wx'});
 console.log(name,readFileSync(`${run}/${name}.glb`).length,hash(readFileSync(`${run}/${name}.glb`)));
}
assert(readFileSync(`${run}/candidate.glb`).equals(readFileSync(`${run}/repeat.glb`)));
console.log('Two independent reconstructions match exact bytes; protected snapshots match.');
