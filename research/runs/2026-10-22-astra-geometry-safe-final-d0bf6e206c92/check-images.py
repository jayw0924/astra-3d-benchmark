import pathlib,json,hashlib
from PIL import Image,ImageChops,ImageStat
here=pathlib.Path(__file__).resolve().parent
accepted=here.parent/'2026-10-21-sol-safe-correction-comparison'
hash=lambda b:hashlib.sha256(b).hexdigest()
manifest=json.loads((here/'capture-manifest.json').read_text())
assert len(manifest['matrix'])==16 and len(manifest['images'])==16
assert {i['id'] for i in manifest['images']}=={i['id'] for i in manifest['matrix']}
assert not manifest['errors']
settings={k:manifest['settings'][k] for k in ['width','height','dpr']};assert settings==dict(width=600,height=400,dpr=1)
for n in ['page.js','page.html','control-spec.json']:assert (here/n).read_bytes()==(accepted/n).read_bytes(),n
spec=json.loads((here/'control-spec.json').read_text());rows=[]
for im in manifest['images']:
    p=here/im['path'];b=p.read_bytes();assert hash(b)==im['sha256'] and len(b)==im['bytes']
    image=Image.open(p);image.load();assert image.size==(600,400)
    assert im['changedPixels']>200 and im['counts']['calls']>0
    assert im['camera']==spec['cameras'][im['target']]
    assert len(im['assignments'])==25 and all(a['verified'] for a in im['assignments'])
    row=dict(id=im['id'],sha256=hash(b),nonblank=True)
    if im['model']=='control':
        row['acceptedControlExactBytes']=b==(accepted/im['path']).read_bytes();assert row['acceptedControlExactBytes']
    else:
        c=Image.open(here/im['path'].replace('final--','control--')).convert('RGB')
        delta=ImageChops.difference(c,image.convert('RGB'))
        row['meanAbsoluteRGB']=sum(ImageStat.Stat(delta).mean)/3;row['pixelIdentical']=delta.getbbox() is None
    rows.append(row)
for name in manifest['sessions']:
    raw=json.loads((here/name).read_text());assert not raw['errors'];assert raw['network'] and all(r['status']==200 for r in raw['network'])
result=dict(images=len(rows),freshControlsExact=sum(r.get('acceptedControlExactBytes',False) for r in rows),renderHarnessPageAndCameraExact=True,rows=rows,errors=[],limitation='Targeted evidence only; native visual review is separate. Glass-edge wireframe selects windshield/gasket, not pillar. Wipers wireframe isolates wipers, not hood.')
with (here/'image-verification.json').open('x') as f:json.dump(result,f,indent=2)
print(json.dumps(result,indent=2))
