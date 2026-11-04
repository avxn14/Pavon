#!/usr/bin/env python3
"""Boundary Builders Meta ad set, template v4 ("editorial"): the fence is never covered.
    python3 build_v4.py [f06|f07|f08|all] [--final]  -> out/v4/*.png, out/v4/preview_contact_sheet.png, out/v4/qa.md

Design system (one for all nine files)
  * photo first: the fence photo is never under a card, sheet, chip or button; copy sits in the sky band of the
    photo (melted into charcoal) or on its own surface next to the photo. Photos are never upscaled past 1.35x.
  * spacing on an 8 px rhythm: 48 px outer margin, 28/36/32 px gaps; radii 32 (photo cards), 12 (chip), full (pills).
  * type: Montserrat ExtraBold 64 (headline), ExtraBold 104-112 (price), Bold 44 (everything else, the 44 px floor).
  * colour: charcoal #1A1A1A, white (secondary lines white at 88 %), yellow #F5C400 for the chip, price and button.
  * one logo position: top-right, 190 px wide, on a flat surface (charcoal band or yellow), never on the photo.
Hard rules from the brief are measured on every render (QA table): min font 44 px, text area < 25 %, contrast >= 4.5:1
against the worst 5 % of the pixels under each line, 9:16 copy and logo inside y 14 %..80 %, PNG < 1 MB.
"""
import os, sys, io
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import build_ads as B
from build_ads import load, wrap, font, sub, CH, WH, YE, CFG, MAX_TEXT_PCT, MIN_FONT, MIN_CONTRAST, MAX_BYTES

V = CFG["v4"]; OUT = "out/v4"; os.makedirs(OUT + "/final", exist_ok=True)
M = 48; WH2 = (225, 225, 225)
B.NOWRAP[:] = ["in 2 minutes.", "fence price", "Winter Sale", "$220/panel", "$210/panel"]

def smooth(t): t = min(1.0, max(0.0, t)); return t * t * (3 - 2 * t)

SS = 4
def aa_mask(size, box, radius):
    """anti-aliased rounded-rectangle mask: drawn at 4x, reduced with LANCZOS"""
    W, H = size; m = Image.new("L", (W * SS, H * SS), 0)
    x0, y0, x1, y1 = box; ImageDraw.Draw(m).rounded_rectangle((x0 * SS, y0 * SS, x1 * SS - 1, y1 * SS - 1), radius=radius * SS, fill=255)
    return m.resize((W, H), Image.LANCZOS)

class Canvas(B.Canvas):
    """build_ads.Canvas + a mask of where the photo is visible (for the 'photo share' QA column) + anti-aliased shapes"""
    def __init__(self, w, h, bg=CH):
        super().__init__(w, h, bg); self.pmask = np.zeros((h, w), bool)
    def fill_round(self, box, radius, color):
        """anti-aliased filled rounded rectangle (drawn in a local window so it stays fast)"""
        x0, y0, x1, y1 = [int(round(v)) for v in box]; pad = 2
        wx0, wy0, wx1, wy1 = max(0, x0 - pad), max(0, y0 - pad), min(self.w, x1 + pad), min(self.h, y1 + pad)
        m = aa_mask((wx1 - wx0, wy1 - wy0), (x0 - wx0, y0 - wy0, x1 - wx0, y1 - wy0), radius)
        self.im.paste(Image.new("RGB", m.size, color), (wx0, wy0), m)
    def paste_rounded(self, im, xy, radius):
        m = aa_mask(im.size, (0, 0, im.width, im.height), radius); self.im.paste(im, (int(xy[0]), int(xy[1])), m)
    def cover_mask(self, box, radius=0):
        x0, y0, x1, y1 = [int(round(v)) for v in box]; m = Image.new("L", (self.w, self.h), 0)
        ImageDraw.Draw(m).rounded_rectangle((x0, y0, x1, y1), radius=radius, fill=255); self.pmask &= ~(np.asarray(m) > 0)

