#!/usr/bin/env python3
"""Drive headless Chromium over the DevTools pipe and capture edu.html frame by frame.
VID=NN selects scripts/NN_*.json.
  render.py plan                 -> renders/NN_plan.json + renders/NN_clips.json from the VO durations
  render.py preview t1 t2 ...    -> stills into renders/NN_preview/
  render.py all                  -> every frame at 30 fps into frames/NN/
  render.py cover                -> final/NN_slug_cover.png (+ .jpg, qa/NN_grid_preview.png)
  render.py qa                   -> samples every 0.25 s: safe zones, overlaps, card top, sharp-scale <= 1.30; dumps qa/NN_strings.txt
"""
import os, sys, json, subprocess, base64, time, glob, shutil, select

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = os.environ.get("CHROME", "/opt/pw-browsers/chromium" if os.path.exists("/opt/pw-browsers/chromium") else "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
FPS = 30
VID = os.environ.get("VID", "")
if not VID: sys.exit("set VID=NN (picks scripts/NN_*.json)")
m = sorted(glob.glob(os.path.join(HERE, "scripts", f"{VID}_*.json")))
if not m: sys.exit(f"no scripts/{VID}_*.json")
SCRIPT_PATH = m[0]; SCRIPT = json.load(open(SCRIPT_PATH)); SLUG = SCRIPT["id"]
HTML = os.path.join(HERE, "edu.html")
PLAN = os.path.join(HERE, "renders", f"{VID}_plan.json"); CLIPS = os.path.join(HERE, "renders", f"{VID}_clips.json")
FRAMES = os.path.join(HERE, "frames", VID)
os.makedirs(os.path.join(HERE, "renders"), exist_ok=True); os.makedirs(os.path.join(HERE, "qa"), exist_ok=True); os.makedirs(os.path.join(HERE, "final"), exist_ok=True)

def audio_duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True).stdout.strip()
    return float(out) if out else None

def vo_file(i):
    for ext in ("caf", "mp3"):
        f = os.path.join(HERE, "audio", "vo", f"{VID}_b{i+1}.{ext}")
        if os.path.exists(f): return f
    return None

def plan():
    beats = SCRIPT["beats"]; n = len(beats)
    DEF = {"hook": (0.30, 0.30, 2.6), "end": (0.35, 1.60, 3.5)}   # type -> (lead, tail, min length)
    t = 0.0; scenes = [0.0]; vo = []; sfx = []; skipcap = []
    for i, b in enumerate(beats):
        lead, tail, mn = DEF.get(b["type"], (0.18, 0.35, 2.4))
        lead = b.get("lead", lead); tail = b.get("tail", tail); mn = b.get("min", mn)
        f = vo_file(i); d = audio_duration(f) if f else None
        if d is None: sys.exit(f"missing VO for beat {i+1}: audio/vo/{VID}_b{i+1}.caf (run tools/make.sh to see which beats need new VO)")
        length = max(mn, lead + d + tail)
        start = t + lead
        vo.append({"start": round(start, 3), "dur": round(d, 3), "text": b["vo"], "beat": i})
        if b["type"] in ("hook", "end"): skipcap.append(i)
        if b.get("wipe") and i > 0: sfx.append({"file": "whoosh", "start": max(0.0, t - 0.26), "vol": 0.5})
        if b.get("card") or b["type"] == "end": sfx.append({"file": "hit", "start": t + (0.12 if b["type"] == "end" else 0.32), "vol": 0.4})
        for s in b.get("sfx", []): sfx.append({"file": s["file"], "start": t + s.get("offset", 0.0), "vol": s.get("vol", 0.4)})
        t += length; scenes.append(round(t, 3))
    total = scenes[-1]
    plan = {"scenes": scenes, "skipcap": skipcap, "vo": vo, "total": total}
    json.dump(plan, open(PLAN, "w"), indent=1)
    clips = [{"file": vo_file(i), "start": vo[i]["start"], "volume": 1.0} for i in range(n)]
    mu = SCRIPT.get("music")
    if mu:
        mf = os.path.join(HERE, mu["file"])
        if os.path.exists(mf): clips.append({"file": mf, "start": 0.0, "volume": mu.get("volume", 0.2), "offset": mu.get("offset", 0.0), "fadeOut": round(max(0.0, total - 1.0), 3)})
    for s in sfx:
        f = os.path.join(HERE, "audio", "sfx", s["file"] + ".mp3")
        if os.path.exists(f): clips.append({"file": f, "start": round(s["start"], 3), "volume": s["vol"]})
    json.dump(clips, open(CLIPS, "w"), indent=1)
    print(json.dumps({"scenes": scenes, "total": total, "frames": int(round(total * FPS))}))
    lo, hi = SCRIPT.get("target", [24, 34])
    if not (lo <= total <= 35): print(f"WARNING: total {total:.2f}s outside {lo}-{hi}s (hard max 35)")
    return plan

