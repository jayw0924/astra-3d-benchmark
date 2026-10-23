import pathlib, json, hashlib, subprocess, datetime, platform, shutil, importlib.util
root=pathlib.Path.cwd()
here=pathlib.Path(__file__).resolve().parent
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def save(name,value):
    with (here/name).open('x') as f: json.dump(value,f,indent=2); f.write('\n')
def command(argv):
    start=now(); p=subprocess.run(argv,capture_output=True,text=True)
    with (here/'commands.jsonl').open('a') as f: f.write(json.dumps(dict(argv=argv,cwd=str(root),startedAt=start,endedAt=now(),exitStatus=p.returncode,stdout=p.stdout,stderr=p.stderr))+'\n')
    assert p.returncode==0,p.stderr
    return p.stdout
files=command(['git','ls-files','--cached','--others','--exclude-standard','-z']).split('\0')
records={}; excluded=[]
for name in files:
    p=root/name
    if not name or p.is_relative_to(here): continue
    if p.name.startswith('.env') or p.name=='session.jsonl' or any(s in p.name.lower() for s in ['secret','credential','private-key']): excluded.append(name); continue
    if p.is_file(): records[name]=hashlib.sha256(p.read_bytes()).hexdigest()
save('workspace-before.json',dict(capturedAt=now(),files=records,exclusions=excluded,coverage='Tracked and nonignored untracked files; ignored caches and private transcripts excluded',gitStatus=command(['git','status','--short']),branch=command(['git','branch','--show-current'])))
source=root/'public/assets/models/product-estuary.glb'; b=source.read_bytes()
assert len(b)==10191496 and hashlib.sha256(b).hexdigest()=='bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f'
versions={p:json.loads((root/'node_modules'/p/'package.json').read_text())['version'] for p in ['@gltf-transform/core','@gltf-transform/extensions','@gltf-transform/functions','@gltf-transform/cli','meshoptimizer','gltf-validator','@playwright/test','three']}
for p in ['core','extensions','functions','cli']: assert versions['@gltf-transform/'+p]=='4.5.1'
assert versions['meshoptimizer']=='1.2.0'
save('environment.json',dict(capturedAt=now(),projectRoot=str(root),hostProjectRoot='/home/jay/projects/external/configurator-demo',sessionId='local-d0bf6e206c9298befb665382c599a950d599a720fb7d55c9038e54b7a23938b9',model='gpt-6-astra',provider='openai-codex',persistence='unverified; runtime metadata only; authentic post-run export required',correctionBudget='FINAL third round, including initial verifier-default correction; exhausted after this package',source=dict(path=str(source.relative_to(root)),bytes=len(b),sha256=hashlib.sha256(b).hexdigest()),versions=versions,node=command(['node','--version']).strip(),npm=command(['npm','--version']).strip(),python=platform.python_version(),platform=platform.platform(),blender=shutil.which('blender'),gltfpack=shutil.which('gltfpack'),bpyAvailable=importlib.util.find_spec('bpy') is not None))
with (here/'prompt.md').open('x') as f: f.write('Execute research/ASTRA_SAFE_FINAL_CORRECTION.md exactly and stop for Sol review.\n')
with (here/'handoff-input.md').open('x') as f: f.write((root/'research/ASTRA_SAFE_FINAL_CORRECTION.md').read_text())
print('Protected baseline captured:',len(records),'files; exclusions',len(excluded))
