#!/usr/bin/env python3
"""Boundary Builders ad set, template v2 ("offer card"): full-bleed photo + white offer card, yellow CTA button.
    python3 build_v2.py [f06|f07|f08|all] [--final]   -> out/v2/*.png, out/v2/preview_contact_sheet.png, out/v2/qa.md
Copy, prices, sources and crops live in config.json under "v2". Same hard rules as build_ads.py."""
import os, sys, json
from PIL import Image, ImageDraw, ImageFont
import build_ads as B
from build_ads import Canvas, cover, load, wrap, font, sub, CH, WH, YE, CFG, MIN_FONT, MAX_TEXT_PCT, MIN_CONTRAST, MAX_BYTES, save_png

V = CFG["v2"]; GREY = (0x5A, 0x5A, 0x5A)
OUT = "out/v2"; os.makedirs(OUT + "/final", exist_ok=True)

def button(cv, box, text, fnt, bg=YE, fg=CH, radius=26):
    """full-width CTA: rounded rect + centred text (logged as a text box)"""
    d = cv.d; d.rounded_rectangle(box, radius=radius, fill=bg); cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
    tb = d.textbbox((cx, cy), text, font=fnt, anchor="mm"); cv.contrasts.append(B.contrast(B.lum(fg), B.lum(bg))); cv.boxes.append(tb); cv.fonts.append(fnt.size)
    d.text((cx, cy), text, font=fnt, fill=fg, anchor="mm"); return box
def logo_chip(cv, xy, width=150):
    lg = Image.open(CFG["logo"]).convert("RGBA"); lg = lg.resize((width, round(lg.height * width / lg.width)), Image.LANCZOS)
    pad = 16; box = (xy[0], xy[1], xy[0] + lg.width + 2 * pad, xy[1] + lg.height + 2 * pad)
    cv.d.rounded_rectangle(box, radius=22, fill=WH); cv.im.paste(lg, (xy[0] + pad, xy[1] + pad), lg)
    cv.boxes.append(box); cv.fonts.append(999); cv.contrasts.append(99)
def card(cv, box, radius=40):
    cv.shadow(box, radius, blur=30, offset=(0, 20), alpha=90); cv.d.rounded_rectangle(box, radius=radius, fill=WH)
def price_row(cv, x, y_base, big, big_px, rest, rest_px, color=CH):
    fb, fr = font("heavy", big_px), font("bold", rest_px); cv.text((x, y_base), big, fb, color, anchor="ls")
    w = cv.d.textlength(big, font=fb); cv.text((x + w + 16, y_base), rest, fr, color, anchor="ls")

def f06(size):
    W, H = CFG["sizes"][size]; cfg = V["f06"]; T = cfg["text"]; is916 = size == "9x16"; M = 40; P = 48
    cv = Canvas(W, H); cv.im = cover(load(cfg["source"]), W, H, cfg["focal"][size])
    hl = {"1x1": 60, "4x5": 76, "9x16": 76}[size]; big = {"1x1": 80, "4x5": 100, "9x16": 100}[size]; cta = 48; bh = 100 if size == "1x1" else 110
    # measure the card contents first
    d = cv.d; fh = font("heavy", hl); lines = wrap(d, T["headline"], fh, W - 2 * M - 2 * P); lh = int(hl * 1.04)
    inner = 44 + 24 + len(lines) * lh + 18 + big + 20 + 44 + 30 + bh
    ch = inner + 2 * P; cb = (int(H * 0.80) - M) if is916 else H - M; ct = cb - ch
    card(cv, (M, ct, W - M, cb))
    logo_chip(cv, (M, int(H * 0.14) + 24 if is916 else M))
    x = M + P; y = ct + P
    cv.pill((x, y), [T["tag"]], font("bold", 44), YE, CH, padx=22, pady=10, radius=16); y += 44 + 20 + 24
    for i, l in enumerate(lines): cv.text((x, y + i * lh), l, fh, CH, anchor="la")
    y += len(lines) * lh + 18 + big; price_row(cv, x, y, T["price_big"], big, T["price_rest"], 44); y += 20 + 44
    cv.text((x, y), sub(T["small"]), font("bold", 44), GREY, anchor="ls"); y += 30
    button(cv, (x, y, W - M - P, y + bh), T["cta"], font("bold", cta))
    return cv

