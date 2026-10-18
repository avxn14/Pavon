#!/usr/bin/env python3
"""audiofix: ffmpeg/numpy port of the Winter Reel's audiofix.swift.
usage: audiofix.py <in> <out.caf> <rate> <maxGapSec> <threshDb>
1) pitch-preserving time stretch by <rate> (ffmpeg rubberband), 2) trim leading/trailing silence,
3) shorten internal silences longer than <maxGapSec> down to <maxGapSec>. Same windowing, pads,
cross-fades and click fades as the Swift tool. All five arguments are required."""
import sys, subprocess, json, numpy as np
if len(sys.argv) < 6: sys.exit("usage: audiofix.py <in> <out.caf> <rate> <maxGapSec> <threshDb>")
inp, outp, rate, maxGap, threshDb = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
pr = json.loads(subprocess.run(["ffprobe","-v","error","-select_streams","a:0","-show_entries","stream=sample_rate,channels","-of","json",inp],capture_output=True,text=True).stdout)["streams"][0]
sr, ch = int(pr["sample_rate"]), int(pr["channels"])
af = f"rubberband=tempo={rate}:pitch=1.0:transients=crisp" if abs(rate-1.0) > 0.001 else "anull"
raw = subprocess.run(["ffmpeg","-v","error","-i",inp,"-af",af,"-f","f32le","-acodec","pcm_f32le","-ac",str(ch),"-ar",str(sr),"-"],capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.float32).reshape(-1, ch).T.copy()   # [ch, n]
n = x.shape[1]; srcDur = None
try:
    srcDur = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",inp],capture_output=True,text=True).stdout.strip())
except Exception: pass
win = int(sr*0.01); nWin = n//win; thresh = 10**(threshDb/20)
seg = x[:, :nWin*win].reshape(ch, nWin, win)
loud = np.sqrt((seg**2).sum(axis=(0,2))/(win*ch)) > thresh
idx = np.flatnonzero(loud)
if idx.size == 0: sys.exit("silent file")
first, last = int(idx[0]), int(idx[-1])
pad = int(0.03*sr); maxGapS = int(maxGap*sr)
segs = []; curStart = max(0, first*win - pad); i = first
while i <= last:
    if not loud[i]:
        j = i
        while j <= last and not loud[j]: j += 1
        if (j-i)*win > maxGapS:
            half = maxGapS//2; segs.append((curStart, i*win+half)); curStart = j*win - half
        i = j
    else: i += 1
segs.append((curStart, min(n, (last+1)*win + pad)))
xf = int(0.01*sr); out = [np.zeros(0, dtype=np.float32) for _ in range(ch)]
for k,(a,b) in enumerate(segs):
    s0, s1 = max(0,a), min(n,b)
    if s1 <= s0: continue
    for c in range(ch):
        if k > 0 and out[c].size >= xf and (s1-s0) > xf:
            base = out[c].size - xf; t = np.arange(xf, dtype=np.float32)/xf
            out[c][base:base+xf] = out[c][base:base+xf]*(1-t) + x[c, s0:s0+xf]*t
            out[c] = np.concatenate([out[c], x[c, s0+xf:s1]])
        else: out[c] = np.concatenate([out[c], x[c, s0:s1]])
fadeN = min(int(0.008*sr), out[0].size//2); g = np.arange(fadeN, dtype=np.float32)/max(1,fadeN)
for c in range(ch): out[c][:fadeN] *= g; out[c][-fadeN:] *= g[::-1]
y = np.stack(out).T.astype(np.float32).tobytes()
r = subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ac",str(ch),"-ar",str(sr),"-i","-","-c:a","pcm_f32le",outp],input=y,capture_output=True)
if r.returncode: sys.exit(r.stderr.decode())
print(f"{inp.split('/')[-1]}: {srcDur:.2f}s -> stretched {n/sr:.2f}s -> final {out[0].size/sr:.2f}s ({len(segs)-1} gaps shortened)")
