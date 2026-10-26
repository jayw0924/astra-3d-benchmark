import json,hashlib,subprocess,sys,difflib,datetime,time
from pathlib import Path
from html.parser import HTMLParser
p=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
started=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
cmd=[sys.executable,str(p/'verify.py')]
r=subprocess.run(cmd,capture_output=True,text=True)
(p/'verify-final.log').write_text(r.stdout+r.stderr)
assert r.returncode==0,r.stderr
before=(p/'baseline-viewerLighting.ts.txt').read_text();after=(p/'current-viewerLighting.ts.txt').read_text()
assert Path('src/lib/viewerLighting.ts').read_text()==after
assert subprocess.check_output(['git','show','ffe0a56982a0bb22c34d705b1c00f0a62d147a0f:src/lib/viewerLighting.ts'],text=True)==before
(p/'source.diff').write_text(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='pinned-baseline-viewerLighting.ts',tofile='current-viewerLighting.ts')))
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[]
 def handle_starttag(self,tag,attrs):
  self.links.extend(v for k,v in attrs if k in ['src','href'])
l=Links();l.feed((p/'index.html').read_text())
for link in l.links:assert (p/link).is_file(),link
native=list(p.glob('before-*.png'))+list(p.glob('after-*.png'));diff=list(p.glob('diff8x-*.png'));pairs=list(p.glob('pair-*.jpg'))
assert len(native)==12 and len(diff)==6 and len(pairs)==6
assets={f.name:{'bytes':f.stat().st_size,'sha256':sha(f.read_bytes())} for f in native+diff+pairs}
(p/'image-sha256.json').write_text(json.dumps(assets,indent=2)+'\n')
pr=json.loads((p/'provenance.json').read_text())
elapsed=(datetime.datetime.fromisoformat(pr['ended'].replace('Z','+00:00'))-datetime.datetime.fromisoformat(pr['started'].replace('Z','+00:00'))).total_seconds()
report={'started':started,'ended':datetime.datetime.now(datetime.timezone.utc).isoformat(),'verificationCommand':cmd,'verificationExitCode':r.returncode,'elapsedSeconds':time.monotonic()-t,'captureStarted':pr['started'],'captureEnded':pr['ended'],'captureElapsedSeconds':elapsed,'nativeImages':len(native),'diffDiagnosticPngs':len(diff),'pairDerivativeJpegs':len(pairs),'galleryRelativeLinkCount':len(l.links),'galleryRelativeLinksExist':True,'currentSourceEqualsAfterSnapshot':True,'baselineSourceEqualsGitPin':True,'historicalFilePreservation':json.loads((p/'historical-preservation.json').read_text()),'productionGitDiff':subprocess.check_output(['git','diff','--stat','--','src','tests'],text=True)}
(p/'closeout-verification.json').write_text(json.dumps(report,indent=2)+'\n')
# Additive inventory only; do not touch any historical inventory.
inv={f.name:{'bytes':f.stat().st_size,'sha256':sha(f.read_bytes())} for f in p.iterdir() if f.is_file() and f.name!='inventory.json'}
(p/'inventory.json').write_text(json.dumps(inv,indent=2)+'\n')
print(json.dumps(report,indent=2))
