#!/usr/bin/env python3
"""Drive headless Chromium over the DevTools pipe and capture ad.html frame by frame.
FMT=916 (1080x1920, default) or FMT=45 (1080x1350) selects the format block in scripts/ad.json.
  render_ad.py preview t1 t2 ...   -> stills into renders/<FMT>_preview/
  render_ad.py all                 -> every frame at 30 fps into frames/<FMT>/
  render_ad.py qa                  -> samples every 0.1 s: text inside the safe zone, sharp scale <= 1.10, no empty frame,
                                      last 1.5 s unchanged; dumps qa/<FMT>_strings.txt and qa/<FMT>_qa.json
"""
import os, sys, json, subprocess, base64, time, shutil, select

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = os.environ.get("CHROME", "/opt/pw-browsers/chromium")
FPS = 30
FMT = os.environ.get("FMT", "916")
SCRIPT = json.load(open(os.path.join(HERE, "scripts", "ad.json")))
F = SCRIPT["formats"][FMT]
HTML = os.path.join(HERE, "ad.html")
FRAMES = os.path.join(HERE, "frames", FMT)
for d in ("renders", "qa", "final", "frames"): os.makedirs(os.path.join(HERE, d), exist_ok=True)

class CDP:
    def __init__(self):
        self.fin = os.path.join(HERE, "renders", f"cdp_in{FMT}.fifo"); self.fout = os.path.join(HERE, "renders", f"cdp_out{FMT}.fifo")
        for f in (self.fin, self.fout):
            if os.path.exists(f): os.remove(f)
            os.mkfifo(f)
        prof = os.path.join(HERE, "renders", f"chrome-profile{FMT}"); shutil.rmtree(prof, ignore_errors=True)
        cmd = (f'exec "{CHROME}" --headless=new --remote-debugging-pipe --disable-gpu --hide-scrollbars --no-sandbox '
               f'--no-first-run --no-default-browser-check --disable-extensions --user-data-dir="{prof}" '
               f'--window-size={F["w"]},{F["h"]} --force-device-scale-factor=1 --allow-file-access-from-files --font-render-hinting=none '
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
    def __init__(self):
        self.c = CDP(); c = self.c
        tid = c.call("Target.createTarget", {"url": "about:blank"})["targetId"]
        self.s = s = c.call("Target.attachToTarget", {"targetId": tid, "flatten": True})["sessionId"]
        c.call("Page.enable", session=s); c.call("Runtime.enable", session=s)
        c.call("Emulation.setDeviceMetricsOverride", {"width": F["w"], "height": F["h"], "deviceScaleFactor": 1, "mobile": False}, session=s)
        c.call("Page.navigate", {"url": "file://" + HTML}, session=s)
        for _ in range(400):
            r = c.call("Runtime.evaluate", {"expression": "document.readyState==='complete' && !!window.ready", "returnByValue": True}, session=s)
            if r.get("result", {}).get("value"): break
            time.sleep(0.05)
        r = self.ev("(async()=>{await window.ready; await init(" + json.dumps(SCRIPT) + "," + json.dumps(FMT) + "); return 'ok';})()", True)
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

def render(times, outdir):
    os.makedirs(outdir, exist_ok=True); pg = Page(); t0 = time.time()
    try:
        warn = pg.ev("JSON.stringify(window.FIT_WARNINGS||[])")
        if warn and warn != "[]": print("FIT WARNINGS:", warn)
        for idx, t in enumerate(times):
            pg.seek(t); name = f"f{idx:04d}.png" if len(times) > 20 else f"t{t:06.2f}.png"; pg.shot(os.path.join(outdir, name))
            if idx % 100 == 0 and len(times) > 20: print(f"frame {idx}/{len(times)} {time.time()-t0:.1f}s", flush=True)
        print(f"rendered {len(times)} frames in {time.time()-t0:.1f}s")
    finally: pg.close()

def qa():
    pg = Page(); fails = []; samples = []; dur = SCRIPT["duration"]
    try:
        warn = json.loads(pg.ev("JSON.stringify(window.FIT_WARNINGS||[])"))
        if warn: fails.append(f"fit warnings: {warn}")
        strings = json.loads(pg.ev("JSON.stringify(window.STRINGS_FULL||[])"))
        with open(os.path.join(HERE, "qa", f"{FMT}_strings.txt"), "w") as fh: fh.write("\n".join(strings) + "\n")
        y0, y1 = F["safe"]; t = 0.0
        while t <= dur + 1e-6:
            pg.seek(t); smp = json.loads(pg.ev("JSON.stringify(window.qaSample())")); samples.append(smp)
            if smp["scenes"] == 0 and not smp["wipe"]: fails.append(f"t={t:.2f}: nothing visible")
            for tx in smp["texts"]:
                if tx["x0"] < 65 - 1 or tx["x1"] > 1015 + 1 or tx["y0"] < y0 - 1 or tx["y1"] > y1 + 1:
                    fails.append(f"t={t:.2f}: '{tx['t'][:40]}' box ({tx['x0']:.0f},{tx['y0']:.0f})-({tx['x1']:.0f},{tx['y1']:.0f}) outside safe x65-1015 y{y0}-{y1}")
            for im in smp["imgs"]:
                if im["scale"] > 1.10 + 1e-3: fails.append(f"t={t:.2f}: {im['photo']} shown at {im['scale']:.3f}x > 1.10")
            t = round(t + 0.1, 3)
        # last 1.5 s must be fully populated and unchanged: compare the text box list at dur-1.5 and dur
        def key(s): return json.dumps([[x["t"], round(x["x0"]), round(x["y0"]), round(x["o"], 1)] for x in s["texts"]])
        last = [s for s in samples if s["t"] >= dur - 1.5 - 1e-6]
        if len({key(s) for s in last}) != 1: fails.append("end card changes during the last 1.5 s")
        if not last or len(last[-1]["texts"]) < 3: fails.append("end card is not fully populated at the end")
        # on-screen strings must match the brief's lines byte for byte
        brief = [l.strip() for l in open(os.path.join(HERE, "scripts", "lines.txt"), encoding="utf-8") if l.strip()]
        missing = [l for l in brief if l not in strings]; extra = [s for s in strings if s not in brief]
        if missing: fails.append(f"brief lines missing on screen: {missing}")
        if extra: fails.append(f"on-screen text not in the brief: {extra}")
    finally: pg.close()
    json.dump({"fails": fails, "samples": samples}, open(os.path.join(HERE, "qa", f"{FMT}_qa.json"), "w"))
    print(f"QA {FMT}: {len(fails)} failures"); [print("  -", f) for f in fails[:40]]
    return 0 if not fails else 1

if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "preview": render([float(x) for x in sys.argv[2:]], os.path.join(HERE, "renders", f"{FMT}_preview"))
    elif mode == "all":
        n = int(round(SCRIPT["duration"] * FPS)); shutil.rmtree(FRAMES, ignore_errors=True); render([i / FPS for i in range(n)], FRAMES)
    elif mode == "qa": sys.exit(qa())
    else: sys.exit(__doc__)
