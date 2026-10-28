"""Preserve original RGB pixels; only an explicit background-cover transform is allowed."""
import argparse
import hashlib
import json
import math
from pathlib import Path
from PIL import Image
NATIVE = (850,778)
SOURCE_SHA = 'a23adfe1d1ba992ce736f55ca6915f62f7b54d8afa96e9600a6181d8437c1c3b'

def validate(source, mask):
    if source.size != NATIVE or mask.size != NATIVE:
        raise ValueError('Source and mask must be exactly 850x778; never crop/stretch car')
    if source.mode != 'RGB' or mask.mode != 'L':
        raise ValueError('Require RGB source and grayscale L mask')

def fit_background(background, policy='strict'):
    size = background.size
    if policy not in ('strict','cover'): raise ValueError('Unknown fit policy')
    if size == NATIVE: return background.convert('RGB'), {'policy':policy,'originalSize':size,'resizedSize':size,'cropBox':[0,0,*NATIVE]}
    if policy == 'strict': raise ValueError(f'Background {size} != {NATIVE}; explicitly select --background-fit cover if approved')
    scale = max(NATIVE[0]/size[0],NATIVE[1]/size[1])
    resized = (math.ceil(size[0]*scale),math.ceil(size[1]*scale))
    left,top = ((resized[0]-NATIVE[0])//2,(resized[1]-NATIVE[1])//2)
    box = (left,top,left+850,top+778)
    return background.convert('RGB').resize(resized,Image.Resampling.LANCZOS).crop(box), {'policy':'cover','originalSize':size,'nominalUniformScale':scale,'resizedSize':resized,'effectiveScale':[resized[0]/size[0],resized[1]/size[1]],'cropBox':box,'resampling':'Pillow LANCZOS; background only; integer rounding disclosed'}

def composite(source, mask, background):
    validate(source,mask)
    if background.size != NATIVE: raise ValueError('Background must already be explicitly fitted')
    return Image.composite(source, background.convert('RGB'), mask)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('background',type=Path);p.add_argument('output',type=Path)
    p.add_argument('--background-fit',choices=['strict','cover'],default='strict')
    a=p.parse_args(); here=Path(__file__).parent
    source_path=here/'source.png';mask_path=here/'mask.png'
    sha=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
    if sha(source_path)!=SOURCE_SHA: raise ValueError('Immutable source hash mismatch')
    provenance=json.loads((here/'mask-provenance.json').read_text())
    if sha(mask_path)!=provenance['maskSha256']: raise ValueError('Mask hash mismatch')
    if a.output.exists() or a.output.with_suffix('.json').exists(): raise FileExistsError('Refuse to overwrite output or record')
    source=Image.open(source_path).convert('RGB');mask=Image.open(mask_path)
    bg, transform=fit_background(Image.open(a.background),a.background_fit)
    result=composite(source,mask,bg)
    s,o,m=source.load(),result.load(),mask.load()
    core_changed=sum(s[x,y]!=o[x,y] for y in range(778) for x in range(850) if m[x,y]==255)
    if core_changed: raise AssertionError('Protected RGB changed')
    result.save(a.output)
    record={'sourceSha256':sha(source_path),'maskSha256':sha(mask_path),'backgroundSha256':sha(a.background),'outputSha256':sha(a.output),'backgroundTransform':transform,'protectedChangedPixels':core_changed,'boundaryPolicy':'Every native raster sample with nonzero coverage is fully protected. No feathering/blending; antialiased source edge includes original backdrop spill.','technicalSelftestOnly':sha(a.background)==SOURCE_SHA}
    a.output.with_suffix('.json').write_text(json.dumps(record,indent=2)+'\n')
    print(json.dumps(record,indent=2))
if __name__=='__main__': main()
