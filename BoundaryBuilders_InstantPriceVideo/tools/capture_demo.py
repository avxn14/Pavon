#!/usr/bin/env python3
"""capture_demo.py: screen-record the owner's quote flow (local copy of boundarybuilders.ca/quote) at phone size.
Chromium headless, 430x932 CSS px @2x (860x1864), touch UA, ALL http/https blocked (no lead, no pixels can leave;
the copy's CONFIG.api is empty anyway). Frames arrive from Page.startScreencast with wall-clock timestamps.
Writes capture/raw/NNNNN.png, capture/frames.json [[t, file], ...], capture/events.json {name: t}, capture/price.json."""
import os, sys, json, subprocess, base64, time, shutil, select
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.abspath(os.path.join(HERE, "..", "BoundaryBuilders_WinterInstall", "estimator", "site", "index.html"))
CHROME = "/opt/pw-browsers/chromium"; W, H = 430, 932
CAP = os.path.join(HERE, "capture"); RAW = os.path.join(CAP, "raw"); shutil.rmtree(RAW, ignore_errors=True); os.makedirs(RAW)

class CDP:
    def __init__(self):
        self.fin = os.path.join(CAP, "cdp_in.fifo"); self.fout = os.path.join(CAP, "cdp_out.fifo")
        for f in (self.fin, self.fout):
            if os.path.exists(f): os.remove(f)
            os.mkfifo(f)
        prof = os.path.join(CAP, "chrome-profile"); shutil.rmtree(prof, ignore_errors=True)
        cmd = (f'exec "{CHROME}" --headless=new --remote-debugging-pipe --disable-gpu --hide-scrollbars --no-sandbox --no-first-run '
               f'--no-default-browser-check --disable-extensions --user-data-dir="{prof}" --window-size={W*2},{H*2} --force-device-scale-factor=2 '
               f'--allow-file-access-from-files --font-render-hinting=none about:blank 3<"{self.fin}" 4>"{self.fout}"')
        self.p = subprocess.Popen(["bash", "-c", cmd], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.w = open(self.fin, "wb", buffering=0); self.r = open(self.fout, "rb", buffering=0); self.buf = b""; self.mid = 0
        self.frames = []; self.session = None
    def send(self, m, p=None, session=None):
        self.mid += 1; d = {"id": self.mid, "method": m, "params": p or {}}
        if session: d["sessionId"] = session
        self.w.write(json.dumps(d).encode() + b"\0"); return self.mid
    def _read(self, timeout):
        dl = time.time() + timeout
        while True:
            i = self.buf.find(b"\0")
            if i >= 0: m = self.buf[:i]; self.buf = self.buf[i + 1:]; return json.loads(m)
            rem = dl - time.time()
            if rem <= 0: return None
            r, _, _ = select.select([self.r], [], [], rem)
            if not r: return None
            c = os.read(self.r.fileno(), 1 << 16)
            if not c: raise RuntimeError("chrome closed the pipe")
            self.buf += c
    def handle(self, m):
        if m.get("method") == "Page.screencastFrame":
            p = m["params"]; n = len(self.frames); path = os.path.join(RAW, f"{n:05d}.png")
            with open(path, "wb") as fh: fh.write(base64.b64decode(p["data"]))
            self.frames.append([p["metadata"]["timestamp"], os.path.basename(path)])
            self.send("Page.screencastFrameAck", {"sessionId": p["sessionId"]}, session=m.get("sessionId"))
    def call(self, m, p=None, session=None, timeout=60):
        i = self.send(m, p, session); dl = time.time() + timeout
        while True:
            r = self._read(max(0.01, dl - time.time()))
            if r is None: raise RuntimeError(f"timeout waiting for {m}")
            if r.get("id") == i:
                if "error" in r: raise RuntimeError(f"{m}: {r['error']}")
                return r.get("result", {})
            self.handle(r)
    def pump(self, seconds):
        dl = time.time() + seconds
        while True:
            rem = dl - time.time()
            if rem <= 0: return
            r = self._read(rem)
            if r is not None: self.handle(r)
    def close(self):
        try: self.send("Browser.close")
        except Exception: pass
        try: self.p.wait(timeout=10)
        except Exception: self.p.kill()

c = CDP(); tid = c.call("Target.createTarget", {"url": "about:blank"})["targetId"]
s = c.call("Target.attachToTarget", {"targetId": tid, "flatten": True})["sessionId"]
c.call("Page.enable", session=s); c.call("Runtime.enable", session=s); c.call("Network.enable", session=s)
c.call("Network.setBlockedURLs", {"urls": ["http://*", "https://*", "ws://*", "wss://*"]}, session=s)
c.call("Emulation.setDeviceMetricsOverride", {"width": W, "height": H, "deviceScaleFactor": 2, "mobile": True}, session=s)
c.call("Emulation.setUserAgentOverride", {"userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"}, session=s)
c.call("Emulation.setTouchEmulationEnabled", {"enabled": True}, session=s)
c.call("Page.navigate", {"url": "file://" + SITE}, session=s); c.pump(2.5)
ev = lambda expr: c.call("Runtime.evaluate", {"expression": expr, "awaitPromise": True, "returnByValue": True}, session=s).get("result", {}).get("value")
# the page's CONFIG lives in a closure; its lead endpoint and pixels come only from window.BBQ, which the local copy never sets
assert ev("typeof window.BBQ") == "undefined", "window.BBQ must be unset in the local copy (no lead endpoint, no pixels)"
events = {}
def mark(name): events[name] = time.time(); print(f"{events[name]-T0:6.2f}s  {name}", flush=True)
def click(txt):
    r = ev("""(()=>{const t=%s; const els=[...document.querySelectorAll('.choice, .option, .preset, .chip')].filter(e=>e.offsetParent);
      const e=els.find(e=>((e.querySelector('.c-title,.o-name')||e).textContent.trim().toLowerCase().startsWith(t.toLowerCase())));
      if(!e) return 'no match for '+t; e.scrollIntoView({block:'center'}); e.click(); if(!e.classList.contains('is-on')){const i=e.querySelector('input'); if(i){i.click();}} return 'ok';})()""" % json.dumps(txt))
    assert r == "ok", (txt, r)
def nxt(): assert ev("(()=>{const n=document.querySelector('#next'); if(!n||n.hidden) return 'no next'; n.click(); return 'ok';})()") == "ok"
c.call("Page.startScreencast", {"format": "png", "everyNthFrame": 1, "maxWidth": W * 2, "maxHeight": H * 2}, session=s)
T0 = time.time(); mark("start"); c.pump(0.8)
for label, wait_pick, wait_next in [("Fence", 0.75, 1.05), ("Metal", 0.7, 1.05), ("Black", 0.7, 1.05), ("No gate", 0.6, 1.05)]:
    click(label); mark(f"pick:{label}"); c.pump(wait_pick); nxt(); mark(f"next:{label}"); c.pump(wait_next)
# measurements: type 120 ft one digit at a time
mark("type:start")
for i in range(1, 4):
    ev("(()=>{const i=document.querySelector('#m-fence'); i.focus(); i.value=%s; i.dispatchEvent(new Event('input',{bubbles:true})); return 1;})()" % json.dumps("120"[:i])); c.pump(0.22)
mark("type:end"); c.pump(0.6); nxt(); mark("next:measure"); c.pump(1.05)
click("No, it"); mark("pick:clear"); c.pump(0.6); nxt(); mark("next:extras"); c.pump(1.2)          # 'See my price' -> contact screen
# contact screen (empty form) is shown briefly; then placeholder details are filled and submitted in one go: those frames are CUT in the edit
mark("contact:shown"); c.pump(0.9)
ev("""(()=>{const set=(id,v)=>{const i=document.querySelector(id); i.value=v; i.dispatchEvent(new Event('input',{bubbles:true}));};
  set('#c-name','Jamie Lee'); set('#c-phone','6045550123'); set('#c-email','jamie@example.com'); return 1;})()""")
mark("contact:filled"); c.pump(0.15); nxt(); mark("contact:submit")
for _ in range(60):
    c.pump(0.05)
    if ev("(()=>{const k=document.querySelector('#calc'); return !!k && !k.hidden;})()"): break
mark("calc:visible")
for _ in range(120):
    c.pump(0.05)
    if ev("(()=>{const r=document.querySelector('#result'); return !!r && !r.hidden;})()"): break
mark("result:visible")
# privacy: the result screen greets the placeholder name and prints "for Jamie Lee" on the reference line; strip both (frames before this are cut)
ev("""(()=>{const root=document.querySelector('#result'); const w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const nodes=[]; while(w.nextNode()) nodes.push(w.currentNode);
  for(const n of nodes){ if(!/jamie/i.test(n.nodeValue)) continue; n.nodeValue=n.nodeValue.replace(/,\s*Jamie\s*\./,'.').replace(/Jamie Lee/g,'').replace(/Jamie/g,'');
    let el=n.parentElement; for(let k=0;k<3&&el&&el!==root;k++){ if(/^\s*(for)?\s*$/i.test(el.textContent)) { const p=el.parentElement; el.remove(); el=p; } else break; } }
  return root.textContent.includes('Jamie') ? 'STILL THERE' : 'clean';})()""")
mark("result:clean"); c.pump(1.4); mark("countup:done"); c.pump(1.0); mark("end")
assert ev("document.querySelector('#result').textContent.includes('Jamie')") is False, "name still on the result screen"
c.call("Page.stopScreencast", session=s); c.pump(0.3)
rect = ev("""(()=>{const b=document.querySelector('#result .amt b'); if(!b) return null; const r=b.getBoundingClientRect();
  return {x:r.left*2,y:r.top*2,w:r.width*2,h:r.height*2,text:b.textContent, title:(document.querySelector('#result h2, #result .q, #h-result')||{}).textContent||''};})()""")
print("price:", rect)
json.dump(c.frames, open(os.path.join(CAP, "frames.json"), "w")); json.dump({k: v - T0 for k, v in events.items()}, open(os.path.join(CAP, "events.json"), "w"), indent=1)
json.dump({"T0": T0, "price": rect}, open(os.path.join(CAP, "price.json"), "w"))
print(f"{len(c.frames)} frames; events: {json.dumps({k: round(v - T0, 2) for k, v in events.items()})}")
c.close()
