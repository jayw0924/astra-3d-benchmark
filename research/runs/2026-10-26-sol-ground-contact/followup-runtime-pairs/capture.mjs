import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
const out=path.dirname(new URL(import.meta.url).pathname), root=process.cwd(), parent=path.dirname(out);
const sha=b=>createHash('sha256').update(b).digest('hex');
const save=(name,obj)=>writeFile(path.join(out,name),JSON.stringify(obj,null,2));
async function inventory(dir){const r={};for(const e of await readdir(dir,{withFileTypes:true})){if(e.name==='followup-runtime-pairs')continue;const p=path.join(dir,e.name);if(e.isDirectory())Object.assign(r,await inventory(p));else r[path.relative(parent,p)]=sha(await readFile(p));}return r;}
await mkdir(out,{recursive:true});
const previous=await inventory(parent);await save('historical-files-before.json',previous);
const baseline=execFileSync('git',['show','ffe0a56982a0bb22c34d705b1c00f0a62d147a0f:src/lib/viewerLighting.ts'],{encoding:'utf8'});
assert.equal(baseline,await readFile(path.join(parent,'frozen-before-viewerLighting.ts.txt'),'utf8'));
const current=await readFile('src/lib/viewerLighting.ts','utf8');
await writeFile(path.join(out,'baseline-viewerLighting.ts.txt'),baseline);await writeFile(path.join(out,'current-viewerLighting.ts.txt'),current);
const provenance={started:new Date().toISOString(),command:process.argv.join(' '),cwd:root,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),status:execFileSync('git',['status','--short'],{encoding:'utf8'}),baseline:{revision:'ffe0a56982a0bb22c34d705b1c00f0a62d147a0f',path:'src/lib/viewerLighting.ts',sha256:sha(baseline)},after:{sha256:sha(current)},protocol:{viewport:{width:1280,height:900},dpr:1,rafPacingMs:500,framebufferOnly:true,views:['side','front','wheel'],finishes:['Carmine Candy','Estuary Enamel']},events:[]};
await save('provenance.json',provenance);
const all=[];
for(const phase of ['before','after']){
 const server=await createServer({server:{host:'127.0.0.1',port:5187,strictPort:true},plugins:[{name:'pinned-grounding-source',enforce:'pre',load(id){if(id.split('?')[0]===path.join(root,'src/lib/viewerLighting.ts'))return phase==='before'?baseline:current;}}]});
 await server.listen();
 try{for(const finish of provenance.protocol.finishes){
 const started=new Date().toISOString(),start=performance.now();
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
 const context=await browser.newContext({viewport:provenance.protocol.viewport,deviceScaleFactor:1});
 await context.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>setTimeout(()=>raf(cb),500);});
 await context.route('**/src/lib/threeViewer.ts*',async route=>{const response=await route.fetch();let text=await response.text();assert(text.includes('function animate() {'));text=text.replace('function animate() {','window.__ground = { scene, camera, controls, renderer, get model() { return model; }, get lighting() { return lighting; } };\nfunction animate() {');await route.fulfill({response,body:text});});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const asset=page.waitForResponse(r=>r.url().endsWith('/assets/models/product-estuary-safe.glb'),{timeout:180000});
 await page.goto('http://127.0.0.1:5187/?finish='+encodeURIComponent(finish)+'&trim=bright');
 await page.getByRole('status').filter({hasText:'3D model ready'}).waitFor({timeout:180000});
 const bytes=await (await asset).body();assert.equal(sha(bytes),'01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4');
 await page.waitForFunction(f=>{let s;document.querySelector('[data-testid="configurator-canvas"]').dispatchEvent(new CustomEvent('viewer:inspect',{detail:v=>s=v}));return s?.finish===f&&s.shadowUpdates>0&&s.renderedFrames>0;},finish,{timeout:180000});
 for(const [view,position,target] of [['side',[8,1.8,0],[0,.55,0]],['front',[0,1.5,9],[0,.55,0]],['wheel',[4.2,.65,3.5],[1,.28,1.25]]]){
 await page.evaluate(({position,target})=>{const g=window.__ground;g.controls.enableDamping=false;g.controls.update();g.camera.position.set(...position);g.controls.target.set(...target);g.controls.update();},{position,target});
 // Pixels and all telemetry are sampled synchronously after the same real app render.
 const capture=await page.evaluate(()=>new Promise(resolve=>{const raf=window.requestAnimationFrame;window.requestAnimationFrame=cb=>raf(t=>{window.requestAnimationFrame=raf;cb(t);const g=window.__ground,{camera:c,controls,model,scene,lighting,renderer:r}=g;let inspection;document.querySelector('canvas[data-testid="configurator-canvas"]').dispatchEvent(new CustomEvent('viewer:inspect',{detail:v=>inspection=v}));const meshTransforms=[];model.gltf.scene.updateMatrixWorld(true);model.gltf.scene.traverse(o=>{if(o.isMesh)meshTransforms.push({name:o.name,matrixWorld:o.matrixWorld.toArray(),visible:o.visible,materialParams:(Array.isArray(o.material)?o.material:[o.material]).map(m=>({name:m.name,type:m.type,opacity:m.opacity,transparent:m.transparent,color:m.color?.getHexString(),metalness:m.metalness,roughness:m.roughness,clearcoat:m.clearcoat,clearcoatRoughness:m.clearcoatRoughness,side:m.side,depthWrite:m.depthWrite}))});});const key=scene.children.find(o=>o.isDirectionalLight&&o.castShadow),sc=key.shadow.camera,f=lighting.floor;resolve({data:r.domElement.toDataURL(),telemetry:{sampledAt:new Date().toISOString(),camera:{position:c.position.toArray(),quaternion:c.quaternion.toArray(),projection:c.projectionMatrix.toArray(),matrixWorld:c.matrixWorld.toArray(),target:controls.target.toArray(),fov:c.fov,aspect:c.aspect,near:c.near,far:c.far,zoom:c.zoom},model:{position:model.gltf.scene.position.toArray(),quaternion:model.gltf.scene.quaternion.toArray(),scale:model.gltf.scene.scale.toArray(),matrixWorld:model.gltf.scene.matrixWorld.toArray(),meshes:meshTransforms},inspection,floor:{position:f.position.toArray(),quaternion:f.quaternion.toArray(),scale:f.scale.toArray(),opacity:f.material.opacity,depthWrite:f.material.depthWrite,receiveShadow:f.receiveShadow},shadow:{bias:key.shadow.bias,normalBias:key.shadow.normalBias,radius:key.shadow.radius,mapSize:key.shadow.mapSize.toArray(),allocated:[key.shadow.map.width,key.shadow.map.height],camera:{projection:sc.projectionMatrix.toArray(),matrixWorld:sc.matrixWorld.toArray(),left:sc.left,right:sc.right,top:sc.top,bottom:sc.bottom,near:sc.near,far:sc.far},enabled:r.shadowMap.enabled,type:r.shadowMap.type,autoUpdate:r.shadowMap.autoUpdate},renderer:{exposure:r.toneMappingExposure,toneMapping:r.toneMapping,colorSpace:r.outputColorSpace,dpr:r.getPixelRatio(),width:r.domElement.width,height:r.domElement.height,drawCalls:r.info.render.calls,environment:!!scene.environment}}});});}));
 const name=`${phase}-${finish.split(' ')[0]}-${view}`,image=Buffer.from(capture.data.split(',')[1],'base64'),tel=capture.telemetry;
 assert.equal(tel.inspection.finish,finish);assert.equal(tel.inspection.recipe,'grounded-studio-refined');assert.equal(tel.renderer.environment,true);assert(tel.renderer.drawCalls>0);assert.equal(tel.shadow.allocated[0],1024);assert.equal(tel.floor.position[1],phase==='before'?-.003:.1585579729696714);
 const variants=tel.inspection.meshes.filter(m=>m.expectedMaterial!==undefined);assert(variants.length);for(const m of variants)assert.deepEqual(m.materials.map(x=>x.index),[m.expectedMaterial]);assert.deepEqual(errors,[]);
 const before=all.find(x=>x.phase==='before'&&x.finish===finish&&x.view===view);if(phase==='after'){assert(before);assert.deepEqual(tel.camera,before.telemetry.camera);assert.deepEqual(tel.model,before.telemetry.model);assert.deepEqual(tel.inspection.meshes,before.telemetry.inspection.meshes);assert.deepEqual(tel.shadow,before.telemetry.shadow);assert.deepEqual(tel.renderer,before.telemetry.renderer);}
 await writeFile(path.join(out,name+'.png'),image);await save(name+'.json',{phase,finish,view,requested:{position,target},png:name+'.png',sha256:sha(image),modelSha256:sha(bytes),modelBytes:bytes.length,errors,telemetry:tel});
 all.push({phase,finish,view,filename:name+'.png',sha256:sha(image),telemetry:tel});await save('captures.json',all);console.log(name, new Date().toISOString());
 }
 }finally{await browser.close();provenance.events.push({phase,finish,started,ended:new Date().toISOString(),elapsedSeconds:(performance.now()-start)/1000});await save('provenance.json',provenance);}
 }}finally{await server.close();}
}
assert.equal(all.length,12);assert.deepEqual(await inventory(parent),previous);await save('historical-preservation.json',{verified:true,fileCount:Object.keys(previous).length,pngCount:Object.keys(previous).filter(p=>p.endsWith('.png')).length,beforeManifest:await readFile(path.join(parent,'before-captures.json'),'utf8')});provenance.ended=new Date().toISOString();await save('provenance.json',provenance);console.log('PASS 12 images, 6 runtime-asserted pairs; historical files unchanged');
