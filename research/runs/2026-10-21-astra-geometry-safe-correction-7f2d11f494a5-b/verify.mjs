// Independent of authoring: raw GLB semantics + existing independent reporter.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import validator from 'gltf-validator';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
const run='research/runs/2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b';
const hash=b=>createHash('sha256').update(b).digest('hex');
const save=(name,data)=>writeFileSync(`${run}/${name}`,JSON.stringify(data,null,2)+'\n');
function parse(file) {
  const bytes=readFileSync(file);
  assert.equal(bytes.readUInt32LE(0),0x46546c67); assert.equal(bytes.readUInt32LE(4),2); assert.equal(bytes.readUInt32LE(8),bytes.length);
  let json,bin;
  for(let o=12;o<bytes.length;) {const n=bytes.readUInt32LE(o),t=bytes.readUInt32LE(o+4);assert(o+8+n<=bytes.length); if(t===0x4e4f534a)json=JSON.parse(bytes.subarray(o+8,o+8+n));else if(t===0x004e4942)bin=bytes.subarray(o+8,o+8+n);o+=8+n;}
  assert(json&&bin); return {json,bin,bytes};
}
const a=parse('public/assets/models/product-estuary.glb'),b=parse(`${run}/candidate.glb`);
const checks=[];
function check(name,fn) {try {fn();checks.push({name,passed:true});}catch(e){checks.push({name,passed:false,error:e.message});}}
check('source pin',()=>{assert.equal(a.bytes.length,10191496);assert.equal(hash(a.bytes),'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f');});
check('repeat exact bytes',()=>assert(b.bytes.equals(readFileSync(`${run}/repeat.glb`))));
const reports=[];
for(const [id,role,file,out] of [['web-product-estuary','baseline','public/assets/models/product-estuary.glb','control-geometry-report.json'],['safe-webgl-correction-7f2d11f494a5-b','safe-webgl',`${run}/candidate.glb`,'candidate-geometry-report.pending.json']]) {
  const result=spawnSync('python',[`${run}/command.py`,'node','scripts/report-geometry.mjs','--asset-id',id,'--role',role,file],{encoding:'utf8',maxBuffer:10*1024*1024});
  assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);save(out,report);reports.push(report);
}
const ajv=new Ajv({allErrors:true});addFormats(ajv);
const validate=ajv.compile(JSON.parse(readFileSync('research/schemas/geometry-report.schema.json')));
for(const report of reports)check(`geometry schema ${report.role}`,()=>assert(validate(report),JSON.stringify(validate.errors)));
check('protected static counts',()=>{for(const key of ['scenes','nodes','reachableNodes','meshes','primitives','materials','textures','images','cameras','animations','skins'])assert.equal(reports[0].counts[key],reports[1].counts[key],key);});
check('world bounds within 1e-6 m',()=>{for(const key of ['min','max','dimensions'])for(let i=0;i<3;i++)assert(Math.abs(reports[0].bounds[key][i]-reports[1].bounds[key][i])<=1e-6,`${key}[${i}]`);});
check('no forbidden nodes',()=>{for(const x of [a,b])assert(!x.json.nodes.some(n=>['License Plate','InteriorSteeringEmblem'].includes(n.name)));});
check('hierarchy names and transforms',()=>{
  const nodes=j=>j.nodes.map(n=>({...n,translation:n.translation??[0,0,0],rotation:n.rotation??[0,0,0,1],scale:n.scale??[1,1,1]}));
  assert.deepEqual(nodes(a.json),nodes(b.json));assert.deepEqual(a.json.scenes,b.json.scenes);assert.equal(a.json.scene??0,b.json.scene??0);
});
check('materials equal with glTF default alphaMode OPAQUE',()=>{
  const normalize=materials=>materials.map(m=>({...m,alphaMode:m.alphaMode??'OPAQUE'}));
  assert.deepEqual(normalize(a.json.materials),normalize(b.json.materials));
});
check('textures and samplers exact JSON semantics',()=>{assert.deepEqual(a.json.textures,b.json.textures);assert.deepEqual(a.json.samplers,b.json.samplers);});
check('extension sets and root variant definitions',()=>{for(const key of ['extensionsUsed','extensionsRequired'])assert.deepEqual([...a.json[key]].sort(),[...b.json[key]].sort());assert.deepEqual(a.json.extensions,b.json.extensions);});
function images(x) {return x.json.images.map(i=>{const v=x.json.bufferViews[i.bufferView];return {...i,bufferView:undefined,sha256:hash(x.bin.subarray(v.byteOffset??0,(v.byteOffset??0)+v.byteLength))};});}
check('embedded KTX2 image identity',()=>assert.deepEqual(images(a),images(b)));
const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
const types={5121:[1,'readUInt8'],5123:[2,'readUInt16LE'],5125:[4,'readUInt32LE'],5126:[4,'readFloatLE']};
function accessor(x,i) {const ac=x.json.accessors[i],v=x.json.bufferViews[ac.bufferView],[size,read]=types[ac.componentType],width=widths[ac.type];assert(!ac.sparse);return Array.from({length:ac.count},(_,n)=>Array.from({length:width},(_,c)=>x.bin[read]((v.byteOffset??0)+(ac.byteOffset??0)+n*(v.byteStride??size*width)+c*size)));}
const protectedPrimitives=[];
function rawAccessor(x,i){
 const ac=x.json.accessors[i],v=x.json.bufferViews[ac.bufferView],size=types[ac.componentType][0]*widths[ac.type];
 const bytes=Buffer.concat(Array.from({length:ac.count},(_,n)=>{const start=(v.byteOffset??0)+(ac.byteOffset??0)+n*(v.byteStride??size);return x.bin.subarray(start,start+size);}));
 return {type:ac.type,componentType:ac.componentType,normalized:ac.normalized??false,count:ac.count,sha256:hash(bytes)};
}
check('excluded primitives exact serialized geometry',()=>{
 for(const mi of [1,2,4,30,40,41,42,43]){
  const p=a.json.meshes[mi].primitives[0],q=b.json.meshes[mi].primitives[0];
  const before={indices:rawAccessor(a,p.indices),attributes:Object.fromEntries(Object.entries(p.attributes).map(([k,i])=>[k,rawAccessor(a,i)]))};
  const after={indices:rawAccessor(b,q.indices),attributes:Object.fromEntries(Object.entries(q.attributes).map(([k,i])=>[k,rawAccessor(b,i)]))};
  assert.deepEqual(after,before);assert.deepEqual(accessor(a,p.indices),accessor(b,q.indices));
  protectedPrimitives.push({mesh:mi,primitive:0,nodes:a.json.nodes.flatMap((n,i)=>n.mesh===mi?[{index:i,name:n.name}]:[]),before,after,exact:true});
 }
});
save('protected-primitives.json',protectedPrimitives);
const perPrimitive=[];
check('primitive identities, assignments, variants and vertex tuples',()=>{
  assert.equal(a.json.meshes.length,b.json.meshes.length);
  a.json.meshes.forEach((mesh,mi)=>{
    const other=b.json.meshes[mi];assert.equal(mesh.name,other.name);assert.equal(mesh.primitives.length,other.primitives.length);
    mesh.primitives.forEach((p,pi)=>{
      const q=other.primitives[pi];assert.equal(p.material,q.material);assert.equal(p.mode??4,q.mode??4);assert.deepEqual(p.extensions,q.extensions);
      const keys=Object.keys(p.attributes).sort();assert.deepEqual(keys,Object.keys(q.attributes).sort());
      const src=keys.map(k=>accessor(a,p.attributes[k])),dst=keys.map(k=>accessor(b,q.attributes[k]));
      const tuples=new Set(src[0].map((_,v)=>JSON.stringify(src.map(rows=>rows[v]))));
      for(let v=0;v<dst[0].length;v++)assert(tuples.has(JSON.stringify(dst.map(rows=>rows[v]))),`Changed attribute tuple ${mi}/${pi}/${v}`);
      const indices=accessor(b,q.indices).flat();assert.equal(indices.length%3,0);for(const index of indices)assert(index>=0&&index<dst[0].length);
      const mappings=q.extensions?.KHR_materials_variants?.mappings??[];
      const assigned=Array.from({length:4},(_,vi)=>mappings.filter(m=>m.variants.includes(vi)));
      if(mappings.length)assert(assigned.every(m=>m.length===1),`Incomplete variant mapping ${mi}/${pi}`);
      // Matches viewer semantics: mapped primitives always assigned; unmapped stay at base.
      for(let previous=0;previous<4;previous++)for(let next=0;next<4;next++) {
        const previousMaterial=assigned[previous][0]?.material??q.material;
        const sequential=assigned[next][0]?.material??previousMaterial;
        assert.equal(sequential,assigned[next][0]?.material??q.material);
      }
      perPrimitive.push({mesh:mi,primitive:pi,name:mesh.name??null,sourceTriangles:a.json.accessors[p.indices].count/3,candidateTriangles:indices.length/3,sourceVertices:src[0].length,candidateVertices:dst[0].length});
    });
  });
});
check('four variants each cover 25 primitives',()=>{assert.equal(reports[1].variants.length,4);assert.deepEqual(reports[0].variants,reports[1].variants);assert(reports[1].variants.every(v=>v.mappedPrimitives===25));});
const official=[];
for(const [name,x] of [['control',a],['candidate',b]]) {const result=await validator.validateBytes(new Uint8Array(x.bytes),{uri:`${name}.glb`,maxIssues:10000});save(`${name}-validator.json`,result);official.push({name,version:validator.version(),errors:result.issues.numErrors,warnings:result.issues.numWarnings,infos:result.issues.numInfos,codes:[...new Set(result.issues.messages.map(m=>m.code))]});check(`${name} official validator zero errors`,()=>assert.equal(result.issues.numErrors,0));}
const deltas={};for(const key of ['bytes',...Object.keys(reports[0].counts)]){const s=key==='bytes'?reports[0].bytes:reports[0].counts[key],c=key==='bytes'?reports[1].bytes:reports[1].counts[key];deltas[key]={source:s,candidate:c,change:c-s,reductionPercent:s?(s-c)/s*100:0};}
check('named delivery metric improves',()=>assert(b.bytes.length<a.bytes.length));
const result={checks,allPassed:checks.every(c=>c.passed),source:{bytes:a.bytes.length,sha256:hash(a.bytes)},candidate:{bytes:b.bytes.length,sha256:hash(b.bytes)},deltas,officialValidator:official,perPrimitive,limitations:['Static semantic evidence does not establish visual parity or browser variant behavior','Validator lacks complete KHR_texture_basisu/KTX2 support; zero errors is not full current Khronos certification','Fixed-view visual matrix, shader timings, browser performance, session evidence and Sol review pending']};
save('verification.json',result);console.log(JSON.stringify({...result,perPrimitive:undefined},null,2));assert(result.allPassed,'Protected check failed; stop and review verification.json');
