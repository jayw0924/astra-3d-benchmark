// Separate inspection implementation: never imports or executes the authoring script.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Matrix4, Quaternion, Vector3 } from 'three';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const hash = (b) => createHash('sha256').update(b).digest('hex');
const directory = new URL('./', import.meta.url);
async function inspect(url) {
  const bytes = await readFile(url);
  assert.equal(bytes.readUInt32LE(0), 0x46546c67);
  assert.equal(bytes.readUInt32LE(4), 2);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  const chunks = [];
  for (let offset = 12; offset < bytes.length;) {
    const length = bytes.readUInt32LE(offset);
    assert.equal(length % 4, 0);
    assert(offset + 8 + length <= bytes.length);
    chunks.push({ type: bytes.readUInt32LE(offset + 4), data: bytes.subarray(offset + 8, offset + 8 + length) });
    offset += 8 + length;
  }
  assert.deepEqual(chunks.map((c) => c.type), [0x4e4f534a, 0x004e4942]);
  const g = JSON.parse(chunks[0].data.toString());
  const bin = chunks[1].data;
  assert.equal(g.buffers.length, 1);
  assert(!g.buffers[0].uri);
  assert(g.buffers[0].byteLength <= bin.length);
  const readAccessor = (index) => {
    const a = g.accessors[index], v = g.bufferViews[a.bufferView];
    assert(!a.sparse && !a.normalized);
    const size = { 5121: 1, 5123: 2, 5125: 4, 5126: 4 }[a.componentType];
    const components = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
    assert(size && components);
    const method = {5121:'readUInt8',5123:'readUInt16LE',5125:'readUInt32LE',5126:'readFloatLE'}[a.componentType];
    return Array.from({length:a.count}, (_, i) => Array.from({length:components}, (_, c) => {
      const local = (a.byteOffset ?? 0) + i * (v.byteStride ?? size * components) + c * size;
      assert(local + size <= v.byteLength);
      const value = bin[method]((v.byteOffset ?? 0) + local);
      assert(Number.isFinite(value));
      return value;
    }));
  };
  const positions = new Map();
  const primitives = [];
  let triangles = 0, renderVertices = 0;
  g.meshes.forEach((m, mi) => m.primitives.forEach((p, pi) => {
    assert.equal(p.mode ?? 4, 4);
    if (!positions.has(p.attributes.POSITION)) positions.set(p.attributes.POSITION, readAccessor(p.attributes.POSITION));
    const points = positions.get(p.attributes.POSITION);
    const indices = readAccessor(p.indices).flat();
    assert(indices.every((i) => i >= 0 && i < points.length));
    assert.equal(indices.length % 3, 0);
    triangles += indices.length / 3;
    renderVertices += indices.length;
    primitives.push({mesh:mi, primitive:pi, name:m.name ?? '', vertices:points.length, triangles:indices.length / 3, mappings:p.extensions?.KHR_materials_variants?.mappings ?? []});
  }));
  const min = new Vector3(Infinity,Infinity,Infinity), max = new Vector3(-Infinity,-Infinity,-Infinity);
  const visited = new Set();
  function visit(index, parent) {
    assert(!visited.has(index), 'Repeated/cyclic scene node'); visited.add(index);
    const n = g.nodes[index];
    const local = n.matrix ? new Matrix4().fromArray(n.matrix) : new Matrix4().compose(new Vector3().fromArray(n.translation ?? [0,0,0]),new Quaternion().fromArray(n.rotation ?? [0,0,0,1]),new Vector3().fromArray(n.scale ?? [1,1,1]));
    const world = parent.clone().multiply(local);
    if (n.mesh !== undefined) for (const p of g.meshes[n.mesh].primitives) for (const point of positions.get(p.attributes.POSITION)) {
      const v = new Vector3().fromArray(point).applyMatrix4(world); min.min(v); max.max(v);
    }
    for (const child of n.children ?? []) visit(child, world);
  }
  assert.equal(g.scenes.length, 1);
  for (const n of g.scenes[g.scene ?? 0].nodes) visit(n, new Matrix4());
  assert.equal(visited.size, g.nodes.length);
  const variants = g.extensions.KHR_materials_variants.variants.map((v) => v.name);
  const mapped = primitives.filter((p) => p.mappings.length);
  const coverage = variants.map((name, vi) => {
    const counts = mapped.map((p) => p.mappings.filter((m) => m.variants.includes(vi)).length);
    assert(counts.every((n) => n === 1));
    return { name, mappedPrimitives:counts.length, missing:0, ambiguous:0 };
  });
  for (const p of mapped) for (const m of p.mappings) {
    assert(Number.isInteger(m.material) && m.material >= 0 && m.material < g.materials.length);
    assert(m.variants.every((v) => Number.isInteger(v) && v >= 0 && v < variants.length));
  }
  const removedNodes = ['License Plate','InteriorSteeringEmblem'].filter((name) => g.nodes.some((n) => n.name === name));
  assert.deepEqual(removedNodes, []);
  const images = g.images.map((image) => {
    assert(!image.uri); const v = g.bufferViews[image.bufferView];
    return { mimeType:image.mimeType, bytes:v.byteLength, sha256:hash(bin.subarray(v.byteOffset ?? 0,(v.byteOffset ?? 0) + v.byteLength)) };
  });
  const inventory = {path:url.pathname, bytes:bytes.length, sha256:hash(bytes), counts:{nodes:g.nodes.length, reachableNodes:visited.size, meshes:g.meshes.length, primitives:primitives.length, triangles, renderVertices, uniquePositionVertices:[...positions.values()].reduce((n,p)=>n+p.length,0), materials:g.materials.length,textures:g.textures.length,images:g.images.length}, bounds:{min:min.toArray(),max:max.toArray(),dimensions:max.clone().sub(min).toArray(),units:'glTF metres'}, extensionsUsed:g.extensionsUsed,extensionsRequired:g.extensionsRequired,variants,coverage,removedNodesPresent:removedNodes,images,primitives};
  // Independent library parse in addition to our raw binary/accessor checks.
  const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).readBinary(bytes);
  assert.equal(doc.getRoot().listMaterials().length, g.materials.length);
  inventory.nodeIOParse = 'passed (not a Khronos Validator certification)';
  return {g,bin,inventory};
}
const source = await inspect(new URL('../../../public/assets/models/product.glb', import.meta.url));
const candidate = await inspect(new URL('candidate.glb', directory));
assert(source.bin.equals(candidate.bin), 'BIN differs');
const a = source.g, b = candidate.g;
assert.deepEqual(b.materials.slice(0,a.materials.length), a.materials);
assert.equal(b.materials.length, a.materials.length + 2);
assert.deepEqual(b.extensions.KHR_materials_variants.variants.slice(0,3), a.extensions.KHR_materials_variants.variants);
assert.equal(b.extensions.KHR_materials_variants.variants[3].name, 'Estuary Enamel');
const changes = [];
const reconstructed = structuredClone(b);
reconstructed.materials.splice(a.materials.length);
reconstructed.extensions.KHR_materials_variants.variants.splice(3);
for (let mi = 0; mi < a.meshes.length; mi++) for (let pi = 0; pi < a.meshes[mi].primitives.length; pi++) {
  const original = a.meshes[mi].primitives[pi];
  const mapped = original.extensions?.KHR_materials_variants?.mappings;
  if (!mapped) continue;
  const updated = b.meshes[mi].primitives[pi].extensions.KHR_materials_variants.mappings;
  assert.deepEqual(updated.slice(0,mapped.length), mapped);
  assert.equal(updated.length, mapped.length + 1);
  const added = updated.at(-1);
  const family = a.materials[mapped.find((m) => m.variants.includes(0)).material].name;
  const expected = {'Paint 1 Carmine':28,'Paint 2 Carmine':29,'Interior 3 Carmine':26}[family];
  assert.deepEqual(added, {material:expected, variants:[3]});
  changes.push({mesh:mi,primitive:pi,name:a.meshes[mi].name,sourceFamily:family,newMaterial:added.material,newMaterialName:b.materials[added.material].name});
  reconstructed.meshes[mi].primitives[pi].extensions.KHR_materials_variants.mappings.pop();
}
assert.deepEqual(reconstructed,a,'Unexpected semantic difference');
assert.deepEqual(source.inventory.bounds,candidate.inventory.bounds);
// Simulate every previous supplied variant then new variant, including all primitives.
for (let previous = 0; previous < 3; previous++) for (const m of b.meshes) for (const p of m.primitives) {
  const mappings = p.extensions?.KHR_materials_variants?.mappings ?? [];
  const state = mappings.find((x)=>x.variants.includes(previous))?.material ?? p.material;
  const next = mappings.find((x)=>x.variants.includes(3))?.material ?? state;
  const direct = mappings.find((x)=>x.variants.includes(3))?.material ?? p.material;
  assert.equal(next,direct,'History-dependent assignment');
}
const report = {source:source.inventory,candidate:candidate.inventory,comparison:{binaryPayloadIdentical:true,binarySha256:hash(source.bin),geometryHierarchyTransformsTexturesAndDefaultMaterialsIdentical:true,originalMaterialsAndVariantAssignmentsIdentical:true,dimensionsIdentical:true,historyIndependentAllThreePriorVariants:true,addedMaterials:b.materials.slice(28),addedVariant:b.extensions.KHR_materials_variants.variants[3],assignmentChanges:changes,assignmentCounts:Object.fromEntries([26,28,29].map((id)=>[b.materials[id].name,changes.filter((c)=>c.newMaterial===id).length])),byteDelta:candidate.inventory.bytes-source.inventory.bytes,serializerChanges:'JSON re-encoding/padding and GLB total/JSON chunk lengths only; binary chunk header and payload byte-identical',unintendedSemanticDifferences:[]}};
console.log(JSON.stringify({candidate:report.candidate,comparison:report.comparison}, (key,value)=>Array.isArray(value) && ['primitives','images','assignmentChanges'].includes(key)?undefined:value,2));
