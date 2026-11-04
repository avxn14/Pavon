#!/usr/bin/env python3
"""Boundary Builders Meta ad set: 3 creatives x 3 sizes from ./inputs, with Pillow.
    python3 build_ads.py [f06|f07|f08|all] [--final]
Drafts -> out/<name>.png + out/preview_contact_sheet.png + QA table (out/qa.md). --final also writes out/final/<name>.png.
All copy, dates, sources and focal points live in config.json. Hard rules enforced here: only ./inputs files, exact text,
min font 44 px, text area < 25 %, contrast >= 4.5:1, 9:16 text/logo inside y 14 %..80 %, PNG < 1 MB."""
import os, sys, json, glob, io
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
CFG = json.load(open("config.json", encoding="utf-8"))
C = CFG["colors"]; DATE = CFG["sale_end_date"]
MIN_FONT = 44; MAX_TEXT_PCT = 25.0; MIN_CONTRAST = 4.5; MAX_BYTES = 1_000_000
os.makedirs("out/final", exist_ok=True)

def hexrgb(h): h = h.lstrip("#"); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
CH, WH, YE = hexrgb(C["charcoal"]), hexrgb(C["white"]), hexrgb(C["yellow"])
def font(kind, px): return ImageFont.truetype(CFG["fonts"][kind], px)
def sub(s): return s.replace("[SALE END DATE]", DATE)

# ---------- helpers ----------
def cover(im, w, h, focal=(0.5, 0.5)):
    """scale to cover w x h, crop around the focal point; never stretches"""
    s = max(w / im.width, h / im.height); nw, nh = round(im.width * s), round(im.height * s)
    im = im.resize((nw, nh), Image.LANCZOS)
    x = int(min(max(focal[0] * nw - w / 2, 0), nw - w)); y = int(min(max(focal[1] * nh - h / 2, 0), nh - h))
    return im.crop((x, y, x + w, y + h))
def load(path): return ImageOps.exif_transpose(Image.open(path)).convert("RGB")
NOWRAP = ["in 2 minutes."]   # phrases that never break across lines
def wrap(draw, text, fnt, maxw):
    """greedy wrap, then balance a 2-line result so the lines are similar in width (no dangling last word)"""
    for ph in NOWRAP: text = text.replace(ph, ph.replace(" ", "\u00a0"))
    words = text.split(" "); lines = []; cur = ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=fnt) <= maxw or not cur: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    if len(lines) == 2:
        best = lines; gap = abs(draw.textlength(lines[0], font=fnt) - draw.textlength(lines[1], font=fnt))
        for k in range(1, len(words)):
            a, b = " ".join(words[:k]), " ".join(words[k:])
            if draw.textlength(a, font=fnt) <= maxw and draw.textlength(b, font=fnt) <= maxw:
                g = abs(draw.textlength(a, font=fnt) - draw.textlength(b, font=fnt))
                if g < gap: gap, best = g, [a, b]
        lines = best
    return [l.replace("\u00a0", " ") for l in lines]
def lum(rgb):
    def ch(c): c = c / 255; return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb; return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
def contrast(l1, l2): a, b = max(l1, l2), min(l1, l2); return (a + 0.05) / (b + 0.05)