def f07(size):
    W, H = CFG["sizes"][size]; cfg = V["f07"]; T = cfg["text"]; is916 = size == "9x16"; P = 64
    cv = Canvas(W, H, bg=YE); d = cv.d
    y = int(H * 0.14) + 40 if is916 else 64
    hl = {"1x1": 64, "4x5": 72, "9x16": 72}[size]; fh = font("heavy", hl); lines = wrap(d, T["headline"], fh, W - 2 * P - 210); lh = int(hl * 1.04)
    logo_chip(cv, (W - P - 182, y - 8), 150)
    for i, l in enumerate(lines): cv.text((P, y + i * lh), l, fh, CH, anchor="la")
    y += len(lines) * lh + 16; cv.text((P, y), T["medium"], font("bold", 46), CH, anchor="la"); y += 46 + 36
    top = y; safe_bottom = int(H * 0.80) if is916 else H
    # phone: big, plain white rounded frame, bleeding off the bottom edge on 1:1 and 4:5
    pw = {"1x1": 500, "4x5": 520, "9x16": 470}[size]; sw = pw - 28; shot = load(cfg["screenshot"]); sh_full = round(sw * shot.height / shot.width)
    ph_h = min(sh_full + 28, (safe_bottom - top) if is916 else (H - top + 120))
    cv.shadow((P, top, P + pw, top + ph_h), 56, blur=34, offset=(0, 22), alpha=90); d = cv.d; d.rounded_rectangle((P, top, P + pw, top + ph_h), radius=56, fill=WH)
    cv.paste_rounded(shot.resize((sw, sh_full), Image.LANCZOS).crop((0, 0, sw, min(sh_full, ph_h - 28))), (P + 14, top + 14), 42)
    # right column: price pill (charcoal, yellow text), small line, fence photo card
    cx = P + pw + 36; cw = W - P - cx; fp = font("bold", 44)
    parts = T["pill"].split(" · "); pl = [parts[0], parts[1], parts[2]]
    pb = cv.pill((cx, top), pl, fp, CH, YE, padx=26, pady=18, radius=30)
    yy = pb[3] + 22; fs = font("bold", 44); sl = wrap(d, sub(T["small"]), fs, cw)
    for i, l in enumerate(sl): cv.text((cx, yy + i * int(44 * 1.15)), l, fs, CH, anchor="la")
    yy += len(sl) * int(44 * 1.15) + 28; ch = min(round(cw * 0.75) + 20, safe_bottom - 40 - yy)
    if ch > 160:
        cv.shadow((cx, yy, cx + cw, yy + ch), 28, blur=22, offset=(0, 14), alpha=70); cv.d.rounded_rectangle((cx, yy, cx + cw, yy + ch), radius=28, fill=WH)
        cv.paste_rounded(cover(load(cfg["photo"]), cw - 20, ch - 20, cfg["photo_focal"]), (cx + 10, yy + 10), 20); yy += ch + 24
    return cv

def f08(size):
    W, H = CFG["sizes"][size]; cfg = V["f08"]; T = cfg["text"]; is916 = size == "9x16"; M = 40; P = 48; G = 14
    total = cfg["linear_ft"] * cfg["rate_per_ft"]; total_s = "${:,}".format(total)
    cv = Canvas(W, H, bg=CH); d = cv.d
    top = int(H * 0.14) + 24 if is916 else M; cb = (int(H * 0.80) - M) if is916 else H - M
    hl = {"1x1": 52, "4x5": 62, "9x16": 62}[size]; big = {"1x1": 112, "4x5": 144, "9x16": 144}[size]
    fh = font("heavy", hl); lines = wrap(d, T["headline"], fh, W - 2 * M - 2 * P - 190); lh = int(hl * 1.04)
    fs = font("bold", 44); sl = wrap(d, sub(T["small"]), fs, W - 2 * M - 2 * P); slh = int(44 * 1.15)
    inner = 44 + 20 + 24 + len(lines) * lh + 16 + 48 + 18 + big + 22 + len(sl) * slh + 30 + 110; ch = inner + 2 * P; ct = cb - ch
    # photo strip above the card: three rounded tiles
    th = ct - top - 28; tw = (W - 2 * M - 2 * G) // 3
    for i, (p, foc) in enumerate(zip(cfg["photos"], cfg["focals"])):
        x = M + i * (tw + G); cv.paste_rounded(cover(load(p), tw, th, foc), (x, top), 24)
    card(cv, (M, ct, W - M, cb)); x = M + P; y = ct + P
    cv.pill((x, y), [T["tag"]], font("bold", 44), YE, CH, padx=22, pady=10, radius=16); y += 44 + 20 + 24
    for i, l in enumerate(lines): cv.text((x, y + i * lh), l, fh, CH, anchor="la")
    y += len(lines) * lh + 16; cv.text((x, y), T["calc"], font("bold", 48), GREY, anchor="la"); y += 48 + 18 + big
    price_row(cv, x, y, total_s, big, T["total_suffix"], 44); y += 22 + 44
    for i, l in enumerate(sl): cv.text((x, y + i * slh), l, fs, GREY, anchor="ls")
    y += (len(sl) - 1) * slh + 30
    button(cv, (x, y, W - M - P, y + 110), T["cta"], font("bold", 48))
    logo_chip(cv, (W - M - P - 166, ct + P - 12), 134)
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
