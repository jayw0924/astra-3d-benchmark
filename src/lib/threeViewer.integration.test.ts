import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Box3, BoxGeometry, Group, Mesh, MeshStandardMaterial, Texture } from 'three';
const state = vi.hoisted(() => ({ load: vi.fn(), controls: [] as Array<{rotateLeft:(angle:number)=>void;update:()=>void}>, rigs: [] as Array<{ dispose: ReturnType<typeof vi.fn>; refreshCasters: ReturnType<typeof vi.fn>; invalidateShadows: ReturnType<typeof vi.fn> }>, calls: [] as Array<Record<string, unknown>> }));
vi.mock('three', async importOriginal => ({ ...await importOriginal<typeof import('three')>(), WebGLRenderer: class {
 shadowMap = { enabled:false }; setPixelRatio() {} getPixelRatio() {return 1;} setSize() {} render() {} dispose() {}
} }));
vi.mock('three/addons/controls/OrbitControls.js', async importOriginal => {
 const actual=await importOriginal<typeof import('three/addons/controls/OrbitControls.js')>();
 return {OrbitControls: class extends actual.OrbitControls {
  constructor(...args: ConstructorParameters<typeof actual.OrbitControls>) {super(...args);state.controls.push(this);}
 }};
});
vi.mock('three/addons/loaders/KTX2Loader.js', () => ({ KTX2Loader: class { setTranscoderPath() {return this;} detectSupport() {return this;} dispose() {} } }));
vi.mock('three/addons/loaders/GLTFLoader.js', () => ({ GLTFLoader: class { setKTX2Loader() {return this;} loadAsync(...args: unknown[]) {return state.load(...args);} } }));
vi.mock('./viewerLighting', () => ({ createLightingRig: vi.fn((args: Record<string, unknown>) => {
 state.calls.push(args); const rig = {dispose:vi.fn(), refreshCasters:vi.fn(), invalidateShadows:vi.fn()};state.rigs.push(rig);return rig;
}) }));
import { createThreeViewer } from './threeViewer';
function fixture() {
 const scene = new Group();const mesh = new Mesh(new BoxGeometry(2, 2, 4),new MeshStandardMaterial()); scene.add(mesh);scene.position.set(4,3,2);
 const material = new MeshStandardMaterial({transparent:true});
 const parser = {json:{extensions:{KHR_materials_variants:{variants:[{name:'Carmine Candy'}]}},meshes:[{primitives:[{extensions:{KHR_materials_variants:{mappings:[{material:0,variants:[0]}]}}}]}]}, associations:new Map([[mesh,{meshes:0,primitives:0}]]),getDependency:vi.fn().mockResolvedValue(material)};
 return {scene,parser,mesh,material};
}
beforeEach(() => { state.calls=[];state.rigs=[];state.controls=[];state.load.mockReset();vi.stubGlobal('requestAnimationFrame',vi.fn(() => 1));vi.stubGlobal('cancelAnimationFrame',vi.fn()); });
describe('live lighting lifecycle', () => {
 it('clears real OrbitControls damping momentum before resetting the camera', () => {
  const canvas=document.createElement('canvas');const viewer=createThreeViewer(canvas);
  state.controls[0].rotateLeft(.6);viewer.resetCamera();state.controls[0].update();
  const read=vi.fn();canvas.dispatchEvent(new CustomEvent('viewer:inspect',{detail:read}));
  const camera=read.mock.calls[0][0].camera as number[];
  for(const [i,value] of [6.4,3.25,7.2].entries())expect(camera[i]).toBeCloseTo(value,8);
  viewer.dispose();
 });
 it('does not invalidate cached shadows when finish assignments are unchanged', async () => {
  const asset=fixture();state.load.mockResolvedValue(asset);const viewer=createThreeViewer(document.createElement('canvas'));await viewer.load();await viewer.setFinish('Carmine Candy');await viewer.setFinish('Carmine Candy');expect(state.rigs[1].refreshCasters).toHaveBeenCalledOnce();viewer.dispose();
 });
 it('offers a read-only dev inspection snapshot and removes the seam on teardown', async () => {
  const asset=fixture();state.load.mockResolvedValue(asset);const canvas=document.createElement('canvas');const viewer=createThreeViewer(canvas);await viewer.load();await viewer.setFinish('Carmine Candy');
  const read=vi.fn();canvas.dispatchEvent(new CustomEvent('viewer:inspect',{detail:read}));
  expect(read).toHaveBeenCalledOnce();expect(read.mock.calls[0][0]).toMatchObject({finish:'Carmine Candy',environment:false});
  for(const [i,value] of [6.4,3.25,7.2].entries())expect(read.mock.calls[0][0].camera[i]).toBeCloseTo(value,8);
  expect(read.mock.calls[0][0].meshes).toHaveLength(1);viewer.dispose();canvas.dispatchEvent(new CustomEvent('viewer:inspect',{detail:read}));expect(read).toHaveBeenCalledOnce();
 });
 it('releases each late dependency even when a sibling rejected, sharing textures only once', async () => {
  const asset=fixture();const second=asset.mesh.clone();asset.scene.add(second);asset.parser.associations.set(second,{meshes:0,primitives:0});
  const texture=new Texture();asset.mesh.material.map=texture;asset.material.map=texture;const textureDisposal=vi.spyOn(texture,'dispose');
  let resolve!: (value: MeshStandardMaterial) => void;
  asset.parser.getDependency.mockRejectedValueOnce(new Error('material failed')).mockImplementationOnce(() => new Promise(r => {resolve=r;}));
  state.load.mockResolvedValue(asset);const viewer=createThreeViewer(document.createElement('canvas'));await viewer.load();
  const pending=viewer.setFinish('Carmine Candy');await expect(pending).rejects.toThrow('material failed');viewer.dispose();
  const disposal=vi.spyOn(asset.material,'dispose');resolve(asset.material);await Promise.resolve();await Promise.resolve();
  expect(disposal).toHaveBeenCalledOnce();
  expect(textureDisposal).toHaveBeenCalledOnce();
 });
 it('refreshes shadows only after assignments commit, not stale async completions', async () => {
  const asset=fixture();state.load.mockResolvedValue(asset);const viewer=createThreeViewer(document.createElement('canvas'));await viewer.load();
  let resolveFirst!: (value: MeshStandardMaterial) => void;
  asset.parser.getDependency.mockImplementationOnce(() => new Promise(resolve => {resolveFirst=resolve;}));
  const stale=viewer.setFinish('Carmine Candy'); await viewer.setFinish('Carmine Candy');
  expect(state.rigs[1].refreshCasters).toHaveBeenCalledOnce();expect(asset.mesh.material).toBe(asset.material);
  resolveFirst(new MeshStandardMaterial());await stale;
  expect(state.rigs[1].refreshCasters).toHaveBeenCalledOnce();expect(asset.mesh.material).toBe(asset.material);viewer.dispose();
 });
 it('disposes late models without creating a grounded rig', async () => {
  const asset=fixture();let resolve!: (value: typeof asset) => void;state.load.mockImplementation(() => new Promise(r => {resolve=r;}));
  const viewer=createThreeViewer(document.createElement('canvas'));const load=viewer.load();viewer.dispose();
  const disposal=vi.spyOn(asset.mesh.geometry,'dispose');resolve(asset);await load;
  expect(disposal).toHaveBeenCalledOnce();expect(state.calls).toHaveLength(1);
 });
 it('does not request or attach variants after disposal', async () => {
  const asset=fixture();state.load.mockResolvedValue(asset);const viewer=createThreeViewer(document.createElement('canvas'));await viewer.load();viewer.dispose();await viewer.setFinish('Carmine Candy');
  expect(asset.parser.getDependency).not.toHaveBeenCalled();
 });
 it('replaces original only after centered rotated world bounds are ready and disposes in order', async () => {
 const asset=fixture();state.load.mockResolvedValue(asset);const viewer=createThreeViewer(document.createElement('canvas'));
 expect(state.calls[0].preset ?? 'original').toBe('original'); await viewer.load();
 expect(state.calls).toHaveLength(2);expect(state.rigs[0].dispose).toHaveBeenCalledOnce();
 const selected=state.calls[1];expect(selected.preset).toBe('grounded-studio-refined');expect(selected.model).toBe(asset.scene);
 expect((selected.bounds as Box3).equals(new Box3().setFromObject(asset.scene))).toBe(true);
 expect(asset.scene.rotation.y).toBe(-.22);expect((selected.bounds as Box3).min.y).toBeCloseTo(0);
 viewer.dispose();viewer.dispose();expect(state.rigs[1].dispose).toHaveBeenCalledOnce();
 });
});
