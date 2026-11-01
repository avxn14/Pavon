#!/usr/bin/env python3
"""sheet3x6.py <stillsDir> <out.png>: 3 rows x 6 columns of frames taken at 1-second intervals (t = 1..18 s), labelled."""
import sys, glob, os
from PIL import Image, ImageDraw, ImageFont
d, out = sys.argv[1], sys.argv[2]; files = sorted(glob.glob(os.path.join(d, 't*.png')))[:18]
ims = [Image.open(f).convert('RGB') for f in files]; w, h = ims[0].size; TW = 360; TH = round(h * TW / w); COLS, ROWS, PAD, LAB = 6, 3, 12, 30
sheet = Image.new('RGB', (PAD + COLS * (TW + PAD), PAD + ROWS * (TH + LAB + PAD)), (26, 26, 26)); dr = ImageDraw.Draw(sheet)
f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
for i, (fn, im) in enumerate(zip(files, ims)):
    x = PAD + (i % COLS) * (TW + PAD); y = PAD + (i // COLS) * (TH + LAB + PAD)
    sheet.paste(im.resize((TW, TH), Image.LANCZOS), (x, y)); t = os.path.basename(fn)[1:-4]
    dr.text((x, y + TH + 6), f"t = {float(t):.0f} s", font=f, fill=(245, 196, 0))
sheet.save(out); print('wrote', out, sheet.size, len(ims), 'frames')