def place_photo(cv, photo, scale, y_top, focal_x=0.5, x0=0, width=None, radius=0, shadow=False):
    """resize by `scale` (never stretches), crop horizontally around focal_x to `width`, paste with its top at y_top"""
    width = width or cv.w; sw, sh = round(photo.width * scale), round(photo.height * scale)
    im = photo.resize((sw, sh), Image.LANCZOS); cx = int(min(max(focal_x * sw - width / 2, 0), sw - width)); im = im.crop((cx, 0, cx + width, sh))
    if shadow: cv.shadow((x0, y_top, x0 + width, y_top + sh), radius, blur=30, offset=(0, 18), alpha=70)
    if radius: cv.paste_rounded(im, (x0, int(y_top)), radius)
    else: cv.im.paste(im, (x0, int(y_top)))
    m = Image.new("L", (cv.w, cv.h), 0); ImageDraw.Draw(m).rounded_rectangle((x0, y_top, x0 + width, y_top + sh), radius=radius, fill=255)
    cv.pmask |= np.asarray(m) > 0
    return dict(scale=scale, cx=cx, x0=x0, y_top=y_top, w=width, h=sh)

def tile(cv, photo, box, focal, zoom=0.0):
    """cover the box; `zoom` (source scale, <= 1.0) frames tighter on the fence without upscaling past the source"""
    x0, y0, x1, y1 = box; w, h = x1 - x0, y1 - y0; s = max(w / photo.width, h / photo.height, min(zoom, 1.0))
    sw, sh = round(photo.width * s), round(photo.height * s); im = photo.resize((sw, sh), Image.LANCZOS)
    cx = int(min(max(focal[0] * sw - w / 2, 0), sw - w)); cy = int(min(max(focal[1] * sh - h / 2, 0), sh - h))
    cv.im.paste(im.crop((cx, cy, cx + w, cy + h)), (x0, y0)); cv.pmask[y0:y1, x0:x1] = True

def melt(cv, y_solid, y_clear, up=True, hide_above=0.65):
    """charcoal veil: fully opaque at y_solid, smoothly clear at y_clear (up=True: dark above, clear below)"""
    a = np.zeros(cv.h)
    for y in range(cv.h):
        t = (y - y_solid) / max(1, (y_clear - y_solid)); a[y] = 1 - smooth(t)
    if not up: a = a[::-1] if False else a
    alpha = (a * 255).astype(np.uint8)
    mask = Image.fromarray(np.repeat(alpha[:, None], cv.w, axis=1), "L")
    cv.im = Image.composite(Image.new("RGB", cv.im.size, CH), cv.im, mask)
    cv.pmask &= ~(np.repeat(a[:, None], cv.w, axis=1) > hide_above)

def soft_text(cv, xy, s, fnt, fill, anchor="ls", spacing=0, shadow=0.0):
    """text with an optional soft shadow under it (only used for light text over a photo)"""
    if shadow:
        layer = Image.new("L", cv.im.size, 0); ImageDraw.Draw(layer).text(xy, s, font=fnt, fill=255, anchor=anchor)
        layer = layer.filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * shadow))
        cv.im = Image.composite(Image.new("RGB", cv.im.size, (10, 10, 10)), cv.im, layer)
    return cv.text(xy, s, fnt, fill, anchor=anchor, spacing=spacing)

def chip(cv, x, y, text, fnt, h=64, padx=22):
    d = cv.d; w = int(d.textlength(text, font=fnt) + 2 * padx + 3 * (len(text) - 1)); box = (x, y, x + w, y + h)
    cv.fill_round(box, 12, YE); cv.cover_mask(box, 12)
    cv.text((x + padx, y + h / 2), text, fnt, CH, anchor="lm", spacing=3); return box

