import datetime,hashlib,json,struct,subprocess
from pathlib import Path
from PIL import Image
here=Path(__file__).resolve().parent;run=here.parent;root=Path.cwd()
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
hash=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda n:json.loads((run/n).read_text())
def save(n,data):
 with (here/n).open('x') as f:json.dump(data,f,indent=2);f.write('\n')
# Capture every preexisting artifact without reading private session content.
artifacts={}
for p in sorted(run.rglob('*')):
 if not p.is_file() or p.is_relative_to(here):continue
 st=p.stat();name=str(p.relative_to(run));private=any(k in p.name.lower() for k in ['session.jsonl','secret','credential','.env','token','private'])
 artifacts[name]={'bytes':st.st_size,**({'handling':'metadata-only','mtime_ns':st.st_mtime_ns,'mode':st.st_mode} if private else {'sha256':hash(p)})}
save('existing-artifacts.json',{'capturedAt':now(),'files':artifacts})
base=read('workspace-before.json');changed=[]
for name,rec in base['files'].items():
 p=root/name
 if not p.is_file():changed.append({'path':name,'reason':'missing'});continue
 if 'sha256' in rec:
  if hash(p)!=rec['sha256']:changed.append({'path':name,'reason':'hash'})
 else:
  st=p.stat()
  if any(rec[k]!=v for k,v in {'bytes':st.st_size,'mode':st.st_mode,'mtime_ns':st.st_mtime_ns}.items()):changed.append({'path':name,'reason':'metadata'})
files=set(filter(None,subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z']).decode().split('\0')))
new=sorted(n for n in files if n not in base['files'] and not (root/n).is_relative_to(run))
save('scope.json',{'capturedAt':now(),'protectedFiles':len(base['files']),'changedSinceOriginalBaseline':changed,'newOutOfScope':new,'coverage':base['coverage']})
assert not changed and not new,(changed,new)
assert (run/'handoff-input.md').read_bytes()==(root/'research/ASTRA_MOBILE_LOD_HANDOFF.md').read_bytes()
assert hash(run/'candidate.glb')==hash(run/'repeat.glb')=='3d652b91d18e13910a03fb595b0ce9386c424ab39eb72187f17a6de7eaeb3c5b'
assert (run/'candidate.glb').stat().st_size==9195792
assert hash(root/'public/assets/models/product-estuary.glb')=='bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f'
assert hash(root/'public/assets/models/product-estuary-safe.glb')=='01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4'
manifest=read('capture-manifest.json');assert len(manifest['images'])==108 and not manifest['errors']
assert {i['id'] for i in manifest['images']}=={i['id'] for i in manifest['matrix']}
control=0
for im in manifest['images']:
 p=run/im['path'];assert hash(p)==im['sha256'] and p.stat().st_size==im['bytes'];assert Image.open(p).size==(600,400)
 assert im['changedPixels']>=200 and im['counts']['calls']>0
 assert len(im['assignments'])==25 and all(x['verified'] for x in im['assignments'])
 if im['model']=='control':
  assert p.read_bytes()==(root/'research/runs/2026-10-22-sol-safe-final-comparison'/im['path']).read_bytes();control+=1
assert control==54
sheets=read('sheet-manifest.json')['sheets'];assert len(sheets)==9
for im in sheets:assert hash(run/im['path'])==im['sha256']
for name in ['page.js','page.html','control-spec.json']:assert (run/name).read_bytes()==(root/'research/runs/2026-10-22-sol-safe-final-comparison'/name).read_bytes()
assert read('verification-final.json')['allPassed']
for name in ['candidate-validator.json','control-validator.json']:
 v=read(name);assert v['issues']['numErrors']==0 and v['issues']['numWarnings']==28
record=read('run.json');assert set(record['outputPaths'])=={p['path'] for p in record['provenance']['outputs']}
for p in record['outputPaths']:assert (root/p).is_file(),p
logs=[json.loads(l) for l in (run/'commands.jsonl').read_text().splitlines()]
summary=[{k:j[k] for k in ['argv','cwd','startedAt','endedAt','exitCode']} for j in logs]
assert any(j['argv'][-1].endswith('/package.mjs') and j['exitCode']==0 for j in logs)
save('completed-command-index.json',summary)
processes=[]
for p in Path('/proc').iterdir():
 if not p.name.isdigit():continue
 try:
  args=(p/'cmdline').read_bytes().split(b'\0');comm=(p/'comm').read_text().strip()
  if comm in ['node','chrome','chromium'] and (comm in ['chrome','chromium'] or any(b'capture.mjs' in a for a in args)):
   processes.append({'pid':p.name,'comm':comm,'relatedRun':any(b'bd8abb4a578f' in a for a in args)})
 except (FileNotFoundError,PermissionError,ProcessLookupError):pass
save('process-check.json',{'capturedAt':now(),'browserOrCaptureProcesses':processes,'action':'read-only; no processes killed'})
partial=read('raw/measure-0-control.json')
result={'checkedAt':now(),'candidateUnchanged':True,'repeatExactBytes':True,'protectedWorkspaceUnchanged':True,'existingArtifacts':len(artifacts),'nativeFramesVerified':108,'controlReplaysVerified':control,'sheetsVerified':len(sheets),'historicalCommandRecords':len(logs),'historicalFinalizationCompleted':True,'partialMeasurement':{'controlPresent':True,'candidatePresent':(run/'raw/measure-1-mobile.json').exists(),'controlTransitionCount':len(partial.get('metrics',{}).get('transitions',[]))},'sessionExportPresent':(run/'session.jsonl').exists(),'missingExecutableHandoffSteps':[],'remainingGates':['Authentic private session export/attribution','Independent Sol visual and acceptance review'],'optionalUnavailable':['Candidate all-pairs browser transition measurement','Candidate timing/performance; not required for this initial delivery-metric package'],'correctionRoundsUnchanged':2,'geometryCorrections':0,'resumeAuthoringExecutions':0}
save('reconciliation.json',result)
print(json.dumps(result,indent=2))
