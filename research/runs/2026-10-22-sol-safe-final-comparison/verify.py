from pathlib import Path
import json,hashlib,subprocess,platform,datetime
from PIL import Image
p=Path(__file__).resolve().parent;root=Path.cwd();h=lambda b:hashlib.sha256(b).hexdigest();load=lambda n:json.loads((p/n).read_text())
m=load('capture-manifest.json');assert len(m['images'])==108 and m['remaining']==0
assert 'pass 7' in (p/'tests-final.txt').read_text() and 'fail 0' in (p/'tests-final.txt').read_text()
assert 'Tests  18 passed (18)' in (p/'fast-unit.txt').read_text()
for name,count in [('fast-scripts.txt',25),('fast-render-plans.txt',6)]:assert f'pass {count}' in (p/name).read_text() and 'fail 0' in (p/name).read_text()
for x in m['images']:
 b=(p/x['path']).read_bytes();assert len(b)==x['bytes'] and h(b)==x['sha256'];assert x['camera']==load('control-spec.json')['cameras'][x['target']]
for x in m['inputPins']:
 b=Path(x['path']).read_bytes();assert len(b)==x['bytes'] and h(b)==x['sha256']
protected=load('protected-snapshot.json');changed=[]
for x in protected:
 f=Path(x['path'])
 if not f.is_file() or f.stat().st_size!=x['bytes'] or h(f.read_bytes())!=x['sha256']:changed.append(x['path'])
assert not changed,changed
initial={x['path'] for x in protected};exclusions=set(load('initial-inventory.json')['exclusions'])
current=set(filter(None,subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z']).decode().split('\0')))
newOutside=sorted(n for n in current-initial-exclusions if p not in (root/n).parents)
assert not newOutside,newOutside
pngs=sorted(p.rglob('*.png'))
for f in pngs:
 with Image.open(f) as im:im.verify()
raw=[load(f'raw/measure-{i}-{id}.json') for i,id in enumerate(['control','safe','safe','control'])]
assert sum(len(x['metrics']['transitions']) for x in raw)==64
assert sum(len(x['metrics']['warmSamples']) for x in raw)==120
assert all(not x['errors'] for x in raw)
commands=[json.loads(x) for x in (p/'commands.jsonl').read_text().splitlines()]
executions=[x for x in commands if x['log'].startswith('execution-')]
assert len(executions)==9 and all(x['exitCode']==0 for x in executions)
assert not list(p.rglob('run.json')) and not (p/'decision.json').exists()
gallery=load('gallery-check.json');assert gallery['count']==108 and not gallery['errors'] and not gallery['bad']
for x in load('native-comparison-manifest.json'):
 assert h((p/x['path']).read_bytes())==x['sha256']
 for s in x['sources']:assert h(Path(s['path']).read_bytes())==s['sha256']
author=p.parent/'2026-10-22-astra-geometry-safe-final-d0bf6e206c92';am=json.loads((author/'capture-manifest.json').read_text());replayed=[]
for x in am['images']:
 b=(author/x['path']).read_bytes();assert len(b)==x['bytes'] and h(b)==x['sha256'];key=x['id'].replace('final--','safe--');y=next(i for i in m['images'] if i['id']==key);replayed.append({'authorId':x['id'],'acceptanceId':key,'sha256':y['sha256'],'byteIdenticalToIndependentAffectedViewCapture':x['sha256']==y['sha256']})
assert len(replayed)==16 and all(x['byteIdenticalToIndependentAffectedViewCapture'] for x in replayed)
(p/'affected-view-replay.json').write_text(json.dumps(replayed,indent=2)+'\n')
assert all(x['controlFinalPixelIdentical'] for x in load('seam-diagnostic.json'))
sourceHashes=[{'path':n,'sha256':h((root/n).read_bytes())} for n in ['package.json','package-lock.json','vite.config.ts','research/protocols/geometry-optimization-v1.md','research/ASTRA_SAFE_FINAL_CORRECTION.md']]
harnessHashes=[{'path':str(f.relative_to(root)),'sha256':h(f.read_bytes())} for f in sorted(p.iterdir()) if f.suffix in ['.py','.mjs','.js','.html']]
env={'cwd':str(root),'hostProject':load('initial-inventory.json')['hostProject'],'platform':platform.platform(),'python':platform.python_version(),'node':subprocess.check_output(['node','--version'],text=True).strip(),'browser':raw[0]['browser'],'renderer':raw[0]['metrics']['gpu'],'sourceInputPins':m['inputPins'],'sourceHashes':sourceHashes,'harnessHashes':harnessHashes,'reuseMethodChecks':'reuse-verification.json'}
(p/'environment.json').write_text(json.dumps(env,indent=2)+'\n')
result={'status':'evidence-complete; final verdict reserved for parent','verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'matrixImages':len(m['images']),'freshFinalImages':54,'cryptographicallyVerifiedReusedControls':54,'sheets':len(load('sheet-manifest.json')),'supplementalComparisons':len(load('native-comparison-manifest.json')),'allPngsDecodedByPillow':len(pngs),'browserGalleryDecoded':gallery['count'],'completedContextOrder':[x['model'] for x in raw],'actualAllPairsTransitions':64,'assignmentsPerTransition':25,'rawWarmSamples':120,'captureContexts':len(m['sessions']),'measuredContexts':len(raw),'successfulExecutionCommands':len(executions),'failedCommandsPreserved':[x for x in commands if x['exitCode']!=0],'activeCaptureErrors':m['activeCaptureErrors'],'measuredErrors':[e for x in raw for e in x['errors']],'protectedFilesChecked':len(protected),'protectedChanges':changed,'newOutsideScopePaths':newOutside,'scopeExclusions':load('initial-inventory.json')['exclusions'],'ignoredFilesCoverage':'Ignored files are excluded from broad Git content snapshot; input binary pins checked explicitly. No claim of whole-host coverage.','fastTests':{'unit':18,'scripts':25,'priorRenderPlans':6,'package':7},'affectedViewReplayByteIdentical':len(replayed),'firstCorrectFrame':{'status':'unavailable','reason':'No correctness inspection at first-render timestamp'},'runJsonAuthored':False,'finalAcceptanceAuthored':False,'visualReview':'visual-review.md'}
(p/'verification.json').write_text(json.dumps(result,indent=2)+'\n')
# stdout and command log are finalized by logger after this process; inventory is generated separately afterwards.
print(json.dumps(result,indent=2))