class Canvas:
    """RGB canvas + a log of every text/logo box for the QA table"""
    def __init__(self, w, h, bg=CH):
        self.im = Image.new("RGB", (w, h), bg); self.w, self.h = w, h; self.boxes = []; self.fonts = []; self.contrasts = []
    @property
    def d(self): return ImageDraw.Draw(self.im)
    def bg_lum_worst(self, box, light_text):
        """worst-case background luminance under a text box: brightest 5 % for light text, darkest 5 % for dark text"""
        x0, y0, x1, y1 = [int(v) for v in box]; x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, self.w), min(y1, self.h)
        reg = self.im.crop((x0, y0, x1, y1)).convert("L"); px = sorted(reg.get_flattened_data()) if hasattr(reg, 'get_flattened_data') else sorted(reg.getdata())
        if not px: return 0.0
        v = px[int(len(px) * (0.95 if light_text else 0.05))]; return lum((v, v, v))
    def text(self, xy, s, fnt, fill, anchor="la", spacing=0):
        d = self.d; x, y = xy
        if spacing:  # manual tracking
            bb = [x, y, x, y]; cx = x
            for chc in s:
                b = d.textbbox((cx, y), chc, font=fnt, anchor=anchor); bb[1] = min(bb[1], b[1]); bb[3] = max(bb[3], b[3]); bb[2] = b[2]
                cx += d.textlength(chc, font=fnt) + spacing
            box = tuple(bb); self._log(box, fnt, fill)
            cx = x
            for chc in s: d.text((cx, y), chc, font=fnt, fill=fill, anchor=anchor); cx += d.textlength(chc, font=fnt) + spacing
            return box
        box = d.textbbox((x, y), s, font=fnt, anchor=anchor); self._log(box, fnt, fill); d.text((x, y), s, font=fnt, fill=fill, anchor=anchor); return box
    def _log(self, box, fnt, fill):
        light = lum(fill) > 0.5; bgl = self.bg_lum_worst(box, light); self.contrasts.append(contrast(lum(fill), bgl))
        self.boxes.append(box); self.fonts.append(fnt.size)
    def pill(self, xy, lines, fnt, fill_bg, fill_text, padx=34, pady=22, anchor_left=True, radius=None):
        """rounded pill; lines centred; returns its box. Logged as one text box (the pill area)."""
        d = self.d; lh = int(fnt.size * 1.18); tw = max(d.textlength(l, font=fnt) for l in lines)
        w = int(tw + 2 * padx); h = int(len(lines) * lh + 2 * pady); x, y = xy
        box = (x, y, x + w, y + h); r = radius if radius else h // 2
        self.contrasts.append(contrast(lum(fill_text), lum(fill_bg))); self.boxes.append(box); self.fonts.append(fnt.size)
        d.rounded_rectangle(box, radius=r, fill=fill_bg)
        for i, l in enumerate(lines): d.text((x + w / 2, y + pady + i * lh + lh / 2), l, font=fnt, fill=fill_text, anchor="mm")
        return box
    def gradient_band(self, y0, alpha=0.93, color=CH, full_by=None):
        """dark gradient from y0 (transparent) to full strength at full_by (default: the bottom), then held to the bottom"""
        h = self.h - y0; ov = Image.new("RGBA", (self.w, self.h), (0, 0, 0, 0)); mask = Image.new("L", (self.w, self.h), 0)
        ramp = (full_by - y0) if full_by else h
        for yy in range(h):
            t = min(1.0, yy / max(ramp - 1, 1)); a = int(255 * alpha * (t * t * (3 - 2 * t)))  # smoothstep
            ImageDraw.Draw(mask).line([(0, y0 + yy), (self.w, y0 + yy)], fill=a)
        col = Image.new("RGBA", (self.w, self.h), color + (255,)); ov.paste(col, (0, 0), mask); self.im = Image.alpha_composite(self.im.convert("RGBA"), ov).convert("RGB")
    def logo(self, xy, width):
        lg = Image.open(CFG["logo"]).convert("RGBA"); lg = lg.resize((width, round(lg.height * width / lg.width)), Image.LANCZOS)
        self.im.paste(lg, xy, lg); box = (xy[0], xy[1], xy[0] + lg.width, xy[1] + lg.height); self.boxes.append(box); self.fonts.append(999); self.contrasts.append(99)
    def paste_rounded(self, im, xy, radius):
        m = Image.new("L", im.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, im.width - 1, im.height - 1), radius=radius, fill=255); self.im.paste(im, xy, m)
    def shadow(self, box, radius, blur=28, offset=(0, 18), alpha=70):
        x0, y0, x1, y1 = box; pad = blur * 2; sh = Image.new("RGBA", (x1 - x0 + 2 * pad, y1 - y0 + 2 * pad), (0, 0, 0, 0))
        ImageDraw.Draw(sh).rounded_rectangle((pad, pad, pad + x1 - x0, pad + y1 - y0), radius=radius, fill=(0, 0, 0, alpha)); sh = sh.filter(ImageFilter.GaussianBlur(blur))
        base = self.im.convert("RGBA"); base.alpha_composite(sh, (x0 - pad + offset[0], y0 - pad + offset[1])); self.im = base.convert("RGB")
    def qa(self, name, is916):
        area = sum((b[2] - b[0]) * (b[3] - b[1]) for b, f in zip(self.boxes, self.fonts)) / (self.w * self.h) * 100
        fonts = [f for f in self.fonts if f != 999]; smallest = min(fonts) if fonts else 0; lowc = min(c for c in self.contrasts if c != 99) if self.contrasts else 0
        safe = "n/a"
        if is916:
            lo, hi = 0.14 * self.h, 0.80 * self.h; bad = [b for b in self.boxes if b[1] < lo or b[3] > hi]; safe = "PASS" if not bad else f"FAIL {len(bad)} box(es)"
        return {"file": name, "size": f"{self.w}x{self.h}", "text_area_pct": round(area, 1), "smallest_font_px": smallest, "lowest_contrast": round(lowc, 1), "safe_zone_9x16": safe}

