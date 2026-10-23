import datetime,hashlib,json,subprocess,sys,shutil,importlib.util,struct
from pathlib import Path
run=Path(__file__).parent; root=Path.cwd()
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
hash=lambda b:hashlib.sha256(b).hexdigest()
def save(n,x):
 with (run/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
files=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z']).decode().split('\0')
records={}
for name in sorted(set(filter(None,files))):
 p=Path(name)
 if p.is_relative_to(run) or not p.is_file():continue
 secret=any(s in p.name.lower() for s in ['.env','secret','credential','session.jsonl','private','token'])
 st=p.stat();records[name]={'bytes':st.st_size,'mode':st.st_mode,'mtime_ns':st.st_mtime_ns,**({'handling':'metadata-only'} if secret else {'sha256':hash(p.read_bytes())})}
save('workspace-before.json',{'capturedAt':now(),'gitStatus':subprocess.check_output(['git','status','--short']).decode(),'files':records,'coverage':'tracked and nonignored untracked; secrets/transcripts metadata only; ignored files excluded'})
src=Path('public/assets/models/product-estuary.glb').read_bytes();assert len(src)==10191496 and hash(src)=='bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f'
j=json.loads(src[20:20+struct.unpack_from('<I',src,12)[0]])
save('source-inventory.json',{'meshes':[{'mesh':i,'nodes':[n.get('name','') for n in j['nodes'] if n.get('mesh')==i],'triangles':sum(j['accessors'][p['indices']]['count']//3 for p in m['primitives'])} for i,m in enumerate(j['meshes'])],'embeddedImageBytes':sum(j['bufferViews'][im['bufferView']]['byteLength'] for im in j['images'])})
versions={n:json.loads(Path('node_modules',n,'package.json').read_text())['version'] for n in ['@gltf-transform/core','@gltf-transform/extensions','@gltf-transform/functions','@gltf-transform/cli','meshoptimizer','gltf-validator','@playwright/test','three']}
assert all(versions[n]=='4.5.1' for n in versions if n.startswith('@gltf-transform/'));assert versions['meshoptimizer']=='1.2.0'
save('environment.json',{'startedAt':now(),'root':str(root),'sessionId':'local-bd8abb4a578f6f844c88718fb0c080ca3cd56d1393036b77f6c42bd7e12c85ac','model':'gpt-6-astra','provider':'openai-codex','identityBasis':'runtime metadata; private persistence UNVERIFIED; no actual previous Sol work or switch notice this session','cost':None,'versions':versions,'node':subprocess.check_output(['node','--version']).decode().strip(),'python':sys.version,'blender':shutil.which('blender'),'gltfpack':shutil.which('gltfpack'),'bpy':importlib.util.find_spec('bpy') is not None,'source':{'path':'public/assets/models/product-estuary.glb','bytes':len(src),'sha256':hash(src)},'initialDiscovery':'Tool transcript contains actual preliminary reads and file edits; timestamps not reconstructed'})
with (run/'handoff-input.md').open('x') as f:f.write(Path('research/ASTRA_MOBILE_LOD_HANDOFF.md').read_text())
print('Baseline, immutable source, environment recorded',len(records))
