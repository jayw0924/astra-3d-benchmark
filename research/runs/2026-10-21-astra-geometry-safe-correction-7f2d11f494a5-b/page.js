import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const params=new URLSearchParams(location.search), model=params.get('model'), bootstrap=params.has('bootstrap');
const renderer=new T.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:true,preserveDrawingBuffer:true});
renderer.setSize(600,400,false);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const gl=renderer.getContext(), debug=gl.getExtension('WEBGL_debug_renderer_info');
const gpu={vendor:debug?gl.getParameter(debug.UNMASKED_VENDOR_WEBGL):null,renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null,version:gl.getParameter(gl.VERSION),userAgent:navigator.userAgent,parallelCompile:!!gl.getExtension('KHR_parallel_shader_compile')};
const scene=new T.Scene();scene.background=new T.Color('#d6d6d3');
const pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(new RoomEnvironment(),0.04);pmrem.dispose();scene.environment=env.texture;
const camera=new T.PerspectiveCamera(32,1.5,0.005,100);
// Explicitly finish native fetch bodies before priming FileLoader's cache.
// The initial non-preloaded path reported ERR_ABORTED despite parse success;
// the exact browser/stream failure cause was not conclusively isolated.
const basisPath=location.origin+'/node_modules/three/examples/jsm/libs/basis/';
T.Cache.enabled=true;
const basisSetupStart=performance.now();
await Promise.all(['basis_transcoder.js','basis_transcoder.wasm'].map(async name=>{const r=await fetch(basisPath+name);if(!r.ok)throw Error('basis fetch');T.Cache.add('file:'+basisPath+name,name.endsWith('.js')?await r.text():await r.arrayBuffer());}));
const basisPreloadMs=performance.now()-basisSetupStart;
const ktx=new KTX2Loader().setTranscoderPath(basisPath).detectSupport(renderer);
const loader=new GLTFLoader().setKTX2Loader(ktx);
const start=performance.now(),response=await fetch(model),buffer=await response.arrayBuffer(),fetched=performance.now();
const gltf=await loader.parseAsync(buffer,location.origin+'/'),parsed=performance.now(),root=gltf.scene;
root.rotation.y=-0.22;root.updateMatrixWorld(true);
let spec;
if(bootstrap){
 const b=new T.Box3().setFromObject(root),c=b.getCenter(new T.Vector3()),s=b.getSize(new T.Vector3());
 root.position.set(-c.x,-c.y+s.y/2,-c.z);
}else{spec=await (await fetch('./control-spec.json')).json();root.position.fromArray(spec.transform.position);}
scene.add(root);root.updateMatrixWorld(true);
const groups={
 'wheel-brake':['WheelFrontL'],
 'mirror-window':['BodyDoorLMirror','BodyDoorLMirrorColor1','BodyDoorLMirrorColor2','BodyDoorLWindow'],
 wipers:['BodyWindshieldWipers','BodyWindshieldWipersBase'],
 'panel-seams':['BodyDoorLColor1','BodyDoorLColor2','BodyDoorLHandle01'],
 interior:['InteriorSeatsColor1','InteriorSeatsColor2','InteriorDashMid','InteriorSteeringWheel01'],
 'glass-edge':['BodyWindshield','BodyWindshieldGasket'],
};
if(bootstrap){
 const bounds={};root.traverse(o=>{if(o.name){const b=new T.Box3().setFromObject(o);bounds[o.name]={center:b.getCenter(new T.Vector3()).toArray(),size:b.getSize(new T.Vector3()).toArray()};}});
 const cameras={
 'front-three-quarter':{position:[6.4,3.25,7.2],target:[0,0.55,0.1],fov:32},
 side:{position:[8.2,2.25,0],target:[0,0.58,0],fov:32},
 'rear-three-quarter':{position:[-6.4,3,-7.2],target:[0,0.55,-0.1],fov:32}};
 for(const [name,names] of Object.entries(groups)){
  const b=new T.Box3();for(const n of names){const o=root.getObjectByName(n);if(!o)throw Error('missing '+n);b.union(new T.Box3().setFromObject(o));}
  const c=b.getCenter(new T.Vector3()),s=b.getSize(new T.Vector3());let direction,distance;
  if(name==='wheel-brake'){direction=new T.Vector3(Math.sign(c.x),0.12,0.05);distance=1.75;}
  if(name==='mirror-window'){direction=new T.Vector3(Math.sign(c.x),0.23,0.3);distance=2.9;}
  if(name==='wipers'){direction=new T.Vector3(0.45,0.95,1);distance=2.15;}
  if(name==='panel-seams'){direction=new T.Vector3(Math.sign(c.x),0.2,0.12);distance=3.0;}
  if(name==='interior'){direction=new T.Vector3(0.25,0.5,1);distance=3.2;}
  if(name==='glass-edge'){direction=new T.Vector3(0.75,0.5,1);distance=2.9;}
  const pos=c.clone().addScaledVector(direction.normalize(),distance);
  cameras[name]={position:pos.toArray(),target:c.toArray(),fov:32,bounds:{center:c.toArray(),size:s.toArray()},nodes:names};
 }
 window.result={transform:{position:root.position.toArray(),rotationY:-0.22},cameras,bounds,source:model};document.body.dataset.ready='true';
}else{
 const json=gltf.parser.json,variants=json.extensions.KHR_materials_variants.variants.map(x=>x.name),meshes=[];
 root.traverse(object=>{if(object.isMesh){const a=gltf.parser.associations.get(object);const primitive=json.meshes[a.meshes].primitives[a.primitives];meshes.push({object,base:object.material,mappings:primitive.extensions?.KHR_materials_variants?.mappings});}});
 async function variant(name){const index=variants.indexOf(name);if(index<0)throw Error('variant missing');const records=[];
  for(const m of meshes.filter(m=>m.mappings)){const maps=m.mappings.filter(x=>x.variants.includes(index));if(maps.length!==1)throw Error('ambiguous mapping');records.push({m,index:maps[0].material,material:await gltf.parser.getDependency('material',maps[0].material)});}
  for(const r of records)r.m.object.material=r.material;
  const assignments=records.map(r=>({object:r.m.object.name,materialIndex:r.index,materialName:r.material.name,verified:r.m.object.material===r.material}));
  if(assignments.length!==25||assignments.some(x=>!x.verified))throw Error('assignment failure');return assignments;
 }
 function setCamera(target){const c=spec.cameras[target];camera.fov=c.fov;camera.position.fromArray(c.position);camera.lookAt(new T.Vector3().fromArray(c.target));camera.updateProjectionMatrix();}
 function info(){return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,lines:renderer.info.render.lines,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,programs:renderer.info.programs.length};}
 renderer.info.autoReset=false;
 function frame(){renderer.info.reset();renderer.render(scene,camera);gl.finish();return info();}
 setCamera('front-three-quarter');await variant('Estuary Enamel');
 // Model compile is cold: no render(scene,camera) has occurred. PMREM is separate setup work.
 const compileStart=performance.now();renderer.compile(scene,camera);const coldCompileMs=performance.now()-compileStart;
 const firstStart=performance.now();const firstInfo=frame();const firstEnd=performance.now();
 const resource=performance.getEntriesByName(new URL(model,location.href).href).at(-1);
 const metrics={gpu,basisPreloadMs,load:{fetchArrayBufferMs:fetched-start,parseDecodeMs:parsed-fetched,fetchParseMs:parsed-start},coldCompileMs,firstRender:{cpuSubmitAndFinishMs:firstEnd-firstStart,loadToFirstRenderedFrameMs:firstEnd-start,correctness:'not checked at first-frame timestamp; later visual QC is separate'},resourceTiming:resource?.toJSON(),firstInfo,warmSamples:[],transitions:[]};
 const wire=new T.MeshBasicMaterial({color:0x294744,wireframe:true,side:T.DoubleSide}),hidden=new T.MeshBasicMaterial({colorWrite:false,depthWrite:false}),silhouette=new T.MeshBasicMaterial({color:0x223834});
 function reset(){for(const m of meshes){m.object.visible=true;m.object.material=m.base;}scene.environment=env.texture;}
 async function render(item){reset();const assignments=await variant(item.variant);setCamera(item.target);
  if(item.mode==='wireframe'){
   const names=groups[item.target];let selected=new Set();
   if(names){for(const n of names)root.getObjectByName(n).traverse(o=>{if(o.isMesh)selected.add(o);});}else selected=new Set(meshes.map(m=>m.object));
   const ancestors=new Set();for(const o of selected)for(let a=o.parent;a;a=a.parent)ancestors.add(a);
   for(const m of meshes){if(selected.has(m.object))m.object.material=wire;else if(ancestors.has(m.object))m.object.material=hidden;else m.object.visible=false;}
   scene.environment=null;
  }else if(item.mode==='silhouette'){for(const m of meshes)m.object.material=silhouette;scene.environment=null;}
  const counts=frame();if(counts.calls===0)throw Error('blank zero calls');
  const pixels=new Uint8Array(600*400*4);gl.readPixels(0,0,600,400,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let changed=0;for(let i=0;i<pixels.length;i+=4)if(Math.abs(pixels[i]-pixels[0])+Math.abs(pixels[i+1]-pixels[1])+Math.abs(pixels[i+2]-pixels[2])>12)changed++;
  if(changed<200)throw Error('blank pixels '+changed);return {counts,changedPixels:changed,camera:spec.cameras[item.target],assignments};
 }
 async function measure(){
  for(let i=0;i<36;i++){const t=performance.now();frame();const sync=performance.now()-t;await new Promise(requestAnimationFrame);if(i>=6)metrics.warmSamples.push({submitAndFinishMs:sync,renderFinishAndRafMs:performance.now()-t});}
  const canonical=new Map();
  for(const source of variants)for(const target of variants){reset();await variant(source);frame();const t=performance.now(),assignments=await variant(target);frame();const signature=JSON.stringify(assignments.map(x=>[x.object,x.materialIndex,x.materialName]));if(canonical.has(target)&&canonical.get(target)!==signature)throw Error('history dependent');canonical.set(target,signature);metrics.transitions.push({source,target,durationMs:performance.now()-t,assignments});}
  return metrics;
 }
 function probe(target,points){
  reset();setCamera(target);camera.updateMatrixWorld(true);root.updateMatrixWorld(true);
  const ray=new T.Raycaster();
  return points.map(([x,y])=>{ray.setFromCamera(new T.Vector2((x+0.5)/600*2-1,1-(y+0.5)/400*2),camera);return {pixel:[x,y],hits:ray.intersectObjects(meshes.map(m=>m.object),false).slice(0,6).map(h=>({object:h.object.name,association:gltf.parser.associations.get(h.object),faceIndex:h.faceIndex,point:h.point.toArray()}))};});
 }
 window.harness={metrics,render,measure,probe};document.body.dataset.ready='true';
}
