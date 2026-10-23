from pathlib import Path
import hashlib,json,datetime,time,sys,os
p=Path(__file__).resolve().parent;start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();h=lambda b:hashlib.sha256(b).hexdigest()
assert not (p/'artifact-inventory.json').exists(), 'Final inventory already exists; do not overwrite evidence'
assert json.loads((p/'verification.json').read_text())['protectedChanges']==[]
files=[]
for f in sorted(p.rglob('*')):
 if f.is_file() and f.name not in ['artifact-inventory.json','inventory-execution.json']:
  b=f.read_bytes();files.append({'path':str(f.relative_to(p)),'bytes':len(b),'sha256':h(b)})
rec={'argv':[sys.executable,*sys.argv],'cwd':str(Path.cwd()),'startedAt':start,'hashingFinishedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedHashingSeconds':time.monotonic()-t,'operation':'Finalize retained-file inventory; no external writes; inventory excludes itself only','expectedExitCodeOnSuccessfulWrite':0}
(p/'inventory-execution.json').write_text(json.dumps(rec,indent=2)+'\n');b=(p/'inventory-execution.json').read_bytes();files.append({'path':'inventory-execution.json','bytes':len(b),'sha256':h(b)})
result={'fileCount':len(files),'totalBytesExcludingSelf':sum(x['bytes'] for x in files),'exclusions':['artifact-inventory.json (self-reference only)'],'files':sorted(files,key=lambda x:x['path'])}
(p/'artifact-inventory.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='files'},indent=2));print('Inventory written successfully; no files will be changed after this step.')
