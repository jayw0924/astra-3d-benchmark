import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { Matrix4, Quaternion, Vector3 } from 'three';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const FORBIDDEN_NODES = ['License Plate', 'InteriorSteeringEmblem'];
const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
const COMPONENT_TYPES = {
  5120: { bytes: 1, read: 'readInt8', signed: true, max: 127 },
  5121: { bytes: 1, read: 'readUInt8', signed: false, max: 255 },
  5122: { bytes: 2, read: 'readInt16LE', signed: true, max: 32767 },
  5123: { bytes: 2, read: 'readUInt16LE', signed: false, max: 65535 },
  5125: { bytes: 4, read: 'readUInt32LE', signed: false, max: 4294967295 },
  5126: { bytes: 4, read: 'readFloatLE', float: true },
};

function option(name) {
  const index = process.argv.indexOf(name);
  if (index < 0 || !process.argv[index + 1]) throw new Error(`Missing ${name}`);
  return process.argv[index + 1];
}

const assetId = option('--asset-id');
const role = option('--role');
const sourceArgument = process.argv.at(-1);
if (!sourceArgument || sourceArgument.startsWith('--')) throw new Error('Missing source GLB path');
if (path.isAbsolute(sourceArgument) || sourceArgument.split(/[\\/]/).includes('..')) {
  throw new Error('Source GLB path must be project-relative and may not escape the project root');
}

const root = process.cwd();
const sourcePath = sourceArgument.split(path.sep).join('/');
const absoluteSource = path.resolve(root, sourceArgument);
const [realRoot, realSource] = await Promise.all([
  realpath(root),
  realpath(absoluteSource),
]);
const resolvedRelative = path.relative(realRoot, realSource);
if (resolvedRelative.startsWith('..') || path.isAbsolute(resolvedRelative)) {
  throw new Error('Source GLB path must be project-relative and may not escape the project root');
}
const bytes = await readFile(realSource);
const sha256 = createHash('sha256').update(bytes).digest('hex');

assert.equal(bytes.readUInt32LE(0), 0x46546c67, 'Expected a binary glTF file');
assert.equal(bytes.readUInt32LE(4), 2, 'Expected glTF 2.0');
assert.equal(bytes.readUInt32LE(8), bytes.length, 'GLB header length mismatch');

let json;
let binary;
for (let offset = 12; offset < bytes.length;) {
  const length = bytes.readUInt32LE(offset);
  const type = bytes.readUInt32LE(offset + 4);
  const chunk = bytes.subarray(offset + 8, offset + 8 + length);
  if (type === 0x4e4f534a) json = JSON.parse(chunk.toString());
  if (type === 0x004e4942) binary = chunk;
  offset += 8 + length;
}
assert(json && binary, 'Expected one JSON and one binary GLB chunk');
assert.equal(json.buffers?.length, 1, 'Expected one embedded buffer');
assert.equal(json.buffers[0].uri, undefined, 'External buffers are not supported');
assert.equal(json.extensionsUsed?.includes('EXT_meshopt_compression') ?? false, false,
  'EXT_meshopt_compression requires a decoded inspection path');

function normalizedValue(value, info) {
  if (info.float) return value;
  if (info.signed) return Math.max(value / info.max, -1);
  return value / info.max;
}

function readAccessor(index) {
  const accessor = json.accessors[index];
  assert(accessor, `Missing accessor ${index}`);
  assert.equal(accessor.sparse, undefined, 'Sparse accessors require a decoded inspection path');
  const view = json.bufferViews[accessor.bufferView];
  assert(view, `Missing buffer view for accessor ${index}`);
  const type = COMPONENT_TYPES[accessor.componentType];
  const width = COMPONENTS[accessor.type];
  assert(type && width, `Unsupported accessor encoding ${accessor.componentType}/${accessor.type}`);
  const stride = view.byteStride ?? type.bytes * width;
  return Array.from({ length: accessor.count }, (_, itemIndex) =>
    Array.from({ length: width }, (_, componentIndex) => {
      const offset = (view.byteOffset ?? 0)
        + (accessor.byteOffset ?? 0)
        + itemIndex * stride
        + componentIndex * type.bytes;
      const value = binary[type.read](offset);
      return accessor.normalized ? normalizedValue(value, type) : value;
    }),
  );
}

