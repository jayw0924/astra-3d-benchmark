import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import {chromium} from '@playwright/test';
import {buildPlan,models,targets} from './plan.mjs';
const root=process.cwd(),here=path.dirname(new URL(import.meta.url).pathname),rel=path.relative(root,here),hash=b=>createHash('sha256').update(b).digest('hex');
const save=async(name,x)=>{const p=path.join(here,name),tmp=p+'.tmp';await writeFile(tmp,typeof x==='string'?x:JSON.stringify(x,null,2)+'\n');await rename(tmp,p);};
await mkdir(path.join(here,'rendered'),{recursive:true});await mkdir(path.join(here,'raw'),{recursive:true});
for(const model of models){const b=await readFile(model.path);if(b.length!==model.bytes||hash(b)!==model.sha256)throw Error('pin mismatch');}
const server=createServer(async(req,res)=>{try{const p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(!p.startsWith(root+'/'))throw Error('outside');const b=await readFile(p);const ext=path.extname(p);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.wasm':'application/wasm','.png':'image/png','.glb':'model/gltf-binary'})[ext]||'application/octet-stream','Content-Length':b.length,'Cache-Control':'no-store'});res.end(b);}catch{res.writeHead(404);res.end('not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const args=process.argv.slice(2),action=args[0];
let manifest;try{manifest=JSON.parse(await readFile(path.join(here,'capture-manifest.json')));}catch{manifest={status:'unaccepted; controlled evidence only',expected:108,images:[],sessions:[],errors:[],settings:{width:600,height:400,dpr:1,environment:'RoomEnvironment PMREM 0.04',lights:'no direct lights; same procedural environment',toneMapping:'ACESFilmic',exposure:1.05,colorSpace:'sRGB',rootRotationY:-0.22,warmup:6},matrix:buildPlan()};}
// Retained outputs are rehashed before any resume or subset repair.
for(const im of manifest.images){const b=await readFile(path.join(here,im.path));if(b.length!==im.bytes||hash(b)!==im.sha256)throw Error('retained PNG mismatch '+im.id);}
async function session(model,label,bootstrap=false){
 const context=await browser.newContext({viewport:{width:600,height:400},deviceScaleFactor:1,reducedMotion:'reduce'}),page=await context.newPage(),errors=[],network=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url());});
 const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');const requests=new Map();
 cdp.on('Network.responseReceived',e=>{requests.set(e.requestId,{url:e.response.url,status:e.response.status,headers:e.response.headers,mimeType:e.response.mimeType,fromDiskCache:e.response.fromDiskCache});});
 cdp.on('Network.loadingFinished',e=>{const r=requests.get(e.requestId);if(r&&r.url.endsWith('.glb'))network.push({...r,encodedDataLength:e.encodedDataLength});});
 await page.goto(`${base}/${rel}/page.html?${new URLSearchParams({model:model.url,...(bootstrap?{bootstrap:'1'}:{})})}`);
 await page.waitForFunction(()=>document.body.dataset.ready==='true',null,{timeout:180000});
 return {page,context,errors,network,label,model};
}
try{
 if(action==='gallery'){
  const context=await browser.newContext({viewport:{width:1280,height:800}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url());});
  await page.goto(`${base}/${rel}/index.html`);
  const result=await page.evaluate(async()=>{const images=[...document.images];await Promise.all(images.map(async im=>{im.loading='eager';await im.decode();}));return {title:document.title,count:images.length,bad:images.filter(im=>im.naturalWidth!==600||im.naturalHeight!==400||!im.alt).map(im=>im.src)};});
  await save('gallery-check.json',{...result,errors});if(result.count!==108||result.bad.length||errors.length)throw Error('gallery check failed');await context.close();console.log('gallery checked',result.count);
 }else if(action==='bootstrap'){
  const s=await session(models[0],'control-camera-derivation',true);const spec=await s.page.evaluate(()=>window.result);spec.controlSha256=models[0].sha256;await save('control-spec.json',spec);await save('raw/bootstrap.json',{errors:s.errors,network:s.network});await s.context.close();console.log('Control-only camera spec saved');
 }else if(action==='capture'){
  const model=models.find(x=>x.id===args[1]);if(!model)throw Error('model');const subset=args[2]?args[2].split(','):targets;
  const selected=buildPlan().filter(x=>x.model===model.id&&subset.includes(x.target));const s=await session(model,`capture-${model.id}-${Date.now()}`);
  for(const item of selected){
   const m=await s.page.evaluate(item=>window.harness.render(item),item);
   const urls=await s.page.evaluate(()=>[document.querySelector('canvas').toDataURL('image/png'),document.querySelector('canvas').toDataURL('image/png')]);
   const b=Buffer.from(urls[0].split(',')[1],'base64');if(urls[0]!==urls[1])throw Error('readback mismatch');
   const filename=`rendered/${item.id}.png`;await writeFile(path.join(here,filename),b);
   manifest.images=manifest.images.filter(x=>x.id!==item.id);manifest.images.push({...item,path:filename,bytes:b.length,sha256:hash(b),repeatReadbackIdentical:true,...m});
   manifest.remaining=108-manifest.images.length;await save('capture-manifest.json',manifest);console.log('captured',item.id,b.length,'remaining',manifest.remaining);
  }
  const raw={model:model.id,label:s.label,metrics:await s.page.evaluate(()=>window.harness.metrics),network:s.network,errors:s.errors};await save(`raw/${s.label}.json`,raw);manifest.sessions.push(`raw/${s.label}.json`);manifest.errors.push(...s.errors);await save('capture-manifest.json',manifest);await s.context.close();if(s.errors.length)throw Error(s.errors.join('\n'));
 }else if(action==='measure'){
  const order=args[1]||'control,safe,safe,control';
  for(const [localIndex,id] of order.split(',').entries()){
   const index=localIndex+Number(args[2]||0);
   const model=models.find(x=>x.id===id),s=await session(model,`measure-${index}-${id}`);
   const metrics=await s.page.evaluate(()=>window.harness.measure());
   const raw={model:id,order:index,metrics,network:s.network,errors:s.errors,browser:browser.version(),machine:{platform:os.platform(),release:os.release(),arch:os.arch(),cpus:os.cpus().map(x=>x.model),memory:os.totalmem()},scope:'Fresh contexts, shared browser process; HTTP no-store; OS/browser process caches uncontrolled. Software-renderer diagnostics only. No production-GPU ranking.'};
   await save(`raw/${s.label}.json`,raw);console.log(s.label,JSON.stringify({load:metrics.load,compile:metrics.coldCompileMs,frames:metrics.warmSamples.length,transitions:metrics.transitions.length,counts:metrics.firstInfo,errors:s.errors}));await s.context.close();if(s.errors.length)throw Error(s.errors.join('\n'));
  }
 }else throw Error('bootstrap | capture model [targets] | measure [order]');
}finally{await browser.close();await new Promise(r=>server.close(r));}