def save_png(canvas, path):
    """sRGB PNG under 1 MB: optimise first, then palette-quantise with dithering if needed"""
    im = canvas.im.convert("RGB"); buf = io.BytesIO(); im.save(buf, "PNG", optimize=True)
    if buf.tell() > MAX_BYTES:
        for colors in (256, 192, 128, 96):
            q = im.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG); buf = io.BytesIO(); q.save(buf, "PNG", optimize=True)
            if buf.tell() <= MAX_BYTES: break
    open(path, "wb").write(buf.getvalue()); return buf.tell()

# ---------- creatives ----------
def f06(size):
    W, H = CFG["sizes"][size]; cfg = CFG["f06"]; T = cfg["text"]; is916 = size == "9x16"; P = 72
    photo = cover(load(cfg["source"]), W, H, cfg["focal"][size])
    logo_xy = (W - P - 200, int(H * 0.14) + 30 if is916 else P)
    y_end = int(H * 0.80) - 28 if is916 else H - P
    hl_size = {"1x1": 80, "4x5": 90, "9x16": 92}[size]
    def layout(cv, draw_it):
        """stack the text block upward from y_end; returns the block top"""
        d = cv.d; y = y_end
        fp = font("bold", 48); ph = int(48 * 1.18 + 44); y -= ph
        if draw_it: cv.pill((P, y), [sub(T["pill"])], fp, YE, CH)
        y -= 30; fs = font("bold", 46)
        if draw_it: cv.text((P, y), sub(T["small"]), fs, WH, anchor="ls")
        y -= 46 + 22; fpz = font("bold", 64)
        if draw_it: cv.text((P, y), T["price"], fpz, YE, anchor="ls")
        y -= 64 + 24; fh = font("heavy", hl_size); lines = wrap(d, T["headline"], fh, W - 2 * P); lh = int(hl_size * 1.06)
        if draw_it:
            for i, l in reversed(list(enumerate(lines))): cv.text((P, y - (len(lines) - 1 - i) * lh), l, fh, WH, anchor="ls")
        y -= (len(lines) - 1) * lh + hl_size + 26; ft = font("bold", 46)
        if draw_it: cv.text((P, y), T["tag"], ft, YE, anchor="ls", spacing=5)
        return y - 46
    while True:
        cv = Canvas(W, H); cv.im = photo.copy()
        top = layout(cv, False)                                   # dry run: where does the block start?
        cv.gradient_band(max(0, top - 300), alpha=0.94, full_by=top - 20)
        cv.logo(logo_xy, 200); layout(cv, True)
        q = cv.qa("", is916)
        if q["text_area_pct"] <= MAX_TEXT_PCT or hl_size <= 72: break
        hl_size -= 4
    return cv

