#!/usr/bin/env python3
"""Boundary Builders ad set, template v3 ("photo first"): the fence fills the frame, a compact frosted-glass panel carries
the words, a small pill button is the call to action. Softer, image-led, Stories-safe.
    python3 build_v3.py [f06|f07|f08|all] [--final]   -> out/v3/*.png, out/v3/preview_contact_sheet.png, out/v3/qa.md"""
import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import build_ads as B
from build_ads import Canvas, cover, load, wrap, font, sub, CH, WH, YE, CFG, MAX_TEXT_PCT, MIN_FONT, MIN_CONTRAST, MAX_BYTES, save_png

V = CFG["v3"]; INK = (0x1A, 0x1A, 0x1A); INK2 = (0x4A, 0x4A, 0x4A)
OUT = "out/v3"; os.makedirs(OUT + "/final", exist_ok=True)

# ---------- v3 drawing helpers ----------
def frosted(cv, box, radius=36, white=0.84, blur=34):
    """frosted-glass panel: the photo under the box, blurred and lifted towards white, with a soft shadow and a hairline"""
    x0, y0, x1, y1 = box; cv.shadow(box, radius, blur=36, offset=(0, 22), alpha=80)
    reg = cv.im.crop(box).filter(ImageFilter.GaussianBlur(blur)); reg = Image.blend(reg, Image.new("RGB", reg.size, WH), white)
    cv.paste_rounded(reg, (x0, y0), radius)
    ov = Image.new("RGBA", cv.im.size, (0, 0, 0, 0)); ImageDraw.Draw(ov).rounded_rectangle(box, radius=radius, outline=(255, 255, 255, 170), width=2)
    cv.im = Image.alpha_composite(cv.im.convert("RGBA"), ov).convert("RGB")
def blur_fill(cv, photo, focal):
    """background for tall frames: the same photo blown up, blurred and darkened; the sharp photo sits on top"""
    bg = cover(photo, cv.w, cv.h, focal).filter(ImageFilter.GaussianBlur(40)); cv.im = ImageEnhance.Brightness(bg).enhance(0.55)
