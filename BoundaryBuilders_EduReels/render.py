#!/usr/bin/env python3
"""Drive headless Chrome over the DevTools pipe and capture the ad HTML frame by frame.

usage (VID env var selects the variant: "" -> ad.html/plan.json/clips.json, "2" -> script2.json etc.):
  render.py plan                      -> writes plan{VID}.json + clips{VID}.json from audio durations
  render.py preview t1 t2 ...         -> renders the given times into preview/
  render.py all                       -> renders every frame into frames{VID}/
"""
import os, sys, json, subprocess, base64, time, re, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FPS = 30
VID = os.environ.get("VID", "")

DEFAULT_CFG = {
    "html": "ad.html", "prefix": "vo", "music": "music", "hold": 0.0, "lead": 0.10, "tail": 0.15,
    "base": [4.0, 3.0, 3.1, 2.3, 2.2], "skipcap": [],
    "vo": [
        "Winters are the best time to get *competitive pricing* so don't miss out on this *winter deal.*",
        "Boundary Builders metal fencing, just *$220* a panel.",
        "Materials AND installation *included.* And your quote? Completely *FREE.*",
        "This winter pricing *won't last.*",
        "Fill out the *form now* and lock in your spot.",
    ],
    "sfx": [
        {"file": "whoosh", "scene": 1, "offset": -0.28, "vol": 0.55}, {"file": "whoosh", "scene": 4, "offset": -0.28, "vol": 0.55},
        {"file": "whoosh", "scene": 2, "offset": -0.2, "vol": 0.35}, {"file": "whoosh", "scene": 3, "offset": -0.2, "vol": 0.35},
        {"file": "hit", "scene": 1, "offset": 0.6, "vol": 0.7}, {"file": "hit", "scene": 4, "offset": 0.02, "vol": 0.6},
    ],
}
cfg_path = os.path.join(HERE, f"script{VID}.json")
CFG = dict(DEFAULT_CFG); CFG.update(json.load(open(cfg_path))) if os.path.exists(cfg_path) else None
HTML = os.path.join(HERE, CFG["html"]); PLAN = os.path.join(HERE, f"plan{VID}.json"); CLIPS = os.path.join(HERE, f"clips{VID}.json")
FRAMES = os.path.join(HERE, f"frames{VID}")


def audio_duration(path):
    out = subprocess.run(["afinfo", path], capture_output=True, text=True).stdout
    m = re.search(r"estimated duration:\s*([0-9.]+)", out)
    return float(m.group(1)) if m else None


def vo_file(i):
    audio = os.path.join(HERE, "audio")
    for ext in ("caf", "mp3"):
        f = os.path.join(audio, f"{CFG['prefix']}{i+1}.{ext}")
        if os.path.exists(f): return f
    return None


def plan():
    audio = os.path.join(HERE, "audio")
    n = len(CFG["vo"]); lead, tail = CFG["lead"], CFG["tail"]
    durs, starts, scenes, t = [], [], [0.0], 0.0
    for i in range(n):
        f = vo_file(i)
        d = audio_duration(f) if f else None
        if d is None: d = CFG["base"][i] - lead - tail
        durs.append(d)
        length = max(CFG["base"][i], d + lead + tail)
        if i == n - 1: length += CFG["hold"]
        starts.append(t + lead)
        t += length
        scenes.append(round(t, 3))
    total = scenes[-1]
    plan = {"scenes": scenes, "skipcap": CFG["skipcap"],
            "vo": [{"start": round(starts[i], 3), "dur": round(durs[i], 3), "text": CFG["vo"][i]} for i in range(n)]}
    json.dump(plan, open(PLAN, "w"), indent=1)
    clips = []
    for i in range(n):
        f = vo_file(i)
        if f: clips.append({"file": f, "start": starts[i], "volume": 1.0})
    music = os.path.join(audio, CFG["music"] + ".caf")
    if not os.path.exists(music): music = os.path.join(audio, CFG["music"] + ".mp3")
    if os.path.exists(music):
        mdur = audio_duration(music) or total
        clips.append({"file": music, "start": 0.0, "volume": 0.20, "fadeOut": max(0.0, min(total, mdur) - 1.0)})
    for s in CFG["sfx"]:
        f = os.path.join(audio, s["file"] + ".mp3")
        if not os.path.exists(f): continue
        sc = s["scene"]; start = scenes[sc]
        if "frac" in s: start += (scenes[sc + 1] - scenes[sc]) * s["frac"]
        start += s.get("offset", 0.0)
        clips.append({"file": f, "start": max(0.0, start), "volume": s["vol"]})
    json.dump(clips, open(CLIPS, "w"), indent=1)
    print(json.dumps(plan, indent=1)); print("total", total, "s ->", int(round(total * FPS)), "frames")
    return plan


