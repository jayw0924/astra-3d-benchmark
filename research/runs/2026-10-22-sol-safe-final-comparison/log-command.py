from pathlib import Path
import sys,subprocess,datetime,time,json,os
p=Path(__file__).resolve().parent
name=sys.argv[1];args=sys.argv[2:];assert not (p/name).exists(),name
os.environ['PLAYWRIGHT_BROWSERS_PATH']=str(Path.cwd()/'.cache/ms-playwright')
start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
with (p/name).open('w') as f:r=subprocess.run(args,stdout=f,stderr=subprocess.STDOUT)
rec={'argv':args,'cwd':str(Path.cwd()),'startedAt':start,'finishedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':time.monotonic()-t,'exitCode':r.returncode,'log':name}
with (p/'commands.jsonl').open('a') as f:f.write(json.dumps(rec)+'\n')
print(json.dumps(rec),flush=True);print((p/name).read_text()[-14000:]);raise SystemExit(r.returncode)
