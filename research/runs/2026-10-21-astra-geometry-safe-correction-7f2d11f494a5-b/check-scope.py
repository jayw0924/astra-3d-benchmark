from pathlib import Path
import json,subprocess,hashlib,datetime
root=Path.cwd();here=Path(__file__).resolve().parent;rel=str(here.relative_to(root))
before=json.loads((here/'workspace-before.json').read_text());changed=[]
for n,h in before['hashes'].items():
 p=root/n
 if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=h:changed.append(n)
now=set(subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z']).decode().split('\0'))
new=sorted(n for n in now if n and n not in before['hashes'] and n not in before['excluded'] and not n.startswith(rel+'/'))
report={'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'protectedFiles':len(before['hashes']),'changed':changed,'newOutsideRun':new,'exclusions':before['excluded'],'ignoredFiles':'Ignored caches and private transcripts are not covered by this git-index/nonignored-file snapshot','passed':not changed and not new,'candidateSha256':hashlib.sha256((here/'candidate.glb').read_bytes()).hexdigest(),'rejectedCandidateSha256':hashlib.sha256((root/'research/runs/2026-10-21-astra-geometry-safe-d8fc14b866ab/candidate.glb').read_bytes()).hexdigest()}
with (here/'scope-verification.json').open('x') as f:json.dump(report,f,indent=2);f.write('\n')
print(json.dumps(report,indent=2));assert report['passed']
print('Private export ignore check:')
p=subprocess.run(['git','check-ignore',rel+'/session.jsonl'],capture_output=True,text=True);print(p.stdout);assert p.returncode==0
