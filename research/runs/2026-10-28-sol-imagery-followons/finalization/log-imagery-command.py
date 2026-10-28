from pathlib import Path
import datetime,json,subprocess,sys
root=Path('/workspace');run=root/'research/runs/2026-10-28-sol-imagery-followons';out=run/'finalization';out.mkdir(exist_ok=True)
label=sys.argv[1];argv=sys.argv[2:];record={'label':label,'argv':argv,'cwd':'/home/jay/projects/external/configurator-demo (backend /workspace)','startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':None}
p=out/(label+'-execution.json');p.write_text(json.dumps(record,indent=2)+'\n')
with (out/(label+'.log')).open('w') as f:r=subprocess.run(argv,cwd=root,stdout=f,stderr=subprocess.STDOUT)
record.update(endedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),exitCode=r.returncode);p.write_text(json.dumps(record,indent=2)+'\n')
print(label,'EXIT',r.returncode);print((out/(label+'.log')).read_text()[-4500:]);sys.exit(r.returncode)
