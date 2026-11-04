#!/usr/bin/env python3
"""storyboard_sheet.py <mapping.json> <out.jpg>
Contact sheet for the owner's approval: one column per scene, the chosen crop at the top, the exact on-screen text under it.
mapping.json = [{"scene":1,"time":"0-3 s","photo":"3.jpg"|null,"crop":[x0,y0,x1,y1]|null,"move":"...","text":["WINTER SALE","..."],"note":"..."}]
Only format/downscale operations on the photos (no edits), per the owner's rules."""
import json, sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mapping = json.load(open(sys.argv[1])); out = sys.argv[2]
W, PH, TH, PAD = 560, 420, 300, 24
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"; FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
def font(sz, bold=True):
    try: return ImageFont.truetype(FONT_B if bold else FONT_R, sz)
    except Exception: return ImageFont.load_default()
def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines
cols = len(mapping); sheet = Image.new("RGB", (PAD + cols * (W + PAD), PAD + PH + TH + PAD), (12, 12, 14)); d = ImageDraw.Draw(sheet)
GOLD = (255, 197, 39); WHITE = (249, 249, 249); GREY = (170, 170, 170)
for i, s in enumerate(mapping):
    x0 = PAD + i * (W + PAD); y0 = PAD
    if s.get("photo"):
        im = Image.open(os.path.join(ROOT, "photos", "src", s["photo"])).convert("RGB")
        if s.get("crop"): im = im.crop(tuple(s["crop"]))
        # fit the crop inside W x PH over a dark blurred copy (the same look the video band uses)
        fill = im.resize((W, PH)).filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.45))
        r = min(W / im.width, PH / im.height); band = im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)
        fill.paste(band, ((W - band.width) // 2, (PH - band.height) // 2)); sheet.paste(fill, (x0, y0))
    else:
        d.rectangle([x0, y0, x0 + W, y0 + PH], fill=(2, 1, 1))
        logo = Image.open(os.path.join(ROOT, "logo_gold.png")).convert("RGBA"); lw = 340; logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
        sheet.paste(logo, (x0 + (W - lw) // 2, y0 + PH // 2 - logo.height // 2 - 10), logo)
    d.rectangle([x0, y0, x0 + W - 1, y0 + PH - 1], outline=(60, 60, 64), width=2)
    tag = f"SCENE {s['scene']}  {s.get('time','')}"
    d.rectangle([x0 + 12, y0 + 12, x0 + 12 + d.textlength(tag, font=font(22)) + 20, y0 + 46], fill=GOLD)
    d.text((x0 + 22, y0 + 17), tag, font=font(22), fill=(17, 17, 17))
    ty = y0 + PH + 16
    src = f"Photo: {s['photo'] or 'none (dark background + gold logo)'}" + (f"   crop x{s['crop'][0]}-{s['crop'][2]}, y{s['crop'][1]}-{s['crop'][3]}" if s.get("crop") else "")
    for ln in wrap(d, src, font(17, False), W - 20): d.text((x0 + 10, ty), ln, font=font(17, False), fill=GREY); ty += 22
    for ln in wrap(d, "Move: " + s.get("move", ""), font(17, False), W - 20): d.text((x0 + 10, ty), ln, font=font(17, False), fill=GREY); ty += 22
    ty += 8
    for t in s.get("text", []):
        for ln in wrap(d, t, font(30), W - 20): d.text((x0 + 10, ty), ln, font=font(30), fill=GOLD if t.isupper() else WHITE); ty += 38
    if s.get("note"):
        ty += 6
        for ln in wrap(d, s["note"], font(17, False), W - 20): d.text((x0 + 10, ty), ln, font=font(17, False), fill=(255, 160, 120)); ty += 22
sheet.save(out, quality=90); print("wrote", out, sheet.size)