class CDP:
    def __init__(self):
        self.fin = os.path.join(HERE, f"cdp_in{VID}.fifo"); self.fout = os.path.join(HERE, f"cdp_out{VID}.fifo")
        for f in (self.fin, self.fout):
            if os.path.exists(f): os.remove(f)
            os.mkfifo(f)
        prof = os.path.join(HERE, f"chrome-profile{VID}"); shutil.rmtree(prof, ignore_errors=True)
        cmd = (f'exec "{CHROME}" --headless=new --remote-debugging-pipe --disable-gpu --hide-scrollbars '
               f'--no-first-run --no-default-browser-check --disable-extensions --user-data-dir="{prof}" '
               f'--window-size=1080,1920 --force-device-scale-factor=1 --allow-file-access-from-files '
               f'about:blank 3<"{self.fin}" 4>"{self.fout}"')
        self.p = subprocess.Popen(["bash", "-c", cmd], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.w = open(self.fin, "wb", buffering=0)
        self.r = open(self.fout, "rb", buffering=0)
        self.buf = b""; self.mid = 0

    def send(self, method, params=None, session=None):
        self.mid += 1
        m = {"id": self.mid, "method": method, "params": params or {}}
        if session: m["sessionId"] = session
        self.w.write(json.dumps(m).encode() + b"\0"); return self.mid

    def recv(self, timeout=40.0):
        import select
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


def render(times, outdir, plan_obj):
    os.makedirs(outdir, exist_ok=True)
    c = CDP()
    try:
        tid = c.call("Target.createTarget", {"url": "about:blank"})["targetId"]
        s = c.call("Target.attachToTarget", {"targetId": tid, "flatten": True})["sessionId"]
        c.call("Page.enable", session=s); c.call("Runtime.enable", session=s)
        c.call("Emulation.setDeviceMetricsOverride", {"width": 1080, "height": 1920, "deviceScaleFactor": 1, "mobile": False}, session=s)
        c.call("Page.navigate", {"url": "file://" + HTML}, session=s)
        for _ in range(200):
            r = c.call("Runtime.evaluate", {"expression": "document.readyState==='complete' && !!window.ready", "returnByValue": True}, session=s)
            if r.get("result", {}).get("value"): break
            time.sleep(0.05)
        r = c.call("Runtime.evaluate", {"expression": "(async()=>{await window.ready; init(" + json.dumps(plan_obj) + "); return 'ok';})()", "awaitPromise": True, "returnByValue": True}, session=s)
        assert r.get("result", {}).get("value") == "ok", r
        t_start = time.time()
        for idx, t in enumerate(times):
            expr = ("(async()=>{seek(%f); await Promise.race([new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))), new Promise(r=>setTimeout(r,120))]); return 1;})()" % t)
            c.call("Runtime.evaluate", {"expression": expr, "awaitPromise": True, "returnByValue": True}, session=s)
            shot = c.call("Page.captureScreenshot", {"format": "png", "optimizeForSpeed": True}, session=s)
            name = f"f{idx:04d}.png" if len(times) > 20 else f"t{t:06.2f}.png"
            with open(os.path.join(outdir, name), "wb") as fh: fh.write(base64.b64decode(shot["data"]))
            if idx % 50 == 0 and len(times) > 20:
                print(f"frame {idx}/{len(times)} {time.time()-t_start:.1f}s", flush=True)
        print(f"rendered {len(times)} frames in {time.time()-t_start:.1f}s")
    finally:
        c.close()


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "plan":
        plan(); sys.exit(0)
    plan_obj = json.load(open(PLAN))
    if mode == "preview":
        times = [float(x) for x in sys.argv[2:]]
        out = os.path.join(HERE, f"preview{VID}"); shutil.rmtree(out, ignore_errors=True)
        render(times, out, plan_obj)
    elif mode == "all":
        total = plan_obj["scenes"][-1]
        n = int(round(total * FPS))
        shutil.rmtree(FRAMES, ignore_errors=True)
        render([i / FPS for i in range(n)], FRAMES, plan_obj)
