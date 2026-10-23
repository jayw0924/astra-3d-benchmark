// Supplemental independent raw check, correcting inherited single-primitive assumption.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const run='research/runs/2026-10-22-astra-geometry-mobile-bd8abb4a578f';
const hash=b=>createHash('sha256').update(b).digest('hex');
function parse(file){const bytes=readFileSync(file);const length=bytes.readUInt32LE(12);const json=JSON.parse(bytes.subarray(20,20+length));assert.equal(bytes.readUInt32LE(24+length),0x004e4942);return {json,bin:bytes.subarray(28+length)};}
const a=parse('public/assets/models/product-estuary.glb'),b=parse(`${run}/candidate.glb`);
const protectedMeshes=[1,2,3,4,30,33,34,35,36,37,38,40,41,42,43,45,50,51,52,53,54,69,70,71,72,73,87,89,91,93];
const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4},sizes={5121:1,5123:2,5125:4,5126:4};
function raw(x,id){const ac=x.json.accessors[id],v=x.json.bufferViews[ac.bufferView],size=widths[ac.type]*sizes[ac.componentType];assert(size&&!ac.sparse);const bytes=Buffer.concat(Array.from({length:ac.count},(_,n)=>{const o=(v.byteOffset??0)+(ac.byteOffset??0)+n*(v.byteStride??size);assert(o+size<=x.bin.length);return x.bin.subarray(o,o+size);}));return {type:ac.type,componentType:ac.componentType,normalized:ac.normalized??false,count:ac.count,sha256:hash(bytes)};}
const snap=(x,p)=>({indices:raw(x,p.indices),attributes:Object.fromEntries(Object.entries(p.attributes).map(([k,v])=>[k,raw(x,v)]))});
const records=[];
for(const mi of protectedMeshes){assert.equal(a.json.meshes[mi].primitives.length,b.json.meshes[mi].primitives.length);for(const [pi,p] of a.json.meshes[mi].primitives.entries()){const q=b.json.meshes[mi].primitives[pi],before=snap(a,p),after=snap(b,q);assert.deepEqual(after,before);records.push({mesh:mi,primitive:pi,before,after,exact:true});}}
// No eligible serialized primitive may alias a protected accessor.
const ids=p=>[p.indices,...Object.values(p.attributes)];
const protectedIds=new Set(protectedMeshes.flatMap(mi=>b.json.meshes[mi].primitives.flatMap(ids)));
for(const [mi,m] of b.json.meshes.entries())if(!protectedMeshes.includes(mi))for(const p of m.primitives)for(const id of ids(p))assert(!protectedIds.has(id),`Aliased protected accessor ${mi}/${id}`);
const prior=JSON.parse(readFileSync(`${run}/verification.json`));const failure=prior.checks.filter(c=>!c.passed);assert.equal(failure.length,1);assert.equal(failure[0].name,'excluded primitives exact serialized geometry');assert.equal(failure[0].error,'Expected values to be strictly equal:\n\n2 !== 1\n');
const result={allPassed:true,priorEvidence:'verification.json',priorFailurePreserved:true,correction:'Inspector now checks ALL primitives of protected meshes; no candidate edits',protectedMeshCount:protectedMeshes.length,protectedPrimitiveCount:records.length,records,serializedAccessorIsolation:true,remainingPriorChecksPassed:true,candidate:prior.candidate,limitations:['Exact stored attributes and indices do not prove interpolation on simplified meshes, arbitrary silhouette or hidden details','Initial verifier failure was a false single-primitive assumption, not corrupted geometry']};
writeFileSync(`${run}/verification-final.json`,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...result,records:undefined},null,2));