def f07(size):
    W, H = CFG["sizes"][size]; cfg = CFG["f07"]; T = cfg["text"]; is916 = size == "9x16"; P = 72
    cv = Canvas(W, H, bg=YE); d = cv.d
    y = int(H * 0.14) + 36 if is916 else 64
    hl = {"1x1": 58, "4x5": 66, "9x16": 68}[size]; fh = font("heavy", hl); lines = wrap(d, T["headline"], fh, W - 2 * P); lh = int(hl * 1.06)
    for i, l in enumerate(lines): cv.text((P, y + i * lh), l, fh, CH, anchor="la")
    y += len(lines) * lh + 18; fm = font("bold", 46); cv.text((P, y), T["medium"], fm, CH, anchor="la"); y += 46 + 26
    fp = font("bold", 46); parts = T["pill"].split(" · "); pill_lines = [parts[0] + " · " + parts[1], parts[2]]
    if d.textlength(T["pill"], font=fp) + 68 <= W - 2 * P: pill_lines = [T["pill"]]
    pb = cv.pill((P, y), pill_lines, fp, CH, YE, padx=34, pady=20, radius=34); y = pb[3] + 24
    fs = font("bold", 46); cv.text((P, y), sub(T["small"]), fs, CH, anchor="la"); y += 46 + 40
    # phone (plain white rounded rectangle) left, photo card right
    top = y; bottom = int(H * 0.80) if is916 else (H + 150 if size == "1x1" else H - 60)   # 1:1 bleeds off the bottom edge
    ph_h = bottom - top; sw = round((ph_h - 28) * 860 / 1864); pw = sw + 28
    if size == "1x1": pw = 430; sw = pw - 28; ph_h = round(sw * 1864 / 860) + 28
    shot = load(cfg["screenshot"]).resize((sw, round(sw * 1864 / 860)), Image.LANCZOS)
    cv.shadow((P, top, P + pw, top + ph_h), 58); cv.d.rounded_rectangle((P, top, P + pw, top + ph_h), radius=58, fill=WH)
    cv.paste_rounded(shot.crop((0, 0, sw, min(shot.height, ph_h - 28))), (P + 14, top + 14), 44)
    cx = P + pw + 40; cw = W - P - cx; ch = round(cw * 0.72) + 20
    cy = top + (min(ph_h, (int(H * 0.80) if is916 else H - 60) - top) - ch) // 2 if size != "1x1" else top + 40
    cv.shadow((cx, cy, cx + cw, cy + ch), 30, blur=22, offset=(0, 14), alpha=60); cv.d.rounded_rectangle((cx, cy, cx + cw, cy + ch), radius=30, fill=WH)
    cv.paste_rounded(cover(load(cfg["photo"]), cw - 20, ch - 20, cfg["photo_focal"]), (cx + 10, cy + 10), 22)
    # logo: bottom-right corner on the yellow, never over the fence card or the phone
    cv.logo((W - P - 180, (int(H * 0.80) - 90) if is916 else H - P - 78), 180)
    return cv

