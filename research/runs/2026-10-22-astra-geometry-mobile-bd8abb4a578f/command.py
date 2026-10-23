"""Log actual executions, never reconstructed timestamps."""
import datetime,json,os,subprocess,sys
from pathlib import Path
run=Path(__file__).resolve().parent
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
record={'argv':sys.argv[1:],'cwd':os.getcwd(),'startedAt':now()}
try:
 p=subprocess.run(sys.argv[1:],capture_output=True,text=True)
 record.update(exitCode=p.returncode,stdout=p.stdout,stderr=p.stderr)
except Exception as e:
 record.update(exitCode=127,stdout='',stderr=repr(e))
record['endedAt']=now()
with (run/'commands.jsonl').open('a') as f:f.write(json.dumps(record)+'\n')
sys.stdout.write(record['stdout']);sys.stderr.write(record['stderr']);sys.exit(record['exitCode'])
