"""Run a command from the project root and append exact evidence."""
import datetime
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path('/workspace')
RUN = Path(__file__).resolve().parent
argv = sys.argv[1:]
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
result = subprocess.run(argv, cwd=ROOT, capture_output=True, text=True)
entry = dict(startedAt=started, endedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(), argv=argv, cwd=str(ROOT), exitStatus=result.returncode, stdout=result.stdout, stderr=result.stderr)
with (RUN / 'commands.jsonl').open('a') as stream:
    stream.write(json.dumps(entry) + '\n')
print(result.stdout, end='')
print(result.stderr, end='', file=sys.stderr)
sys.exit(result.returncode)
