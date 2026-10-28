import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir=new URL('./',import.meta.url), sha=b=>createHash('sha256').update(b).digest('hex');
const historical=JSON.parse(await readFile(new URL('../../source-captures/2026-10-27-current-carmine-two-angles/front.json',dir)));
assert.equal(sha(await readFile(new URL('../source.png',dir))),historical.sha256);
assert.equal(sha(await readFile('public/assets/models/product-estuary-safe.glb')),historical.modelSha256);
const save=(name,b)=>writeFile(new URL(name,dir),b,{flag:'wx'});
const server=await createServer({server:{host:'127.0.0.1',port:5189,strictPort:true}});await server.listen();
let browser;
try {
 browser=await chromium.launch({executablePath:'/opt/playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:900,height:820},deviceScaleFactor:1});
 await context.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
 await context.route('**/src/lib/threeViewer.ts*',async route=>{
  const response=await route.fetch(),original=await response.text();
  assert.equal(original.split('function animate() {').length,2);
  assert.equal(original.split('alpha: false').length,2);
  await route.fulfill({response,body:original.replace('alpha: false','alpha: true').replace('function animate() {','window.__shadowRig={scene,camera,controls,renderer,get model(){return model;},get lighting(){return lighting;}};\nfunction animate() {')});
 });
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message);});
 page.on('console',m=>console.log('BROWSER',m.type(),m.text()));
 await page.goto('http://127.0.0.1:5189/work/ai-imagery-followup/protected-background/harness.html');
 await page.waitForFunction(()=>window.ready,null,{timeout:180000,polling:100});
 const result=await page.evaluate(h=>{
  const g=window.__shadowRig,T=window.THREE,c=g.camera,r=g.renderer,m=g.model.gltf.scene,f=g.lighting.floor;
  r.setPixelRatio(1);r.setSize(850,778,false);
  c.position.fromArray(h.camera.position);c.quaternion.fromArray(h.camera.quaternion);c.projectionMatrix.fromArray(h.camera.projection);c.projectionMatrixInverse.copy(c.projectionMatrix).invert();c.aspect=h.camera.aspect;c.updateMatrixWorld(true);
  g.controls.target.fromArray(h.camera.target);m.updateMatrixWorld(true);
  const camera=()=>({position:c.position.toArray(),quaternion:c.quaternion.toArray(),projection:c.projectionMatrix.toArray(),matrixWorld:c.matrixWorld.toArray(),target:g.controls.target.toArray()});
  const meshes=[];m.traverse(o=>{if(o.isMesh)meshes.push({name:o.name,matrixWorld:o.matrixWorld.toArray(),visible:o.visible,castShadow:o.castShadow,materials:(Array.isArray(o.material)?o.material:[o.material]).map(v=>({name:v.name,side:v.side,opacity:v.opacity,transparent:v.transparent}))});});
  const lights=[];g.scene.traverse(o=>{if(o.isLight)lights.push({type:o.type,color:o.color.getHexString(),intensity:o.intensity,position:o.position.toArray(),castShadow:o.castShadow,target:o.target?.position.toArray(),shadow:o.shadow?{bias:o.shadow.bias,normalBias:o.shadow.normalBias,radius:o.shadow.radius,mapSize:o.shadow.mapSize.toArray(),camera:{left:o.shadow.camera.left,right:o.shadow.camera.right,top:o.shadow.camera.top,bottom:o.shadow.camera.bottom,near:o.shadow.camera.near,far:o.shadow.camera.far}}:null});});
  r.render(g.scene,c);const rgb=r.domElement.toDataURL('image/png');
  if(r.shadowMap.autoUpdate||r.shadowMap.needsUpdate)throw Error('Shadow map not cached');
  const key=g.scene.children.find(o=>o.isDirectionalLight&&o.castShadow);
  if(!key?.shadow.map)throw Error('Missing actual source shadow map');
  const mapUUID=key.shadow.map.uuid,firstCamera=camera();
  const floor={position:f.position.toArray(),matrixWorld:f.matrixWorld.toArray(),type:f.material.type,opacity:f.material.opacity,color:f.material.color.getHexString(),depthWrite:f.material.depthWrite,receiveShadow:f.receiveShadow,geometry:f.geometry.parameters};
  // Freeze populated actual caster map; remove only beauty visibility, never caster assignments or lights.
  m.visible=false;g.scene.background=null;r.setClearColor(0x000000,0);
  r.render(g.scene,c);
  if(key.shadow.map.uuid!==mapUUID||r.shadowMap.needsUpdate)throw Error('Shadow cache changed');
  return {rgb,shadow:r.domElement.toDataURL('image/png'),camera:firstCamera,shadowCamera:camera(),modelMatrix:m.matrixWorld.toArray(),meshes,lights,floor,recipe:g.lighting.recipe,renderer:{width:r.domElement.width,height:r.domElement.height,context:r.getContext().getContextAttributes(),samples:r.getContext().getParameter(r.getContext().SAMPLES),toneMapping:r.toneMapping,exposure:r.toneMappingExposure,outputColorSpace:r.outputColorSpace,shadowType:r.shadowMap.type,shadowAutoUpdate:r.shadowMap.autoUpdate},explicitRenderCalls:2,shadowMapCacheRetained:true,modelBeautyHiddenForSecondPass:true};
 },historical.telemetry);
 assert.deepEqual(errors,[]);
 for(const k of ['position','quaternion','projection','matrixWorld','target'])assert.deepEqual(result.camera[k],historical.telemetry.camera[k]);
 assert.deepEqual(result.camera,result.shadowCamera);
 assert.deepEqual(result.modelMatrix,historical.telemetry.model.matrixWorld);
 assert.equal(result.meshes.length,historical.telemetry.model.meshes.length);
 for(const m of result.meshes){const old=historical.telemetry.model.meshes.find(x=>x.name===m.name);assert(old);assert.deepEqual(m.matrixWorld,old.matrixWorld);assert.equal(m.visible,old.visible);assert.deepEqual(m.materials.map(x=>x.name),old.materials.map(x=>x.name));const caster=historical.telemetry.inspection.meshes.find(x=>x.name===m.name);assert.equal(m.castShadow,caster.castShadow);}
 assert.equal(result.floor.position[1],historical.telemetry.inspection.floorY);
 assert.equal(result.floor.type,'ShadowMaterial');assert.equal(result.floor.opacity,.14);
 for(const [key,name] of [['rgb','source-diagnostic.png'],['shadow','shadow-layer.png']]){await save(name,Buffer.from(result[key].split(',')[1],'base64'));delete result[key];}
 await save('capture.json',JSON.stringify({at:new Date().toISOString(),sourceSha256:historical.sha256,modelSha256:historical.modelSha256,errors,instrumentation:'Disposable browser response only: alpha:false -> true for transparent export; RAF disabled; scene/model/materials/light recipe otherwise actual viewer. First render populates unchanged shadow map, second retains it while hiding model beauty.',...result},null,2));
 console.log('PASS exact camera/model/mesh/material-name/caster parity; two explicit native frames, actual cached ShadowMaterial alpha.',result.renderer);
}finally{await browser?.close();await server.close();}
