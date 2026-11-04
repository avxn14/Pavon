#!/usr/bin/env python3
"""tools_preview.py <cover.png> <out.png>: how the cover will look. Top: desktop (the central 1640x624 band, shown at 820x312 with the
page's round profile picture and the Edit button area indicated). Bottom: mobile (whole 16:9 image at 640x360)."""
import sys
from PIL import Image, ImageDraw, ImageFont
src=Image.open(sys.argv[1]).convert('RGB'); assert src.size==(1640,924), src.size
desk=src.crop((0,150,1640,774)).resize((820,312),Image.LANCZOS)
mob=src.resize((640,360),Image.LANCZOS)
W=900; out=Image.new('RGB',(W,312+40+360+140),(240,242,245)); d=ImageDraw.Draw(out)
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',16); f2=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
d.text((40,12),"Desktop: Facebook shows the middle band of the image at 820x312",font=f,fill=(40,40,40))
out.paste(desk,(40,40))
# profile picture position (new Pages layout: below the cover, overlapping its bottom-left corner slightly)
d.ellipse((40+16,40+312-70,40+16+150,40+312+80),fill=(255,255,255)); d.ellipse((40+22,40+312-64,40+22+138,40+312+74),fill=(20,20,20))
d.text((40+45,40+312-20),"profile\npicture",font=f2,fill=(230,230,230))
d.rounded_rectangle((40+820-175,40+312-44,40+820-12,40+312-12),radius=6,outline=(255,255,255),width=2); d.text((40+820-160,40+312-37),"Edit cover photo",font=f2,fill=(255,255,255))
d.text((40,40+312+100),"Mobile: the whole image shows at 640x360",font=f,fill=(40,40,40))
out.paste(mob,(40,40+312+128))
out.save(sys.argv[2]); print('wrote',sys.argv[2])
