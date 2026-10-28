"""Add screenshot-completion outputs without rewriting historical inventory/logs."""
from pathlib import Path
import json
import hashlib

root = Path(__file__).resolve().parents[3]
run_dir = Path(__file__).resolve().parent
record_path = run_dir / 'run.json'
record = json.loads(record_path.read_text())
paths = set(record['outputPaths'])
paths.update(str(p.relative_to(root)) for p in run_dir.rglob('*') if p.is_file() and p != record_path)
paths.add('public/assets/study/ai-imagery/workflow/comfy-cloud-rear-workflow.png')
paths.add('research/asset-manifest.json')
paths.add(str((run_dir / 'screenshot-output-inventory.json').relative_to(root)))
record['outputPaths'] = sorted(paths)
existing = {item['path'] for item in record['provenance']['outputs']}
for path in sorted(paths - existing):
    record['provenance']['outputs'].append({
        'path': path,
        'lane': 'non_astra_authored_baseline',
        'sourceAssets': record['inputAssets'],
    })
record_path.write_text(json.dumps(record, indent=2) + '\n')
files = []
for path in sorted(paths):
    p = root / path
    if p.name == 'screenshot-output-inventory.json' or not p.is_file():
        continue
    data = p.read_bytes()
    files.append({'path': path, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
(run_dir / 'screenshot-output-inventory.json').write_text(json.dumps({
    'scope': 'Screenshot-completion snapshot; earlier output-inventory.json retained as historical evidence. Mutable run record and generated projection excluded to avoid circular hashes.',
    'files': files,
}, indent=2) + '\n')
print(f'Reconciled {len(paths)} outputs; historical inventory unchanged')
