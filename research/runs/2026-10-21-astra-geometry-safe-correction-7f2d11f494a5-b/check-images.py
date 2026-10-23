from pathlib import Path
import json,hashlib
from PIL import Image,ImageChops,ImageStat
here=Path(__file__).resolve().parent
old=Path('research/runs/2026-10-21-sol-safe-webgl-comparison')
m=json.loads((here/'capture-manifest.json').read_text())
assert m['expected']==16 and len(m['images'])==16 and len({x['id'] for x in m['images']})==16
assert not m['errors'] and m['remaining']==0
results=[]
def diff(a,b):
 d=ImageChops.difference(a.convert('RGB'),b.convert('RGB'));return {'meanAbsoluteChannelDifference':sum(ImageStat.Stat(d).mean)/3,'pixelsDifferent':sum(any(c for c in p) for p in d.getdata())}
for row in m['images']:
 p=here/row['path'];b=p.read_bytes();assert len(b)==row['bytes'] and hashlib.sha256(b).hexdigest()==row['sha256']
 im=Image.open(p);assert im.size==(600,400);assert row['changedPixels']>=200 and row['counts']['calls']>0
 assert row['repeatReadbackIdentical'] and len(row['assignments'])==25 and all(x['verified'] for x in row['assignments'])
 assert row['camera']==json.loads((old/'control-spec.json').read_text())['cameras'][row['target']]
 if row['model']=='control':
  previous=old/row['path'];results.append({'id':row['id'],'controlExactOldPNG':b==previous.read_bytes(),'pixelDifference':diff(im,Image.open(previous))})
 else:
  name=row['id'].replace('safe--','control--')+'.png';control=Image.open(here/'rendered'/name)
  prior=Image.open(old/row['path']);newDiff=diff(control,im);priorDiff=diff(control,prior)
  results.append({'id':row['id'],'correctedVsControl':newDiff,'rejectedVsControl':priorDiff})
report={'expected':16,'verified':16,'nonblank':True,'cameraSpecExact':(here/'control-spec.json').read_bytes()==(old/'control-spec.json').read_bytes(),'errors':m['errors'],'comparisons':results,'nativeVisualInspection':'unverified: browser tool unavailable; statistics do not establish perceptual repair','scope':'affected-view subset only; not full acceptance'}
with (here/'image-verification.json').open('x') as f:json.dump(report,f,indent=2);f.write('\n')
print(json.dumps(report,indent=2))
