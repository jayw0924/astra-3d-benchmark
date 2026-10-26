"""One-time additive baseline inventory; never rerun in a populated package."""
from pathlib import Path
import datetime, hashlib, json, subprocess
ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).parent
assert not (OUT / 'before.json').exists()
def record(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest()}
files = sorted(p for base in ['research/runs', 'public'] for p in (ROOT / base).rglob('*') if p.is_file() and OUT not in p.parents)
files += [ROOT / p for p in ['research/FROZEN_LIGHTING_CHECKPOINT.md', 'src/lib/viewerLighting.ts', 'src/lib/viewerLighting.test.ts', 'tests/e2e/lighting.spec.ts']]
data = {'recordedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(), 'files': [record(p) for p in files]}
(OUT / 'before.json').write_text(json.dumps(data, indent=2) + '\n')
for source, target in [('2026-10-26-sol-ground-contact/notes.md','original-ground-notes.md'), ('2026-10-26-sol-ground-contact/followup-runtime-pairs/notes.md','original-followup-notes.md')]:
    (OUT / target).write_bytes((ROOT / 'research/runs' / source).read_bytes())
print(json.dumps({'inventoryCount': len(files), 'recordedAt': data['recordedAt'], 'head': data['head']}))
