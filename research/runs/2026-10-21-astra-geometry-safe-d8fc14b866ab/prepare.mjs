import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const run = 'research/runs/2026-10-21-astra-geometry-safe-d8fc14b866ab';
const source = 'public/assets/models/product-estuary.glb';
const bytes = readFileSync(source);
const hash = createHash('sha256').update(bytes).digest('hex');
assert.equal(bytes.length, 10191496);
assert.equal(hash, 'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f');
const handoff = readFileSync('research/ASTRA_HANDOFF.md', 'utf8');
const prompt = handoff.split('\n').filter(line => line.startsWith('>')).map(line => line.replace(/^> ?/, '')).join('\n') + '\n';
writeFileSync(`${run}/prompt.md`, prompt);
const versions = {};
for (const name of ['@gltf-transform/cli','@gltf-transform/core','@gltf-transform/functions','@gltf-transform/extensions','meshoptimizer','gltf-validator','@playwright/test']) {
  versions[name] = JSON.parse(readFileSync(`node_modules/${name}/package.json`)).version;
}
for (const name of ['@gltf-transform/cli','@gltf-transform/core','@gltf-transform/functions','@gltf-transform/extensions']) assert.equal(versions[name], '4.5.1');
assert.equal(versions.meshoptimizer, '1.2.0');
const environment = {capturedAt:new Date().toISOString(), projectRoot:process.cwd(), session:{id:'local-d8fc14b866ab86f25880391b832b60f366b81a1d92cd5df6932349a5b4b04c42',model:'gpt-6-astra',provider:'openai-codex',billingProvider:'openai-codex',identityBasis:'Runtime conversation metadata only; private persisted JSONL not yet verified',persistence:'Not verified from sandbox; authentic export required',privateExportPath:`${run}/session.jsonl`},source:{path:source,bytes:bytes.length,sha256:hash},runtime:{node:process.version,npm:execFileSync('npm',['--version'],{encoding:'utf8'}).trim()},versions,limitations:['No GUI applications launched; browser gates deferred','Blender/bpy/gltfpack unavailable in accepted preflight; not used','Known development CLI advisory chain; fixed repository-controlled arguments only']};
writeFileSync(`${run}/environment.json`,JSON.stringify(environment,null,2)+'\n');
const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
const primitives=json.meshes.flatMap((m,mi)=>m.primitives.map((p,pi)=>({mesh:mi,primitive:pi,name:m.name,triangles:json.accessors[p.indices].count/3,attributes:Object.keys(p.attributes),material:p.material})));
const inspection={source:environment.source,primitives:primitives.sort((a,b)=>b.triangles-a.triangles),materials:json.materials.map(m=>({name:m.name,extensions:Object.keys(m.extensions??{})})),images:json.images.map(i=>({name:i.name,mimeType:i.mimeType,bytes:json.bufferViews[i.bufferView].byteLength})),nodes:json.nodes.map(n=>n.name)};
writeFileSync(`${run}/source-inspection.json`,JSON.stringify(inspection,null,2)+'\n');
console.log(JSON.stringify({environment,inspection},null,2));
// Capture content identities of existing project files, excluding dependencies/caches and this run.
const paths=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(p=>p&&!p.startsWith(run+'/'));
const snapshot=Object.fromEntries(paths.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
writeFileSync(`${run}/workspace-before.json`,JSON.stringify(snapshot,null,2)+'\n');
