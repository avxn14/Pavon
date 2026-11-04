#!/usr/bin/env python3
"""sheet.py <out.png> <frame.png>...   contact sheet of 1080x1920 frames, 4 per row at 405x720, file name under each."""
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
W, H, PAD = 405, 720, 26; cols = 4; rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * W, rows * (H + PAD)), (30, 30, 30)); d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((W, H), Image.LANCZOS); x, y = (i % cols) * W, (i // cols) * (H + PAD)
    sheet.paste(im, (x, y)); d.text((x + 6, y + H + 6), f.split('/')[-1], fill=(255, 197, 39))
sheet.save(out); print('wrote', out, len(files), 'frames')
