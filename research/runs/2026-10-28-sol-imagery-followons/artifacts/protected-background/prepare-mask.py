"""Derive masks/inspection overlay from the retained actual native coverage render."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageChops
p=Path(__file__).parent
s=Image.open(p/'source.png').convert('RGB')
r=Image.open(p/'source-rerender.png').convert('RGB')
c=Image.open(p/'coverage-render.png').convert('RGB')
assert s.size==r.size==c.size==(850,778)
assert c.getchannel(0).tobytes()==c.getchannel(1).tobytes()==c.getchannel(2).tobytes()
cov=c.getchannel(0)
mask=cov.point(lambda x:255 if x else 0)
mask.save(p/'mask.png')
cov.point(lambda x:255 if x==255 else 0).save(p/'core-mask.png')
cov.point(lambda x:255 if 0<x<255 else 0).save(p/'boundary-mask.png')
diffs=list(ImageChops.difference(s,r).getdata());cm=list(cov.getdata())
sha=lambda name:hashlib.sha256((p/name).read_bytes()).hexdigest()
stats={'sourceRerenderChangedPixels':sum(any(v) for v in diffs),'sourceRerenderMaxChannelDelta':max(max(v) for v in diffs),'sourceRerenderChangedCoveredPixels':sum(any(v) for v,a in zip(diffs,cm) if a),'coveredPixels':sum(a>0 for a in cm),'corePixels':sum(a==255 for a in cm),'rasterBoundaryPixels':sum(0<a<255 for a in cm),'maskBounds':mask.getbbox(),'maskSha256':sha('mask.png'),'coverageSha256':sha('coverage-render.png'),'sourceSha256':sha('source.png'),'policy':'All nonzero native MSAA coverage fully protected including glass/transmission and mirrors; floor/contact shadow excluded; no boundary blend.'}
(p/'mask-provenance.json').write_text(json.dumps(stats,indent=2)+'\n')
overlay=Image.blend(s,Image.new('RGB',s.size,(0,255,80)),.35)
Image.composite(overlay,s,mask).save(p/'inspect-overlay.png')
print(json.dumps(stats,indent=2))
