import { afterEach, describe, expect, it, vi } from 'vitest';
import { PMREMGenerator, Float32BufferAttribute, WebGLRenderTarget, Texture, BasicShadowMap, PCFShadowMap, type WebGLRenderer } from 'three';
afterEach(() => vi.restoreAllMocks());
import { Scene, DirectionalLight, HemisphereLight, GridHelper, Box3, Vector3, Group, Mesh, BoxGeometry, MeshStandardMaterial } from 'three';
import { createLightingRig, createGrounding, lightingRecipes, lightingSettings } from './viewerLighting';

describe('viewer lighting', () => {
  it('grounds only the refined recipe at actual transformed vertices, not conservative transformed boxes', () => {
    vi.spyOn(PMREMGenerator.prototype, 'fromScene').mockReturnValue(new WebGLRenderTarget());
    vi.spyOn(PMREMGenerator.prototype, 'dispose').mockImplementation(() => {});
    const model = new Group();
    const mesh = new Mesh(new BoxGeometry(), new MeshStandardMaterial());
    // A sparse triangle: its transformed local AABB contains empty space below every vertex.
    mesh.geometry.setIndex([0, 1, 2]);
    mesh.geometry.setAttribute('position', new Float32BufferAttribute([0,0,0, 1,1,0, 0,1,1],3));
    mesh.geometry.computeBoundingBox(); mesh.rotation.z = -Math.PI / 4; model.add(mesh); model.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(model), precise = new Box3().setFromObject(model,true);
    expect(precise.min.y - bounds.min.y).toBeGreaterThan(.1);
    const before = model.matrixWorld.clone();
    for (const preset of ['grounded-studio','grounded-studio-refined'] as const) {
      const scene = new Scene();
      const renderer = {shadowMap:{enabled:false,type:BasicShadowMap,autoUpdate:true,needsUpdate:false}} as WebGLRenderer;
      const rig = createLightingRig({scene,renderer,model,bounds,preset});
      expect(rig.floor!.position.y).toBeCloseTo(preset === 'grounded-studio-refined' ? precise.min.y - .0005 : bounds.min.y - .003,8);
      expect(model.matrixWorld.equals(before)).toBe(true);
      rig.dispose();
    }
  });
  it('refreshes caster eligibility from actual material assignments and preserves original flags', () => {
    const model = new Group(), opaque = new MeshStandardMaterial(), glass = new MeshStandardMaterial({transparent:true});
    const mesh = new Mesh(new BoxGeometry(), opaque); model.add(mesh);
    const grounding = createGrounding(model, new Box3().setFromObject(model));
    mesh.material = glass; grounding.refreshCasters(); expect(mesh.castShadow).toBe(false);
    mesh.material = opaque; grounding.refreshCasters(); expect(mesh.castShadow).toBe(true);
    grounding.dispose(); expect(mesh.castShadow).toBe(false);
    grounding.refreshCasters(); expect(mesh.castShadow).toBe(false);
  });
  it('offers one optional bounded refinement without replacing accepted recipes', () => {
    expect(lightingRecipes.original).toEqual({id:'original',hemisphere:2.5,key:5.5,rim:3.5,environment:false,grounded:false});
    expect(lightingRecipes['environment-only']).toEqual({id:'environment-only',hemisphere:.65,key:2.4,rim:1.1,environment:true,grounded:false});
    expect(lightingRecipes['grounded-studio']).toEqual({id:'grounded-studio',hemisphere:.65,key:2.4,rim:1.1,environment:true,grounded:true});
    expect(lightingRecipes).toHaveProperty('grounded-studio-refined');
    const target = new WebGLRenderTarget();
    const disposedRoomResources: object[] = [], roomResources = new Set<{ addEventListener: (type: 'dispose', listener: () => void) => void }>();
    const bake = vi.spyOn(PMREMGenerator.prototype, 'fromScene').mockImplementation(room => {
      room.traverse(object => {
        if (!(object instanceof Mesh)) return;
        roomResources.add(object.geometry);
        for (const m of Array.isArray(object.material) ? object.material : [object.material]) roomResources.add(m);
      });
      for (const resource of roomResources) resource.addEventListener('dispose',() => disposedRoomResources.push(resource));
      return target;
    });
    const generatorDisposal = vi.spyOn(PMREMGenerator.prototype, 'dispose').mockImplementation(() => {});
    const targetDisposal = vi.spyOn(target, 'dispose');
    const renderer = { shadowMap: {enabled:false,type:BasicShadowMap,autoUpdate:true,needsUpdate:false} } as WebGLRenderer;
    const scene = new Scene(), model = new Group();
    const mesh = new Mesh(new BoxGeometry(), new MeshStandardMaterial()); model.add(mesh);
    const materialBefore = mesh.material.toJSON();
    const rig = createLightingRig({scene,renderer,model,bounds:new Box3().setFromObject(model),preset:'grounded-studio-refined'});
    expect(roomResources.size).toBeGreaterThan(0);
    expect(disposedRoomResources).toHaveLength(roomResources.size);
    expect(new Set(disposedRoomResources)).toEqual(roomResources);
    const room = bake.mock.calls[0][0];
    expect(room.rotation.y).toBeCloseTo(Math.PI/2);
    expect(room.children.find(x => x.type === 'PointLight')).toHaveProperty('intensity',650);
    const panel = room.children.find(x => x instanceof Mesh && x.position.z === 14.520) as Mesh;
    expect(panel.scale.x).toBe(2); expect(panel.material).toHaveProperty('emissiveIntensity',12);
    const key = scene.children.find(x => x instanceof DirectionalLight && x.castShadow) as DirectionalLight;
    expect(key.intensity).toBe(2); expect(key.position.toArray()).toEqual([1,10,1]);
    expect(key.shadow.radius).toBe(8); expect(key.shadow.mapSize.toArray()).toEqual([1024,1024]);
    expect(rig.floor?.material.opacity).toBe(.14);
    expect(scene.children.some(x => x instanceof GridHelper)).toBe(false);
    const originalMaterial = mesh.material;
    renderer.shadowMap.needsUpdate = false;
    mesh.material = new MeshStandardMaterial({transparent:true});
    rig.refreshCasters();
    expect(mesh.castShadow).toBe(false); expect(renderer.shadowMap.needsUpdate).toBe(true);
    mesh.material = originalMaterial;
    const shadowDisposal = vi.spyOn(key.shadow,'dispose');
    const geometryDisposal = vi.spyOn(rig.floor!.geometry,'dispose');
    const materialDisposal = vi.spyOn(rig.floor!.material,'dispose');
    rig.dispose(); rig.dispose();
    for (const spy of [generatorDisposal,targetDisposal,shadowDisposal,geometryDisposal,materialDisposal]) expect(spy).toHaveBeenCalledTimes(1);
    expect(scene.children).toHaveLength(0); expect(scene.environment).toBeNull();
    expect(mesh.castShadow).toBe(false); expect(mesh.material.toJSON()).toEqual(materialBefore);
  });
  it.each([false, true])('restores prior shadow needsUpdate=%s after grounded teardown', (needsUpdate) => {
    const target = new WebGLRenderTarget();
    vi.spyOn(PMREMGenerator.prototype, 'fromScene').mockReturnValue(target);
    vi.spyOn(PMREMGenerator.prototype, 'dispose').mockImplementation(() => {});
    const prior = { enabled: false, type: BasicShadowMap, autoUpdate: true, needsUpdate };
    const renderer = { shadowMap: { ...prior } } as WebGLRenderer;
    const scene = new Scene(), previous = new Texture(); scene.environment = previous;
    const model = new Group(); model.add(new Mesh(new BoxGeometry(), new MeshStandardMaterial()));
    const rig = createLightingRig({scene, renderer, model, bounds: new Box3().setFromObject(model), preset: 'grounded-studio'});
    expect(renderer.shadowMap).toMatchObject({enabled:true,type:PCFShadowMap,autoUpdate:false,needsUpdate:true});
    renderer.shadowMap.needsUpdate = !needsUpdate;
    rig.dispose(); rig.dispose();
    expect(renderer.shadowMap).toEqual(prior);
    expect(scene.environment).toBe(previous);
  });
  it('omits transparent casters, preserves mixed-material flags and owns only floor resources', () => {
    const model = new Group(), opaque = new MeshStandardMaterial(), glass = new MeshStandardMaterial({transparent:true});
    const a = new Mesh(new BoxGeometry(),opaque), b = new Mesh(new BoxGeometry(),glass), c = new Mesh(new BoxGeometry(),[opaque,glass]);
    b.castShadow = true; c.castShadow = true; model.add(a,b,c);
    const materialDisposal = vi.spyOn(opaque,'dispose'), geometryDisposal = vi.spyOn(a.geometry,'dispose');
    const rig = createGrounding(model,new Box3(new Vector3(-2,.7,-3),new Vector3(2,2,3)));
    expect([a.castShadow,b.castShadow,c.castShadow]).toEqual([true,false,false]);
    expect(rig.floor.geometry.parameters).toMatchObject({width:30,height:30});
    expect(rig.floor.rotation.x).toBe(-Math.PI/2); expect(rig.floor.material.depthWrite).toBe(false);
    const gd=vi.spyOn(rig.floor.geometry,'dispose'),md=vi.spyOn(rig.floor.material,'dispose');
    rig.dispose();rig.dispose(); expect(gd).toHaveBeenCalledTimes(1);expect(md).toHaveBeenCalledTimes(1);
    expect([a.castShadow,b.castShadow,c.castShadow]).toEqual([false,true,true]);
    expect(materialDisposal).not.toHaveBeenCalled();expect(geometryDisposal).not.toHaveBeenCalled();
  });
  it('declares a restrained wide PCF shadow filter rather than the hard default radius', () => {
    expect(lightingSettings).toMatchObject({ shadowRadius: 6, shadowOpacity: 0.18 });
  });
  it('places the floor below transformed bounds and restores shadow flags on disposal', () => {
    const model = new Group(); const mesh = new Mesh(new BoxGeometry(), new MeshStandardMaterial()); model.add(mesh);
    const bounds = new Box3(new Vector3(-2, 0.7, -3), new Vector3(2, 2, 3));
    const grounding = createGrounding(model, bounds);
    expect(grounding.floor.position.y).toBeCloseTo(0.697);
    expect(mesh.castShadow).toBe(true); expect(mesh.receiveShadow).toBe(false);
    grounding.dispose(); grounding.dispose(); expect(mesh.castShadow).toBe(false);
  });
  it('fails closed rather than silently omitting the procedural environment', () => {
    expect(() => createLightingRig({ scene: new Scene(), preset: 'environment-only' })).toThrow('renderer required');
  });
  it('defaults to the exact original lights and grid without renderer or environment', () => {
    const scene = new Scene();
    const rig = createLightingRig({ scene });
    expect(rig.recipe).toEqual(lightingRecipes.original);
    expect(scene.children.filter(x => x instanceof HemisphereLight).map(x => x.intensity)).toEqual([2.5]);
    expect(scene.children.filter(x => x instanceof DirectionalLight).map(x => [x.intensity, x.position.toArray()])).toEqual([[5.5,[4,8,5]],[3.5,[-5,3,-4]]]);
    const hemi = scene.children.find(x => x instanceof HemisphereLight) as HemisphereLight;
    expect(hemi.color.getHex()).toBe(0xf7f3ea); expect(hemi.groundColor.getHex()).toBe(0x30363d);
    const lights = scene.children.filter(x => x instanceof DirectionalLight) as DirectionalLight[];
    expect(lights.map(x => x.color.getHex())).toEqual([0xffffff,0x93b6d4]);
    expect(lights.every(x => x.target.position.equals(new Vector3()) && !x.castShadow)).toBe(true);
    const grid = scene.children.find(x => x instanceof GridHelper) as GridHelper;
    expect(grid.position.y).toBe(-0.015);
    const referenceGrid = new GridHelper(24,24,0x9c9a94,0xc9c5bb);
    for (const name of ['position','color']) expect(Array.from(grid.geometry.getAttribute(name).array)).toEqual(Array.from(referenceGrid.geometry.getAttribute(name).array));
    const gd = vi.spyOn(grid.geometry,'dispose'), md = vi.spyOn(grid.material,'dispose');
    expect(scene.children).toHaveLength(4);
    rig.dispose(); rig.dispose(); expect(gd).toHaveBeenCalledTimes(1); expect(md).toHaveBeenCalledTimes(1);
    referenceGrid.dispose();
    expect(scene.environment).toBeNull();
    rig.dispose(); rig.dispose();
    expect(scene.children).toHaveLength(0);
  });
});
