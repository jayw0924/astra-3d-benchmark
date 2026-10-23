import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.querySelector('#render');
const params = new URLSearchParams(location.search);
const modelUrl = params.get('model');
const variantName = params.get('variant');
const mode = params.get('mode');
const view = params.get('view');
if (!modelUrl || !variantName || !view || !['shaded', 'wireframe'].includes(mode)) {
  throw new Error('model, variant, view, and a valid mode are required');
}

const renderer = new WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
  preserveDrawingBuffer: true,
});
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setPixelRatio(1);
renderer.setSize(600, 400, false);

const scene = new Scene();
scene.background = new Color(mode === 'wireframe' ? '#eeeae2' : '#d6d6d3');
const camera = new PerspectiveCamera(32, 1.5, 0.01, 100);
const pmrem = new PMREMGenerator(renderer);
const environmentTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
pmrem.dispose();
scene.environment = environmentTarget.texture;

const ktx2Loader = new KTX2Loader()
  .setTranscoderPath('/basis/')
  .detectSupport(renderer);
const loader = new GLTFLoader().setKTX2Loader(ktx2Loader);
const gltf = await loader.loadAsync(modelUrl);
const root = gltf.scene;
root.rotation.y = -0.22;
root.updateMatrixWorld(true);
const initialBounds = new Box3().setFromObject(root);
const initialCenter = initialBounds.getCenter(new Vector3());
root.position.sub(initialCenter);
root.position.y += initialBounds.getSize(new Vector3()).y / 2;
scene.add(root);
root.updateMatrixWorld(true);

const json = gltf.parser.json;
const variants = json.extensions?.KHR_materials_variants?.variants ?? [];
const variantIndex = variants.findIndex((variant) => variant.name === variantName);
if (variantIndex < 0) throw new Error(`Missing variant ${variantName}`);

const assignments = [];
for (const object of root.getObjectsByProperty('isMesh', true)) {
  if (!(object instanceof Mesh)) continue;
  const association = gltf.parser.associations.get(object);
  if (association?.meshes === undefined || association.primitives === undefined) continue;
  const primitive = json.meshes?.[association.meshes]?.primitives?.[association.primitives];
  const mappings = primitive?.extensions?.KHR_materials_variants?.mappings;
  if (!mappings) continue;
  const mapping = mappings.find(({ variants: mappedVariants }) =>
    mappedVariants.includes(variantIndex));
  if (!mapping) throw new Error(`Missing mapping for ${object.name} and ${variantName}`);
  assignments.push({
    object,
    material: await gltf.parser.getDependency('material', mapping.material),
  });
}
for (const assignment of assignments) assignment.object.material = assignment.material;

let wireframeMaterial = null;
let hiddenMaterial = null;
if (mode === 'wireframe') {
  wireframeMaterial = new MeshBasicMaterial({
    color: 0x294744,
    side: DoubleSide,
    wireframe: true,
  });
  hiddenMaterial = new MeshBasicMaterial({
    colorWrite: false,
    depthWrite: false,
  });
  const target = root.getObjectByName(view);
  if (!target) throw new Error(`Missing wireframe target ${view}`);
  const targetMeshes = new Set();
  target.traverse((object) => {
    if (object instanceof Mesh) targetMeshes.add(object);
  });
  const ancestors = new Set();
  for (let ancestor = target.parent; ancestor; ancestor = ancestor.parent) {
    ancestors.add(ancestor);
  }
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    if (targetMeshes.has(object)) object.material = wireframeMaterial;
    else if (ancestors.has(object)) object.material = hiddenMaterial;
    else object.visible = false;
  });
  scene.environment = null;
  root.updateMatrixWorld(true);
  const targetBounds = new Box3().setFromObject(target);
  if (targetBounds.isEmpty()) throw new Error(`Empty wireframe target ${view}`);
  const targetCenter = targetBounds.getCenter(new Vector3());
  const targetSize = targetBounds.getSize(new Vector3());
  const outward = new Vector3(targetCenter.x, 0, targetCenter.z);
  if (outward.lengthSq() === 0) outward.set(1, 0, 1);
  outward.normalize();
  const distance = Math.max(targetSize.x, targetSize.y, targetSize.z) * 2.2;
  camera.fov = 30;
  camera.position.copy(targetCenter).addScaledVector(outward, distance);
  camera.position.y += targetSize.y * 0.15;
  camera.lookAt(targetCenter);
} else {
  camera.position.set(6.4, 3.25, 7.2);
  camera.lookAt(new Vector3(0, 0.55, 0.1));
}

camera.updateProjectionMatrix();
renderer.compile(scene, camera);
renderer.render(scene, camera);
await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
renderer.render(scene, camera);

window.__geometryHarness = {
  metrics: {
    modelUrl,
    variantName,
    mode,
    view,
    assignments: assignments.length,
    renderer: renderer.capabilities.isWebGL2 ? 'WebGL2' : 'WebGL1',
    rendererInfo: {
      calls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures,
      programs: renderer.info.programs?.length ?? null,
    },
  },
  dispose() {
    wireframeMaterial?.dispose();
    hiddenMaterial?.dispose();
    ktx2Loader.dispose();
    environmentTarget.dispose();
    renderer.dispose();
  },
};
document.body.dataset.ready = 'true';
