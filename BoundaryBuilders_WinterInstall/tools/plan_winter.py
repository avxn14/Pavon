#!/usr/bin/env python3
"""plan_winter.py: time the six scenes to the voice lines (audio/vo/b1..b6.caf) and write audio/clips.json.
Scene k's line starts 0.25 s after the scene (0.2 s for the opener). Scene lengths = max(minimum, line + 0.35); scene 3 is split
in half between the close-up and the wide; the phone scene and the end card absorb what is left so the total stays at 20 s."""
import json, os, subprocess, math
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); S=json.load(open(os.path.join(ROOT,'scripts','winter.json'))); T=S['duration']; FPS=30
def dur(p): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p],capture_output=True,text=True).stdout.strip())
def q(t): return math.ceil(t*FPS-1e-6)/FPS
vo=[dur(os.path.join(ROOT,'audio','vo',f'b{k}.caf')) for k in range(1,7)]
mins=[3.0,2.2,4.0,3.5,2.4,2.15]; lead=[0.2,0.25,0.25,0.25,0.25,0.2]
L=[max(m, v+l+0.3) for m,v,l in zip(mins,vo,lead)]
over=sum(L)-T
if over>0:   # shave the phone scene and the end card first (they have no fixed picture), never below what their lines need
    for i in (3,5,1,4):
        give=min(over, L[i]-(vo[i]+lead[i]+0.3)); L[i]-=give; over-=give
        if over<=1e-6: break
assert over<=1e-6, f"voice lines do not fit in {T} s"
L[3]+=T-sum(L)   # any slack goes to the phone scene
b=[0.0]
for x in L: b.append(q(b[-1]+x))
b[-1]=T
sc={s['id']:s for s in S['shots']}
sc['s1'].update(t0=b[0],t1=b[1]); sc['s2'].update(t0=b[1],t1=b[2]); mid=q((b[2]+b[3])/2); sc['s3a'].update(t0=b[2],t1=mid); sc['s3b'].update(t0=mid,t1=b[3])
sc['s4'].update(t0=b[3],t1=b[4]); sc['s5'].update(t0=b[4],t1=b[5]); sc['s6'].update(t0=b[5],t1=b[6])
caps=S['captions']; caps[0].update(t0=b[0],t1=b[1]); caps[1].update(t0=b[1],t1=b[2]); caps[2].update(t0=b[2],t1=b[3]); caps[3].update(t0=b[3],t1=b[4]); caps[4].update(t0=b[4],t1=b[5]); caps[5].update(t0=b[5],t1=b[6])
clips=[]
for k in range(6):
    vs=q(b[k]+lead[k]); clips.append({"file":f"audio/vo/b{k+1}.caf","start":round(vs,3),"volume":S.get("vo_volume",2.6)})
    print(f"scene {k+1}: {b[k]:.2f}-{b[k+1]:.2f} ({b[k+1]-b[k]:.2f} s)  voice {vs:.2f}-{vs+vo[k]:.2f} ({vo[k]:.2f} s)")
clips.append({"file":"audio/bed.mp3","start":0.0,"volume":S.get("music_volume",0.3),"fadeOut":T-1.0,"offset":0.0})
json.dump(S,open(os.path.join(ROOT,'scripts','winter.json'),'w'),indent=1,ensure_ascii=False); json.dump(clips,open(os.path.join(ROOT,'audio','clips.json'),'w'),indent=1)
print("end card holds from", b[5]+0.5, "to", T)
