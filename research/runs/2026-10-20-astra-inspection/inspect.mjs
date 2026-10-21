// Read-only asset inspection. Writes evidence only beside this script.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Matrix4, Vector3, Quaternion } from 'three';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';

const out = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(out, '../../..');
const hash = (b) => createHash('sha256').update(b).digest('hex');
const paths = ['research/assets/upstream/CarConcept.glb', 'public/assets/models/product.glb'];
function parse(b) {
  assert.equal(b.readUInt32LE(0), 0x46546c67);
  assert.equal(b.readUInt32LE(4), 2);
  assert.equal(b.readUInt32LE(8), b.length);
  let json, bin;
  for (let offset = 12; offset < b.length;) {
    const size = b.readUInt32LE(offset), type = b.readUInt32LE(offset + 4);
    const chunk = b.subarray(offset + 8, offset + 8 + size);
    if (type === 0x4e4f534a) json = JSON.parse(chunk.toString());
    if (type === 0x004e4942) bin = chunk;
    offset += 8 + size;
  }
  return { json, bin };
}
function inventory(bytes) {
  const { json: j, bin } = parse(bytes);
  const access = (index) => {
    const a = j.accessors[index], v = j.bufferViews[a.bufferView];
    assert.equal(a.sparse, undefined, 'Sparse accessors need a different decoder');
    const widths = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
    const types = { 5123: [2, 'readUInt16LE'], 5125: [4, 'readUInt32LE'], 5126: [4, 'readFloatLE'] };
    const [size, read] = types[a.componentType];
    const width = widths[a.type], stride = v.byteStride ?? size * width;
    return Array.from({ length: a.count }, (_, i) => Array.from({ length: width }, (_, c) => bin[read]((v.byteOffset ?? 0) + (a.byteOffset ?? 0) + i * stride + c * size)));
  };
  const primitives = j.meshes.flatMap((m, mi) => m.primitives.map((p, pi) => {
    assert.equal(p.mode ?? 4, 4);
    const positions = access(p.attributes.POSITION);
    const indices = p.indices === undefined ? positions.map((_, i) => i) : access(p.indices).flat();
    assert.equal(indices.length % 3, 0);
    assert(indices.every((i) => i < positions.length));
    assert(positions.flat().every(Number.isFinite));
    return { mesh: mi, primitive: pi, meshName: m.name ?? '', vertices: positions.length, indices: indices.length, triangles: indices.length / 3, attributes: p.attributes, material: p.material, mappings: p.extensions?.KHR_materials_variants?.mappings ?? [] };
  }));
  const hierarchy = [];
  let min = new Vector3(Infinity, Infinity, Infinity), max = new Vector3(-Infinity, -Infinity, -Infinity);
  let renderedIndices = 0;
  function visit(i, parent, depth, ancestors = []) {
    assert(!ancestors.includes(i), 'Scene graph cycle');
    const n = j.nodes[i];
    const local = n.matrix ? new Matrix4().fromArray(n.matrix) : new Matrix4().compose(new Vector3(...(n.translation ?? [0, 0, 0])), new Quaternion(...(n.rotation ?? [0, 0, 0, 1])), new Vector3(...(n.scale ?? [1, 1, 1])));
    const world = parent.clone().multiply(local);
    hierarchy.push({ index: i, name: n.name ?? '', depth, parent: ancestors.at(-1) ?? null, mesh: n.mesh ?? null, children: n.children ?? [], worldMatrix: world.toArray() });
    if (n.mesh !== undefined) for (const p of j.meshes[n.mesh].primitives) {
      const positions = access(p.attributes.POSITION);
      renderedIndices += p.indices === undefined ? positions.length : j.accessors[p.indices].count;
      for (const position of positions) { const v = new Vector3(...position).applyMatrix4(world); min.min(v); max.max(v); }
    }
    for (const child of n.children ?? []) visit(child, world, depth + 1, [...ancestors, i]);
  }
  assert.equal(j.scenes.length, 1, 'Report currently expects one scene');
  for (const node of j.scenes[j.scene ?? 0].nodes) visit(node, new Matrix4(), 0);
  const positionIds = new Set(primitives.map((p) => p.attributes.POSITION));
  const images = (j.images ?? []).map((im, i) => {
    assert.equal(im.mimeType, 'image/ktx2');
    const bv = j.bufferViews[im.bufferView];
    const b = bin.subarray(bv.byteOffset ?? 0, (bv.byteOffset ?? 0) + bv.byteLength);
    assert.equal(b.subarray(0, 12).toString('hex'), 'ab4b5458203230bb0d0a1a0a');
    return { index: i, bytes: b.length, sha256: hash(b), width: b.readUInt32LE(20), height: b.readUInt32LE(24), levels: b.readUInt32LE(40), supercompressionScheme: b.readUInt32LE(44), mimeType: im.mimeType };
  });
  return {
    bytes: bytes.length, sha256: hash(bytes), asset: j.asset,
    counts: { scenes: j.scenes.length, nodes: j.nodes.length, reachableNodes: hierarchy.length, meshes: j.meshes.length, primitives: primitives.length, materials: j.materials.length, textures: j.textures.length, images: images.length, cameras: (j.cameras ?? []).length, animations: (j.animations ?? []).length, skins: (j.skins ?? []).length, triangles: primitives.reduce((s, p) => s + p.triangles, 0), renderVertices: renderedIndices, uploadVertices: [...positionIds].reduce((s, i) => s + j.accessors[i].count, 0) },
    bounds: { method: 'Decode all POSITION float32 values and apply full scene world matrices; axis-aligned bounds, glTF metres', min: min.toArray(), max: max.toArray(), dimensions: max.clone().sub(min).toArray() },
    hierarchy, primitives, materials: j.materials, textures: j.textures, images,
    variants: j.extensions?.KHR_materials_variants?.variants ?? [],
    extensionsUsed: j.extensionsUsed, extensionsRequired: j.extensionsRequired,
    cameras: j.cameras ?? [], animations: j.animations ?? [],
    externalUris: [...(j.buffers ?? []), ...(j.images ?? [])].flatMap((x) => x.uri ? [x.uri] : []),
  };
}
const results = [];
for (const p of paths) results.push({ path: p, ...inventory(await readFile(path.join(root, p))) });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const document = await io.read(path.join(root, paths[0]));
const removed = [];
for (const node of document.getRoot().listNodes()) if (['License Plate', 'InteriorSteeringEmblem'].includes(node.getName())) { removed.push(node.getName()); node.dispose(); }
assert.equal(removed.length, 2);
await document.transform(prune());
const regenerated = await io.writeBinary(document);
const derivative = await readFile(path.join(root, paths[1]));
const reproducibility = { method: 'Same sanitizer operations in memory; no model files written', removed, regeneratedSha256: hash(regenerated), byteIdenticalToServed: Buffer.from(regenerated).equals(derivative) };
assert(reproducibility.byteIdenticalToServed);
const report = { assets: results, reproducibility };
await writeFile(path.join(out, 'inventory.json'), JSON.stringify(report, null, 2) + '\n');
for (const a of results) console.log(JSON.stringify({ path: a.path, counts: a.counts, bounds: a.bounds, variants: a.variants, images: a.images.map(({width,height}) => [width,height]) }, null, 2));
console.log(JSON.stringify(reproducibility, null, 2));
