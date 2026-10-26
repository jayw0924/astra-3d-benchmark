import { Box3, DirectionalLight, GridHelper, HemisphereLight, Mesh, Object3D, PCFSoftShadowMap, PlaneGeometry, PMREMGenerator, Scene, ShadowMaterial, Vector3, type WebGLRenderer } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const lightingRecipes = {
  original: { id: 'original', hemisphere: 2.5, key: 5.5, rim: 3.5, environment: false, grounded: false },
  'environment-only': { id: 'environment-only', hemisphere: 0.65, key: 2.4, rim: 1.1, environment: true, grounded: false },
  'grounded-studio': { id: 'grounded-studio', hemisphere: 0.65, key: 2.4, rim: 1.1, environment: true, grounded: true },
} as const;
export const lightingSettings = { background: '#ddd9d0', exposure: 1.05, pmremSigma: 0.08, shadowMapSize: 1024, shadowOpacity: 0.24, floorOffset: 0.003, shadowBias: -0.00015, shadowNormalBias: 0.015 } as const;

/** Shadow-only neutral floor preserves the background; no model material changes. */
export function createGrounding(model: Object3D, bounds: Box3) {
  const size = bounds.getSize(new Vector3()), center = bounds.getCenter(new Vector3());
  const floor = new Mesh(new PlaneGeometry(Math.max(size.x, size.z) * 5, Math.max(size.x, size.z) * 5), new ShadowMaterial({ opacity: lightingSettings.shadowOpacity, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(center.x, bounds.min.y - lightingSettings.floorOffset, center.z); floor.receiveShadow = true;
  const flags = new Map<Mesh, boolean>();
  model.traverse(object => {
    if (!(object instanceof Mesh)) return;
    flags.set(object, object.castShadow);
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    object.castShadow = materials.every(m => !m.transparent);
  });
  let disposed = false;
  return { floor, dispose() {
    if (disposed) return; disposed = true;
    floor.removeFromParent(); floor.geometry.dispose(); floor.material.dispose();
    for (const [mesh, flag] of flags) mesh.castShadow = flag;
  } };
}

export type LightingPreset = keyof typeof lightingRecipes;
/** Dispose before replacement; bounds must be post-transform world-space bounds. */
export function createLightingRig({ scene, renderer, model, bounds, preset = 'original' }: { scene: Scene; renderer?: WebGLRenderer; model?: Object3D; bounds?: Box3; preset?: LightingPreset }) {
  const recipe = lightingRecipes[preset];
  if (recipe.environment && !renderer) throw new Error('renderer required');
  if (recipe.grounded && (!model || !bounds || bounds.isEmpty())) throw new Error('transformed model bounds required');
  const previousEnvironment = scene.environment;
  let environment: ReturnType<PMREMGenerator['fromScene']> | undefined;
  if (recipe.environment && renderer) {
    const room = new RoomEnvironment(), pmrem = new PMREMGenerator(renderer);
    try { environment = pmrem.fromScene(room, lightingSettings.pmremSigma); } finally { room.dispose(); pmrem.dispose(); }
    scene.environment = environment.texture;
  }
  const hemi = new HemisphereLight(0xf7f3ea, 0x30363d, recipe.hemisphere);
  const key = new DirectionalLight(0xffffff, recipe.key); key.position.set(4, 8, 5);
  const rim = new DirectionalLight(0x93b6d4, recipe.rim); rim.position.set(-5, 3, -4);
  const grid = new GridHelper(24, 24, 0x9c9a94, 0xc9c5bb); grid.position.y = -0.015;
  scene.add(hemi, key, rim);
  const grounding = recipe.grounded && model && bounds ? createGrounding(model, bounds) : undefined;
  const priorShadows = renderer ? { enabled: renderer.shadowMap.enabled, type: renderer.shadowMap.type, autoUpdate: renderer.shadowMap.autoUpdate } : undefined;
  if (grounding && bounds && renderer) {
    scene.add(grounding.floor, key.target);
    const center = bounds.getCenter(new Vector3()), span = Math.max(...bounds.getSize(new Vector3()).toArray());
    // Keep the identical key and target in both candidate stages; fit only shadow camera.
    key.castShadow = true; key.shadow.mapSize.setScalar(lightingSettings.shadowMapSize);
    key.shadow.camera.left = key.shadow.camera.bottom = -span;
    key.shadow.camera.right = key.shadow.camera.top = span;
    key.shadow.camera.near = 0.1; key.shadow.camera.far = key.position.distanceTo(center) + span * 3;
    key.shadow.bias = lightingSettings.shadowBias; key.shadow.normalBias = lightingSettings.shadowNormalBias;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
  } else scene.add(grid);
  let disposed = false;
  return { recipe, floor: grounding?.floor,
    invalidateShadows() { if (grounding && renderer) renderer.shadowMap.needsUpdate = true; },
    dispose() {
      if (disposed) return; disposed = true;
      scene.remove(hemi, key, rim, grid, key.target); grounding?.dispose(); key.shadow.dispose();
      if (environment) { if (scene.environment === environment.texture) scene.environment = previousEnvironment; environment.dispose(); }
      if (renderer && priorShadows) Object.assign(renderer.shadowMap, priorShadows);
      grid.geometry.dispose(); for (const m of Array.isArray(grid.material) ? grid.material : [grid.material]) m.dispose();
    },
  };
}