def f08(size):
    W, H = CFG["sizes"][size]; cfg = CFG["f08"]; T = cfg["text"]; is916 = size == "9x16"; P = 72
    before = glob.glob(cfg["before"] + ".*"); after = glob.glob(cfg["after"] + ".*"); split = bool(before and after)
    cv = Canvas(W, H, bg=CH); d = cv.d; DIV = 6
    band_top = {"1x1": 640, "4x5": 760, "9x16": 1080}[size]
    if split:
        b, a = load(before[0]), load(after[0])
        if is916: h2 = (band_top - DIV) // 2; cv.im.paste(cover(b, W, h2), (0, 0)); cv.im.paste(cover(a, W, h2), (0, h2 + DIV)); d.rectangle((0, h2, W, h2 + DIV), fill=WH); lab = [(0, 0), (0, h2 + DIV)]
        else: w2 = (W - DIV) // 2; cv.im.paste(cover(b, w2, band_top), (0, 0)); cv.im.paste(cover(a, w2, band_top), (w2 + DIV, 0)); d.rectangle((w2, 0, w2 + DIV, band_top), fill=WH); lab = [(0, 0), (w2 + DIV, 0)]
        fl = font("bold", 44)
        for (x, y), txt, bg, fg in zip(lab, ["BEFORE", "AFTER"], [CH, YE], [WH, CH]):
            ly = max(y + 24, int(H * 0.14) + 12) if is916 else y + 24; cv.pill((x + 24, ly), [txt], fl, bg, fg, padx=24, pady=12, radius=12)
        headline = T["headline_split"]
    else:
        tiles = [load(p) for p in cfg["grid"]]; labels = [os.path.basename(p).split("f08_city_")[-1].rsplit(".", 1)[0].replace("_", " ").title() for p in cfg["grid"]]
        labels = [("[" + l.upper() + "]") if l.upper().startswith("CITY") else l for l in labels]   # placeholder until real names are in the file names
        if cfg.get("grid_labels"): labels = cfg["grid_labels"]                                      # explicit labels from config.json win
        if is916:
            th = (band_top - 2 * DIV) // 3; rects = [(0, i * (th + DIV), W, th) for i in range(3)]
        else:
            lw = 648; rects = [(0, 0, lw, band_top), (lw + DIV, 0, W - lw - DIV, (band_top - DIV) // 2), (lw + DIV, (band_top - DIV) // 2 + DIV, W - lw - DIV, band_top - (band_top - DIV) // 2 - DIV)]
        fl = font("bold", 44)
        for (x, y, w, h), im, foc, lab in zip(rects, tiles, cfg["grid_focal"], labels):
            cv.im.paste(cover(im, w, h, foc), (x, y))
            ly = y + h - 24 - (44 + 24)
            if is916: ly = max(ly, int(H * 0.14) + 12)
            cv.pill((x + 24, ly), [lab], fl, CH, YE, padx=(14 if size == "1x1" else 22), pady=(8 if size == "1x1" else 12), radius=12)
        if is916: [d.rectangle((0, r[1] + r[3], W, r[1] + r[3] + DIV), fill=WH) for r in rects[:2]]
        else: d.rectangle((648, 0, 648 + DIV, band_top), fill=WH); d.rectangle((648, (band_top - DIV) // 2, W, (band_top - DIV) // 2 + DIV), fill=WH)
        headline = T["headline_grid"]
    d = cv.d; d.rectangle((0, band_top, W, H), fill=CH)
    y = band_top + 44; hl = {"1x1": 50, "4x5": 64, "9x16": 62}[size]; fh = font("heavy", hl); lines = wrap(d, headline, fh, W - 2 * P - 160); lh = int(hl * 1.06)
    for i, l in enumerate(lines): cv.text((P, y + i * lh), l, fh, WH, anchor="la")
    y += len(lines) * lh + 16; pz = 48 if size == "1x1" else 52; cv.text((P, y), T["price"], font("bold", pz), YE, anchor="la"); y += pz + 14
    cv.text((P, y), T["small"], font("bold", 46), WH, anchor="la"); y += 46 + 24
    cv.pill((P, y), [sub(T["pill"])], font("bold", 46), YE, CH, padx=(24 if size == "1x1" else 32), pady=(14 if size == "1x1" else 20))
    cv.logo((W - P - 160, band_top + 40), 160)
    return cv

BUILD = {"f06": f06, "f07": f07, "f08": f08}

def contact_sheet(rows):
    tiles = []; H = 540; f = ImageFont.truetype(CFG["fonts"]["bold"], 26)
    for name, path in rows:
        im = Image.open(path).convert("RGB"); w = round(im.width * H / im.height); im = im.resize((w, H), Image.LANCZOS)
        t = Image.new("RGB", (w, H + 40), (24, 24, 26)); t.paste(im, (0, 40)); ImageDraw.Draw(t).text((8, 8), name, font=f, fill=WH); tiles.append(t)
    cols = 3; rws = (len(tiles) + cols - 1) // cols; cw = max(t.width for t in tiles) + 16; rh = H + 56
    sheet = Image.new("RGB", (cols * cw + 16, rws * rh + 16), (24, 24, 26))
    for i, t in enumerate(tiles): sheet.paste(t, (16 + (i % cols) * cw, 16 + (i // cols) * rh))
    sheet.save("out/preview_contact_sheet.png", optimize=True)

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]; final = "--final" in sys.argv
    which = ["f06", "f07", "f08"] if not args or args == ["all"] else args
    qa_rows = []; rows = []
    for key in which:
        for size in ("1x1", "4x5", "9x16"):
            cv = BUILD[key](size); name = f"{key}_{size}.png"; path = f"out/{name}"; kb = save_png(cv, path) / 1024
            if final: save_png(cv, f"out/final/{name}")
            q = cv.qa(name, size == "9x16"); q["file_kb"] = round(kb); qa_rows.append(q); rows.append((name, path))
            flags = []
            if q["text_area_pct"] > MAX_TEXT_PCT: flags.append("TEXT AREA > 25%")
            if q["smallest_font_px"] < MIN_FONT: flags.append("FONT < 44")
            if q["lowest_contrast"] < MIN_CONTRAST: flags.append("CONTRAST < 4.5")
            if kb * 1024 > MAX_BYTES: flags.append("FILE > 1 MB")
            if q["safe_zone_9x16"].startswith("FAIL"): flags.append("SAFE ZONE")
            q["flags"] = ", ".join(flags) or "ok"
    allrows = [(n, f"out/{n}") for k in ("f06", "f07", "f08") for s in ("1x1", "4x5", "9x16") for n in [f"{k}_{s}.png"] if os.path.exists(f"out/{n}")]
    contact_sheet(allrows)
    hdr = ["file", "size", "text_area_pct", "smallest_font_px", "lowest_contrast", "file_kb", "safe_zone_9x16", "flags"]
    md = "| " + " | ".join(hdr) + " |\n|" + "---|" * len(hdr) + "\n" + "\n".join("| " + " | ".join(str(r[h]) for h in hdr) + " |" for r in qa_rows)
    open("out/qa.md", "w").write(md + "\n"); print(md)
