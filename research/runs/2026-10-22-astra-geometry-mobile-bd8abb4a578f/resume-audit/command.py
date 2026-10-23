import datetime,json,os,subprocess,sys,uuid
from pathlib import Path
here=Path(__file__).resolve().parent
execution=uuid.uuid4().hex
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def event(data):
 with (here/'commands.jsonl').open('a') as f:f.write(json.dumps({'executionId':execution,**data})+'\n');f.flush();os.fsync(f.fileno())
out=here/(execution+'.stdout.txt');err=here/(execution+'.stderr.txt')
event({'event':'start','timestamp':now(),'argv':sys.argv[1:],'cwd':os.getcwd(),'stdoutPath':out.name,'stderrPath':err.name})
with out.open('x') as o,err.open('x') as e:
 try:result=subprocess.run(sys.argv[1:],stdout=o,stderr=e);code=result.returncode
 except Exception as exc:e.write(repr(exc));code=127
event({'event':'complete','timestamp':now(),'exitCode':code})
print(out.read_text(),end='');print(err.read_text(),file=sys.stderr,end='');sys.exit(code)
