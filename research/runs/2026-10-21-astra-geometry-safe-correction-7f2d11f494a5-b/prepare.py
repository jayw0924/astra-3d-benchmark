import pathlib,subprocess,json,hashlib,datetime,platform,shutil,importlib.util
root=pathlib.Path.cwd();here=pathlib.Path(__file__).resolve().parent;rel=str(here.relative_to(root))
def save(n,x):
 with (here/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
files=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z']).decode().split('\0')
excluded=[];hashes={}
for n in sorted(set(files)):
 if not n or n.startswith(rel+'/'):continue
 if any(s in n.lower() for s in ['session.jsonl','.env','secret','credential','transcript']):excluded.append(n);continue
 p=root/n
 if p.is_file():hashes[n]=hashlib.sha256(p.read_bytes()).hexdigest()
save('workspace-before.json',{'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'hashes':hashes,'excluded':excluded,'runs':sorted(p.name for p in (root/'research/runs').iterdir() if p.is_dir()),'gitStatus':subprocess.check_output(['git','status','--short']).decode()})
versions={p:json.loads((root/'node_modules'/p/'package.json').read_text())['version'] for p in ['@gltf-transform/core','@gltf-transform/extensions','@gltf-transform/functions','@gltf-transform/cli','meshoptimizer','gltf-validator','@playwright/test','three']}
save('environment.json',{'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sessionId':'local-7f2d11f494a583302db2e53b0f9e4a2005993658d95139d2820942312e2131c4','model':'gpt-6-astra','provider':'openai-codex','identityBasis':'runtime metadata; provisional','privatePersistence':'unverified; authentic post-run export required','versions':versions,'node':subprocess.check_output(['node','--version']).decode().strip(),'python':platform.python_version(),'root':str(root),'blender':shutil.which('blender'),'gltfpack':shutil.which('gltfpack'),'bpy':importlib.util.find_spec('bpy') is not None})
print('Protected file hashes:',len(hashes),'exclusions:',len(excluded));print(versions)
