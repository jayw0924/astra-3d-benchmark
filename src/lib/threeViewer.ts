/// <reference types="vite/client" />
import {
  ACESFilmicToneMapping,
  Box3,
  BufferGeometry,
  Color,

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
import { createLightingRig } from './viewerLighting';
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
  disposedResources = new Set<BufferGeometry | Material | Texture>(),
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
  for (const geometry of geometries) {
    if (!disposedResources.has(geometry)) { disposedResources.add(geometry); geometry.dispose(); }
  }
  for (const material of materials) {
    for (const value of Object.values(material)) {
      if (value instanceof Texture) textures.add(value);
    }
    if (!disposedResources.has(material)) { disposedResources.add(material); material.dispose(); }
  }
  for (const texture of textures) {
    if (!disposedResources.has(texture)) { disposedResources.add(texture); texture.dispose(); }
  }
}

async function applyVariant(
  model: LoadedModel,
  finish: Finish,
  retainMaterial: (material: Material) => void,
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
        retainMaterial(material);
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

  let lighting = createLightingRig({ scene });

  const ktx2Loader = new KTX2Loader()
    .setTranscoderPath('/basis/')
    .detectSupport(renderer);
  const loader = new GLTFLoader().setKTX2Loader(ktx2Loader);
  let model: LoadedModel | null = null;
  let disposed = false;
  let variantRequest = 0;
  let frame = 0;
  let renderedFrames = 0;
  let shadowUpdates = 0;
  let appliedFinish: Finish | null = null;
  const originalRimColors = new Map<MeshStandardMaterial, Color>();
  const knownMaterials = new Set<Material>();
  const disposedResources = new Set<BufferGeometry | Material | Texture>();
  function retainMaterial(material: Material) {
    knownMaterials.add(material);
    if (disposed) disposeObject(new Object3D(), [material], disposedResources);
  }

  // Opt-in, read-only development seam: copies only; never exposes scene objects.
  function inspect(event: Event) {
    const receive = (event as CustomEvent<unknown>).detail;
    if (typeof receive !== 'function' || disposed) return;
    const json = model?.parser.json as GltfJson | undefined;
    const variant = json?.extensions?.KHR_materials_variants?.variants.findIndex(v => v.name === appliedFinish);
    const meshes: Array<unknown> = [];
    model?.gltf.scene.traverse(object => {
      if (!(object instanceof Mesh)) return;
      const association = model!.parser.associations.get(object) as Association | undefined;
      const mappings = association?.meshes === undefined || association.primitives === undefined ? undefined :
        json?.meshes?.[association.meshes]?.primitives[association.primitives]?.extensions?.KHR_materials_variants?.mappings;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      meshes.push({ name: object.name, castShadow: object.castShadow,
        expectedMaterial: mappings?.find(m => m.variants.includes(variant ?? -1))?.material,
        materials: materials.map(material => ({ name: material.name,
          index: (model!.parser.associations.get(material) as { materials?: number } | undefined)?.materials,
          transparent: material.transparent,
          ...(material instanceof MeshStandardMaterial ? { color: material.color.getHexString(), metalness: material.metalness, roughness: material.roughness } : {}),
        })) });
    });
    const bounds = model ? new Box3().setFromObject(model.gltf.scene) : null;
    receive({ finish: appliedFinish, recipe: lighting.recipe?.id, camera: camera.position.toArray(), target: controls.target.toArray(),
      bounds: bounds ? { min: bounds.min.toArray(), max: bounds.max.toArray() } : null,
      floorY: lighting.floor?.position.y, environment: !!scene.environment,
      shadows: { enabled: renderer.shadowMap.enabled, type: renderer.shadowMap.type, autoUpdate: renderer.shadowMap.autoUpdate, needsUpdate: renderer.shadowMap.needsUpdate },
      renderedFrames, shadowUpdates, meshes });
  }
  if (import.meta.env.DEV) canvas.addEventListener('viewer:inspect', inspect);

  function resize() {
    // Size follows the native application layout.
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
    if (renderer.shadowMap.enabled && renderer.shadowMap.needsUpdate) shadowUpdates += 1;
    renderer.render(scene, camera);
    renderedFrames += 1;
    frame = requestAnimationFrame(animate);
  }
  frame = requestAnimationFrame(animate);

  return {
    async load(onProgress) {
      const gltf = await loader.loadAsync('/assets/models/product-estuary-safe.glb', (event) => {
        if (event.total > 0) onProgress?.((event.loaded / event.total) * 100);
      });
      if (disposed) {
        disposeObject(gltf.scene, [], disposedResources);
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
      gltf.scene.updateMatrixWorld(true);
      lighting.dispose();
      lighting = createLightingRig({ scene, renderer, model: gltf.scene,
        bounds: new Box3().setFromObject(gltf.scene), preset: 'grounded-studio-refined' });
    },
    async setFinish(finish) {
      if (!model || disposed) return;
      const request = ++variantRequest;
      const assignments = await applyVariant(model, finish, retainMaterial);
      if (disposed) {
        return;
      }
      if (request !== variantRequest) return;
      const changed = assignments.some(({ object, material }) => object.material !== material);
      for (const { object, material } of assignments) object.material = material;
      appliedFinish = finish;
      if (changed) lighting.refreshCasters();
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
      // Drain pending orbit/pan/dolly deltas before overwriting the home pose.
      const damping = controls.enableDamping;
      controls.enableDamping = false;
      controls.update();
      camera.position.copy(defaultCameraPosition);
      controls.target.set(0, 0.55, 0.1);
      controls.update();
      controls.enableDamping = damping;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      canvas.removeEventListener('viewer:inspect', inspect);
      variantRequest += 1;
      cancelAnimationFrame(frame);
      controls.dispose();
      ktx2Loader.dispose();
      lighting.dispose();
      disposeObject(scene, knownMaterials, disposedResources);
      renderer.dispose();
    },
  };
}
