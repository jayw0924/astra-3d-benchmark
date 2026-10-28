import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir=new URL('./',import.meta.url), sha=b=>createHash('sha256').update(b).digest('hex');
const historical=JSON.parse(await readFile(new URL('../source-captures/2026-10-27-current-carmine-two-angles/front.json',dir)));
assert.equal(sha(await readFile(new URL('source.png',dir))),historical.sha256);
assert.equal(sha(await readFile('public/assets/models/product-estuary-safe.glb')),historical.modelSha256);
const save=(name,b)=>writeFile(new URL(name,dir),b,{flag:'wx'});
const server=await createServer({server:{host:'127.0.0.1',port:5189,strictPort:true}});await server.listen();
let browser;
try {
 browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:900,height:820},deviceScaleFactor:1});
 // No animation: one explicit source verification render and one native mask render.
 await context.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
 await context.route('**/src/lib/threeViewer.ts*',async route=>{
  const response=await route.fetch(),original=await response.text();
  assert.equal(original.split('function animate() {').length,2);
  await route.fulfill({response,body:original.replace('function animate() {','window.__maskRig={scene,camera,controls,renderer,get model(){return model;},get lighting(){return lighting;}};\nfunction animate() {')});
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message);});page.on('console',m=>console.log('BROWSER',m.type(),m.text()));page.on('requestfailed',r=>console.error('REQUEST FAILED',r.url(),r.failure()));
 await page.goto('http://127.0.0.1:5189/work/ai-imagery-followup/protected-background/harness.html');
 await page.waitForFunction(()=>window.ready,null,{timeout:180000,polling:100});
 const result=await page.evaluate(h=>{
  const g=window.__maskRig,T=window.THREE,c=g.camera,r=g.renderer,m=g.model.gltf.scene;
  r.setPixelRatio(1);r.setSize(850,778,false);
  c.position.fromArray(h.camera.position);c.quaternion.fromArray(h.camera.quaternion);c.projectionMatrix.fromArray(h.camera.projection);c.projectionMatrixInverse.copy(c.projectionMatrix).invert();c.aspect=h.camera.aspect;c.updateMatrixWorld(true);
  g.controls.target.fromArray(h.camera.target);m.updateMatrixWorld(true);
  const meshes=[];m.traverse(o=>{if(o.isMesh)meshes.push({name:o.name,matrixWorld:o.matrixWorld.toArray(),visible:o.visible,materials:(Array.isArray(o.material)?o.material:[o.material]).map(v=>({name:v.name,side:v.side,opacity:v.opacity,transparent:v.transparent,alphaTest:v.alphaTest,transmission:v.transmission??0,alphaMap:!!v.alphaMap,map:!!v.map}))});});
  r.render(g.scene,c);const rgb=r.domElement.toDataURL('image/png');
  // Glass (transmission), mirrors and every visible car primitive become solid geometric coverage.
  // No color key; retain actual side/culling and geometry, same camera and native MSAA framebuffer.
  g.lighting.floor.visible=false;g.scene.background=new T.Color(0);g.scene.environment=null;r.shadowMap.enabled=false;
  m.traverse(o=>{if(o.isMesh){const convert=v=>{if(v.alphaTest||v.alphaMap||v.transparent||v.opacity!==1)throw Error('Unsupported alpha material: manual gate required');return new T.MeshBasicMaterial({color:0xffffff,side:v.side,toneMapped:false});};o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);}});
  r.toneMapping=T.NoToneMapping;r.outputColorSpace=T.LinearSRGBColorSpace;r.render(g.scene,c);
  return {rgb,mask:r.domElement.toDataURL('image/png'),camera:{position:c.position.toArray(),quaternion:c.quaternion.toArray(),projection:c.projectionMatrix.toArray(),matrixWorld:c.matrixWorld.toArray(),target:g.controls.target.toArray()},modelMatrix:m.matrixWorld.toArray(),meshes,renderer:{width:r.domElement.width,height:r.domElement.height,context:r.getContext().getContextAttributes(),samples:r.getContext().getParameter(r.getContext().SAMPLES)},floorExcluded:true};
 },historical.telemetry);
 assert.deepEqual(errors,[]);
 for(const k of ['position','quaternion','projection','matrixWorld','target'])assert.deepEqual(result.camera[k],historical.telemetry.camera[k]);
 assert.deepEqual(result.modelMatrix,historical.telemetry.model.matrixWorld);
 assert.equal(result.meshes.length,historical.telemetry.model.meshes.length);
 for(const m of result.meshes){const old=historical.telemetry.model.meshes.find(x=>x.name===m.name);assert(old);assert.deepEqual(m.matrixWorld,old.matrixWorld);assert.equal(m.visible,old.visible);assert.deepEqual(m.materials.map(x=>x.name),old.materials.map(x=>x.name));}
 for(const [key,name] of [['rgb','source-rerender.png'],['mask','coverage-render.png']]){await save(name,Buffer.from(result[key].split(',')[1],'base64'));delete result[key];}
 await save('capture.json',JSON.stringify({at:new Date().toISOString(),sourceSha256:historical.sha256,modelSha256:historical.modelSha256,errors,...result},null,2));
 console.log('PASS exact camera/model/mesh transforms and material names; native coverage render retained',result.renderer);
}finally{await browser?.close();await server.close();}
