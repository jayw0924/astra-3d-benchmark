// Astra-authored. Run from any cwd. Only the two fixed run-local outputs are allowed.
import { open, readFile, rename, rm } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const filename = process.argv[2] ?? 'candidate.glb';
assert(['candidate.glb', 'candidate-repeat.glb'].includes(filename));
const output = path.join(here, filename);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const bytes = await readFile(path.join(root, 'public/assets/models/product.glb'));
assert.equal(hash(bytes), '67b7986109c72f6fcc61745e4e2eef25833fbf5c43fa6ffc0f0cf4e9d9e91f41');
assert.equal(bytes.readUInt32LE(0), 0x46546c67);
assert.equal(bytes.readUInt32LE(4), 2);
assert.equal(bytes.readUInt32LE(8), bytes.length);
assert.equal(bytes.readUInt32LE(16), 0x4e4f534a);
const jsonLength = bytes.readUInt32LE(12);
const j = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString('utf8'));
const key = 'KHR_materials_variants';
assert.deepEqual(j.extensions[key].variants.map(v => v.name), ['Carmine Candy', 'Pearly Swirly', 'Torched Graphite']);
assert(!j.nodes.some(n => ['License Plate', 'InteriorSteeringEmblem'].includes(n.name)));
assert.equal(j.materials.length, 28);
// Editable design parameters: linear RGB, opaque pigment, no metallic flakes.
const finish = {
  name: 'Fjord Enamel',
  doubleSided: true,
  alphaMode: 'OPAQUE',
  pbrMetallicRoughness: {
    baseColorFactor: [0.018, 0.105, 0.125, 1],
    metallicFactor: 0,
    roughnessFactor: 0.32,
  },
  extensions: {
    KHR_materials_clearcoat: {
      clearcoatFactor: 1,
      clearcoatRoughnessFactor: 0.12,
    },
  },
};
// Deliberately no new maps or borrowed flake normals: smooth solid-color enamel.
const newMaterial = j.materials.length;
j.materials.push(finish);
j.extensions[key].variants.push({ name: finish.name });
const counts = { exterior: 0, interior: 0 };
for (const [mi, mesh] of j.meshes.entries()) for (const primitive of mesh.primitives) {
  const mappings = primitive.extensions?.[key]?.mappings;
  if (!mappings) continue;
  const selected = mappings.filter(m => m.variants.includes(2));
  assert.equal(selected.length, 1);
  const source = j.materials[selected[0].material].name;
  const owners = j.nodes.filter(n => n.mesh === mi);
  assert(owners.length > 0);
  let material;
  if (['Paint 1 Graphite', 'Paint 2 Graphite'].includes(source)) {
    assert(owners.every(n => n.name.startsWith('Body')));
    material = newMaterial;
    counts.exterior++;
  } else {
    assert.equal(source, 'Interior 3 Graphite', 'Unexpected mapped family; review before extending scope');
    assert(owners.every(n => n.name.startsWith('Interior')));
    material = selected[0].material;
    counts.interior++;
  }
  // Append rather than edit any supplied mapping; every mapped primitive gets index 3.
  mappings.push({ material, variants: [3] });
}
assert.deepEqual(counts, { exterior: 16, interior: 9 });
const json = Buffer.from(JSON.stringify(j), 'utf8');
const padded = Buffer.alloc(Math.ceil(json.length / 4) * 4, 0x20);
json.copy(padded);
// Preserve all non-JSON chunks INCLUDING their headers and padding byte-for-byte.
const tail = bytes.subarray(20 + jsonLength);
const header = Buffer.alloc(20);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(20 + padded.length + tail.length, 8);
header.writeUInt32LE(padded.length, 12);
header.writeUInt32LE(0x4e4f534a, 16);
const candidate = Buffer.concat([header, padded, tail]);
// Create a new inode, then atomically replace the directory entry. This never
// follows a pre-existing symlink or writes through a hardlink at the target.
const temporary = path.join(here, `.candidate-${process.pid}-${randomUUID()}.tmp`);
let handle;
try {
  handle = await open(temporary, 'wx', 0o644);
  await handle.writeFile(candidate);
  await handle.sync();
  await handle.close();
  handle = undefined;
  await rename(temporary, output);
} finally {
  await handle?.close();
  await rm(temporary, { force: true });
}
console.log(JSON.stringify({ output: path.relative(root, output), bytes: candidate.length, sha256: hash(candidate), assignments: counts, newMaterial, variant: 3 }, null, 2));
