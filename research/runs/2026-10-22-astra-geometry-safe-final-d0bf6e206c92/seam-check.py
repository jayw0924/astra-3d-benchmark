import sys,json,pathlib
from PIL import Image,ImageChops,ImageStat
here=pathlib.Path(__file__).resolve().parent
accepted=here.parent/'2026-10-21-sol-safe-correction-comparison'/'rendered'
phase=sys.argv[1]
assert phase in ['prior','final']
rows=[]
for finish in ['estuary','carmine']:
    control=Image.open(accepted/f'control--glass-edge--{finish}--shaded.png').convert('RGB')
    candidate=Image.open((accepted if phase=='prior' else here/'rendered')/f'{"safe" if phase=="prior" else "final"}--glass-edge--{finish}--shaded.png').convert('RGB')
    box=(418,323,424,340)
    delta=ImageChops.difference(control.crop(box),candidate.crop(box))
    rows.append(dict(finish=finish,region=list(box),meanAbsoluteChannelDifference=ImageStat.Stat(delta).mean,maxChannelDifference=max(v[1] for v in delta.getextrema()),exact=delta.getbbox() is None))
result=dict(phase=phase,rows=rows,allExact=all(r['exact'] for r in rows),limitation='Exact ROI diagnostic is red-capable but not full visual acceptance')
with (here/f'seam-check-{phase}.json').open('x') as f:json.dump(result,f,indent=2)
print(json.dumps(result,indent=2))
sys.exit(0 if result['allExact'] else 1)
