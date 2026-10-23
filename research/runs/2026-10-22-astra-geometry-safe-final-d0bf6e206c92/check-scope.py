import pathlib,hashlib,json,subprocess,datetime
root=pathlib.Path.cwd();here=pathlib.Path(__file__).resolve().parent
before=json.loads((here/'workspace-before.json').read_text())
changed=[]
for name,h in before['files'].items():
    p=root/name
    if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=h:changed.append(name)
argv=['git','ls-files','--cached','--others','--exclude-standard','-z'];start=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(argv,capture_output=True,text=True)
with (here/'commands.jsonl').open('a') as f:f.write(json.dumps(dict(argv=argv,cwd=str(root),startedAt=start,endedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),exitStatus=p.returncode,stdout=p.stdout,stderr=p.stderr))+'\n')
assert p.returncode==0
new=[n for n in p.stdout.split('\0') if n and n not in before['files'] and n not in before['exclusions'] and not (root/n).is_relative_to(here)]
result=dict(checked=len(before['files']),changed=changed,newOutOfScope=new,exclusions=before['exclusions'],coverage=before['coverage'],passed=not changed and not new,capturedAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
with (here/'scope-verification.json').open('x') as f:json.dump(result,f,indent=2);f.write('\n')
print(json.dumps(result,indent=2));assert result['passed']
