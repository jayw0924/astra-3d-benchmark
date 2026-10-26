from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageStat
import json, hashlib
root=Path(__file__).parent
pairs=[]
for finish in ['Carmine','Estuary']:
    a=json.loads((root/f'before-{finish}-measurement.json').read_text())
    b=json.loads((root/f'after-{finish}-measurement.json').read_text())
    assert a['meshes']==b['meshes'], 'Model world geometry / materials / caster flags changed'
    assert a['shadow']==b['shadow'] and a['exposure']==b['exposure']
    tires=[m for m in b['meshes'] if any(t['name']=='Tiretread' for t in m['materials'])]
    assert len(tires)==4 and all(m['castShadow'] for m in tires)
    for m in tires:
        assert .00049999 <= m['min']-b['floorY'] < .002
    print(finish, 'before gaps', [m['min']-a['floorY'] for m in tires], 'after gaps',[m['min']-b['floorY'] for m in tires])
for finish,mobile in [('Carmine',False),('Estuary',False),('Carmine',True)]:
    for view in (['side'] if mobile else ['side','front','wheel']):
        prefix='-mobile' if mobile else ''
        names=[f'{p}{prefix}-{finish}-{view}.png' for p in ['before','after']]
        images=[Image.open(root/n).convert('RGB') for n in names]
        assert images[0].size==images[1].size
        for image in images:
            assert max(ImageStat.Stat(image).stddev)>15, 'Blank framebuffer'
        diff=ImageChops.difference(*images)
        assert diff.getbbox(), 'No visible change'
        w,h=images[0].size
        pair=Image.new('RGB',(w*2,h+35),'white'); draw=ImageDraw.Draw(pair)
        for i,image in enumerate(images):
            pair.paste(image,(i*w,35)); draw.text((i*w+8,10),names[i],fill='black')
        filename=f'pair{prefix}-{finish}-{view}.jpg';pair.save(root/filename,quality=94)
        pixels=list(diff.get_flattened_data());changed=sum(max(p)>0 for p in pixels)
        pairs.append({'finish':finish,'mobile':mobile,'view':view,'before':names[0],'after':names[1],'pair':filename,'dimensions':[w,h],'changedPixels':changed,'maximumChannelDelta':max(max(p) for p in pixels),'imageHashes':{n:hashlib.sha256((root/n).read_bytes()).hexdigest() for n in names}})
assert len(pairs)==7
model=Path('public/assets/models/product-estuary-safe.glb').read_bytes()
assert len(model)==9239404 and hashlib.sha256(model).hexdigest()=='01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4'
(root/'verification.json').write_text(json.dumps({'modelBytes':len(model),'modelSha256':hashlib.sha256(model).hexdigest(),'pairs':pairs,'status':'technical checks passed; visual approval separate'},indent=2))
html='<!doctype html><meta charset="utf-8"><title>Sol ground-contact review</title><style>body{background:#222;color:white;font:16px sans-serif;margin:24px}img{width:100%;height:auto}section{margin:30px 0}a{color:#9ef}</style><h1>Sol: precise receiver contact</h1><p>Left: frozen selected lighting before grounding correction. Right: identical lighting, receiver fitted to actual transformed vertices. Native app framebuffers (not DOM screenshots); 500 ms render pacing, SwiftShader, DPR 1. Fixed research cameras only. Human approval pending.</p>'
for p in pairs:
    html+=f'<section><h2>{p["finish"]} {p["view"]} {"mobile layout" if p["mobile"] else "desktop"}</h2><a href="{p["before"]}">Native before</a> | <a href="{p["after"]}">Native after</a><img src="{p["pair"]}"></section>'
(root/'index.html').write_text(html)
print('Verified',len(pairs),'paired nonblank native views; model hash unchanged')