def kicker(cv, xy, text, fnt, color=INK):
    """small yellow square + caps label"""
    x, y = xy; s = int(fnt.size * 0.55); cv.d.rounded_rectangle((x, y + (fnt.size - s) // 2 + 2, x + s, y + (fnt.size - s) // 2 + 2 + s), radius=6, fill=YE)
    return cv.text((x + s + 16, y), text, fnt, color, anchor="la", spacing=3)
def cta(cv, xy, text, fnt, bg=YE, fg=INK, padx=36, pady=22, arrow=True):
    """compact pill button with a drawn arrow"""
    d = cv.d; tw = d.textlength(text, font=fnt); aw = int(fnt.size * 0.9) + 18 if arrow else 0
    w = int(tw + aw + 2 * padx); h = int(fnt.size * 1.15 + 2 * pady); x, y = xy; box = (x, y, x + w, y + h)
    cv.shadow(box, h // 2, blur=18, offset=(0, 10), alpha=60); d = cv.d; d.rounded_rectangle(box, radius=h // 2, fill=bg)
    tb = d.textbbox((x + padx, y + h / 2), text, font=fnt, anchor="lm"); d.text((x + padx, y + h / 2), text, font=fnt, fill=fg, anchor="lm")
    cv.boxes.append(tb); cv.fonts.append(fnt.size); cv.contrasts.append(B.contrast(B.lum(fg), B.lum(bg)))
    if arrow:
        ax = x + padx + tw + 18; cy = y + h / 2; L = int(fnt.size * 0.8); lw = max(4, fnt.size // 11)
        d.line([(ax, cy), (ax + L, cy)], fill=fg, width=lw); d.line([(ax + L - L * 0.38, cy - L * 0.38), (ax + L, cy), (ax + L - L * 0.38, cy + L * 0.38)], fill=fg, width=lw, joint="curve")
    return box
def logo(cv, xy, width=140):
    lg = Image.open(CFG["logo"]).convert("RGBA"); lg = lg.resize((width, round(lg.height * width / lg.width)), Image.LANCZOS)
    cv.im.paste(lg, xy, lg); cv.boxes.append((xy[0], xy[1], xy[0] + lg.width, xy[1] + lg.height)); cv.fonts.append(999); cv.contrasts.append(99)
def price_row(cv, x, y_base, big, big_px, rest, rest_px, color=INK):
    fb, fr = font("heavy", big_px), font("bold", rest_px); cv.text((x, y_base), big, fb, color, anchor="ls")
    w = cv.d.textlength(big, font=fb); cv.text((x + w + 14, y_base), rest, fr, color, anchor="ls")

# ---------- creatives ----------
def f06(size):
    W, H = CFG["sizes"][size]; cfg = V["f06"]; T = cfg["text"]; is916 = size == "9x16"; M = 48; P = 44
    photo = load(cfg["hero"]); cv = Canvas(W, H)
    hl = {"1x1": 56, "4x5": 62, "9x16": 62}[size]; big = {"1x1": 72, "4x5": 80, "9x16": 80}[size]
    d = cv.d; fh = font("heavy", hl); cw = W - 2 * M; lines = wrap(d, T["headline"], fh, cw - 2 * P); lh = int(hl * 1.06)
    inner = 44 + 22 + len(lines) * lh + 16 + big + 18 + 44 + 26 + int(44 * 1.15 + 44); ph = inner + 2 * P
    if is916:
        blur_fill(cv, photo, cfg["focal"][size]); top = int(H * 0.14) + 40; pb = int(H * 0.80) - M; pt = pb - ph
        sh = pt + 120 - top; sharp = cover(photo, W - 2 * M, sh, cfg["focal"][size]); cv.shadow((M, top, W - M, top + sh), 32, blur=30, offset=(0, 18), alpha=90); cv.paste_rounded(sharp, (M, top), 32)
        logo(cv, (M + 28, top + 28), 130)
    else:
        cv.im = cover(photo, W, H, cfg["focal"][size]); pb = H - M; pt = pb - ph; logo(cv, (M, M), 140)
    frosted(cv, (M, pt, W - M, pb))
    x = M + P; y = pt + P
    kicker(cv, (x, y), T["tag"], font("bold", 44)); y += 44 + 22
    for i, l in enumerate(lines): cv.text((x, y + i * lh), l, fh, INK, anchor="la")
    y += len(lines) * lh + 16 + big; price_row(cv, x, y, T["price_big"], big, T["price_rest"], 44); y += 18 + 44
    cv.text((x, y), sub(T["small"]), font("bold", 44), INK2, anchor="ls"); y += 26
    cta(cv, (x, y), T["cta"], font("bold", 44))
    return cv

def f07(size):
    W, H = CFG["sizes"][size]; cfg = V["f07"]; T = cfg["text"]; is916 = size == "9x16"; P = 56
    cv = Canvas(W, H, bg=YE); d = cv.d
    y = int(H * 0.14) + 40 if is916 else 60
    hl = {"1x1": 58, "4x5": 64, "9x16": 64}[size]; fh = font("heavy", hl); lines = wrap(d, T["headline"], fh, W - 2 * P - 190); lh = int(hl * 1.06)
    logo(cv, (W - P - 150, y + 2), 150)
    for i, l in enumerate(lines): cv.text((P, y + i * lh), l, fh, INK, anchor="la")
    y += len(lines) * lh + 12; cv.text((P, y), T["medium"], font("bold", 44), INK, anchor="la"); y += 44 + 34
    # scene: a big fence photo card; the phone stands in front of its left side; the price lives under the card on the right
    bottom = int(H * 0.80) if is916 else H
    ch = {"1x1": 440, "4x5": 600, "9x16": 640}[size]; cx0, cx1 = P, W - P
    cv.shadow((cx0, y, cx1, y + ch), 36, blur=30, offset=(0, 18), alpha=70); cv.paste_rounded(cover(load(cfg["photo"]), cx1 - cx0, ch, cfg["photo_focal"]), (cx0, y), 36)
    pw = {"1x1": 380, "4x5": 420, "9x16": 420}[size]; sw = pw - 28; shot = load(cfg["screenshot"]); sh_full = round(sw * shot.height / shot.width)
    px, py = cx0 + 44, y + 56; ph_h = min(sh_full + 28, (bottom - py) if is916 else (H - py + 140))
    cv.shadow((px, py, px + pw, py + ph_h), 52, blur=34, offset=(0, 24), alpha=110); cv.d.rounded_rectangle((px, py, px + pw, py + ph_h), radius=52, fill=WH)
    cv.paste_rounded(shot.resize((sw, sh_full), Image.LANCZOS).crop((0, 0, sw, min(sh_full, ph_h - 28))), (px + 14, py + 14), 40)
    rx = px + pw + 40; ry = y + ch + 34; fp = font("bold", 44); parts = T["pill"].split(" · ")
    pb = cv.pill((rx, ry), parts, fp, INK, YE, padx=28, pady=18, radius=30); yy = pb[3] + 20
    fs = font("bold", 44); sl = wrap(d, sub(T["small"]), fs, W - P - rx)
    for i, l in enumerate(sl): cv.text((rx, yy + i * int(44 * 1.15)), l, fs, INK, anchor="la")
    return cv

def f08(size):
    W, H = CFG["sizes"][size]; cfg = V["f08"]; T = cfg["text"]; is916 = size == "9x16"; M = 48; P = 44; G = 10
    total = "${:,}".format(cfg["linear_ft"] * cfg["rate_per_ft"]); cv = Canvas(W, H); d = cv.d
    hl = {"1x1": 52, "4x5": 58, "9x16": 58}[size]; big = {"1x1": 92, "4x5": 104, "9x16": 104}[size]
    fh = font("heavy", hl); cw = W - 2 * M; lines = wrap(d, T["headline"], fh, cw - 2 * P); lh = int(hl * 1.06)
    fs = font("bold", 44); sl = wrap(d, sub(T["small"]), fs, cw - 2 * P); slh = int(44 * 1.15)
    inner = 44 + 22 + len(lines) * lh + 12 + 44 + 16 + big + 18 + len(sl) * slh + 26 + int(44 * 1.15 + 44); ph = inner + 2 * P
    # four fences in a 2x2 mosaic behind everything (sharp, no text over the top half)
    photos = [load(p) for p in cfg["photos"]]; tw = (W - G) // 2
    mh = (H - G) // 2 if not is916 else (int(H * 0.80) - int(H * 0.14) + 200) // 2
    oy = 0 if not is916 else int(H * 0.14) - 100
    if is916: blur_fill(cv, photos[0], cfg["focals"][0])
    for i, (p, foc) in enumerate(zip(photos, cfg["focals"])):
        x = (i % 2) * (tw + G); yy = oy + (i // 2) * (mh + G); cv.im.paste(cover(p, tw, mh, foc), (x, yy))
    pb = (int(H * 0.80) - M) if is916 else H - M; pt = pb - ph
    frosted(cv, (M, pt, W - M, pb)); logo(cv, (M, (int(H * 0.14) + 28) if is916 else M), 140)
    x = M + P; y = pt + P
    kicker(cv, (x, y), T["tag"], font("bold", 44)); y += 44 + 22
    for i, l in enumerate(lines): cv.text((x, y + i * lh), l, fh, INK, anchor="la")
    y += len(lines) * lh + 12; cv.text((x, y), T["calc"], font("bold", 44), INK2, anchor="la"); y += 44 + 16 + big
    price_row(cv, x, y, total, big, T["total_suffix"], 44); y += 18 + 44
    for i, l in enumerate(sl): cv.text((x, y + i * slh), l, fs, INK2, anchor="ls")
    y += (len(sl) - 1) * slh + 26; cta(cv, (x, y), T["cta"], font("bold", 44))
    return cv

BUILD = {"f06": f06, "f07": f07, "f08": f08}
def contact_sheet(rows, path):
    tiles = []; Hh = 540; f = ImageFont.truetype(CFG["fonts"]["bold"], 26)
    for name, p in rows:
        im = Image.open(p).convert("RGB"); w = round(im.width * Hh / im.height); im = im.resize((w, Hh), Image.LANCZOS)
        t = Image.new("RGB", (w, Hh + 40), (24, 24, 26)); t.paste(im, (0, 40)); ImageDraw.Draw(t).text((8, 8), name, font=f, fill=WH); tiles.append(t)
    cols = 3; rws = (len(tiles) + cols - 1) // cols; cw = max(t.width for t in tiles) + 16; rh = Hh + 56
    sheet = Image.new("RGB", (cols * cw + 16, rws * rh + 16), (24, 24, 26))
    for i, t in enumerate(tiles): sheet.paste(t, (16 + (i % cols) * cw, 16 + (i // cols) * rh))
    sheet.save(path, optimize=True)

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]; final = "--final" in sys.argv
    which = ["f06", "f07", "f08"] if not args or args == ["all"] else args; qa = []
    for key in which:
        for size in ("1x1", "4x5", "9x16"):
            cv = BUILD[key](size); name = f"{key}_{size}.png"; kb = save_png(cv, f"{OUT}/{name}") / 1024
            if final: save_png(cv, f"{OUT}/final/{name}")
            q = cv.qa(name, size == "9x16"); q["file_kb"] = round(kb); flags = []
            if q["text_area_pct"] > MAX_TEXT_PCT: flags.append("TEXT AREA > 25%")
            if q["smallest_font_px"] < MIN_FONT: flags.append("FONT < 44")
            if q["lowest_contrast"] < MIN_CONTRAST: flags.append("CONTRAST < 4.5")
            if kb * 1024 > MAX_BYTES: flags.append("FILE > 1 MB")
            if q["safe_zone_9x16"].startswith("FAIL"): flags.append("SAFE ZONE")
            q["flags"] = ", ".join(flags) or "ok"; qa.append(q)
    rows = [(n, f"{OUT}/{n}") for k in ("f06", "f07", "f08") for s in ("1x1", "4x5", "9x16") for n in [f"{k}_{s}.png"] if os.path.exists(f"{OUT}/{n}")]
    contact_sheet(rows, f"{OUT}/preview_contact_sheet.png")
    hdr = ["file", "size", "text_area_pct", "smallest_font_px", "lowest_contrast", "file_kb", "safe_zone_9x16", "flags"]
    md = "| " + " | ".join(hdr) + " |\n|" + "---|" * len(hdr) + "\n" + "\n".join("| " + " | ".join(str(r[h]) for h in hdr) + " |" for r in qa)
    open(f"{OUT}/qa.md", "w").write(md + "\n"); print(md)
