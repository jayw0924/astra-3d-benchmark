import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'error'});await server.listen();
const browser=await chromium.launch({headless:true});const checks=[];
try {
 for(const [layout,viewport] of [['desktop',{width:1280,height:900}],['mobile',{width:393,height:851}]]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(`${server.resolvedUrls.local[0]}research/runs/2026-10-26-sol-lighting-integration/index.html`);
  const state=await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode()));return {images:document.images.length,bad:[...document.images].filter(i=>i.naturalWidth<300||i.naturalHeight<400).map(i=>i.src),overflow:document.documentElement.scrollWidth-innerWidth};});
  if(state.images!==13||state.bad.length||state.overflow>1||errors.length)throw Error(JSON.stringify({state,errors}));
  checks.push({layout,viewport,...state,errors});await page.close();
 }
 console.log(JSON.stringify(checks,null,2));
} finally {await browser.close();await server.close();await writeFile('research/runs/2026-10-26-sol-lighting-integration/gallery-check.json',JSON.stringify(checks,null,2));}
