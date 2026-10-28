"""Run only bounded local validation, retaining real outputs and return codes."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
import json
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[3]
RUN = Path(__file__).resolve().parent
sets = {
    'fast': [('fast-tests', ['npm', 'test']), ('lint', ['npm', 'run', 'lint']), ('focused-e2e', ['npm', 'run', 'test:e2e', '--', 'tests/e2e/ai-imagery.spec.ts', '--workers=1'])],
    'retry-lint': [('lint-retry', ['npm', 'run', 'lint'])],
    'retry-e2e': [('focused-e2e-retry', ['npm', 'run', 'test:e2e', '--', 'tests/e2e/ai-imagery.spec.ts', '--workers=1'])],
    'build': [('strict-build', ['npm', 'run', 'build'])],
    'public-e2e': [('public-e2e', ['npm', 'run', 'test:e2e', '--', 'tests/e2e/ai-imagery.spec.ts', '--workers=1'])],
    'public': [('public-build', ['npm', 'run', 'build:app'])],
}
def execute(item):
    name, argv = item
    started = datetime.now(timezone.utc)
    with (RUN / (name + '.log')).open('w') as stream:
        result = subprocess.run(argv, cwd=ROOT, stdout=stream, stderr=subprocess.STDOUT, env=os.environ.copy(), check=False)
    ended = datetime.now(timezone.utc)
    report = {'argv': argv, 'cwd': str(ROOT), 'startedAt': started.isoformat(), 'endedAt': ended.isoformat(), 'exitCode': result.returncode, 'log': name + '.log'}
    (RUN / (name + '-execution.json')).write_text(json.dumps(report, indent=2) + '\n')
    return report
if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=3) as pool:
        results = list(pool.map(execute, sets[sys.argv[1]]))
    for result in results: print(result['log'], result['exitCode'])
    sys.exit(any(r['exitCode'] != 0 for r in results))