class CDP:
    def __init__(self):
        self.fin = os.path.join(HERE, "renders", f"cdp_in{VID}.fifo"); self.fout = os.path.join(HERE, "renders", f"cdp_out{VID}.fifo")
        for f in (self.fin, self.fout):
            if os.path.exists(f): os.remove(f)
            os.mkfifo(f)
        prof = os.path.join(HERE, "renders", f"chrome-profile{VID}"); shutil.rmtree(prof, ignore_errors=True)
        cmd = (f'exec "{CHROME}" --headless=new --remote-debugging-pipe --disable-gpu --hide-scrollbars --no-sandbox '
               f'--no-first-run --no-default-browser-check --disable-extensions --user-data-dir="{prof}" '
               f'--window-size=1080,1920 --force-device-scale-factor=1 --allow-file-access-from-files --font-render-hinting=none '
               f'about:blank 3<"{self.fin}" 4>"{self.fout}"')
        self.p = subprocess.Popen(["bash", "-c", cmd], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.w = open(self.fin, "wb", buffering=0); self.r = open(self.fout, "rb", buffering=0)
        self.buf = b""; self.mid = 0
    def send(self, method, params=None, session=None):
        self.mid += 1; m = {"id": self.mid, "method": method, "params": params or {}}
        if session: m["sessionId"] = session
        self.w.write(json.dumps(m).encode() + b"\0"); return self.mid
    def recv(self, timeout=60.0):
        deadline = time.time() + timeout
        while True:
            i = self.buf.find(b"\0")
            if i >= 0:
                msg = self.buf[:i]; self.buf = self.buf[i + 1:]; return json.loads(msg)
            remaining = deadline - time.time()
            if remaining <= 0: raise RuntimeError("CDP read timed out")
            ready, _, _ = select.select([self.r], [], [], remaining)
            if not ready: raise RuntimeError("CDP read timed out")
            chunk = os.read(self.r.fileno(), 1 << 16)
            if not chunk: raise RuntimeError("chrome closed the pipe")
            self.buf += chunk
    def call(self, method, params=None, session=None):
        i = self.send(method, params, session)
        while True:
            m = self.recv()
            if m.get("id") == i:
                if "error" in m: raise RuntimeError(f"{method}: {m['error']}")
                return m.get("result", {})
    def close(self):
        try: self.send("Browser.close")
        except Exception: pass
        try: self.p.wait(timeout=10)
        except Exception: self.p.kill()

class Page:
    def __init__(self, plan_obj):
        self.c = CDP(); c = self.c
        tid = c.call("Target.createTarget", {"url": "about:blank"})["targetId"]
        self.s = s = c.call("Target.attachToTarget", {"targetId": tid, "flatten": True})["sessionId"]
        c.call("Page.enable", session=s); c.call("Runtime.enable", session=s)
        c.call("Emulation.setDeviceMetricsOverride", {"width": 1080, "height": 1920, "deviceScaleFactor": 1, "mobile": False}, session=s)
        c.call("Page.navigate", {"url": "file://" + HTML}, session=s)
        for _ in range(400):
            r = c.call("Runtime.evaluate", {"expression": "document.readyState==='complete' && !!window.ready", "returnByValue": True}, session=s)
            if r.get("result", {}).get("value"): break
            time.sleep(0.05)
        r = self.ev("(async()=>{await window.ready; await init(" + json.dumps(plan_obj) + "," + json.dumps(SCRIPT) + "); return 'ok';})()", True)
        assert r == "ok", r
    def ev(self, expr, awaitP=False):
        r = self.c.call("Runtime.evaluate", {"expression": expr, "awaitPromise": awaitP, "returnByValue": True}, session=self.s)
        if "exceptionDetails" in r: raise RuntimeError(json.dumps(r["exceptionDetails"])[:2000])
        return r.get("result", {}).get("value")
    def seek(self, t):
        self.ev("(async()=>{seek(%f); await Promise.race([new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))), new Promise(r=>setTimeout(r,120))]); return 1;})()" % t, True)
    def shot(self, path):
        d = self.c.call("Page.captureScreenshot", {"format": "png", "optimizeForSpeed": True}, session=self.s)
        with open(path, "wb") as fh: fh.write(base64.b64decode(d["data"]))
    def close(self): self.c.close()

def render(times, outdir, plan_obj):
    os.makedirs(outdir, exist_ok=True); pg = Page(plan_obj); t0 = time.time()
    try:
        warn = pg.ev("JSON.stringify(window.FIT_WARNINGS||[])")
        if warn and warn != "[]": print("FIT WARNINGS:", warn)
        for idx, t in enumerate(times):
            pg.seek(t); name = f"f{idx:04d}.png" if len(times) > 20 else f"t{t:06.2f}.png"; pg.shot(os.path.join(outdir, name))
            if idx % 100 == 0 and len(times) > 20: print(f"frame {idx}/{len(times)} {time.time()-t0:.1f}s", flush=True)
        print(f"rendered {len(times)} frames in {time.time()-t0:.1f}s")
    finally: pg.close()

def cover(plan_obj):
    pg = Page(plan_obj)
    try:
        pg.ev("coverMode()"); pg.seek(0); out = os.path.join(HERE, "final", f"{SLUG}_cover.png"); pg.shot(out)
        warn = pg.ev("JSON.stringify(window.FIT_WARNINGS||[])")
        if warn and warn != "[]": print("FIT WARNINGS:", warn)
        box = pg.ev("JSON.stringify(coverBox())"); print("cover title box", box)
    finally: pg.close()
    from PIL import Image
    im = Image.open(out).convert("RGB"); im.save(os.path.join(HERE, "final", f"{SLUG}_cover.jpg"), quality=90)
    im.crop((0, 240, 1080, 1680)).save(os.path.join(HERE, "qa", f"{VID}_grid_preview.png")); print("wrote", out)

def qa(plan_obj):
    total = plan_obj["total"]; pg = Page(plan_obj); fails = []; strings = set(); maxScale = 0.0
    try:
        warn = json.loads(pg.ev("JSON.stringify(window.FIT_WARNINGS||[])"))
        for w in warn: fails.append(f"fit: {w}")
        t = 0.0
        while t <= total + 1e-6:
            pg.seek(t); r = json.loads(pg.ev("JSON.stringify(qaSample())"))
            for f in r["fails"]: fails.append(f"t={t:.2f} {f}")
            for s in r["strings"]: strings.add(s)
            maxScale = max(maxScale, r["maxScale"])
            t = round(t + 0.25, 3)
    finally: pg.close()
    open(os.path.join(HERE, "qa", f"{VID}_strings.txt"), "w").write("\n".join(sorted(strings)) + "\n")
    json.dump({"fails": fails, "maxSharpScale": maxScale, "strings": sorted(strings)}, open(os.path.join(HERE, "qa", f"{VID}_qa.json"), "w"), indent=1)
    print(f"qa: max sharp scale {maxScale:.3f}; {len(fails)} failures")
    for f in fails[:40]: print("  FAIL", f)
    if len(fails) > 40: print(f"  ... {len(fails)-40} more")
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "plan": plan(); sys.exit(0)
    plan_obj = json.load(open(PLAN))
    if mode == "preview":
        out = os.path.join(HERE, "renders", f"{VID}_preview"); shutil.rmtree(out, ignore_errors=True)
        render([float(x) for x in sys.argv[2:]], out, plan_obj)
    elif mode == "all":
        n = int(round(plan_obj["total"] * FPS)); shutil.rmtree(FRAMES, ignore_errors=True); render([i / FPS for i in range(n)], FRAMES, plan_obj)
    elif mode == "cover": cover(plan_obj)
    elif mode == "qa": qa(plan_obj)
    else: sys.exit("modes: plan | preview t.. | all | cover | qa")
