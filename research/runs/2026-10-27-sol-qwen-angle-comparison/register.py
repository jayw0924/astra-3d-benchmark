"""Additive, lossless registration helpers; no generation or recapture."""
from pathlib import Path
import hashlib
import json
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[3]
RUN = Path(__file__).resolve().parent
OLD = ROOT / 'research/runs/2026-10-27-sol-qwen-imagery'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(name, value):
    (RUN / name).write_text(json.dumps(value, indent=2) + '\n')

def protected():
    paths = list(OLD.rglob('*')) + list((ROOT / 'public/assets/models').glob('*.glb')) + list((ROOT / 'public/assets/study/ai-imagery').glob('*.png'))
    return {str(p.relative_to(ROOT)): sha(p) for p in sorted(paths) if p.is_file()}

if __name__ == '__main__':
    write('before.json', {'observedAt': datetime.now(timezone.utc).isoformat(), 'files': protected()})
    print('Protected baseline files:', len(protected()))
