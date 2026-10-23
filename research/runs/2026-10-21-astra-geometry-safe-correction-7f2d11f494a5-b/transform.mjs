import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {compactPrimitive,simplifyPrimitive} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';
const run='research/runs/2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b';
const source='public/assets/models/product-estuary.glb';
const hash=b=>createHash('sha256').update(b).digest('hex');
const protectedMeshes=[1,2,4,30,40,41,42,43];
const protectedNames=['BodyWindshield','BodyWindshieldGasket','BodyWindshieldWipersBase','BodyRoofPanel','BodyHood','BodyHoodInterior01','BodyHoodInterior02','BodyHoodTopgrill'];
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
 const protectedRecords=protectedMeshes.map((mi,i)=>{assert.equal(meshes[mi].listPrimitives().length,1);assert(doc.getRoot().listNodes().some(n=>n.getMesh()===meshes[mi]&&n.getName()===protectedNames[i]));return {mesh:mi,primitive:0,nodeName:protectedNames[i],before:snapshot(meshes[mi].listPrimitives()[0])};});
 const protectedAccessors=new Set(protectedMeshes.flatMap(mi=>meshes[mi].listPrimitives().flatMap(p=>[p.getIndices(),...p.listAttributes()])));
 let processed=0;
 for(const [mi,m] of meshes.entries())for(const p of m.listPrimitives()){
  if(protectedMeshes.includes(mi))continue;
  assert.equal(p.getMode(),4);assert.equal(p.listTargets().length,0);
  compactPrimitive(p);
  assert([p.getIndices(),...p.listAttributes()].every(a=>!protectedAccessors.has(a)),'Accessor isolation failed');
  simplifyPrimitive(p,{simplifier:MeshoptSimplifier,ratio:0.80,error:0.0001,lockBorder:true});processed++;
 }
 for(const r of protectedRecords){r.after=snapshot(meshes[r.mesh].listPrimitives()[0]);assert.deepEqual(r.before,r.after);}
 await io.write(`${run}/${name}.glb`,doc);
 writeFileSync(`${run}/${name}-authoring.json`,JSON.stringify({source,sourceSha256:hash(bytes),protectedRecords,processed,globalSimplifyInvoked:false,globalWeldInvoked:false},null,2)+'\n',{flag:'wx'});
 console.log(name,readFileSync(`${run}/${name}.glb`).length,hash(readFileSync(`${run}/${name}.glb`)));
}
assert(readFileSync(`${run}/candidate.glb`).equals(readFileSync(`${run}/repeat.glb`)));
console.log('Two independent reconstructions match exact bytes; protected snapshots match.');
