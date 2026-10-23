import datetime,hashlib,json,subprocess
from pathlib import Path
run=Path(__file__).resolve().parent; root=Path.cwd();relative=run.relative_to(root)
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
hash=lambda b:hashlib.sha256(b).hexdigest()
def save(n,x):
 with (run/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
baseline=json.loads((run/'workspace-before.json').read_text());changed=[]
for name,record in baseline['files'].items():
 p=Path(name)
 if not p.is_file():changed.append({'path':name,'reason':'missing'});continue
 st=p.stat()
 if 'sha256' in record:
  if hash(p.read_bytes())!=record['sha256']:changed.append({'path':name,'reason':'hash'})
 else:
  if any(record[k]!=v for k,v in {'bytes':st.st_size,'mode':st.st_mode,'mtime_ns':st.st_mtime_ns}.items()):changed.append({'path':name,'reason':'metadata'})
files=set(filter(None,subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z']).decode().split('\0')))
new=sorted(n for n in files if n not in baseline['files'] and not Path(n).is_relative_to(relative))
assert not changed and not new,(changed,new)
save('scope-verification.json',{'capturedAt':now(),'allPassed':True,'protectedFileCount':len(baseline['files']),'changed':changed,'newOutOfScope':new,'coverage':baseline['coverage'],'gitStatus':subprocess.check_output(['git','status','--short']).decode()})
env=json.loads((run/'environment.json').read_text());v=json.loads((run/'verification.json').read_text());safe=Path('public/assets/models/product-estuary-safe.glb').stat().st_size
save('delivery-summary.json',{'original':v['source'],'candidate':v['candidate'],'deltas':v['deltas'],'publicSafeBytes':safe,'incrementalBytesSavedVersusSafe':safe-v['candidate']['bytes'],'incrementalPercentVersusSafe':(safe-v['candidate']['bytes'])/safe*100,'verdict':'Smaller original delivery, but incremental advantage versus existing Safe is modest; no integration recommendation without Sol visual review and real-device/policy evidence.'})
end=now();outputs=sorted(str(p.relative_to(root)) for p in run.rglob('*') if p.is_file() and p.name not in ['session.jsonl','run.json'])
outputs.append(str(relative/'package-verification.json'));outputs=sorted(set(outputs))
sol={'page.html','page.js','control-spec.json'}
provenance=[]
for p in outputs:
 name=Path(p).name
 lane='non_astra_authored_baseline' if name in sol else 'mixed' if name in ['candidate.glb','repeat.glb','capture.mjs','plan.mjs','transform.mjs','verify.mjs','verify-initial-path-failure.mjs'] or '/rendered/' in p or '/sheets/' in p else 'astra_authored'
 provenance.append({'path':p,'lane':lane,'sourceAssets':['web-product-estuary']})
record={'id':relative.name,'title':'Initial isolated Mobile LOD candidate — partial, awaiting Sol','startedAt':env['startedAt'],'endedAt':end,'model':'gpt-6-astra','provider':'openai-codex','interface':'Hermes CLI; Docker terminal/file tools; headless Playwright','reasoningMode':'not independently recorded','tools':['terminal','file tools','glTF Transform 4.5.1','meshoptimizer 1.2.0','gltf-validator 2.0.0-dev.3.10','headless Playwright'],'workPackage':'geometry','inputAssets':['web-product-estuary'],'promptPath':str(relative/'prompt.md'),'outputPaths':outputs,'provenance':{'lane':'mixed','outputs':provenance},'sessionEvidence':{'path':str(relative/'session.jsonl'),'sessionId':env['sessionId']},'elapsedSeconds':(datetime.datetime.fromisoformat(end)-datetime.datetime.fromisoformat(env['startedAt'])).total_seconds(),'cost':{'amount':None,'currency':'USD','basis':'Unknown; no billing evidence available'},'interventionLevel':0,'outcome':'partial','failureNotes':'Private persistence unverified. Independent visual acceptance pending; no direct image inspection claimed. Two inspector/tooling corrections, zero geometry corrections; initial failures preserved. Supplemental browser measurement terminated outer exit 137, completion log unavailable; candidate all-pairs browser transitions/performance unavailable. See failures.md. No manifest registration or public integration.','reviewer':'Sol — pending','publicSummary':'Research-only candidate; original delivery bytes improved 9.77%, triangles reduced 14.10%. No mobile performance or quality verdict.'}
save('run.json',record)
print(json.dumps({'protectedFiles':len(baseline['files']),'outputCount':len(outputs),'incrementalSafeSavingBytes':safe-v['candidate']['bytes'],'incrementalSafeSavingPercent':(safe-v['candidate']['bytes'])/safe*100,'endedAt':end},indent=2))