def cta(cv, x, y, text, fnt, h=96, padx=40, on_photo=False):
    d = cv.d; aw = d.textlength("→", font=fnt); w = int(d.textlength(text, font=fnt) + 18 + aw + 2 * padx); box = (x, y, x + w, y + h)
    if on_photo: cv.shadow(box, h // 2, blur=16, offset=(0, 8), alpha=55)
    cv.fill_round(box, h // 2, YE); cv.cover_mask(box, h // 2)
    tb = cv.text((x + padx, y + h / 2), text, fnt, CH, anchor="lm")
    cv.d.text((tb[2] + 18, y + h / 2), "→", font=fnt, fill=CH, anchor="lm"); return box

def logo(cv, x_right, y_center, width=190, on_charcoal=False):
    lg = Image.open(CFG["logo"]).convert("RGBA")
    if on_charcoal:   # the file's backing plate is #222222; on the #1A1A1A band it would read as a lighter box
        a = np.asarray(lg).copy(); rgb = a[..., :3].astype(int)
        plate = (a[..., 3] > 0) & (np.abs(rgb - 34).max(axis=2) <= 12); a[plate, :3] = 26; lg = Image.fromarray(a, "RGBA")
    lg = lg.resize((width, round(lg.height * width / lg.width)), Image.LANCZOS)
    x, y = int(x_right - width), int(y_center - lg.height / 2); cv.im.paste(lg, (x, y), lg)
    box = (x, y, x + lg.width, y + lg.height); cv.boxes.append(box); cv.fonts.append(999); cv.contrasts.append(99); cv.cover_mask(box); return box

CAP = lambda px: round(px * 0.70)          # Montserrat cap height
DESC = lambda px: round(px * 0.22)         # descender allowance below a baseline

# ---------------- F06 "Winter Window" ----------------
def f06_block(cv, top, T, one_line, dry=False):
    """stack: chip / headline / price / small / button. Returns the list of element boxes (also drawn unless dry)."""
    d = cv.d; x = M; boxes = []
    fchip, fh, fp, fb = font("bold", 44), font("heavy", 64), font("heavy", 104), font("bold", 44)
    lines = [T["headline"]] if one_line else wrap(d, T["headline"], fh, 600)
    y = top
    boxes.append(("chip", (x, y, x + int(d.textlength(T["tag"], font=fchip) + 44 + 30), y + 64)))
    b = y + 64 + 28 + CAP(64); hl = []
    for i, l in enumerate(lines): hl.append((l, b + i * 70)); boxes.append(("h1", (x, b + i * 70 - CAP(64) - 14, x + int(d.textlength(l, font=fh)), b + i * 70 + DESC(64))))
    pb = hl[-1][1] + 36 + CAP(104); pw = int(d.textlength(T["price_big"], font=fp)); rw = int(d.textlength(T["price_rest"], font=fb))
    boxes.append(("price", (x, pb - CAP(104) - 6, x + pw + 16 + rw, pb + DESC(44))))
    sb = pb + 28 + CAP(44); boxes.append(("small", (x, sb - CAP(44) - 10, x + int(d.textlength(sub(T["small"]), font=fb)), sb + DESC(44))))
    ct = sb + DESC(44) + 32; cw = int(d.textlength(T["cta"], font=fb) + 18 + d.textlength("→", font=fb) + 80); boxes.append(("cta", (x, ct, x + cw, ct + 96)))
    if not dry:
        chip(cv, x, y, T["tag"], fchip)
        for l, bl in hl: soft_text(cv, (x, bl), l, fh, WH)
        soft_text(cv, (x, pb), T["price_big"], fp, YE); soft_text(cv, (x + pw + 16, pb), T["price_rest"], fb, WH)
        soft_text(cv, (x, sb), sub(T["small"]), fb, WH2)
        cta(cv, x, ct, T["cta"], fb)
    return boxes

def fence_top_out(cfg, geo, x_out):
    (xa, ya), (xb, yb) = cfg["fence_top_src"]; xs = (x_out + geo["cx"]) / geo["scale"]
    return geo["y_top"] + geo["scale"] * (ya + (xs - xa) * (yb - ya) / (xb - xa) - cfg["post_margin"])

def f06(size):
    W, H = CFG["sizes"][size]; cfg = V["f06"]; T = cfg["text"]; is916 = size == "9x16"
    photo = load(cfg["photo"]); cv = Canvas(W, H); fx = cfg["focal_x"][size]
    top = int(H * 0.14) + 32 if is916 else M; one_line = size == "1x1"
    boxes = f06_block(cv, top, T, one_line, dry=True); text_bottom = max(b[3] for _, b in boxes)
    def clearance(geo):   # smallest gap between any text element and the fence top line under it
        return min(fence_top_out(cfg, geo, x) - b[3] for _, b in boxes for x in range(b[0], b[2] + 1, 8))
    best = None
    smin = W / photo.width
    for s in np.arange(1.35, smin - 1e-9, -0.01):                 # largest photo that keeps 28 px of air above the fence
        sh = round(photo.height * s)
        y_top = (H - sh) if not is916 else None
        if is916:                                                   # 9:16: photo bottom may run into the UI zone, never past 1720
            y_top = int(text_bottom + 28 - s * min(cfg["fence_top_src"][0][1], cfg["fence_top_src"][1][1]) + s * cfg["post_margin"])
            if y_top + sh > 1720: continue
        sw = round(photo.width * s); geo = dict(scale=s, cx=int(min(max(fx * sw - W / 2, 0), sw - W)), y_top=y_top)
        if clearance(geo) >= 28: best = (s, y_top); break
    if best is None: best = (smin, H - round(photo.height * smin))
    s, y_top = best
    geo = place_photo(cv, photo, s, y_top, fx)
    # veil: solid charcoal above the photo, melting to clear 24 px above the fence line
    fence_min = min(fence_top_out(cfg, geo, x) for x in range(0, W, 8))
    melt(cv, max(y_top, text_bottom - 150), fence_min - 8)
    if is916:   # melt the photo's lower edge into charcoal (below the 80 % line only)
        y_bot = y_top + geo["h"]; a = np.array([smooth((y - (y_bot - 220)) / 220) for y in range(H)])
        mask = Image.fromarray(np.repeat((a * 255).astype(np.uint8)[:, None], W, axis=1), "L")
        cv.im = Image.composite(Image.new("RGB", cv.im.size, CH), cv.im, mask); cv.pmask &= ~(np.repeat(a[:, None], W, axis=1) > 0.65)
    f06_block(cv, top, T, one_line)
    logo(cv, W - M, top + 32, on_charcoal=True)
    cv.meta = dict(photo_scale=round(s, 2), fence_clearance=int(min(fence_top_out(cfg, geo, x) - b[3] for _, b in boxes for x in range(b[0], b[2] + 1, 8))))
    return cv

# ---------------- F08 "80 ft pricing" ----------------
def f08(size):
    W, H = CFG["sizes"][size]; cfg = V["f08"]; T = cfg["text"]; is916 = size == "9x16"
    cv = Canvas(W, H); d = cv.d; G = 8
    total = "${:,}".format(cfg["linear_ft"] * cfg["rate_per_ft"])
    fb, fbig = font("bold", 44), font("heavy", 112)
    sheet_h = 32 + 28 + CAP(44) + DESC(44) + 28 + CAP(112) + 28 + CAP(44) + DESC(44) + 32 + 96   # chip half .. button bottom
    cta_bottom = (int(H * 0.80) - M) if is916 else H - M
    st = cta_bottom - sheet_h if size != "4x5" else cta_bottom - sheet_h - 24
    ph = [load(p) for p in cfg["photos"]]; foc = cfg["focals"]
    if is916:
        r1 = (0, 0, W, 620); r2 = (0, 628, (W - G) // 2, st); r3 = ((W - G) // 2 + G, 628, W, st)
    else:
        lw = 664; r1 = (0, 0, lw, st); hh = (st - G) // 2; r2 = (lw + G, 0, W, hh); r3 = (lw + G, hh + G, W, st)
    for p, f, r, z in zip(ph, foc, (r1, r2, r3), cfg.get("zoom", [0, 0, 0])): tile(cv, p, r, f[size] if isinstance(f, dict) else f, z)
    # soften the seam: the bottom 96 px of the collage melt into the charcoal sheet
    a = np.array([smooth((y - (st - 96)) / 96) if y < st else 1.0 for y in range(H)]); a[:max(0, st - 96)] = 0
    mask = Image.fromarray(np.repeat((a * 255).astype(np.uint8)[:, None], W, axis=1), "L")
    cv.im = Image.composite(Image.new("RGB", cv.im.size, CH), cv.im, mask); cv.pmask &= ~(np.repeat(a[:, None], W, axis=1) > 0.65)
    chip(cv, M, st - 32, T["tag"], fb)
    b1 = st + 32 + 28 + CAP(44); logo(cv, W - M, b1 - CAP(44) // 2 - 4, 190, on_charcoal=True)
    b1 = st + 32 + 28 + CAP(44); cv.text((M, b1), T["calc"], fb, WH2, anchor="ls")
    b2 = b1 + DESC(44) + 28 + CAP(112); tw = d.textlength(total, font=fbig); cv.text((M, b2), total, fbig, YE, anchor="ls")
    cv.text((M + tw + 20, b2), T["total_suffix"], fb, WH, anchor="ls")
    b3 = b2 + 28 + CAP(44); cv.text((M, b3), sub(T["small"]), fb, WH2, anchor="ls")
    cta(cv, M, b3 + DESC(44) + 32, T["cta"], fb)
    cv.meta = dict(total=total)
    return cv

# ---------------- F07 "Instant Price" ----------------
def f07(size):
    W, H = CFG["sizes"][size]; cfg = V["f07"]; T = cfg["text"]; is916 = size == "9x16"
    cv = Canvas(W, H, bg=YE); d = cv.d; G = 32
    fh, fb = font("heavy", 64), font("bold", 44)
    top = int(H * 0.14) + 32 if is916 else M
    lines = wrap(d, T["headline"], fh, W - 2 * M - 190 - 32); b = top + CAP(64) + 6
    for i, l in enumerate(lines): cv.text((M, b + i * 70), l, fh, CH, anchor="ls")
    logo(cv, W - M, top + 34)
    b = b + (len(lines) - 1) * 70 + DESC(64) + 20 + CAP(44); cv.text((M, b), T["medium"], fb, CH, anchor="ls")
    ctop = b + DESC(44) + 40; cbot = (int(H * 0.80) - 8) if is916 else H - M
    # left: the whole phone (plain white rounded frame, no maker marks), as tall as the content area allows
    shot = load(cfg["screenshot"]); ph_h = cbot - ctop; sh = ph_h - 24; sw = round(sh * shot.width / shot.height); pw = sw + 24
    cv.shadow((M, ctop, M + pw, cbot), 48, blur=34, offset=(0, 22), alpha=80)
    cv.fill_round((M, ctop, M + pw, cbot), 48, WH); cv.cover_mask((M, ctop, M + pw, cbot), 48)
    cv.paste_rounded(shot.resize((sw, sh), Image.LANCZOS), (M + 12, ctop + 12), 38)
    # right column: fence photo card, then the charcoal price pill (left-aligned lines), then the date line
    rx = M + pw + G; rw = W - M - rx
    parts = T["pill"].split(" \u00b7 ")
    pill_lines = [parts[0], parts[1] + " \u00b7 " + parts[2]] if d.textlength(parts[1] + " \u00b7 " + parts[2], font=fb) + 56 <= rw else [parts[0], parts[1], parts[2]]
    lh = 54; pill_h = len(pill_lines) * lh + 34
    small = wrap(d, sub(T["small"]), fb, rw); small_h = len(small) * lh
    card_h = cbot - ctop - 28 - pill_h - 24 - small_h
    card = (rx, ctop, W - M, ctop + card_h)
    cv.shadow(card, 32, blur=16, offset=(0, 8), alpha=40)
    foc = cfg["photo_focal"]; foc = foc[size] if isinstance(foc, dict) else foc
    cv.paste_rounded(B.cover(load(cfg["photo"]), rw, card_h, foc), (rx, ctop), 32); cv.pmask[ctop:ctop + card_h, rx:W - M] = True
    py = card[3] + 28; pwid = rw
    cv.fill_round((rx, py, rx + pwid, py + pill_h), 32, CH)
    cv.contrasts.append(B.contrast(B.lum(YE), B.lum(CH))); cv.boxes.append((rx, py, rx + pwid, py + pill_h)); cv.fonts.append(44)
    yb = py + 17 + CAP(44) + 14
    for l in pill_lines: cv.d.text((rx + 28, yb), l, font=fb, fill=YE, anchor="ls"); yb += lh
    yb = py + pill_h + 24 + CAP(44)
    for l in small: cv.text((rx, yb), l, fb, CH, anchor="ls"); yb += lh
    cv.meta = {}
    return cv

# ---------------- output ----------------
def save_png(cv, path):
    """24-bit PNG if it fits under 1 MB, else libimagequant palette (quality 90-100) - always oxipng-optimised"""
    import oxipng
    im = cv.im.convert("RGB"); buf = io.BytesIO(); im.save(buf, "PNG"); data = oxipng.optimize_from_memory(buf.getvalue(), level=3); mode = "RGB"
    if len(data) > MAX_BYTES:
        import imagequant
        for q in (100, 95, 90, 85):
            pq = imagequant.quantize_pil_image(im.convert("RGBA"), dithering_level=1.0, max_colors=256, min_quality=0, max_quality=q)
            buf = io.BytesIO(); pq.save(buf, "PNG"); data = oxipng.optimize_from_memory(buf.getvalue(), level=3); mode = f"P (libimagequant q{q})"
            if len(data) <= MAX_BYTES: break
    open(path, "wb").write(data); return len(data), mode

BUILD = {"f06": f06, "f07": f07, "f08": f08}
def contact_sheet(rows, path):
    tiles = []; Hh = 560; f = ImageFont.truetype(CFG["fonts"]["bold"], 26)
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
            cv = BUILD[key](size); name = f"{key}_{size}.png"; n, mode = save_png(cv, f"{OUT}/{name}")
            if final: save_png(cv, f"{OUT}/final/{name}")
            q = cv.qa(name, size == "9x16"); q["file_kb"] = round(n / 1024); q["png_mode"] = mode; q["photo_pct"] = round(float(cv.pmask.mean()) * 100, 1)
            flags = []
            if q["text_area_pct"] > MAX_TEXT_PCT: flags.append("TEXT AREA > 25%")
            if q["smallest_font_px"] < MIN_FONT: flags.append("FONT < 44")
            if q["lowest_contrast"] < MIN_CONTRAST: flags.append("CONTRAST < 4.5")
            if n > MAX_BYTES: flags.append("FILE > 1 MB")
            if q["safe_zone_9x16"].startswith("FAIL"): flags.append("SAFE ZONE")
            if getattr(cv, "meta", {}).get("fence_clearance", 99) < 0: flags.append("TEXT ON FENCE")
            q["flags"] = ", ".join(flags) or "ok"; q.update({k: v for k, v in getattr(cv, "meta", {}).items()}); qa.append(q)
    rows = [(n, f"{OUT}/{n}") for k in ("f06", "f07", "f08") for s in ("1x1", "4x5", "9x16") for n in [f"{k}_{s}.png"] if os.path.exists(f"{OUT}/{n}")]
    contact_sheet(rows, f"{OUT}/preview_contact_sheet.png")
    import json as _j
    store = f"{OUT}/qa.json"; old = {}
    if os.path.exists(store): old = {r["file"]: r for r in _j.load(open(store))}
    for r in qa: old[r["file"]] = {k: (float(v) if hasattr(v, "item") else v) for k, v in r.items()}
    qa = [old[k] for k in sorted(old)]; _j.dump(qa, open(store, "w"), indent=1)
    hdr = ["file", "size", "photo_pct", "text_area_pct", "smallest_font_px", "lowest_contrast", "file_kb", "png_mode", "safe_zone_9x16", "flags"]
    md = "| " + " | ".join(hdr) + " |\n|" + "---|" * len(hdr) + "\n" + "\n".join("| " + " | ".join(str(r.get(h, "")) for h in hdr) + " |" for r in qa)
    open(f"{OUT}/qa.md", "w").write(md + "\n"); print(md)
    for r in qa:
        extra = {k: v for k, v in r.items() if k in ("photo_scale", "fence_clearance", "total")}
        if extra: print(r["file"], extra)
