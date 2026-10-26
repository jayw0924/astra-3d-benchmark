import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
test.use({ deviceScaleFactor: 1, launchOptions: { args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage'] } });
type Snapshot = { finish:string; recipe:string; camera:number[];target:number[];bounds:{min:number[];max:number[]}; floorY:number; environment:boolean; shadows:{enabled:boolean;autoUpdate:boolean};renderedFrames:number;shadowUpdates:number; meshes:Array<{name:string;castShadow:boolean;expectedMaterial?:number;materials:Array<{index?:number;name:string;transparent:boolean;color:string;metalness:number;roughness:number}>}> };
async function inspect(page: Page): Promise<Snapshot> {
 return page.getByTestId('configurator-canvas').evaluate(canvas => {
  let result: unknown;
  canvas.dispatchEvent(new CustomEvent('viewer:inspect',{detail:(value:unknown) => {result=value;}}));
  return result;
 }) as Promise<Snapshot>;
}
async function captureNative(page: Page, filename: string) {
 // Read the actual app framebuffer immediately after its own render callback.
 // No replacement renderer, scene, materials, camera, resolution or exposure.
 const data = await page.evaluate(() => new Promise<string>(resolve => {
  const raf=window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame=callback=>raf(time=>{
   window.requestAnimationFrame=raf;
   callback(time);
   resolve((document.querySelector('[data-testid="configurator-canvas"]') as HTMLCanvasElement).toDataURL('image/png'));
  });
 }));
 await writeFile(filename,Buffer.from(data.split(',')[1],'base64'));
}
for (const finish of ['Carmine Candy','Pearly Swirly','Torched Graphite','Estuary Enamel']) {
 test(`refined live lighting ${finish}`, async ({page},info) => {
  test.setTimeout(480000);
  // Bound CPU-only GPU submission from the first frame; not a performance test.
  await page.addInitScript(() => {
   const raf=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=callback=>window.setTimeout(()=>raf(callback),1000);
  });
  await page.setViewportSize(info.project.name.includes('mobile') ? {width:393,height:851} : {width:1280,height:900});
  const out=path.resolve('research/runs/2026-10-26-sol-lighting-integration');await mkdir(out,{recursive:true});
  const label=`${info.project.name}-${finish.toLowerCase().replaceAll(' ','-')}`;
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  const response=page.waitForResponse(r=>r.url().endsWith('/assets/models/product-estuary-safe.glb'));
  await page.goto(`/?finish=${encodeURIComponent(finish)}&trim=bright`);
  await expect(page.getByRole('status')).toHaveText('3D model ready',{timeout:180000});
  const bytes=await (await response).body();expect(bytes.length).toBe(9239404);expect(createHash('sha256').update(bytes).digest('hex')).toBe('01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4');
  await expect.poll(async()=> (await inspect(page))?.finish,{timeout:120000}).toBe(finish);
  const initial=await inspect(page);expect(initial.recipe).toBe('grounded-studio-refined');expect(initial.environment).toBe(true);expect(initial.shadows).toMatchObject({enabled:true,autoUpdate:false});expect(initial.floorY).toBeCloseTo(0.1590579729696714 - .0005,6); // Verified transformed Tiretread minimum, not conservative AABB min.
  const variantMeshes=initial.meshes.filter(m=>m.expectedMaterial!==undefined);expect(variantMeshes.length).toBeGreaterThan(0);for(const mesh of variantMeshes)expect(mesh.materials.map(m=>m.index)).toEqual([mesh.expectedMaterial]);
  for(const mesh of initial.meshes)expect(mesh.castShadow).toBe(mesh.materials.every(m=>!m.transparent));
  const canvas=page.getByTestId('configurator-canvas');await canvas.scrollIntoViewIfNeeded();
  // Native app pixels; no custom render harness or model/camera overrides.
  if(process.env.CAPTURE_LIGHTING==='1') {
   await captureNative(page,path.join(out,`after-refined-${label}-native.png`));
  }
  const frames=initial.renderedFrames;await expect.poll(async()=>(await inspect(page)).renderedFrames,{timeout:120000}).toBeGreaterThan(frames);
  if(finish==='Carmine Candy') {
   const transitions=[];
   // Bound shader/material retention per software-rendered context; all four
   // initial assignments are independently verified by the parameterized cases.
   for(const next of ['Estuary Enamel','Carmine Candy']) {
    const prior=await inspect(page);
    await page.getByRole('radio',{name:next}).evaluate((e:HTMLInputElement)=>e.click());
    await expect.poll(async()=>{const s=await inspect(page);return s.finish===next&&s.shadowUpdates>prior.shadowUpdates;},{timeout:120000}).toBe(true);
    const s=await inspect(page);
    for(const mesh of s.meshes) {
     if(mesh.expectedMaterial!==undefined)expect(mesh.materials.map(m=>m.index)).toEqual([mesh.expectedMaterial]);
     expect(mesh.castShadow).toBe(mesh.materials.every(m=>!m.transparent));
    }
    transitions.push(s);
   }
   await writeFile(path.join(out,`${label}-transitions.json`),JSON.stringify(transitions,null,2));
   for(const [name,expected] of [['Dark alloy','181a1d'],['Bright alloy',null]] as const){
    await page.getByRole('radio',{name}).evaluate((e:HTMLInputElement)=>e.click());
    await expect.poll(async()=>{const s=await inspect(page);const rims=s.meshes.flatMap(m=>m.materials).filter(m=>['Rim1','Rim2'].includes(m.name));return rims.length>0&&rims.every(m=>expected?m.color===expected:m.metalness===1&&m.roughness===.24);}).toBe(true);
   }
   await page.getByRole('button',{name:'Rotate left',exact:true}).evaluate((e:HTMLButtonElement)=>e.click());
   await expect.poll(async()=>(await inspect(page)).camera).not.toEqual(initial.camera);
   const rotated=await inspect(page);expect(rotated.bounds).toEqual(initial.bounds);expect(rotated.floorY).toBe(initial.floorY);
   if(process.env.CAPTURE_LIGHTING==='1') await captureNative(page,path.join(out,`after-refined-${label}-orbit.png`));
   await page.getByRole('button',{name:'Zoom in',exact:true}).evaluate((e:HTMLButtonElement)=>e.click());const zoomed=await inspect(page);expect(zoomed.camera).not.toEqual(rotated.camera);
   await page.getByRole('button',{name:'Zoom out',exact:true}).evaluate((e:HTMLButtonElement)=>e.click());
   await page.getByRole('button',{name:'Rotate right',exact:true}).evaluate((e:HTMLButtonElement)=>e.click());
   if(!info.project.name.includes('mobile')) {
    await canvas.scrollIntoViewIfNeeded();const box=(await canvas.boundingBox())!;
    const before=await inspect(page);await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
    await page.mouse.down();await page.mouse.move(box.x+box.width/2+70,box.y+box.height/2+15,{steps:6});await page.mouse.up();
    await expect.poll(async()=>(await inspect(page)).camera).not.toEqual(before.camera);
    const orbited=await inspect(page);await page.mouse.wheel(0,100);
    await expect.poll(async()=>(await inspect(page)).camera).not.toEqual(orbited.camera);
   }
   await page.getByRole('button',{name:'Reset configuration',exact:true}).evaluate((e:HTMLButtonElement)=>e.click());
   await expect.poll(async()=>{const s=await inspect(page);return s.camera.map((v,i)=>Math.abs(v-initial.camera[i])<1e-6).every(Boolean);}).toBe(true);
   await expect(page.getByRole('radio',{name:'Carmine Candy'})).toBeChecked();
  }
  const final=await inspect(page);await writeFile(path.join(out,`${label}-inspection.json`),JSON.stringify({initial,final,errors,served:{bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')},viewport:page.viewportSize(),dpr:1},null,2));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);expect(errors).toEqual([]);
 });
}
