import datetime
import json
import os
from pathlib import Path
import subprocess
import sys
import time

here = Path(__file__).resolve().parent
start = datetime.datetime.now(datetime.timezone.utc).isoformat()
tick = time.monotonic()
result = subprocess.run(sys.argv[1:], cwd='/workspace', capture_output=True, text=True, env={**os.environ, 'PLAYWRIGHT_BROWSERS_PATH': '/workspace/.cache/ms-playwright'})
record = dict(argv=sys.argv[1:], cwd='/workspace', startedAt=start, endedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(), elapsedSeconds=time.monotonic()-tick, exitCode=result.returncode, stdout=result.stdout, stderr=result.stderr)
with (here/'commands.jsonl').open('a') as f:
    f.write(json.dumps(record)+'\n')
print(result.stdout, end='')
print(result.stderr, end='', file=sys.stderr)
sys.exit(result.returncode)
