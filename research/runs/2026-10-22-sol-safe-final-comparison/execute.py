from pathlib import Path
import subprocess,os,json,time,datetime
p=Path(__file__).resolve().parent
os.environ['PLAYWRIGHT_BROWSERS_PATH']=str(Path.cwd()/'.cache/ms-playwright')
steps=[['capture','safe',t] for t in ['front-three-quarter,side','rear-three-quarter,wheel-brake','mirror-window,wipers','panel-seams,interior','glass-edge']]+[['measure',m,str(i)] for i,m in enumerate(['control','safe','safe','control'])]
for i,args in enumerate(steps):
 cmd=['node',str(p/'capture.mjs'),*args];start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
 with (p/f'execution-{i}.txt').open('w') as f:r=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT)
 rec={'argv':cmd,'cwd':str(Path.cwd()),'startedAt':start,'elapsedSeconds':time.monotonic()-t,'exitCode':r.returncode,'log':f'execution-{i}.txt'}
 with (p/'commands.jsonl').open('a') as f:f.write(json.dumps(rec)+'\n')
 print(json.dumps(rec),flush=True)
 if r.returncode:raise SystemExit(r.returncode)
