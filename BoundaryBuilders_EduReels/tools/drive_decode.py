#!/usr/bin/env python3
"""drive_decode.py <saved_tool_result.txt> [...]: decode Drive download JSON {content: base64, id, mimeType, title} into
photos/raw/<id>.<ext>, an upright sRGB JPEG photos/jpg/<id>.jpg (EXIF orientation applied, ICC converted; original JPEG bytes kept
when no conversion is needed) and a 640 px viewing copy photos/view/<id>.jpg. Only format / sRGB / orientation; never resamples
unless MAXSIDE=<px> is set (plain downscale for huge files, per the brief). Prints id, title, format, WxH."""
import json, base64, sys, os, io
from PIL import Image, ImageOps, ImageCms
try:
    import pillow_heif; pillow_heif.register_heif_opener()
except Exception: pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for d in ("photos/raw", "photos/jpg", "photos/view"): os.makedirs(os.path.join(ROOT, d), exist_ok=True)
srgb = ImageCms.createProfile('sRGB'); maxside = int(os.environ.get("MAXSIDE", "0") or 0)
for f in sys.argv[1:]:
    d = json.load(open(f)); fid = d['id']; raw = base64.b64decode(d['content']); title = d.get('title', '')
    im = Image.open(io.BytesIO(raw)); fmt = im.format
    ext = {'JPEG': 'jpg', 'PNG': 'png', 'HEIF': 'heic', 'MPO': 'jpg'}.get(fmt, (fmt or 'bin').lower())
    open(os.path.join(ROOT, f'photos/raw/{fid}.{ext}'), 'wb').write(raw)
    im2 = ImageOps.exif_transpose(im); rotated = im2.size != im.size or im2 is not im
    icc = im.info.get('icc_profile'); note = ''
    if icc:
        try: im2 = ImageCms.profileToProfile(im2, ImageCms.ImageCmsProfile(io.BytesIO(icc)), srgb, outputMode='RGB'); note = ' icc->sRGB'
        except Exception as e: im2 = im2.convert('RGB'); note = f' icc-fail'
    else: im2 = im2.convert('RGB')
    if maxside and max(im2.size) > maxside: im2.thumbnail((maxside, maxside), Image.LANCZOS); note += f' downscaled to {im2.size[0]}x{im2.size[1]}'
    w, h = im2.size; outp = os.path.join(ROOT, f'photos/jpg/{fid}.jpg')
    if fmt == 'JPEG' and not note and not rotated: open(outp, 'wb').write(raw)
    else: im2.save(outp, quality=95, subsampling=0)
    v = im2.copy(); v.thumbnail((640, 640)); v.save(os.path.join(ROOT, f'photos/view/{fid}.jpg'), quality=85)
    print(f'{fid}  {title}  {fmt}  {w}x{h}  raw {len(raw)//1024} KB{note}')
