// Astra-authored material recipe. Run from any cwd; no dependencies, no random values.
// Only the fixed candidate path is writable. Geometry/image BIN chunk is copied verbatim.
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { open, readFile, rename, rm } from 'node:fs/promises';

const input = new URL('../../../public/assets/models/product.glb', import.meta.url);
const output = new URL('./candidate.glb', import.meta.url);
const expectedHash = '67b7986109c72f6fcc61745e4e2eef25833fbf5c43fa6ffc0f0cf4e9d9e91f41';
const hash = (b) => createHash('sha256').update(b).digest('hex');
const source = await readFile(input);
assert.equal(hash(source), expectedHash, 'Approved input hash mismatch');
assert.equal(source.readUInt32LE(0), 0x46546c67);
assert.equal(source.readUInt32LE(4), 2);
assert.equal(source.readUInt32LE(8), source.length);
assert.equal(source.readUInt32LE(16), 0x4e4f534a);
const jsonEnd = 20 + source.readUInt32LE(12);
const gltf = JSON.parse(source.subarray(20, jsonEnd).toString('utf8'));
assert.equal(source.readUInt32LE(jsonEnd + 4), 0x004e4942);
assert.equal(jsonEnd + 8 + source.readUInt32LE(jsonEnd), source.length);
const variants = gltf.extensions.KHR_materials_variants.variants;
assert.deepEqual(variants.map((v) => v.name), ['Carmine Candy', 'Pearly Swirly', 'Torched Graphite']);
assert(!gltf.nodes.some((n) => ['License Plate', 'InteriorSteeringEmblem'].includes(n.name)));
const materialIndex = (name) => {
  const matches = gltf.materials.flatMap((m, i) => m.name === name ? [i] : []);
  assert.equal(matches.length, 1, `Unique source material required: ${name}`);
  return matches[0];
};

// Editable linear-light RGB factors (not sRGB byte values). Solid pigment, no metallic flakes.
const recipe = {
  name: 'Estuary Enamel',
  main: { baseColorFactor: [0.018, 0.105, 0.085, 1], metallicFactor: 0, roughnessFactor: 0.32 },
  accent: { baseColorFactor: [0.012, 0.025, 0.023, 1], metallicFactor: 0, roughnessFactor: 0.36 },
  clearcoat: { clearcoatFactor: 1, clearcoatRoughnessFactor: 0.12 },
};
const main = gltf.materials.length;
for (const [role, pbr] of [['Main', recipe.main], ['Accent', recipe.accent]]) {
  gltf.materials.push({
    name: `${recipe.name} ${role}`,
    // Retain sourced paint's two-sided surface convention; do not change geometry.
    doubleSided: true,
    alphaMode: 'OPAQUE',
    pbrMetallicRoughness: pbr,
    extensions: { KHR_materials_clearcoat: { ...recipe.clearcoat } },
  });
}
const assignments = new Map([
  [materialIndex('Paint 1 Carmine'), main],
  [materialIndex('Paint 2 Carmine'), main + 1],
  [materialIndex('Interior 3 Carmine'), materialIndex('Interior 3 Graphite')],
]);
const variant = variants.length;
variants.push({ name: recipe.name });
let coverage = 0;
for (const mesh of gltf.meshes) {
  for (const primitive of mesh.primitives) {
    const mappings = primitive.extensions?.KHR_materials_variants?.mappings;
    if (!mappings) continue;
    const baseline = mappings.filter((mapping) => mapping.variants.includes(0));
    assert.equal(baseline.length, 1);
    const material = assignments.get(baseline[0].material);
    assert.notEqual(material, undefined, `Unclassified variant primitive in ${mesh.name}`);
    mappings.push({ material, variants: [variant] });
    coverage++;
  }
}
assert.equal(coverage, 25);
assert(gltf.extensionsUsed.includes('KHR_materials_clearcoat'));
// JSON whitespace/padding and GLB length necessarily change; no serializer touches BIN.
const json = Buffer.from(JSON.stringify(gltf), 'utf8');
const padded = Buffer.alloc(Math.ceil(json.length / 4) * 4, 0x20);
json.copy(padded);
const header = Buffer.from(source.subarray(0, 20));
header.writeUInt32LE(20 + padded.length + source.length - jsonEnd, 8);
header.writeUInt32LE(padded.length, 12);
const candidate = Buffer.concat([header, padded, source.subarray(jsonEnd)]);
// Create a new inode, then atomically replace the directory entry. This never
// follows a pre-existing symlink or writes through a hardlink at the target.
const temporary = new URL(`./.candidate-${process.pid}-${randomUUID()}.tmp`, import.meta.url);
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
console.log(JSON.stringify({ finish: recipe.name, bytes: candidate.length, sha256: hash(candidate), mappedPrimitives: coverage, materialsAdded: 2, output: output.pathname }, null, 2));
