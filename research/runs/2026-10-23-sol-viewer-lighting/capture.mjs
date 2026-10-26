import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { matrix, model, settings, rigs } from './plan.mjs';
const here=path.dirname(new URL(import.meta.url).pathname),rel=path.relative(process.cwd(),here),hash=b=>createHash('sha256').update(b).digest('hex');
const save=async(n,v)=>{await writeFile(path.join(here,n+'.tmp'),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');await rename(path.join(here,n+'.tmp'),path.join(here,n));};
for(const d of ['rendered','raw','attempts'])await mkdir(path.join(here,d),{recursive:true});
const bytes=await readFile(model.path);if(bytes.length!==model.bytes||hash(bytes)!==model.sha256)throw Error('model mismatch');
const sources=['src/lib/viewerLighting.ts','src/lib/threeViewer.ts',`${rel}/plan.mjs`,`${rel}/page.js`,`${rel}/page.html`,'research/protocols/viewer-lighting-v1.md'];
const pins=Object.fromEntries(await Promise.all(sources.map(async n=>[n,hash(await readFile(n))])));
const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'error'});await server.listen();const base=server.resolvedUrls.local[0];
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const action=process.argv[2]||'capture',errors=[],consoleMessages=[];
const context=await browser.newContext({viewport:{width:600,height:400},deviceScaleFactor:1}),page=await context.newPage();page.setDefaultTimeout(180000);
page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()+':'+r.failure()?.errorText));page.on('console',m=>{if(['error','warning'].includes(m.type()))consoleMessages.push({type:m.type(),text:m.text()});});
let modelRequests=0;page.on('request',r=>{if(r.url().endsWith('.glb'))modelRequests++;});
try{
 if(action==='bootstrap'){
  await page.goto(`${base}${rel}/page.html?bootstrap=1`);await page.waitForFunction(()=>document.body.dataset.ready==='true');
  if(errors.length)throw Error(errors.join('\n'));await save('control-spec.json',await page.evaluate(()=>window.result));console.log('frozen control spec');
 }else{
  let manifest;try{manifest=JSON.parse(await readFile(path.join(here,'capture-manifest.json')));}catch{manifest={status:'Sol presentation experiment; preference pending; original retained',expected:matrix.length,settings,pins,images:[],sessions:[],matrix};}
  if(JSON.stringify(manifest.pins)!==JSON.stringify(pins))throw Error('harness/source pins changed; preserve attempt and use explicit new attempt');
  for(const im of manifest.images){const b=await readFile(path.join(here,im.path));if(hash(b)!==im.sha256||b.length!==im.bytes)throw Error('retained capture pin');}
  const specHash=hash(await readFile(path.join(here,'control-spec.json')));if(manifest.specHash&&manifest.specHash!==specHash)throw Error('spec pin');manifest.specHash=specHash;
  await save('plan-frozen.json',{settings,model,matrix,pins,specHash,matrixHash:hash(JSON.stringify(matrix))});
  await page.goto(`${base}${rel}/page.html`);await page.waitForFunction(()=>document.body.dataset.ready==='true');
  if(action==='parity'){
    const checks=[];
    for(const rig of ['original','environment-only']){const item=matrix.find(x=>x.rig===rig&&x.target==='front-three-quarter');await page.evaluate(x=>window.harness.render(x),item);const data=await page.evaluate(()=>document.querySelector('canvas').toDataURL('image/png'));const sha256=hash(Buffer.from(data.split(',')[1],'base64')),prior=manifest.images.find(x=>x.id===item.id);if(sha256!==prior.sha256)throw Error('unaffected control pixel parity failed '+item.id);checks.push({id:item.id,sha256,identical:true});}
    await save('repair-parity.json',{checks,errors,consoleMessages});console.log('Unchanged stages match exact retained PNG hashes');
  }
  const selected=action==='parity'?[]:matrix.filter(x=>(!process.argv[3]||x.rig===process.argv[3])&&!manifest.images.some(y=>x.id===y.id)).slice(0,Number(process.argv[4]||72));
  for(const rig of rigs){
   for(const item of selected.filter(x=>x.rig===rig)){
    const m=await page.evaluate(item=>window.harness.render(item),item);if(errors.length||consoleMessages.some(x=>x.type==='error'))throw Error(JSON.stringify({errors,consoleMessages}));
    const data=await page.evaluate(()=>document.querySelector('canvas').toDataURL('image/png'));const b=Buffer.from(data.split(',')[1],'base64');
    const filename=`rendered/${item.id}.png`;await writeFile(path.join(here,filename),b);
    manifest.images.push({...item,...m,path:filename,bytes:b.length,sha256:hash(b),width:600,height:400,dpr:1});await save('capture-manifest.json',manifest);console.log('captured',manifest.images.length,item.id,b.length);
   }
   await save(`raw/checkpoint-${rig}-${Date.now()}.json`,{metrics:await page.evaluate(()=>window.harness.metrics),errors,consoleMessages,modelRequests,browser:browser.version()});
  }
  const transitions=await page.evaluate(()=>window.harness.transitions());const disposal=await page.evaluate(()=>window.harness.dispose());
  const raw={metrics:await page.evaluate(()=>window.harness.metrics),transitions,disposal,errors,consoleMessages,modelRequests,browser:browser.version(),scope:'Sequential single browser context; same model load; cached material/program history, no randomized timing. Per-image first plus one warmed synchronous submit+gl.finish sample. Renderer counters include transmission passes; not GPU-work or end-user performance.'};
  const name=`raw/session-${Date.now()}.json`;await save(name,raw);manifest.sessions.push(name);manifest.actual=manifest.images.length;await save('capture-manifest.json',manifest);if(errors.length||modelRequests!==1)throw Error('errors or redundant model load');console.log('COMPLETE',manifest.actual,'transitions',transitions,'modelRequests',modelRequests);
 }
}finally{await save(`raw/execution-${Date.now()}.json`,{action,errors,consoleMessages,modelRequests});await browser.close();await server.close();}
