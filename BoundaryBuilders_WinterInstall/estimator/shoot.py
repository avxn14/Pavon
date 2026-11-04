#!/usr/bin/env python3
"""shoot.py: open the local copy of the quote page at phone size (430x932 @2x) and capture each step.
Walks: scope -> material -> colour/quality -> ... -> stops before any personal details are typed."""
import os, sys, json, subprocess, base64, time, shutil, select
HERE=os.path.dirname(os.path.abspath(__file__)); CHROME="/opt/pw-browsers/chromium"; W,H=430,932; OUT=os.path.join(HERE,"shots"); os.makedirs(OUT,exist_ok=True)
class CDP:
    def __init__(self):
        self.fin=os.path.join(HERE,"cdp_in.fifo"); self.fout=os.path.join(HERE,"cdp_out.fifo")
        for f in (self.fin,self.fout):
            if os.path.exists(f): os.remove(f)
            os.mkfifo(f)
        prof=os.path.join(HERE,"chrome-profile"); shutil.rmtree(prof,ignore_errors=True)
        cmd=(f'exec "{CHROME}" --headless=new --remote-debugging-pipe --disable-gpu --hide-scrollbars --no-sandbox --no-first-run --no-default-browser-check '
             f'--disable-extensions --user-data-dir="{prof}" --window-size={W},{H} --allow-file-access-from-files --font-render-hinting=none about:blank 3<"{self.fin}" 4>"{self.fout}"')
        self.p=subprocess.Popen(["bash","-c",cmd],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        self.w=open(self.fin,"wb",buffering=0); self.r=open(self.fout,"rb",buffering=0); self.buf=b""; self.mid=0
    def send(self,m,p=None,session=None):
        self.mid+=1; d={"id":self.mid,"method":m,"params":p or {}}
        if session: d["sessionId"]=session
        self.w.write(json.dumps(d).encode()+b"\0"); return self.mid
    def recv(self,timeout=60):
        dl=time.time()+timeout
        while True:
            i=self.buf.find(b"\0")
            if i>=0: m=self.buf[:i]; self.buf=self.buf[i+1:]; return json.loads(m)
            rem=dl-time.time()
            if rem<=0: raise RuntimeError("timeout")
            r,_,_=select.select([self.r],[],[],rem)
            if not r: raise RuntimeError("timeout")
            c=os.read(self.r.fileno(),1<<16)
            if not c: raise RuntimeError("closed")
            self.buf+=c
    def call(self,m,p=None,session=None):
        i=self.send(m,p,session)
        while True:
            r=self.recv()
            if r.get("id")==i:
                if "error" in r: raise RuntimeError(r["error"])
                return r.get("result",{})
    def close(self):
        try: self.send("Browser.close")
        except Exception: pass
        try: self.p.wait(timeout=10)
        except Exception: self.p.kill()
c=CDP(); tid=c.call("Target.createTarget",{"url":"about:blank"})["targetId"]; s=c.call("Target.attachToTarget",{"targetId":tid,"flatten":True})["sessionId"]
c.call("Page.enable",session=s); c.call("Runtime.enable",session=s)
c.call("Emulation.setDeviceMetricsOverride",{"width":W,"height":H,"deviceScaleFactor":2,"mobile":True},session=s)
c.call("Emulation.setUserAgentOverride",{"userAgent":"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"},session=s)
c.call("Emulation.setTouchEmulationEnabled",{"enabled":True},session=s)
c.call("Page.navigate",{"url":"file://"+os.path.join(HERE,"site","index.html")},session=s); time.sleep(2.5)
def ev(expr):
    r=c.call("Runtime.evaluate",{"expression":expr,"awaitPromise":True,"returnByValue":True},session=s)
    if "exceptionDetails" in r: return "ERR: "+json.dumps(r["exceptionDetails"])[:300]
    return r.get("result",{}).get("value")
def shot(name):
    d=c.call("Page.captureScreenshot",{"format":"png"},session=s); p=os.path.join(OUT,name+".png"); open(p,"wb").write(base64.b64decode(d["data"])); return p
def state():
    return ev("""(()=>{const q=[...document.querySelectorAll('.q')].filter(e=>e.offsetParent).map(e=>e.textContent.trim());
      const opts=[...document.querySelectorAll('.choice, .option, .preset, .chip, label.unsure')].filter(e=>e.offsetParent).map(e=>({t:(e.querySelector('.c-title,.o-name')||e).textContent.trim().replace(/\\s+/g,' ').slice(0,60), on:e.classList.contains('is-on')}));
      const next=document.querySelector('#next'); const hint=document.querySelector('#hint');
      return JSON.stringify({q, opts, next: next? next.textContent.trim().replace(/\\s+/g,' '):null, nextSoft: next? next.classList.contains('soft'):null, hint: hint?hint.textContent.trim():null, y: window.scrollY, h: document.body.scrollHeight});})()""")
def click_text(txt):
    return ev("""(()=>{const t=%s; const els=[...document.querySelectorAll('.choice, .option, .preset, .chip')].filter(e=>e.offsetParent);
      const e=els.find(e=>((e.querySelector('.c-title,.o-name')||e).textContent.trim().toLowerCase().startsWith(t.toLowerCase())));
      if(!e) return 'no match for '+t; e.scrollIntoView({block:'center'}); e.click(); if(!e.classList.contains('is-on')){const i=e.querySelector('input'); if(i){i.click();}} return 'clicked '+t+(e.classList.contains('is-on')?' (on)':' (still off)');})()""" % json.dumps(txt))
def next_():
    return ev("(()=>{const n=document.querySelector('#next'); if(!n) return 'no next'; n.click(); return 'next';})()")
steps=[]; 
plan=sys.argv[1:] or ["Fence","Metal","Black"]
print("START", state()); shot("step00")
for i,t in enumerate(plan, start=1):
    print("click", t, "->", click_text(t)); time.sleep(0.6); print("  state", state()); shot(f"step{i:02d}_picked"); print("  next ->", next_()); time.sleep(0.9); print("  after next", state()); shot(f"step{i:02d}_next")
print("FINAL", state()); c.close()
