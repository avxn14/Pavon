#!/usr/bin/env python3
"""preview.py: out/preview.png = the three cards side by side at a common height, labelled."""
import os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H = 960; GAP = 48; PAD = 48; LABEL = 64
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 26)
cards = []
for f, label in [("1x1", "1:1  1080x1080  (feed)"), ("4x5", "4:5  1080x1350  (feed)"), ("9x16", "9:16  1080x1920  (Stories / Reels)")]:
    im = Image.open(os.path.join(HERE, "out", f"card_{f}.png")).convert("RGB")
    w = round(im.width * H / im.height); cards.append((im.resize((w, H), Image.LANCZOS), label, f))
W = PAD * 2 + sum(c[0].width for c in cards) + GAP * (len(cards) - 1)
sheet = Image.new("RGB", (W, PAD + LABEL + H + PAD), (34, 34, 36)); d = ImageDraw.Draw(sheet); x = PAD
for im, label, f in cards:
    d.text((x, PAD + 14), label, font=font, fill=(235, 235, 235)); sheet.paste(im, (x, PAD + LABEL))
    if f == "9x16":  # show the Meta UI zones the text stays out of (top 14%, bottom 20%)
        s = H / 1920; ov = Image.new("RGBA", (im.width, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
        od.rectangle([0, 0, im.width, round(269 * s)], fill=(0, 0, 0, 70)); od.rectangle([0, round(1536 * s), im.width, H], fill=(0, 0, 0, 70))
        sheet.paste(Image.alpha_composite(im.convert("RGBA"), ov).convert("RGB"), (x, PAD + LABEL))
        d.text((x + 10, PAD + LABEL + 8), "top 14% / bottom 20%: no text (shaded)", font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18), fill=(255, 255, 255))
    x += im.width + GAP
out = os.path.join(HERE, "out", "preview.png"); sheet.save(out, optimize=True); print("wrote", out, sheet.size, os.path.getsize(out) // 1024, "KB")
