import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {matrix,model} from './plan.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
export function validateEvidence(manifest){
 assert.equal(manifest.images.length,72,'72 exact captures required');
 assert.deepEqual([...new Set(manifest.images.map(x=>x.id))].sort(),matrix.map(x=>x.id).sort(),'identities must match plan');
 for(const item of matrix){const im=manifest.images.find(x=>x.id===item.id);for(const k of ['rig','finish','target'])assert.equal(im[k],item[k]);assert.equal(im.width,600);assert.equal(im.height,400);assert.equal(im.dpr,1);assert.ok(im.changedPixels>200);assert.ok(im.counts.calls>0&&im.counts.triangles>0);assert.equal(im.assignments.length,25);assert.ok(im.assignments.every(x=>x.verified));
  const paired=manifest.images.filter(x=>x.target===item.target&&x.finish===item.finish);for(const p of paired){assert.deepEqual(p.camera,im.camera);assert.deepEqual(p.transform,im.transform);assert.deepEqual(p.assignments,im.assignments);}
 }
 return {captures:manifest.images.length,pairedCameras:true,pairedTransforms:true,pairedAssignments:true};
}
export async function verify(){
 const here=path.dirname(fileURLToPath(import.meta.url)),m=JSON.parse(await readFile(path.join(here,'capture-manifest.json'))),result=validateEvidence(m);
 for(const [name,digest] of Object.entries(m.pins))assert.equal(hash(await readFile(name)),digest,name);
 assert.equal(hash(await readFile(path.join(here,'control-spec.json'))),m.specHash);
 const b=await readFile(model.path);assert.equal(b.length,model.bytes);assert.equal(hash(b),model.sha256);
 for(const im of m.images){const b=await readFile(path.join(here,im.path));assert.equal(b.length,im.bytes);assert.equal(hash(b),im.sha256);assert.equal(b.readUInt32BE(16),600);assert.equal(b.readUInt32BE(20),400);}
 for(const name of m.sessions){const s=JSON.parse(await readFile(path.join(here,name)));assert.equal(s.errors.length,0);assert.equal(s.modelRequests,1);assert.equal(s.transitions,16);assert.equal(s.disposal.environmentRestored,true);assert.equal(s.disposal.shadowFlagsRestored,true);assert.equal(s.metrics.servedHash,model.sha256);}
 return {...result,hashedPNGs:m.images.length,completedSessions:m.sessions.length,glbHash:model.sha256};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(await verify(),null,2));
