#!/usr/bin/env python3
"""bandgrid.py <photo> <layout band|full> <pos "px% py%"> <kbscale> <dx> <dy> <out.png> [bandW bandH]
Shows the region of a photo that edu.html would show (cover-fit box aligned by pos, Ken Burns scale about the box centre, pan dx/dy)
with a grid every 100 px labelled in BAND coordinates (band layout: y from the band top) or FRAME coordinates (full layout).
Use it to place callouts (rings, arrows, dimension ticks) and to check what a crop shows. Output is at 50%."""
import sys
from PIL import Image, ImageDraw
p = Image.open(sys.argv[1]); layout = sys.argv[2]; px, py = [float(v.strip('%')) / 100 for v in sys.argv[3].split()]
k = float(sys.argv[4]); dx = float(sys.argv[5]); dy = float(sys.argv[6]); out = sys.argv[7]
if layout == 'full': fw, fh = 1080, 1920
else:
    fw = int(sys.argv[8]) if len(sys.argv) > 8 else 1080; fh = int(sys.argv[9]) if len(sys.argv) > 9 else (782 if len(sys.argv) <= 8 else min(782, round(fw * p.height / p.width)))
pw, ph = p.size; s0 = max(fw / pw, fh / ph); bw0, bh0 = pw * s0, ph * s0
L, T = (fw - bw0) * px, (fh - bh0) * py; cx, cy = L + bw0 / 2, T + bh0 / 2
w, h = bw0 * k, bh0 * k; left, top = cx - w / 2 + dx, cy - h / 2 + dy; s = s0 * k
crop = ((0 - left) / s, (0 - top) / s, (fw - left) / s, (fh - top) / s)
print(f"cover scale {s0:.4f} eff {s:.4f} box {w:.0f}x{h:.0f} left {left:.0f} top {top:.0f} photo crop {tuple(round(c) for c in crop)}")
reg = p.crop(tuple(round(c) for c in crop)).resize((fw, fh), Image.LANCZOS)
d = ImageDraw.Draw(reg)
for x in range(0, fw + 1, 100): d.line([(x, 0), (x, fh)], fill=(255, 197, 39), width=1); d.text((x + 3, 3), str(x), fill=(255, 197, 39))
for y in range(0, fh + 1, 100): d.line([(0, y), (fw, y)], fill=(255, 197, 39), width=1); d.text((3, y + 3), str(y), fill=(255, 197, 39))
if layout != 'full' and (fw != 1080 or fh != 782):
    # short/narrow band: note the band's offset inside the band area
    print(f"band offset in frame: left {round((1080 - fw) / 2)} top {330 + round((782 - fh) / 2)}")
reg.resize((fw // 2, fh // 2), Image.LANCZOS).save(out); print("wrote", out)
