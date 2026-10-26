"""Record actual verification execution timestamps and complete output."""
import datetime
import json
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parents[3]
run = Path(__file__).resolve().parent
name, *argv = sys.argv[1:]
event = {"argv": argv, "cwd": str(root), "startedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()}
target = run / f"{name}-execution.json"
target.write_text(json.dumps(event, indent=2) + "\n")
with (run / f"{name}.log").open("w") as output:
    result = subprocess.run(argv, cwd=root, stdout=output, stderr=subprocess.STDOUT)
event.update(endedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(), exitCode=result.returncode)
target.write_text(json.dumps(event, indent=2) + "\n")
print(json.dumps(event))
print((run / f"{name}.log").read_text()[-2500:])
sys.exit(result.returncode)
