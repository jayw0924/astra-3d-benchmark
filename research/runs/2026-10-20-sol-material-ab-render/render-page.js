import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  DirectionalLight,
  GridHelper,
  HemisphereLight,

  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  Mesh,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { closeupCameraSpec } from './render-camera.js';

const canvas = document.querySelector('#render');
const params = new URLSearchParams(location.search);
const modelUrl = params.get('model');
const candidateVariant = params.get('variant');
const lighting = params.get('lighting');
if (!modelUrl || !candidateVariant || !['viewer', 'neutral'].includes(lighting)) {
  throw new Error('model, variant, and valid lighting query parameters are required');
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
scene.background = new Color(lighting === 'viewer' ? '#ddd9d0' : '#d6d6d3');
const camera = new PerspectiveCamera(32, 1.5, 0.01, 100);

let environmentTarget = null;
if (lighting === 'viewer') {
  scene.add(new HemisphereLight(0xf7f3ea, 0x30363d, 2.5));
  const key = new DirectionalLight(0xffffff, 5.5);
  key.position.set(4, 8, 5);
  scene.add(key);
  const rim = new DirectionalLight(0x93b6d4, 3.5);
  rim.position.set(-5, 3, -4);
  scene.add(rim);
  const grid = new GridHelper(24, 24, 0x9c9a94, 0xc9c5bb);
  grid.position.y = -0.015;
  scene.add(grid);
} else {
  const pmrem = new PMREMGenerator(renderer);
  environmentTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  pmrem.dispose();
  scene.environment = environmentTarget.texture;
}

const ktx2Loader = new KTX2Loader()
  .setTranscoderPath('/basis/')
  .detectSupport(renderer);
const loader = new GLTFLoader().setKTX2Loader(ktx2Loader);
const loadStarted = performance.now();
const gltf = await loader.loadAsync(modelUrl);
const modelLoadMs = performance.now() - loadStarted;
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
const mappedMeshes = [];
root.traverse((object) => {
  if (!(object instanceof Mesh)) return;
  const association = gltf.parser.associations.get(object);
  if (association?.meshes === undefined || association.primitives === undefined) return;
  const primitive = json.meshes?.[association.meshes]?.primitives?.[association.primitives];
  const mappings = primitive?.extensions?.KHR_materials_variants?.mappings;
  if (mappings) mappedMeshes.push({ object, mappings });
});

async function applyVariant(name) {
  const index = variants.findIndex((variant) => variant.name === name);
  if (index < 0) throw new Error(`Missing variant ${name}`);
  const assignments = [];
  for (const { object, mappings } of mappedMeshes) {
    const mapping = mappings.find((candidate) => candidate.variants.includes(index));
    if (!mapping) throw new Error(`Missing mapping for ${object.name} and ${name}`);
    assignments.push({
      object,
      material: await gltf.parser.getDependency('material', mapping.material),
    });
  }
  for (const { object, material } of assignments) object.material = material;
  return assignments.length;
}

const transitionMetrics = [];
camera.position.set(6.4, 3.25, 7.2);
camera.lookAt(new Vector3(0, 0.55, 0.1));
camera.updateProjectionMatrix();
await applyVariant(candidateVariant);
const coldCompileStarted = performance.now();
// SwiftShader does not expose KHR_parallel_shader_compile, so use the
// synchronous API before the first render of the candidate materials.
renderer.compile(scene, camera);
const coldMaterialCompileMs = performance.now() - coldCompileStarted;
for (const source of ['Carmine Candy', 'Pearly Swirly', 'Torched Graphite']) {
  await applyVariant(source);
  renderer.render(scene, camera);
  const started = performance.now();
  const assignments = await applyVariant(candidateVariant);
  renderer.render(scene, camera);
  transitionMetrics.push({
    source,
    target: candidateVariant,
    durationMs: performance.now() - started,
    assignments,
  });
}

const fixedViews = {
  'front-three-quarter': {
    position: [6.4, 3.25, 7.2],
    target: [0, 0.55, 0.1],
  },
  side: {
    position: [8.2, 2.25, 0],
    target: [0, 0.58, 0],
  },
  'rear-three-quarter': {
    position: [-6.4, 3.0, -7.2],
    target: [0, 0.55, -0.1],
  },
};

function setFixedView(name) {
  const view = fixedViews[name];
  if (!view) throw new Error(`Unknown fixed view: ${name}`);
  camera.fov = 32;
  camera.position.fromArray(view.position);
  camera.lookAt(new Vector3().fromArray(view.target));
  camera.updateProjectionMatrix();
}

function setCloseupView(name) {
  const object = root.getObjectByName(name);
  if (!object) throw new Error(`Missing close-up object: ${name}`);
  root.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(object);
  if (bounds.isEmpty()) throw new Error(`Empty close-up bounds: ${name}`);
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const spec = closeupCameraSpec(name, center.toArray(), size.toArray());
  const direction = new Vector3().fromArray(spec.direction);
  direction.normalize();
  camera.fov = spec.fov;
  const distance = spec.distance;
  camera.position.copy(center).addScaledVector(direction, distance);
  camera.lookAt(center);
  camera.near = Math.max(0.005, distance / 100);
  camera.far = Math.max(20, distance * 20);
  camera.updateProjectionMatrix();
}

function renderView(name, kind) {
  if (kind === 'closeup') setCloseupView(name);
  else setFixedView(name);
  renderer.render(scene, camera);
}

setFixedView('front-three-quarter');
renderer.render(scene, camera);

const frameDurations = [];
for (let index = 0; index < 20; index += 1) {
  const started = performance.now();
  renderer.render(scene, camera);
  await new Promise((resolve) => requestAnimationFrame(resolve));
  if (index >= 5) frameDurations.push(performance.now() - started);
}
const sortedFrames = [...frameDurations].sort((left, right) => left - right);
const percentile = (p) => sortedFrames[Math.min(sortedFrames.length - 1, Math.floor(sortedFrames.length * p))];
const metrics = {
  modelUrl,
  candidateVariant,
  lighting,
  renderer: renderer.capabilities.isWebGL2 ? 'WebGL2' : 'WebGL1',
  resolution: { width: 600, height: 400, devicePixelRatio: 1 },
  colorManagement: {
    outputColorSpace: 'SRGBColorSpace',
    toneMapping: 'ACESFilmicToneMapping',
    exposure: 1.05,
  },
  modelLoadMs,
  coldMaterialCompileMs,
  frameTimingMs: {
    samples: frameDurations.length,
    median: percentile(0.5),
    p95: percentile(0.95),
  },
  transitions: transitionMetrics,
  rendererInfo: {
    calls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    geometries: renderer.info.memory.geometries,
    textures: renderer.info.memory.textures,
    programs: renderer.info.programs?.length ?? null,
  },
};

window.__renderHarness = {
  metrics,
  renderView,
  dispose() {
    ktx2Loader.dispose();
    environmentTarget?.dispose();
    renderer.dispose();
  },
};
document.body.dataset.ready = 'true';
