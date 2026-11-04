#!/usr/bin/env python3
"""render_cards.py <1x1|4x5|9x16> [extraQuery]: screenshot cards.html with headless Chromium -> out/card_<f>.png + out/card_<f>.json (layout boxes)"""
import os, sys, json, subprocess, base64, time, shutil, select
HERE=os.path.dirname(os.path.abspath(__file__)); CHROME="/opt/pw-browsers/chromium"
VAR=sys.argv[1] if len(sys.argv)>1 else "1x1"; SIZES={"1x1":(1080,1080),"4x5":(1080,1350),"9x16":(1080,1920)}; W,H=SIZES[VAR]; EXTRA=sys.argv[2] if len(sys.argv)>2 else ""
class CDP:
    def __init__(self):
        self.fin=os.path.join(HERE,"out","cdp_in.fifo"); self.fout=os.path.join(HERE,"out","cdp_out.fifo")
        for f in (self.fin,self.fout):
            if os.path.exists(f): os.remove(f)
            os.mkfifo(f)
        prof=os.path.join(HERE,"out","chrome-profile"); shutil.rmtree(prof,ignore_errors=True)
        cmd=(f'exec "{CHROME}" --headless=new --remote-debugging-pipe --disable-gpu --hide-scrollbars --no-sandbox --no-first-run '
             f'--no-default-browser-check --disable-extensions --user-data-dir="{prof}" --window-size={W},{H} --force-device-scale-factor=1 '
             f'--allow-file-access-from-files --font-render-hinting=none about:blank 3<"{self.fin}" 4>"{self.fout}"')
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
c.call("Emulation.setDeviceMetricsOverride",{"width":W,"height":H,"deviceScaleFactor":1,"mobile":False},session=s)
c.call("Page.navigate",{"url":"file://"+os.path.join(HERE,"cards.html")+"?f="+VAR+EXTRA},session=s)
for _ in range(400):
    r=c.call("Runtime.evaluate",{"expression":"document.readyState==='complete' && !!window.ready","returnByValue":True},session=s)
    if r.get("result",{}).get("value"): break
    time.sleep(0.05)
r=c.call("Runtime.evaluate",{"expression":"(async()=>{await window.ready; return window.layoutInfo ? window.layoutInfo() : 'ok';})()","awaitPromise":True,"returnByValue":True},session=s)
lay=r.get("result",{}).get("value"); print("layout:", lay); open(os.path.join(HERE,"out",f"card_{VAR}.json"),"w").write(lay or "{}")
time.sleep(0.3)
d=c.call("Page.captureScreenshot",{"format":"png"},session=s); out=os.path.join(HERE,"out",f"card_{VAR}.png")
open(out,"wb").write(base64.b64decode(d["data"])); print("wrote",out); c.close()
