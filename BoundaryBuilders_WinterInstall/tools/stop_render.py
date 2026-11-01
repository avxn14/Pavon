import os, signal, subprocess
me=os.getpid(); out=subprocess.run(["ps","-eo","pid,args"],capture_output=True,text=True).stdout
pats=("render_winter.py all","make_winter.sh 916","chrome-profile916","chrome-profile45")
n=0
for line in out.splitlines()[1:]:
    pid,_,args=line.strip().partition(" ")
    if int(pid)==me or "stop_render" in args or args.startswith("bash -c"): continue
    if any(p in args for p in pats):
        try: os.kill(int(pid),signal.SIGTERM); n+=1
        except Exception: pass
print("stopped",n,"processes")
