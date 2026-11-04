#!/usr/bin/env python3
"""build_demo.py: turn the raw capture into public/demo/demo.mp4 (860x1864, 30 fps).
Edit: trims the waits after each tap, plays typing at 2x and the 'working out your price' animation faster, keeps every tap
and step transition at 1x, CUTS the frames where the placeholder contact details are typed (contact:shown+hold .. result:clean),
puts `lead` seconds of the first frame up front and holds the final screen to `hold_to`. The result screen lands at exactly
`landing` seconds into the file (the trim speed is solved for that). Writes capture/demo_meta.json."""
import os, sys, json, subprocess, shutil, bisect
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); CAP = os.path.join(HERE, "capture"); FPS = 30
landing = float(sys.argv[1]) if len(sys.argv) > 1 else 12.6; lead = 1.0; hold_to = 31.0; keep_tap = 0.45; keep_next = 0.62; contact_hold = 0.55
fr = json.load(open(os.path.join(CAP, "frames.json"))); ev = json.load(open(os.path.join(CAP, "events.json"))); PJ = json.load(open(os.path.join(CAP, "price.json"))); T0 = PJ["T0"]
ts = [t - T0 for t, _ in fr]; names = [f for _, f in fr]
# the result pane fades in after the DOM says it is visible: the landing is the first captured frame after result:clean whose
# price box holds dark ink (the "working out your price" screen is blank there)
from PIL import Image
pr = PJ["price"]; box = (int(pr["x"]), int(pr["y"]), int(pr["x"] + pr["w"]), int(pr["y"] + pr["h"]))
ev["landing"] = ev["result:clean"]
for t, f in zip(ts, names):
    if t < ev["result:clean"]: continue
    g = Image.open(os.path.join(CAP, "raw", f)).convert("L").crop(box)
    if sum(1 for v in g.getdata() if v < 110) > 40: ev["landing"] = t; break
print(f"result pane visible at {ev['landing']:.3f}s (DOM said {ev['result:clean']:.3f}s)")
def frame_at(t):
    i = bisect.bisect_right(ts, t) - 1; return names[max(0, i)]
order = ["pick:Fence", "next:Fence", "pick:Metal", "next:Metal", "pick:Black", "next:Black", "pick:No gate", "next:No gate", "type:start", "type:end", "next:measure", "pick:clear", "next:extras", "contact:shown"]
def segments(trim):
    """[(src_start, src_end, speed)] in source time; speed>1 = faster."""
    seg = [(0.0, ev["pick:Fence"], trim)]                                   # idle before the first tap: trimmed
    for a, b in zip(order, order[1:]):
        t0, t1 = ev[a], ev[b]
        if a == "type:start": seg.append((t0, t1, 2.0)); continue           # typing 2x
        keep = keep_tap if a.startswith("pick") else keep_next
        if a == "type:end": keep = 0.35
        k = min(keep, t1 - t0); seg.append((t0, t0 + k, 1.0))
        if t1 - t0 > k: seg.append((t0 + k, t1, trim))                       # the wait after it: trimmed
    seg.append((ev["contact:shown"], ev["contact:shown"] + contact_hold, 1.0))  # empty form glimpse
    # CUT: contact:shown+hold .. result:clean (typing of placeholder details, submit, 'working out your price' is partly kept below)
    seg.append((ev["calc:visible"] + 0.05, ev["result:visible"], 1.5))      # working-out animation at 1.5x
    seg.append((ev["result:clean"], ev["landing"], 1.5))                    # result pane fading in
    seg.append((ev["landing"], ev["end"], 1.0))                             # price visible: count-up and settle at 1x
    return seg
def out_len(seg): return sum((b - a) / s for a, b, s in seg)
def landing_time(seg):
    t = 0.0
    for a, b, s in seg:
        if abs(a - ev["landing"]) < 1e-9: return t
        t += (b - a) / s
    return t
lo, hi = 1.0, 40.0
for _ in range(60):                                                          # solve the trim speed so the result lands at `landing`
    mid = (lo + hi) / 2; lt = lead + landing_time(segments(mid))
    if lt > landing: lo = mid
    else: hi = mid
trim = (lo + hi) / 2; seg = segments(trim); lt = lead + landing_time(seg)
print(f"trim speed {trim:.2f}x, result lands at {lt:.3f}s (target {landing}), flow ends at {lead + out_len(seg):.2f}s, file to {hold_to}s")
# output frames
OUT = os.path.join(CAP, "out"); shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
n_total = int(round(hold_to * FPS)); last_src = ev["end"]; written = 0
def src_time_at(t_out):
    if t_out < lead: return 0.0
    t = t_out - lead
    for a, b, s in seg:
        d = (b - a) / s
        if t <= d: return a + t * s
        t -= d
    return last_src
cut_lo = ev["contact:shown"] + contact_hold
for i in range(n_total):
    st = src_time_at(i / FPS)
    if cut_lo <= st < ev["calc:visible"] + 0.05: st = cut_lo - 0.001          # never show the filled form
    f = frame_at(st); os.symlink(os.path.join(CAP, "raw", f), os.path.join(OUT, f"{i:05d}.png")); written += 1
mp4 = os.path.join(HERE, "public", "demo", "demo.mp4")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", os.path.join(OUT, "%05d.png"), "-c:v", "libx264", "-preset", "slow", "-crf", "16",
                "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-tune", "stillimage", mp4], check=True)
price = json.load(open(os.path.join(CAP, "price.json")))["price"]
meta = {"fps": FPS, "frames": written, "landing": round(lt, 3), "flow_end": round(lead + out_len(seg), 3), "trim_speed": round(trim, 2), "size": [860, 1864],
        "price_rect": price, "price_focus": [round((price["x"] + price["w"] / 2) / 860, 4), round((price["y"] + price["h"] / 2) / 1864, 4)], "price_text": price["text"]}
json.dump(meta, open(os.path.join(CAP, "demo_meta.json"), "w"), indent=1); print(json.dumps(meta))
print("wrote", mp4, os.path.getsize(mp4) // 1024, "KB")
