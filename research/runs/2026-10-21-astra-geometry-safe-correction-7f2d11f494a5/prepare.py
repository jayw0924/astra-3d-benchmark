from pathlib import Path
import hashlib, json, subprocess, datetime, platform, shutil, importlib.util
run=Path(__file__).resolve().parent
root=Path('/workspace')
rel=run.relative_to(root).as_posix()
def save(name,data):
 with (run/name).open('x') as f: json.dump(data,f,indent=2);f.write('\n')
paths=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=root).decode().split('\0')
files={};excluded=[]
for name in sorted(set(filter(None,paths))):
 if name.startswith(rel+'/'): continue
 p=root/name
 if any(s in name.lower() for s in ['session.jsonl','.env','secret','credential','transcript']):excluded.append(name);continue
 if p.is_file():files[name]=hashlib.sha256(p.read_bytes()).hexdigest()
save('workspace-before.json',dict(files=files,exclusions=excluded,runDirectories=sorted(p.name for p in (root/'research/runs').iterdir() if p.is_dir()),gitStatus=subprocess.check_output(['git','status','--short'],cwd=root,text=True),capturedAt=datetime.datetime.now(datetime.timezone.utc).isoformat()))
versions={p:json.loads((root/'node_modules'/p/'package.json').read_text())['version'] for p in ['@gltf-transform/core','@gltf-transform/functions','@gltf-transform/extensions','@gltf-transform/cli','meshoptimizer','gltf-validator','@playwright/test','three']}
save('environment.json',dict(capturedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),sessionId='local-7f2d11f494a583302db2e53b0f9e4a2005993658d95139d2820942312e2131c4',model='gpt-6-astra',provider='openai-codex',identityBasis='runtime metadata; provisional',privatePersistence='unverified; authentic post-run export required',root=str(root),versions=versions,node=subprocess.check_output(['node','--version'],text=True).strip(),python=platform.python_version(),blender=shutil.which('blender'),gltfpack=shutil.which('gltfpack'),bpy=bool(importlib.util.find_spec('bpy'))))
print(json.dumps({'protectedFiles':len(files),'exclusions':excluded,'versions':versions},indent=2))
