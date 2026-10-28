"""Read-only independent verification against archived native originals."""
from pathlib import Path
from PIL import Image,ImageChops
import json,hashlib
base=Path(__file__).resolve().parent
def load(p,mode):return Image.open(base/p).convert(mode)
def digest(p):return hashlib.sha256((base/p).read_bytes()).hexdigest()
s=load('artifacts/protected-background/source.png','RGB')
a=load('artifacts/protected-background/composite-01.png','RGB')
b=load('artifacts/protected-background/contact-shadow-02/composite-02.png','RGB')
m=load('artifacts/protected-background/mask.png','L')
core=load('artifacts/protected-background/core-mask.png','L')
edge=load('artifacts/protected-background/boundary-mask.png','L')
alpha=load('artifacts/protected-background/contact-shadow-02/shadow-layer-effective.png','RGBA').getchannel('A')
assert s.size==a.size==b.size==m.size==core.size==edge.size==alpha.size==(850,778)
assert set(m.get_flattened_data())=={0,255}
changed=[x!=y for x,y in zip(a.get_flattened_data(),b.get_flattened_data())]
protected={'protectedPixels':sum(x>0 for x in m.get_flattened_data()),'corePixels':sum(x>0 for x in core.get_flattened_data()),'boundaryPixels':sum(x>0 for x in edge.get_flattened_data()),'changedProtectedPixels':sum(x!=y and z>0 for x,y,z in zip(s.get_flattened_data(),b.get_flattened_data(),m.get_flattened_data())),'changedVs01':sum(changed),'changedOutsideSupport':sum(c and v==0 for c,v in zip(changed,alpha.get_flattened_data()))}
x=Image.open(base/'inputs/Qwen_image_2.1_00001.png');y=Image.open(base/'artifacts/repeatability-original-seed/repeat-original-seed.png')
assert x.size==y.size==(864,768)
xrgb=x.convert('RGB');yrgb=y.convert('RGB');diff=ImageChops.difference(xrgb,yrgb)
repeat={'changedRGBPixels':sum(p!=(0,0,0) for p in diff.get_flattened_data()),'maxChannelDelta':max(v for p in diff.get_flattened_data() for v in p),'meanAbsoluteChannelDifference':sum(v for p in diff.get_flattened_data() for v in p)/(x.width*x.height*3),'differenceBBox':diff.getbbox(),'decodedRGBAIdentical':x.convert('RGBA').tobytes()==y.convert('RGBA').tobytes(),'executionGraphIdentical':json.loads(x.info['prompt'])==json.loads(y.info['prompt']),'editorGraphIdentical':json.loads(x.info['workflow'])==json.loads(y.info['workflow']),'fileBytesIdentical':digest('inputs/Qwen_image_2.1_00001.png')==digest('artifacts/repeatability-original-seed/repeat-original-seed.png'),'freshSamplingProven':False,'caveat':'Without executed/cached-node job history, fresh sampling versus Comfy cache reuse is unknown.'}
for folder,file in [('qwen-location','original-output.png'),('flux-kontext-pro','original-output.png'),('repeatability-original-seed','repeat-original-seed.png'),('protected-background/received-background-01','original-qwen-background.png')]:
 im=Image.open(base/'artifacts'/folder/file)
 for key in ['prompt','workflow']:
  assert json.loads(im.info[key])==json.loads((base/'artifacts'/folder/(key+'.json')).read_text())
print(json.dumps({'repeat':repeat,'protected':protected},indent=2))
