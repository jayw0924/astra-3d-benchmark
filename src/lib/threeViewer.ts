import {
  ACESFilmicToneMapping,
  Box3,
  BufferGeometry,
  Color,
  DirectionalLight,
  GridHelper,
  HemisphereLight,
  LineSegments,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Texture,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader, type GLTF, type GLTFParser } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Finish } from './configuration';
import type { ViewerController } from '../components/Configurator';

type VariantMapping = { material: number; variants: number[] };
type PrimitiveDefinition = {
  extensions?: {
    KHR_materials_variants?: { mappings: VariantMapping[] };
  };
};
type GltfJson = {
  extensions?: {
    KHR_materials_variants?: { variants: Array<{ name: string }> };
  };
  meshes?: Array<{ primitives: PrimitiveDefinition[] }>;
};
type Association = { meshes?: number; primitives?: number };

type LoadedModel = {
  gltf: GLTF;
  parser: GLTFParser;
};
type VariantAssignment = { object: Mesh; material: Material };

export function disposeObject(
  root: Object3D,
  additionalMaterials: Iterable<Material> = [],
) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>(additionalMaterials);
  const textures = new Set<Texture>();
  root.traverse((object) => {
    if (!(object instanceof Mesh) && !(object instanceof LineSegments)) return;
    geometries.add(object.geometry);
    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of objectMaterials) materials.add(material);
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) {
    for (const value of Object.values(material)) {
      if (value instanceof Texture) textures.add(value);
    }
    material.dispose();
  }
  for (const texture of textures) texture.dispose();
}

async function applyVariant(
  model: LoadedModel,
  finish: Finish,
  knownMaterials: Set<Material>,
): Promise<VariantAssignment[]> {
  const json = model.parser.json as GltfJson;
  const variants = json.extensions?.KHR_materials_variants?.variants ?? [];
  const variantIndex = variants.findIndex((variant) => variant.name === finish);
  if (variantIndex < 0) throw new Error(`Missing material variant: ${finish}`);

  const changes: Array<Promise<VariantAssignment>> = [];
  model.gltf.scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const association = model.parser.associations.get(object) as
      | Association
      | undefined;
    if (association?.meshes === undefined || association.primitives === undefined)
      return;
    const primitive =
      json.meshes?.[association.meshes]?.primitives[association.primitives];
    const mappings = primitive?.extensions?.KHR_materials_variants?.mappings;
    const mapping = mappings?.find((candidate) =>
      candidate.variants.includes(variantIndex),
    );
    if (!mapping) return;
    changes.push(
      model.parser.getDependency('material', mapping.material).then((material) => {
        knownMaterials.add(material);
        return { object, material };
      }),
    );
  });
  return Promise.all(changes);
}

export function createThreeViewer(canvas: HTMLCanvasElement): ViewerController {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = new Scene();
  scene.background = new Color('#ddd9d0');
  const camera = new PerspectiveCamera(32, 1, 0.01, 100);
  const defaultCameraPosition = new Vector3(6.4, 3.25, 7.2);
  camera.position.copy(defaultCameraPosition);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.minDistance = 3.8;
  controls.maxDistance = 12;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.target.set(0, 0.55, 0.1);

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

  const ktx2Loader = new KTX2Loader()
    .setTranscoderPath('/basis/')
    .detectSupport(renderer);
  const loader = new GLTFLoader().setKTX2Loader(ktx2Loader);
  let model: LoadedModel | null = null;
  let disposed = false;
  let variantRequest = 0;
  let frame = 0;
  const originalRimColors = new Map<MeshStandardMaterial, Color>();
  const knownMaterials = new Set<Material>();

  function resize() {
    const width = Math.max(canvas.clientWidth, 1);
    const height = Math.max(canvas.clientHeight, 1);
    if (canvas.width !== Math.round(width * renderer.getPixelRatio()) ||
        canvas.height !== Math.round(height * renderer.getPixelRatio())) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }

  function animate() {
    if (disposed) return;
    resize();
    controls.update();
    renderer.render(scene, camera);
    frame = requestAnimationFrame(animate);
  }
  frame = requestAnimationFrame(animate);

  return {
    async load(onProgress) {
      const gltf = await loader.loadAsync('/assets/models/product-estuary-safe.glb', (event) => {
        if (event.total > 0) onProgress?.((event.loaded / event.total) * 100);
      });
      if (disposed) {
        disposeObject(gltf.scene);
        return;
      }
      const licensePlate = gltf.scene.getObjectByName('License Plate');
      if (licensePlate) licensePlate.visible = false;
      gltf.scene.traverse((object) => {
        object.frustumCulled = true;
        if (!(object instanceof Mesh)) return;
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        for (const material of materials) {
          knownMaterials.add(material);
          if (
            material instanceof MeshStandardMaterial &&
            ['Rim1', 'Rim2'].includes(material.name)
          ) {
            originalRimColors.set(material, material.color.clone());
          }
        }
      });
      const bounds = new Box3().setFromObject(gltf.scene);
      const center = bounds.getCenter(new Vector3());
      gltf.scene.position.sub(center);
      gltf.scene.position.y += bounds.getSize(new Vector3()).y / 2;
      gltf.scene.rotation.y = -0.22;
      scene.add(gltf.scene);
      model = { gltf, parser: gltf.parser };
    },
    async setFinish(finish) {
      if (!model) return;
      const request = ++variantRequest;
      const assignments = await applyVariant(model, finish, knownMaterials);
      if (disposed) {
        disposeObject(new Object3D(), assignments.map(({ material }) => material));
        return;
      }
      if (request !== variantRequest) return;
      for (const { object, material } of assignments) object.material = material;
    },
    setTrim(trim) {
      for (const [material, originalColor] of originalRimColors) {
        if (trim === 'dark') {
          material.color.set('#181a1d');
          material.metalness = 0.85;
          material.roughness = 0.3;
        } else {
          material.color.copy(originalColor);
          material.metalness = 1;
          material.roughness = 0.24;
        }
        material.needsUpdate = true;
      }
    },
    adjustView(action) {
      const offset = camera.position.clone().sub(controls.target);
      if (action === 'left' || action === 'right') {
        offset.applyAxisAngle(
          new Vector3(0, 1, 0),
          action === 'left' ? -0.2 : 0.2,
        );
      } else {
        const distance = offset.length();
        const nextDistance = action === 'in' ? distance * 0.85 : distance * 1.15;
        offset.setLength(
          Math.min(controls.maxDistance, Math.max(controls.minDistance, nextDistance)),
        );
      }
      camera.position.copy(controls.target).add(offset);
      controls.update();
    },
    resetCamera() {
      camera.position.copy(defaultCameraPosition);
      controls.target.set(0, 0.55, 0.1);
      controls.update();
    },
    dispose() {
      disposed = true;
      variantRequest += 1;
      cancelAnimationFrame(frame);
      controls.dispose();
      ktx2Loader.dispose();
      disposeObject(scene, knownMaterials);
      renderer.dispose();
    },
  };
}
