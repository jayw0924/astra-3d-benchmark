import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { createLightingRig, lightingRecipes, lightingSettings } from '/src/lib/viewerLighting.ts';
import { model, finishes } from './plan.mjs';
const renderer=new T.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:true,preserveDrawingBuffer:true});
renderer.setSize(600,400,false);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');
const gpu={vendor:debug?gl.getParameter(debug.UNMASKED_VENDOR_WEBGL):null,renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null,version:gl.getParameter(gl.VERSION),userAgent:navigator.userAgent,parallelCompile:!!gl.getExtension('KHR_parallel_shader_compile')};
const scene=new T.Scene();scene.background=new T.Color('#ddd9d0');const camera=new T.PerspectiveCamera(32,1.5,0.01,100);
const basis=location.origin+'/node_modules/three/examples/jsm/libs/basis/';T.Cache.enabled=true;
await Promise.all(['basis_transcoder.js','basis_transcoder.wasm'].map(async n=>{const r=await fetch(basis+n);if(!r.ok)throw Error('basis');T.Cache.add('file:'+basis+n,n.endsWith('.js')?await r.text():await r.arrayBuffer());}));
const ktx=new KTX2Loader().setTranscoderPath(basis).detectSupport(renderer),loader=new GLTFLoader().setKTX2Loader(ktx);
const start=performance.now(),response=await fetch(model.url),buffer=await response.arrayBuffer();
const servedHash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(n=>n.toString(16).padStart(2,'0')).join('');
if(buffer.byteLength!==model.bytes||servedHash!==model.sha256)throw Error('served model pin');
const gltf=await loader.parseAsync(buffer,location.origin+'/'),loadMs=performance.now()-start,root=gltf.scene;
// Existing bright rim treatment, frozen across all stages (not an experimental material edit).
root.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.isMeshStandardMaterial&&['Rim1','Rim2'].includes(m.name)){m.metalness=1;m.roughness=0.24;m.needsUpdate=true;}});
root.getObjectByName('License Plate')?.removeFromParent();
const params=new URLSearchParams(location.search);let spec;
if(params.has('bootstrap')){
 // Exactly production order: center unrotated bounds, lift, then rotate.
 const b=new T.Box3().setFromObject(root),c=b.getCenter(new T.Vector3());root.position.sub(c);root.position.y+=b.getSize(new T.Vector3()).y/2;root.rotation.y=-0.22;root.updateMatrixWorld(true);
 const prior=await (await fetch('../2026-10-22-sol-safe-final-comparison/control-spec.json')).json();
 const cameras={};for(const n of ['front-three-quarter','side','rear-three-quarter'])cameras[n]=prior.cameras[n];
 for(const [name,nodes,direction,distance] of [
  ['paint',['BodyDoorLColor1','BodyDoorLColor2','BodyDoorLHandle01'],[1,0.2,0.12],3],
  ['glass',['BodyWindshield','BodyWindshieldGasket'],[0.75,0.5,1],2.9],
  ['wheel',['WheelFrontL'],[1,0.12,0.05],1.75],
 ]){
  const box=new T.Box3();for(const n of nodes){const o=root.getObjectByName(n);if(!o)throw Error('missing node '+n);box.union(new T.Box3().setFromObject(o));}
  const center=box.getCenter(new T.Vector3()),dir=new T.Vector3(...direction);if(name!=='glass')dir.x=Math.sign(center.x);
  cameras[name]={position:center.clone().addScaledVector(dir.normalize(),distance).toArray(),target:center.toArray(),fov:32,nodes,bounds:{min:box.min.toArray(),max:box.max.toArray()}};
 }
 spec={source:model,derivation:'Accepted safe source; exact production pre-rotation centering; source-derived detail bounds; frozen once before matrix',transform:{position:root.position.toArray(),rotationY:-0.22},cameras};
 window.result=spec;document.body.dataset.ready='true';
}else{
 spec=await (await fetch('./control-spec.json')).json();root.position.fromArray(spec.transform.position);root.rotation.y=spec.transform.rotationY;scene.add(root);root.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(root);const json=gltf.parser.json;const records=[];root.traverse(o=>{if(!o.isMesh)return;const a=gltf.parser.associations.get(o);const p=json.meshes[a.meshes].primitives[a.primitives];if(p.extensions?.KHR_materials_variants)records.push({object:o,mappings:p.extensions.KHR_materials_variants.mappings});});
 async function variant(finish){const index=finishes.indexOf(finish);if(index<0)throw Error('finish');const assignments=[];
  for(const r of records){const maps=r.mappings.filter(x=>x.variants.includes(index));if(maps.length!==1)throw Error('mapping');const material=await gltf.parser.getDependency('material',maps[0].material);r.object.material=material;assignments.push({object:r.object.name,index:maps[0].material,name:material.name,verified:r.object.material===material});}
  if(assignments.length!==25||assignments.some(x=>!x.verified))throw Error('assignment failure');return assignments;
 }
 const priorShadows={enabled:renderer.shadowMap.enabled,type:renderer.shadowMap.type,autoUpdate:renderer.shadowMap.autoUpdate,needsUpdate:renderer.shadowMap.needsUpdate};
 const metrics={gpu,loadMs,servedHash,servedBytes:buffer.byteLength,rigs:[],transitions:[]};let rig,active;
 const info=()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,lines:renderer.info.render.lines,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,programs:renderer.info.programs.length});renderer.info.autoReset=false;
 function frame(){renderer.info.reset();renderer.render(scene,camera);gl.finish();return info();}
 function setCamera(target){const c=spec.cameras[target];camera.position.fromArray(c.position);camera.lookAt(new T.Vector3().fromArray(c.target));camera.fov=c.fov;camera.updateProjectionMatrix();}
 async function render(item){
  const assignments=await variant(item.finish);setCamera(item.target);
  if(active!==item.rig){rig?.dispose();const t=performance.now();rig=createLightingRig({scene,renderer,model:root,bounds,preset:item.rig});active=item.rig;const setupMs=performance.now()-t;const ct=performance.now();renderer.compile(scene,camera);metrics.rigs.push({rig:active,setupMs,compileMs:performance.now()-ct,compileScope:'first compile for rig in shared context, materials may be cached',recipe:lightingRecipes[active],settings:lightingSettings});}
  rig.invalidateShadows();const first=performance.now();frame();const firstMs=performance.now()-first;
  const t=performance.now();const counts=frame();const warmMs=performance.now()-t;
  const pixels=new Uint8Array(600*400*4);gl.readPixels(0,0,600,400,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let changed=0;for(let i=0;i<pixels.length;i+=4)if(Math.abs(pixels[i]-pixels[0])+Math.abs(pixels[i+1]-pixels[1])+Math.abs(pixels[i+2]-pixels[2])>12)changed++;
  if(changed<200||!counts.calls||!counts.triangles||gl.getError()!==gl.NO_ERROR)throw Error('invalid frame');
  return {counts,changedPixels:changed,firstSubmitFinishMs:firstMs,warmSubmitFinishMs:warmMs,camera:spec.cameras[item.target],transform:spec.transform,assignments,floorY:rig.floor?.position.y??null,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},appliedLighting:{keyPosition:scene.children.find(x=>x.isDirectionalLight&&x.castShadow).position.toArray(),shadowRadius:scene.children.find(x=>x.isDirectionalLight&&x.castShadow).shadow.radius,shadowOpacity:rig.floor.material.opacity},shadowAutoUpdate:renderer.shadowMap.autoUpdate,timestamp:new Date().toISOString()};
 }
 async function transitions(){const canonical=new Map();for(const source of finishes)for(const target of finishes){await variant(source);const a=await variant(target),signature=JSON.stringify(a);if(canonical.has(target)&&canonical.get(target)!==signature)throw Error('history-dependent');canonical.set(target,signature);metrics.transitions.push({source,target,assignments:a});}return metrics.transitions.length;}
 function dispose(){rig?.dispose();for(const [k,v] of Object.entries(priorShadows))if(renderer.shadowMap[k]!==v)throw Error('shadow renderer restoration '+k);if(scene.environment!==null||root.children.length===0)throw Error('dispose state');const flags=[];root.traverse(o=>{if(o.isMesh)flags.push(o.castShadow);});if(flags.some(Boolean))throw Error('shadow flag leak');return {rendererShadowStateRestored:true,environmentRestored:true,shadowFlagsRestored:true,remainingSceneChildren:scene.children.length,resources:info()};}
 window.harness={render,metrics,transitions,dispose};document.body.dataset.ready='true';
}
