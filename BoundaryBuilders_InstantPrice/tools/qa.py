#!/usr/bin/env python3
"""qa.py: checks out/card_<f>.png + out/card_<f>.json against the brief.
exact size; PNG < 1 MB; strings byte-equal to lines.txt; text area < 25%; 9:16 text inside y 269-1536 (top 14% / bottom 20%);
phone + card inside the canvas; background sampled at the four corners is #F5C400."""
import os, sys, json
from PIL import Image
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIZES = {"1x1": (1080, 1080), "4x5": (1080, 1350), "9x16": (1080, 1920)}
SAFE = {"9x16": (269, 1536)}
lines = [l.rstrip("\n") for l in open(os.path.join(HERE, "lines.txt"), encoding="utf-8") if l.strip()]
fails = []
for f, (w, h) in SIZES.items():
    png = os.path.join(HERE, "out", f"card_{f}.png"); js = os.path.join(HERE, "out", f"card_{f}.json")
    if not (os.path.exists(png) and os.path.exists(js)): fails.append(f"{f}: not rendered"); continue
    im = Image.open(png); L = json.load(open(js))
    if im.size != (w, h): fails.append(f"{f}: size {im.size} != {(w, h)}")
    if im.mode not in ("RGB", "RGBA"): fails.append(f"{f}: mode {im.mode}")
    sz = os.path.getsize(png)
    if sz >= 1_000_000: fails.append(f"{f}: {sz} bytes >= 1 MB")
    if L["strings"] != lines: fails.append(f"{f}: strings differ: {L['strings']} vs {lines}")
    if L["textAreaPct"] >= 25: fails.append(f"{f}: text area {L['textAreaPct']}% >= 25%")
    y0, y1 = SAFE.get(f, (0, h))
    for t in L["texts"]:
        x0, ty0, x1, ty1 = t["box"]
        if x0 < 0 or x1 > w or ty0 < y0 or ty1 > y1: fails.append(f"{f}: {t['id']} box {t['box']} outside x0-{w} y{y0}-{y1}")
    for k in ("phone", "card"):
        x0, by0, x1, by1 = L[k]
        if x0 < 0 or by0 < 0 or x1 > w or by1 > h: fails.append(f"{f}: {k} {L[k]} outside the canvas")
    px = im.convert("RGB"); px.load()
    for y in list(range(0, 3)) + list(range(h - 3, h)):
        bad = [x for x in range(0, w, 2) if max(abs(a - b) for a, b in zip(px.getpixel((x, y)), (0xF5, 0xC4, 0x00))) > 2]
        if bad: fails.append(f"{f}: row {y} not clean background at x={bad[0]}..{bad[-1]} (shadow or element bleeds off the edge)")
    for (x, y) in [(5, 5), (w - 6, 5), (5, h - 6), (w - 6, h - 6)]:
        if px.getpixel((x, y)) != (0xF5, 0xC4, 0x00): fails.append(f"{f}: corner {(x, y)} is {px.getpixel((x, y))}, not #F5C400")
    print(f"{f}: {w}x{h} {sz/1024:.0f} KB text {L['textAreaPct']}% phone {L['phone']} card {L['card']}")
print(f"QA: {len(fails)} failures"); [print("  -", x) for x in fails]
sys.exit(1 if fails else 0)
