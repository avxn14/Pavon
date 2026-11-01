#!/usr/bin/env python3
"""prep.py: exact-pixel crops (sRGB) and small blurred-fill sources from scripts/winter.json 'crops'. Format-only operations."""
import json, io, os
from PIL import Image, ImageCms
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); S=json.load(open(os.path.join(ROOT,'scripts','winter.json')))
os.makedirs(os.path.join(ROOT,'photos','crops'),exist_ok=True); os.makedirs(os.path.join(ROOT,'photos','fills'),exist_ok=True); srgb=ImageCms.createProfile('sRGB')
for k,(src,box) in S['crops'].items():
    im=Image.open(os.path.join(ROOT,'photos','src',src)); icc=im.info.get('icc_profile'); note=''
    if icc:
        p=ImageCms.ImageCmsProfile(io.BytesIO(icc)); d=ImageCms.getProfileDescription(p).strip()
        if 'sRGB' not in d: im=ImageCms.profileToProfile(im,p,srgb,outputMode='RGB'); note='from '+d
    im=im.convert('RGB'); c=im.crop(tuple(box)); c.save(os.path.join(ROOT,'photos','crops',f'{k}.jpg'),quality=95,subsampling=0)
    f=im.copy(); f.thumbnail((720,720)); f.save(os.path.join(ROOT,'photos','fills',f'{k}.jpg'),quality=90)
    print(f"{k}: {src} {box} -> {c.size} ratio {c.width/c.height:.3f} band scale {1080/c.width:.3f} {note}")
