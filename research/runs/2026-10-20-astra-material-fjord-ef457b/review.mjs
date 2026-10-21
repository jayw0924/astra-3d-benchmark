// Independent artifact review: does not import or execute the authoring script.
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Matrix4, Quaternion, Vector3 } from 'three';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const hash = b => createHash('sha256').update(b).digest('hex');
async function load(p) {
  const b = await readFile(p);
  assert.equal(b.readUInt32LE(0), 0x46546c67);
  assert.equal(b.readUInt32LE(4), 2);
  assert.equal(b.readUInt32LE(8), b.length);
  const chunks = [];
  for (let o = 12; o < b.length;) {
    const length = b.readUInt32LE(o), type = b.readUInt32LE(o + 4);
    assert.equal(length % 4, 0); assert(o + 8 + length <= b.length);
    chunks.push({ type, data: b.subarray(o + 8, o + 8 + length) });
    o += 8 + length;
  }
  assert.deepEqual(chunks.map(c => c.type), [0x4e4f534a, 0x004e4942]);
  return { b, j: JSON.parse(chunks[0].data.toString()), bin: chunks[1].data };
}
function inventory({ b, j, bin }) {
  function accessor(index) {
    const a = j.accessors[index], v = j.bufferViews[a.bufferView];
    assert(!a.sparse); assert.equal(v.buffer, 0);
    const [size, method] = { 5123: [2, 'readUInt16LE'], 5125: [4, 'readUInt32LE'], 5126: [4, 'readFloatLE'] }[a.componentType];
    const width = { SCALAR: 1, VEC3: 3 }[a.type]; assert(width);
    return Array.from({ length: a.count }, (_, i) => Array.from({ length: width }, (_, k) => {
      const offset = (a.byteOffset ?? 0) + i * (v.byteStride ?? size * width) + k * size;
      assert(offset + size <= v.byteLength);
      return bin[method]((v.byteOffset ?? 0) + offset);
    }));
  }
  const ids = new Set(); let triangles = 0, primitives = 0, renderVertices = 0;
  for (const m of j.meshes) for (const p of m.primitives) {
    assert.equal(p.mode ?? 4, 4); primitives++;
    ids.add(p.attributes.POSITION);
    const positions = accessor(p.attributes.POSITION);
    assert(positions.flat().every(Number.isFinite));
    const indices = p.indices === undefined ? positions.map((_, i) => i) : accessor(p.indices).flat();
    assert(indices.every(i => Number.isInteger(i) && i >= 0 && i < positions.length));
    assert.equal(indices.length % 3, 0); triangles += indices.length / 3;
  }
  const min = new Vector3(Infinity, Infinity, Infinity), max = new Vector3(-Infinity, -Infinity, -Infinity), reached = new Set();
  function visit(i, parent, ancestors) {
    assert(!ancestors.includes(i)); reached.add(i);
    const n = j.nodes[i];
    const local = n.matrix ? new Matrix4().fromArray(n.matrix) : new Matrix4().compose(new Vector3(...(n.translation ?? [0,0,0])), new Quaternion(...(n.rotation ?? [0,0,0,1])), new Vector3(...(n.scale ?? [1,1,1])));
    const world = parent.clone().multiply(local);
    if (n.mesh !== undefined) for (const p of j.meshes[n.mesh].primitives) {
      const positions = accessor(p.attributes.POSITION);
      renderVertices += p.indices === undefined ? positions.length : j.accessors[p.indices].count;
      for (const v of positions) { const point = new Vector3(...v).applyMatrix4(world); min.min(point); max.max(point); }
    }
    for (const child of n.children ?? []) visit(child, world, [...ancestors, i]);
  }
  assert.equal(j.scenes.length, 1);
  for (const n of j.scenes[j.scene ?? 0].nodes) visit(n, new Matrix4(), []);
  assert.equal(reached.size, j.nodes.length);
  const removed = ['License Plate', 'InteriorSteeringEmblem'];
  assert(!j.nodes.some(n => removed.includes(n.name)));
  const coverage = j.extensions.KHR_materials_variants.variants.map((v, vi) => {
    let mapped = 0;
    for (const m of j.meshes) for (const p of m.primitives) {
      const mappings = p.extensions?.KHR_materials_variants?.mappings;
      if (!mappings) continue;
      const selected = mappings.filter(x => x.variants.includes(vi));
      assert.equal(selected.length, 1); assert(j.materials[selected[0].material]); mapped++;
    }
    return { name: v.name, mappedPrimitives: mapped };
  });
  return { bytes: b.length, sha256: hash(b), counts: { nodes: j.nodes.length, meshes: j.meshes.length, primitives, triangles, uploadVertices: [...ids].reduce((s,i) => s+j.accessors[i].count,0), renderVertices, materials: j.materials.length, textures: j.textures.length, images: j.images.length }, bounds: { min: min.toArray(), max: max.toArray(), dimensions: max.clone().sub(min).toArray(), unit: 'metres (glTF convention)' }, extensionsUsed: j.extensionsUsed, extensionsRequired: j.extensionsRequired, variants: coverage, absentNodes: removed, texturePayloads: j.images.map((im,i) => { const v=j.bufferViews[im.bufferView]; return { image:i, bytes:v.byteLength, sha256:hash(bin.subarray(v.byteOffset ?? 0,(v.byteOffset ?? 0)+v.byteLength)) }; }) };
}
const source = await load(path.join(root, 'public/assets/models/product.glb'));
const candidate = await load(path.join(here, 'candidate.glb'));
const repeat = await load(path.join(here, 'candidate-repeat.glb'));
assert(candidate.b.equals(repeat.b), 'Two executions must be byte-identical');
assert(source.bin.equals(candidate.bin), 'BIN chunk must be byte-identical');
const differences = [];
function diff(a,b,p='') {
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    for (const k of new Set([...Object.keys(a),...Object.keys(b)])) diff(a[k],b[k],p+'/'+k);
  } else differences.push({ path:p, before:a ?? null, after:b ?? null });
}
diff(source.j,candidate.j);
const restored = structuredClone(candidate.j);
const addedMaterial = restored.materials.pop();
assert.equal(addedMaterial.name,'Fjord Enamel');
assert.equal(addedMaterial.pbrMetallicRoughness.metallicFactor,0);
assert.deepEqual(restored.extensions.KHR_materials_variants.variants.pop(),{name:'Fjord Enamel'});
const assignments=[];
for (const [mi,m] of restored.meshes.entries()) for (const [pi,p] of m.primitives.entries()) {
  const mappings=p.extensions?.KHR_materials_variants?.mappings;
  if (!mappings) continue;
  const added=mappings.pop(); assert.deepEqual(added.variants,[3]);
  const owners=restored.nodes.filter(n=>n.mesh===mi).map(n=>n.name);
  const interior=owners.every(n=>n.startsWith('Interior'));
  assert.equal(added.material,interior ? 26 : 28);
  if (!interior) assert(owners.every(n=>n.startsWith('Body')));
  assignments.push({mesh:mi,primitive:pi,nodes:owners,material:added.material,materialName:candidate.j.materials[added.material].name});
}
assert.equal(assignments.length,25);
assert.deepEqual(restored,source.j,'Every JSON change must be an intended addition');
const a=inventory(source), b=inventory(candidate);
assert.deepEqual(a.bounds,b.bounds);
assert.deepEqual(a.texturePayloads,b.texturePayloads);
// Separate installed library parse, not a serializer round trip or full conformance certification.
const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).read(path.join(here,'candidate.glb'));
assert.equal(doc.getRoot().listMaterials().length,29);
const report={ source:a,candidate:b, deterministic:{ byteIdentical:true, firstSha256:hash(candidate.b), secondSha256:hash(repeat.b) }, comparison:{ binByteIdentical:true, unchangedJsonAfterRemovingAdditions:true, unintendedDifferences:[], intendedDifferences:differences, assignments, byteDelta:candidate.b.length-source.b.length, jsonSerialization:'JSON.stringify compact encoding and space padding; header lengths updated; no semantic normalization outside intended additions' }, independentLibraryRead:'glTF Transform NodeIO succeeded; not a Khronos validator certification' };
console.log(JSON.stringify({candidate:b,deterministic:report.deterministic,comparison:{...report.comparison,intendedDifferences:differences.length,assignments:assignments.length},independentLibraryRead:report.independentLibraryRead},null,2));
