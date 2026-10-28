"""Close this publication package without touching historical evidence."""
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import re
import shutil
from urllib.request import urlopen

root = Path.cwd()
run_dir = root / 'research/runs/2026-10-28-sol-workflow-publication'
started = datetime.now(timezone.utc)
baseline = json.loads((root / 'work/workflow-protected-before.json').read_text())
changed = [p for p, digest in baseline.items() if not (root / p).is_file() or sha256((root / p).read_bytes()).hexdigest() != digest]
assert not changed, changed
for p in sorted((root / 'work').glob('workflow-*.log')):
    shutil.copyfile(p, run_dir / p.name)
for name in ['workflow-index-desktop-stable.png', 'workflow-explanation-mobile-stable.png']:
    shutil.copyfile(root / 'work' / name, run_dir / name)
body = urlopen('http://127.0.0.1:4187/').read()
assert body == (root / 'dist/index.html').read_bytes()
tests = (root / 'work/workflow-tests.log').read_text()
unit = int(re.search(r'Tests\s+(\d+) passed', tests).group(1))
script_counts = [int(n) for n in re.findall(r'ℹ tests (\d+)', tests)]
assert [unit, *script_counts] == [42, 48, 6]
verification = {
    'protectedExistingFiles': len(baseline), 'changedExistingProtectedFiles': changed,
    'unitTestsPassed': unit, 'scriptTestsPassed': script_counts[0], 'renderPlanTestsPassed': script_counts[1],
    'developmentE2ePassed': 2, 'productionE2ePassed': 6,
    'checks': ['npm test', 'npm run lint', 'npm run research:validate', 'node scripts/validate-case-studies.mjs', 'npm run build', 'npm run build:app', 'npm run test:e2e -- tests/e2e/workflow-overview.spec.ts', 'BASE_URL=http://127.0.0.1:4187 npm run test:e2e -- tests/e2e/workflow-overview.spec.ts tests/e2e/ai-imagery.spec.ts'],
    'researchAssets': 28, 'researchRuns': 33, 'caseStudies': 2,
    'productionIndexMatchesLocalBytes': True, 'productionIndexSha256': sha256(body).hexdigest(),
    'screenshotSource': 'blocked: supplied original not readable; no public screenshot or crop created',
    'newPublicAssets': [],
    'visualInspection': 'Desktop six-stage index and 393px mobile explanation inspected. Stable QA captures disable smooth scrolling and make header static during capture only; real sticky-header anchors checked by Playwright separately. Earlier raw QA captures were affected by smooth-scroll/sticky-header overlap, not used as evidence.',
    'warnings': ['Existing Vite chunk >500kB warning', 'Write-tool standalone TS checker used incompatible default flags; project tsc -b/build and ESLint passed'],
}
(run_dir / 'verification.json').write_text(json.dumps(verification, indent=2) + '\n')
source_paths = ['src/App.tsx', 'src/App.test.tsx', 'src/styles.css', 'tests/e2e/workflow-overview.spec.ts', 'research/case-studies/index.json']
files = sorted(p for p in run_dir.iterdir() if p.is_file() and p.name not in ['run.json', 'output-inventory.json'])
items = [{'path': str(p.relative_to(root)), 'bytes': p.stat().st_size, 'sha256': sha256(p.read_bytes()).hexdigest()} for p in [*files, *(root / p for p in source_paths)]]
(run_dir / 'output-inventory.json').write_text(json.dumps({'files': items, 'exclusions': ['run.json and inventory itself to avoid self-referential hashes; generated study projection regenerated after record closeout']}, indent=2) + '\n')
run_path = run_dir / 'run.json'
run = json.loads(run_path.read_text())
outputs = [str(p.relative_to(root)) for p in sorted(run_dir.iterdir()) if p.is_file() and p.name != 'run.json'] + source_paths
run['outputPaths'] = outputs
run['provenance']['outputs'] = [{'path': p, 'lane': 'non_astra_authored_baseline', 'sourceAssets': run['inputAssets']} for p in outputs]
ended = datetime.now(timezone.utc)
run['startedAt'] = started.isoformat()
run['endedAt'] = ended.isoformat()
run['elapsedSeconds'] = (ended - started).total_seconds()
run['cost']['basis'] = 'Actual observed retrospective package verification/registration interval only; not full task duration, generation, active time or billing. Cost unavailable.'
run_path.write_text(json.dumps(run, indent=2) + '\n')
print(json.dumps(verification, indent=2))
