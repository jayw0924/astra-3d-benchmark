import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root = process.cwd();
const here = import.meta.dirname;
const load = async p => JSON.parse(await readFile(p, 'utf8'));
const hash = b => createHash('sha256').update(b).digest('hex');
const finalization = await load(path.join(here, 'verification.json'));
async function files(dir) {
  const result=[];
  for (const item of await readdir(dir,{withFileTypes:true})) {
    const p=path.join(dir,item.name);
    if(item.isDirectory()) result.push(...await files(p));
    else if(item.isFile()) result.push(path.relative(root,p));
    else assert.fail('Unexpected symlink or special file '+p);
  }
  return result;
}
test('all finalized packages declare each retained public output exactly once',async()=>{
  const ids = [...finalization.privateEvidence.map(e=>e.run),
    '2026-10-21-sol-safe-webgl-comparison','2026-10-21-sol-safe-correction-comparison',
    '2026-10-22-sol-safe-final-comparison','2026-10-21-astra-geometry-safe-correction-7f2d11f494a5',path.basename(here)];
  for(const id of ids){
    const dir=path.join(root,'research/runs',id), run=await load(path.join(dir,'run.json'));
    assert.equal(new Set(run.outputPaths).size,run.outputPaths.length);
    assert.deepEqual([...run.outputPaths].sort(),run.provenance.outputs.map(o=>o.path).sort());
    const local=(await files(dir)).filter(p=>!['run.json','session.jsonl'].includes(path.basename(p)));
    assert.deepEqual(local.sort(),run.outputPaths.filter(p=>p.startsWith(path.relative(root,dir)+'/')).sort());
    for(const entry of run.provenance.outputs){
      if(['prompt.md','handoff-input.md','page.html','page.js','control-spec.json','session-evidence.sha256'].includes(path.basename(entry.path))) {
        assert.notEqual(entry.lane,'astra_authored');
      }
    }
  }
});
test('original prompts, logs, binaries, provisional reports and capture evidence are untouched',async()=>{
  for(const [p,expected] of Object.entries(finalization.historicalDigests))assert.equal(hash(await readFile(path.join(root,p))),expected,p);
});
test('private evidence is ignored, 0600, hash-correct and absent from public projection',async()=>{
  const generated=await readFile(path.join(root,'src/generated/study-data.json'),'utf8');
  for(const item of finalization.privateEvidence){
    const p=path.join(root,'research/runs',item.run,'session.jsonl'),b=await readFile(p),s=JSON.parse(b);
    assert.equal(hash(b),item.sha256);
    assert.equal((await stat(p)).mode&0o777,0o600);
    execFileSync('git',['check-ignore','-q',path.relative(root,p)]);
    assert.equal(generated.includes(s.id),false);
    assert.equal(generated.includes('sessionEvidence'),false);
    assert.equal(generated.includes('system_prompt'),false);
    assert.equal(generated.includes('session.jsonl'),false);
  }
});
test('gate outcomes remain original rejected, correction not promoted, FINAL accepted research only',async()=>{
  const expected=['fail','partial','pass_with_intervention'];
  for(const [i,item] of finalization.privateEvidence.entries()){
    const run=await load(path.join(root,'research/runs',item.run,'run.json'));
    assert.equal(run.outcome,expected[i]);
  }
  const decision=await load(path.join(root,'research/runs/2026-10-22-sol-safe-final-comparison/decision.json'));
  assert.equal(decision.status,'accepted-research-candidate');
  assert.equal(decision.promotionApproved,false);
  assert.equal(decision.runtimeSpeedup.status,'not-established');
  assert.equal(decision.firstCorrectFrame.status,'unavailable');
});
test('registered canonical reports bind measured data to immutable assets; public copies match exact evidence',async()=>{
  const manifest=await load(path.join(root,'research/asset-manifest.json'));
  for(const item of finalization.canonicalReports){
    const report=await load(path.join(root,item.reportPath));
    const a=manifest.assets.find(a=>a.id===report.assetId);
    assert(a);assert.equal(report.sha256,hash(await readFile(path.join(root,a.localPath))));
    const measured=JSON.parse(execFileSync('node',['scripts/report-geometry.mjs','--asset-id',a.id,'--role',report.role,a.localPath],{cwd:root,encoding:'utf8'}));
    assert.deepEqual(report,measured);
  }
  const subsequent = await load(path.join(here,'public-copy-registration.json'));
  const copies=[...finalization.publicCopies,...subsequent.snapshots.at(-1).publicCopies];
  for(const item of copies){
    const b=await readFile(path.join(root,item.path));
    assert.equal(hash(b),item.sha256);assert.equal(b.length,item.bytes);
    assert.deepEqual(b,await readFile(path.join(root,item.source)));
  }
});
