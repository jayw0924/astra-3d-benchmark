"""Independent byte/pixel comparison; never rewrite historical evidence."""
from pathlib import Path
import json,hashlib
from PIL import Image,ImageChops
here=Path(__file__).resolve().parent
prior=here.parent/'2026-10-23-sol-viewer-lighting'
hash=lambda b:hashlib.sha256(b).hexdigest()
m=json.loads((here/'capture-manifest.json').read_text());old={x['id']:x for x in json.loads((prior/'capture-manifest.json').read_text())['images']}
rows=[]
for im in m['images']:
 if im['rig']!='grounded-studio':continue
 a=Image.open(here/im['path']).convert('RGB');b=Image.open(prior/old[im['id']]['path']).convert('RGB')
 diff=ImageChops.difference(a,b);pixels=list(diff.get_flattened_data());changed=[p for p in pixels if p!=(0,0,0)]
 rows.append({'id':im['id'],'byteIdentical':im['sha256']==old[im['id']]['sha256'],'differingPixels':len(changed),'maxChannelDelta':max((max(p) for p in changed),default=0),'meanAbsoluteChannelDeltaAllPixels':sum(sum(p) for p in changed)/(600*400*3),'differenceBounds':diff.getbbox()})
checks=[]
for line in (prior/'SHA256SUMS').read_text().splitlines():
 expected,name=line.split('  ',1);assert hash((prior/name).read_bytes())==expected,name;checks.append(name)
result={'scope':'Historical package retained byte-for-byte. Re-render parity is measured, not assumed or repaired. Differences may depend on context/material/program history; cause unisolated. No pixel retouching.','historicalFilesVerified':len(checks),'baselineFramesCompared':len(rows),'exactByteFrames':sum(x['byteIdentical'] for x in rows),'rows':rows}
(here/'baseline-parity.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
