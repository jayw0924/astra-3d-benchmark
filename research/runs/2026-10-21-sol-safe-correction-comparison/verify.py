from pathlib import Path
import json,hashlib,subprocess,platform,os
from PIL import Image
p=Path(__file__).resolve().parent
h=lambda b:hashlib.sha256(b).hexdigest()
load=lambda n:json.loads((p/n).read_text())
m=load('capture-manifest.json');assert len(m['images'])==108 and m['remaining']==0
assert load('test-execution.json')['exitCode']==0
assert 'pass 7' in (p/'tests-final.txt').read_text() and 'fail 0' in (p/'tests-final.txt').read_text()
for x in m['images']:
 b=(p/x['path']).read_bytes();assert len(b)==x['bytes'] and h(b)==x['sha256']
 assert x['camera']==load('control-spec.json')['cameras'][x['target']]
for x in m['inputPins']:
 b=Path(x['path']).read_bytes();assert len(b)==x['bytes'] and h(b)==x['sha256']
protected=load('protected-snapshot.json');changed=[]
for x in protected:
 f=Path(x['path'])
 if not f.is_file() or h(f.read_bytes())!=x['sha256']:changed.append(x['path'])
assert not changed,changed
pngs=sorted(p.rglob('*.png'))
for f in pngs:
 with Image.open(f) as im:im.verify()
raw=[load(f'raw/measure-{i}-{id}.json') for i,id in enumerate(['control','safe','safe','control'])]
assert sum(len(x['metrics']['transitions']) for x in raw)==64
assert sum(len(x['metrics']['warmSamples']) for x in raw)==120
assert all(not x['errors'] for x in raw)
commands=[json.loads(x) for x in (p/'commands.jsonl').read_text().splitlines()]
assert len(commands)==9 and all(x['exitCode']==0 for x in commands)
assert not (p/'run.json').exists() and not (p/'decision.json').exists()
gallery=load('gallery-check.json');assert gallery['count']==108 and not gallery['errors'] and not gallery['bad']
replayed=[]
for x in load('native-comparison-manifest.json'):
 assert h((p/x['path']).read_bytes())==x['sha256']
 for s in x['sources']:assert h(Path(s['path']).read_bytes())==s['sha256']
author=p.parent/'2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b';authorManifest=json.loads((author/'capture-manifest.json').read_text())
for x in authorManifest['images']:
 b=(author/x['path']).read_bytes();assert len(b)==x['bytes'] and h(b)==x['sha256']
 y=next(i for i in m['images'] if i['id']==x['id']);replayed.append({'id':x['id'],'byteIdenticalToAffectedViewAuthorCapture':x['sha256']==y['sha256']})
assert all(x['byteIdenticalToAffectedViewAuthorCapture'] for x in replayed)
(p/'affected-view-replay.json').write_text(json.dumps(replayed,indent=2)+'\n')
env={'cwd':str(Path.cwd()),'platform':platform.platform(),'python':platform.python_version(),'node':subprocess.check_output(['node','--version'],text=True).strip(),'browser':raw[0]['browser'],'renderer':raw[0]['metrics']['gpu'],'sourceInputPins':m['inputPins'],'harnessInputs':m['harnessInputs']}
(p/'environment.json').write_text(json.dumps(env,indent=2)+'\n')
result={'status':'evidence-complete; final verdict reserved for parent','matrixImages':len(m['images']),'freshCorrectedImages':54,'cryptographicallyVerifiedReusedControls':54,'sheets':len(load('sheet-manifest.json')),'supplementalComparisons':len(load('native-comparison-manifest.json')),'allPngsDecodedByPillow':len(pngs),'browserGalleryDecoded':gallery['count'],'completedContextOrder':[x['model'] for x in raw],'actualAllPairsTransitions':64,'rawWarmSamples':120,'captureContexts':len(m['sessions']),'measuredContexts':len(raw),'interruptedCommands':[],'commandsCompletedWithoutError':len(commands),'activeCaptureErrors':m['activeCaptureErrors'],'measuredErrors':[e for x in raw for e in x['errors']],'protectedFilesChecked':len(protected),'protectedChanges':changed,'testsLog':'tests-final.txt','testsScope':'isolated package tests, not application/research promotion build','runJsonAuthored':False,'finalAcceptanceAuthored':False,'residualVisualConcern':load('visual-review.json')['residualConcern']}
(p/'verification.json').write_text(json.dumps(result,indent=2)+'\n')
files=[{'path':str(f.relative_to(p)),'bytes':f.stat().st_size,'sha256':h(f.read_bytes())} for f in sorted(p.rglob('*')) if f.is_file() and f.name!='artifact-inventory.json' and '__pycache__' not in f.parts]
(p/'artifact-inventory.json').write_text(json.dumps({'exclusions':['artifact-inventory.json (self-reference)','__pycache__ (runtime cache)'],'fileCount':len(files),'files':files},indent=2)+'\n')
print(json.dumps(result,indent=2));print('Inventory files:',len(files))
