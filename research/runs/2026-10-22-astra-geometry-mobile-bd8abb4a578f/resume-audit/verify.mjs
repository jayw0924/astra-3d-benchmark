import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
const run='research/runs/2026-10-22-astra-geometry-mobile-bd8abb4a578f',here=`${run}/resume-audit`;
const read=p=>JSON.parse(readFileSync(p));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const ajv=new Ajv({allErrors:true});addFormats(ajv);
for(const [schema,file] of [['run',`${run}/run.json`],['geometry-report',`${run}/candidate-geometry-report.pending.json`]]){const validate=ajv.compile(read(`research/schemas/${schema}.schema.json`));assert(validate(read(file)),JSON.stringify(validate.errors));}
const before=read(`${here}/existing-artifacts.json`).files;
for(const [name,rec] of Object.entries(before)){const p=`${run}/${name}`;assert.equal(statSync(p).size,rec.bytes);if(rec.sha256)assert.equal(hash(p),rec.sha256,name);}
const reconciliation=read(`${here}/reconciliation.json`);assert.equal(reconciliation.missingExecutableHandoffSteps.length,0);assert.equal(reconciliation.nativeFramesVerified,108);
const walk=d=>readdirSync(d).flatMap(n=>{const p=path.join(d,n);return statSync(p).isDirectory()?walk(p):[p];});
const current=walk(run).filter(p=>!p.startsWith(here+'/')).map(p=>p.slice(run.length+1)).sort();assert.deepEqual(current,Object.keys(before).sort());
const outputs=[...walk(here),`${here}/verification.json`].sort();assert.equal(new Set(outputs).size,outputs.length);
const provenance=outputs.map(p=>({path:p,lane:'mixed',sourceAssets:['web-product-estuary'],basis:'Additive agent-directed audit of existing mixed-provenance evidence; runtime attribution provisional; no new geometry or Sol acceptance'}));
const result={checkedAt:new Date().toISOString(),passed:true,historicalRunSchema:true,historicalGeometryReportSchema:true,priorArtifactCount:Object.keys(before).length,allPriorArtifactsBytePreserved:true,authoringRerun:false,publicConfiguratorChanged:false,historicalRunRecordPreserved:true,resumeOutputPaths:outputs,resumeProvenance:provenance,oneToOneResumeProvenance:true,limitations:['Private export absent; attribution unverified','Sol acceptance pending','Optional measurement interruption not retried; historical timing/log gaps remain unknown'],outcome:'partial; stop for Sol'};
writeFileSync(`${here}/verification.json`,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...result,resumeOutputPaths:undefined,resumeProvenance:undefined,resumeOutputCount:outputs.length},null,2));
