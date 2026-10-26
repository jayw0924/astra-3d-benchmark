import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {writeFile,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const out=new URL('./',import.meta.url); await mkdir(out,{recursive:true});
const phase=process.argv[2]||'before';
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const context=await browser.newContext({viewport:phase.includes('mobile')?{width:393,height:851}:{width:1280,height:900},deviceScaleFactor:1});
await context.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>setTimeout(()=>raf(cb),500);});
// Disposable research-only scene access; production module and rendering unchanged.
await context.route('**/src/lib/threeViewer.ts*',async route=>{const response=await route.fetch();let text=await response.text();text=text.replace('function animate() {','window.__ground = { scene, camera, controls, renderer, get model() { return model; }, get lighting() { return lighting; } };\n  function animate() {');if(!text.includes('window.__ground'))throw Error('instrumentation failed');await route.fulfill({response,body:text});});
const results=[];
if(phase.startsWith('before')) await context.route('**/src/lib/viewerLighting.ts*',async route=>{const response=await route.fetch();const text=(await response.text()).replace(/\s*if \(refined && grounding && model\) \{[\s\S]*?\n\s*\}/,'');await route.fulfill({response,body:text});});
for(const finish of (process.argv[3]?[process.argv[3]]:['Carmine Candy','Estuary Enamel'])){
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const asset=page.waitForResponse(r=>r.url().endsWith('/assets/models/product-estuary-safe.glb'),{timeout:180000});
 await page.goto('http://127.0.0.1:5173/?finish='+encodeURIComponent(finish)+'&trim=bright');
 await page.getByRole('status').filter({hasText:'3D model ready'}).waitFor({timeout:180000});
 const bytes=await (await asset).body();
 console.log('runtime',await page.evaluate(()=>({ground:!!window.__ground,model:!!window.__ground?.model,errors:document.body.innerText.slice(-300),modules:performance.getEntriesByType('resource').map(x=>x.name).filter(x=>x.includes('threeViewer'))})),errors);
 await page.waitForFunction(()=>window.__ground?.model&&document.querySelector('canvas'),null,{timeout:120000});
 assert.equal(bytes.length,9239404);assert.equal(createHash('sha256').update(bytes).digest('hex'),'01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4');
 await page.waitForFunction(f=>{let s;document.querySelector('[data-testid="configurator-canvas"]').dispatchEvent(new CustomEvent('viewer:inspect',{detail:v=>s=v}));return s?.finish===f&&s.shadowUpdates>0&&s.renderedFrames>0;},finish,{timeout:120000});
 const inspection=await page.evaluate(()=>{let snapshot;document.querySelector('[data-testid="configurator-canvas"]').dispatchEvent(new CustomEvent('viewer:inspect',{detail:v=>snapshot=v}));const g=window.__ground,key=g.scene.children.find(o=>o.isDirectionalLight&&o.castShadow);return {snapshot,shadowMap:key.shadow.map?{width:key.shadow.map.width,height:key.shadow.map.height}:null,drawCalls:g.renderer.info.render.calls};});
 assert.equal(inspection.snapshot.recipe,'grounded-studio-refined');assert(inspection.snapshot.environment);assert(inspection.shadowMap?.width===1024);assert(inspection.drawCalls>0);
 const variantMeshes=inspection.snapshot.meshes.filter(m=>m.expectedMaterial!==undefined);assert(variantMeshes.length>0);for(const m of variantMeshes)assert.deepEqual(m.materials.map(t=>t.index),[m.expectedMaterial]);
 assert.deepEqual(errors,[]);
 await writeFile(new URL(`${phase}-${finish.split(' ')[0]}-inspection.json`,out),JSON.stringify(inspection,null,2));
 const measurement=await page.evaluate(()=>{
  const {model,scene,renderer,lighting}=window.__ground;const meshes=[];
  model.gltf.scene.updateMatrixWorld(true);
  model.gltf.scene.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;let min=Infinity,max=-Infinity,point=null;for(let i=0;i<p.count;i++){const v=o.position.clone().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);if(v.y<min){min=v.y;point=v.toArray();}max=Math.max(max,v.y);}meshes.push({name:o.name,min,max,point,castShadow:o.castShadow,visible:o.visible,materials:(Array.isArray(o.material)?o.material:[o.material]).map(m=>({name:m.name,transparent:m.transparent,opacity:m.opacity}))});});
  const key=scene.children.find(o=>o.isDirectionalLight&&o.castShadow);
  return {meshes,floorY:lighting.floor.position.y,shadow:{bias:key.shadow.bias,normalBias:key.shadow.normalBias,radius:key.shadow.radius,mapSize:key.shadow.mapSize.toArray(),camera:{left:key.shadow.camera.left,right:key.shadow.camera.right,near:key.shadow.camera.near,far:key.shadow.camera.far},opacity:lighting.floor.material.opacity,type:renderer.shadowMap.type,enabled:renderer.shadowMap.enabled},exposure:renderer.toneMappingExposure};
 });
 await writeFile(new URL(`${phase}-${finish.split(' ')[0]}-measurement.json`,out),JSON.stringify(measurement,null,2));
 const views=[['side',[8,1.8,0],[0,.55,0]],['front',[0,1.5,9],[0,.55,0]],['wheel',[4.2,.65,3.5],[1,.28,1.25]]];
 for(const [view,position,target] of views){
 if(phase.includes('mobile')&&view!=='side')continue;
 if(await access(new URL(`${phase}-${finish.split(' ')[0]}-${view}.png`,out)).then(()=>true,()=>false)){console.log('retained',phase,finish,view);continue;}
 await page.evaluate(({position,target})=>{const g=window.__ground;g.controls.enableDamping=false;g.camera.position.set(...position);g.controls.target.set(...target);g.controls.update();}, {position,target});
 const data=await page.evaluate(()=>new Promise(resolve=>{const raf=window.requestAnimationFrame;window.requestAnimationFrame=cb=>raf(t=>{window.requestAnimationFrame=raf;cb(t);resolve(document.querySelector('[data-testid="configurator-canvas"]').toDataURL());});}));
 const filename=`${phase}-${finish.split(' ')[0]}-${view}.png`;const image=Buffer.from(data.split(',')[1],'base64');await writeFile(new URL(filename,out),image);
 results.push({finish,view,filename,sha256:createHash('sha256').update(image).digest('hex'),modelSha256:createHash('sha256').update(bytes).digest('hex'),errors,camera:await page.evaluate(()=>({position:window.__ground.camera.position.toArray(),target:window.__ground.controls.target.toArray()}))});await writeFile(new URL(`${phase}-${finish.split(' ')[0]}-captures.json`,out),JSON.stringify(results,null,2));console.log(filename);
 }
 await page.close();
}
if(results.length) await writeFile(new URL(`${phase}-captures.json`,out),JSON.stringify(results,null,2));await browser.close();
