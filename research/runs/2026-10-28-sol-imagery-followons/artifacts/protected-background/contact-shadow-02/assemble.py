"""Run once; all outputs exclusive and native. Never transforms source car."""
from pathlib import Path
import sys,json,hashlib
from PIL import Image,ImageDraw
from shadow import blend_shadow,protected_composite
D=Path(__file__).parent; P=D.parent
sys.path.insert(0,str(P))
from composite import fit_background,SOURCE_SHA
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(im,name):
    with (D/name).open('xb') as f: im.save(f,format='PNG')
assert sha(P/'source.png')==SOURCE_SHA
assert sha(P/'composite-01.png')=='9230f828ad8d6b824defe1b486aba3739ce8849a883b412343ac207ac4613c4c'
assert sha(P/'mask.png')==json.loads((P/'mask-provenance.json').read_text())['maskSha256']
src=Image.open(P/'source.png').convert('RGB'); mask=Image.open(P/'mask.png'); layer=Image.open(D/'shadow-layer.png').convert('RGBA')
plate=P/'received-background-01/original-qwen-background.png'
bg,transform=fit_background(Image.open(plate),'cover')
assert src.size==mask.size==layer.size==bg.size==(850,778)
s=list(src.get_flattened_data());m=list(mask.get_flattened_data());l=list(layer.get_flattened_data());a=[p[3] for p in l]
assert set(m)=={0,255};assert m.count(255)==107603
assert all(p[:3]==(0,0,0) for p in l);assert 0<max(a)<255
out=protected_composite(src,mask,bg,layer);o=list(out.get_flattened_data())
changed=[x!=y for x,y in zip(o,s)];assert not any(c for c,v in zip(changed,m) if v)
old=Image.open(P/'composite-01.png').convert('RGB'); delta01=[x!=y for x,y in zip(o,old.get_flattened_data())]
assert not any(c for c,v in zip(delta01,m) if v);assert not any(c for c,v in zip(delta01,a) if not v)
save(out,'composite-02.png');save(bg,'fitted-background.png')
effective=Image.new('RGBA',src.size);effective.putdata([(0,0,0,0 if mv else av) for mv,av in zip(m,a)]);save(effective,'shadow-layer-effective.png')
boundary=list(Image.open(P/'boundary-mask.png').get_flattened_data());core=list(Image.open(P/'core-mask.png').get_flattened_data())
exposed=[av>0 and not mv for av,mv in zip(a,m)]
overlay=out.copy();overlay.putdata([(0,255,0) if bv else tuple(round(x*.45+y*.55) for x,y in zip(rgb,(0,190,255))) if ex else rgb for rgb,bv,ex in zip(o,boundary,exposed)]);save(overlay,'shadow-overlay.png')
# Test actual alpha against observed old-studio shadow, not a fabricated floor reference.
uniform=Image.new('RGB',src.size,src.getpixel((0,0)))
reconstructed=blend_shadow(uniform,layer)
residual=[max(abs(x-y) for x,y in zip(p,q)) for p,q in zip(reconstructed.get_flattened_data(),s)]
rerender=Image.open(D/'source-diagnostic.png').convert('RGB');rgbdiff=[max(abs(x-y) for x,y in zip(p,q)) for p,q in zip(rerender.get_flattened_data(),s)]
record={
 'nativeDimensions':[850,778], 'sourceSha256':sha(P/'source.png'),'composite01Sha256':sha(P/'composite-01.png'),'plateSha256':sha(plate),'maskSha256':sha(P/'mask.png'),
 'backgroundTransform':transform,'sourceTransforms':'None: source RGB copied at identical integer coordinates, no filtering, feathering or resizing',
 'formula':'A = native exported ShadowMaterial alpha/255. T=round((1-A)*B) in stored sRGB byte space via Pillow alpha_composite (black RGB). C=M*S+(1-M)*T for binary M. Effective layer alpha=A*(1-M).',
 'protectedPixels':m.count(255),'protectedChangedPixels':sum(c for c,v in zip(changed,m) if v),'corePixels':core.count(255),'coreChangedPixels':sum(c for c,v in zip(changed,core) if v),'boundaryPixels':boundary.count(255),'boundaryChangedPixels':sum(c for c,v in zip(changed,boundary) if v),
 'rawShadowNonzeroPixels':sum(v>0 for v in a),'rawAlphaMax':max(a),'exposedShadowNonzeroPixels':sum(exposed),'changedVsComposite01':sum(delta01),'changedVs01OutsideShadowSupport':sum(c for c,v in zip(delta01,a) if not v),
 'oldStudioAlphaReconstruction':{'reference':'Observed source top-left uniform background RGB, NOT transferred floor RGB','backgroundRGB':src.getpixel((0,0)),'outsideProtectedChangedPixels':sum(v>0 for v,mv in zip(residual,m) if not mv),'outsideProtectedMaxChannelDelta':max(v for v,mv in zip(residual,m) if not mv),'outsideProtectedAboveOneChannelDeltaPixels':sum(v>1 for v,mv in zip(residual,m) if not mv)},
 'rgbRerenderResidual':{'changedPixels':sum(v>0 for v in rgbdiff),'maxChannelDelta':max(rgbdiff),'outsideProtectedChangedPixels':sum(v>0 for v,mv in zip(rgbdiff,m) if not mv)},
 'outputs':{name:{'sha256':sha(D/name),'dimensions':list(Image.open(D/name).size)} for name in ['composite-02.png','shadow-layer.png','shadow-layer-effective.png','shadow-overlay.png','fitted-background.png','source-diagnostic.png']}
}
(D/'verification.json').open('x').write(json.dumps(record,indent=2)+'\n')
review=Image.new('RGB',(850*3,810),'#222222'); draw=ImageDraw.Draw(review)
for i,(name,im) in enumerate([('SOURCE: original studio',src),('01: no contact shadow',old),('02: actual source shadow alpha',out)]):
 review.paste(im,(850*i,32)); draw.text((850*i+12,10),name,fill='white')
save(review,'comparison-source-01-02.png')
print(json.dumps(record,indent=2))