const positionAccessors = new Map();
const primitives = [];
let triangles = 0;
let submittedTriangleIndices = 0;
for (const [meshIndex, mesh] of (json.meshes ?? []).entries()) {
  for (const [primitiveIndex, primitive] of mesh.primitives.entries()) {
    assert.equal(primitive.mode ?? 4, 4, 'Only triangle primitives are supported');
    assert.notEqual(primitive.attributes?.POSITION, undefined, 'Primitive is missing POSITION');
    const positionIndex = primitive.attributes.POSITION;
    if (!positionAccessors.has(positionIndex)) {
      positionAccessors.set(positionIndex, readAccessor(positionIndex));
    }
    const positionCount = json.accessors[positionIndex].count;
    const indexCount = primitive.indices === undefined
      ? positionCount
      : json.accessors[primitive.indices].count;
    assert.equal(indexCount % 3, 0, 'Triangle index count is not divisible by three');
    triangles += indexCount / 3;
    submittedTriangleIndices += indexCount;
    primitives.push({ meshIndex, primitiveIndex, positionIndex, primitive });
  }
}

const min = new Vector3(Infinity, Infinity, Infinity);
const max = new Vector3(-Infinity, -Infinity, -Infinity);
const visited = new Set();

function localMatrix(node) {
  if (node.matrix) return new Matrix4().fromArray(node.matrix);
  return new Matrix4().compose(
    new Vector3().fromArray(node.translation ?? [0, 0, 0]),
    new Quaternion().fromArray(node.rotation ?? [0, 0, 0, 1]),
    new Vector3().fromArray(node.scale ?? [1, 1, 1]),
  );
}

function visit(nodeIndex, parentMatrix, ancestors = []) {
  assert.equal(ancestors.includes(nodeIndex), false, 'Scene graph cycle detected');
  const node = json.nodes[nodeIndex];
  assert(node, `Missing node ${nodeIndex}`);
  visited.add(nodeIndex);
  const world = parentMatrix.clone().multiply(localMatrix(node));
  if (node.mesh !== undefined) {
    for (const primitive of json.meshes[node.mesh].primitives) {
      for (const point of positionAccessors.get(primitive.attributes.POSITION)) {
        const transformed = new Vector3().fromArray(point).applyMatrix4(world);
        min.min(transformed);
        max.max(transformed);
      }
    }
  }
  for (const child of node.children ?? []) {
    visit(child, world, [...ancestors, nodeIndex]);
  }
}

const scene = json.scenes?.[json.scene ?? 0];
assert(scene, 'Default scene is missing');
for (const nodeIndex of scene.nodes ?? []) visit(nodeIndex, new Matrix4());
assert(Number.isFinite(min.x) && Number.isFinite(max.x), 'Scene contains no bounded geometry');

const variantNames = json.extensions?.KHR_materials_variants?.variants?.map(({ name }) => name) ?? [];
const variants = variantNames.map((name, variantIndex) => ({
  name,
  mappedPrimitives: primitives.filter(({ primitive }) =>
    (primitive.extensions?.KHR_materials_variants?.mappings ?? [])
      .some(({ variants: mappedVariants }) => mappedVariants.includes(variantIndex)),
  ).length,
}));

const forbiddenNodesPresent = FORBIDDEN_NODES.filter((name) =>
  (json.nodes ?? []).some((node) => node.name === name),
);
const document = await new NodeIO().registerExtensions(ALL_EXTENSIONS).readBinary(bytes);
assert.equal(document.getRoot().listMeshes().length, json.meshes?.length ?? 0);

const report = {
  schemaVersion: 1,
  id: `${assetId}-${role}-geometry`,
  assetId,
  role,
  sourcePath,
  bytes: bytes.length,
  sha256,
  counts: {
    scenes: json.scenes?.length ?? 0,
    nodes: json.nodes?.length ?? 0,
    reachableNodes: visited.size,
    meshes: json.meshes?.length ?? 0,
    primitives: primitives.length,
    materials: json.materials?.length ?? 0,
    textures: json.textures?.length ?? 0,
    images: json.images?.length ?? 0,
    cameras: json.cameras?.length ?? 0,
    animations: json.animations?.length ?? 0,
    skins: json.skins?.length ?? 0,
    triangles,
    submittedTriangleIndices,
    positionAccessorEntries: [...positionAccessors.keys()]
      .reduce((total, index) => total + json.accessors[index].count, 0),
  },
  bounds: {
    method: 'Decoded every POSITION accessor and applied full default-scene world transforms; axis-aligned bounds',
    min: min.toArray(),
    max: max.toArray(),
    dimensions: max.clone().sub(min).toArray(),
    units: 'metres',
  },
  variants,
  extensionsUsed: json.extensionsUsed ?? [],
  extensionsRequired: json.extensionsRequired ?? [],
  checks: {
    forbiddenNodesPresent,
    parserValidation: 'passed with @gltf-transform/core NodeIO (not Khronos Validator certification)',
  },
  measurement: {
    method: 'Raw GLB JSON/accessor inspection plus independent NodeIO parse',
    generatedBy: 'scripts/report-geometry.mjs',
  },
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
