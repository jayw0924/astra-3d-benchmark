import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {verify} from './verify.mjs';
const result=await verify(),server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'error'});await server.listen();
const browser=await chromium.launch({headless:true});const checks=[];
try{for(const width of [1280,390]){const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));await page.goto(server.resolvedUrls.local[0]+'research/runs/2026-10-23-sol-viewer-lighting/index.html');
 const check=await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode()));return {images:document.images.length,bad:[...document.images].filter(i=>i.naturalWidth!==600||i.naturalHeight!==400||!i.alt).map(i=>i.src),overflow:document.documentElement.scrollWidth>innerWidth,title:document.title};});if(check.images!==72||check.bad.length||check.overflow||errors.length)throw Error('gallery invalid '+JSON.stringify({check,errors}));await page.screenshot({path:`research/runs/2026-10-23-sol-viewer-lighting/gallery-${width}.png`});checks.push({width,...check,errors});await page.close();}
 await writeFile(new URL('./gallery-check.json',import.meta.url),JSON.stringify({evidence:result,checks},null,2)+'\n');console.log(JSON.stringify(checks));
}finally{await browser.close();await server.close();}
