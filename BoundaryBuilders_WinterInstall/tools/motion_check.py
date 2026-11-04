#!/usr/bin/env python3
"""motion_check.py <framesDir> <bandTop> <bandH> [t_end]: counts consecutive frames whose photo band is identical (a frozen move)
and prints the mean per-frame change inside the band. Reads the rendered PNG frames before encoding."""
import sys, glob, numpy as np
from PIL import Image
d, top, h = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); tend = float(sys.argv[4]) if len(sys.argv) > 4 else 14.0
files = sorted(glob.glob(d + "/f*.png"))[: int(tend * 30)]
prev = None; same = 0; diffs = []
for f in files:
    a = np.asarray(Image.open(f).convert("L"), dtype=np.int16)[top:top + h]
    if prev is not None:
        dd = float(np.abs(a - prev).mean()); diffs.append(dd)
        if dd < 1e-6: same += 1
    prev = a
print(f"{d}: {len(files)} frames, {same} identical-band consecutive pairs, mean change {np.mean(diffs):.2f}, min {np.min(diffs):.3f}")
