from pathlib import Path
import hashlib,json,subprocess,re
from PIL import Image
root=Path('/workspace'); out=root/'work/imagery-publication-finalization';out.mkdir(exist_ok=False)
def identity(p):return {'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
files=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=root).decode().split('\0')
snapshot={p:identity(root/p) for p in files if p and (root/p).is_file()}
(out/'before.json').write_text(json.dumps(snapshot,indent=2)+'\n')
(out/'git-status-before.txt').write_bytes(subprocess.check_output(['git','status','--short'],cwd=root))
inv={str(p.relative_to(root)):identity(p) for p in (root/'research/runs').rglob('*') if p.is_file()}
(out/'historical-evidence-before.json').write_text(json.dumps(inv,indent=2)+'\n')
for p in (root/'work/ai-imagery-followup').rglob('*.png'):
 im=Image.open(p)
 print(str(p.relative_to(root)),im.size,p.stat().st_size,list(im.info))
 if im.info:
  txt=json.dumps(im.info)
  flags=re.findall(r'https?://[^\s"<>]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|/(?:home|Users|workspace)/[^\s"<>]+|(?:api[_-]?key|password|access_token|Bearer)\S*',txt,re.I)
  print('METADATA SCREEN',flags[:20])
print('SNAPSHOT',len(snapshot),'historical',len(inv))
