/* turf_layers (video 05): an artificial-turf cross-section drawn as a cutaway block that slopes gently down away from a house wall at the right edge.
   opts.part = 1 or 2; opts.cont continues the previous beat (part 1 already finished).
   part 1 (beat 2): dark soil and the house wall; the dug-out zone lightens, a dashed excavation line slides in with a gold 4-6 IN dimension; the weed barrier
     (thin line) draws along the bottom of the cut in GOLD while the voice says "weed barrier", then settles to off-white as the gravel starts; the gravel base
     builds in two lifts (off-white dots), compacted together (two squashes with hit sfx from the script), a gold tint and a gold 3-4 IN dimension; the turf
     (backing, blades, infill dots) lands on top; a gold slope arrow AWAY FROM HOUSE; the footnote TYPICAL. WET CLAY: MAY NEED MORE BASE OR A DRAIN.
   part 2 (beat 3, cont): a plastic sheet slides in under the turf through the cut face, BLUE water pools on it with a grey X; the sheet slides back out,
     the water drains down through the gravel (blue arrows) and a gold tick replaces the X.
   Band coordinates 1080x782. The block runs from x 420 to the house wall at x 1000 and every layer sits inside an SVG clipPath at x >= 420, so NOTHING of the
   section is drawn behind the inset (photo A 320x400 at x 72-392 / y 360-760) or peeks out left of it. Labels: dimension labels on dark chips over the layers,
   WEED BARRIER in the soil, the slope label above the turf, the two footnote lines in the sky above the section (right-aligned at x 960: two 40 px lines
   cannot sit bottom-right of the band and stay left of x 920 and clear of the inset, so they go top-right, under the small logo which ends at band y 20). */
Object.assign(DIAGRAMS, {
  turf_layers(svg, t0, opts) {
    opts = opts || {}; const part = Number(opts.part) || 1;
    const tb = opts.cont ? t0 - 20 : t0;                 // base already finished when a continuation beat starts
    const t1 = part === 1 ? t0 : tb;                     // part 1 animation times
    const XL = 420, XH = 1000, K = 0.05, X0 = 440, S0 = 400;   // block left (cut face), house wall face; slope (rises toward the house); surface y 400 at x 440
    const surf = x => S0 - K * (x - X0);                 // y of the original grade / finished turf surface at x
    const D = 200, GT = 60, TB = 48;                     // offsets below the surface: excavation bottom, gravel top, turf backing top
    const SOIL = '#1c1c1c', MID = '#434343', LIGHT = '#6b6b6b', BLADE = '#9a9a9a', PLASTIC = '#c9d3de';
    const SH = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))';
    const stroke = (col, w) => ({ fill: 'none', stroke: col, 'stroke-width': w || 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const poly = (xa, xb, oa, ob, fill, parent) => sv('polygon', { points: `${xa},${(surf(xa) + oa).toFixed(1)} ${xb},${(surf(xb) + oa).toFixed(1)} ${xb},${(surf(xb) + ob).toFixed(1)} ${xa},${(surf(xa) + ob).toFixed(1)}`, fill }, parent || svg);
    let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };   // seeded: every frame is a pure function of t
    function dots(parent, xa, xb, oa, ob, n, rmin, rmax, op) {   // seeded dots inside the sloped band between offsets oa and ob
      const g = sv('g', {}, parent);
      for (let i = 0; i < n; i++) { const x = xa + rnd() * (xb - xa); sv('circle', { cx: x.toFixed(1), cy: (surf(x) + oa + rnd() * (ob - oa)).toFixed(1), r: (rmin + rnd() * (rmax - rmin)).toFixed(1), fill: OFF, opacity: op || .8 }, g); }
      return g;
    }
    function drawOn(e, t, d) {   // stroke draw-on like drawPath, but the dash boundary starts 4 px before the path so no round-cap dot shows before t
      const L = e.getTotalLength() + 2, P = L + 8; e.setAttribute('stroke-dasharray', P + ' ' + P); reg(e, { o: 1, dash: P + 4 }); tw(e, t, t + (d || .6), { dash: 0 }, EO);
    }
    function head(parent, x0, y0, x1, y1, col, size, w) {   // open arrow head at (x1,y1) pointing away from (x0,y0)
      const a = Math.atan2(y1 - y0, x1 - x0), s = size || 30;
      return sv('path', { d: `M${(x1 - s * Math.cos(a - .5)).toFixed(1)} ${(y1 - s * Math.sin(a - .5)).toFixed(1)} L${x1} ${y1} L${(x1 - s * Math.cos(a + .5)).toFixed(1)} ${(y1 - s * Math.sin(a + .5)).toFixed(1)}`, ...stroke(col, w) }, parent);
    }
    function arrow(parent, d, tail, tip, col, t, dur, w, hs) {   // path d drawn on, then its head fades in
      const gr = sv('g', {}, parent); gr.style.filter = SH;
      const p = sv('path', { d, ...stroke(col, w) }, gr); const h = head(gr, tail[0], tail[1], tip[0], tip[1], col, hs || 30, w);
      drawOn(p, t, dur); fadeIn(h, t + dur - .12, .18); return gr;
    }
    function pop(e, t, d) { e.style.transformBox = 'fill-box'; e.style.transformOrigin = 'center'; reg(e, { o: 0, s: .3 }); tw(e, t, t + (d || .4), { o: 1, s: 1 }, EOB); }
    function markTick(parent, cx, cy, t) {   // gold tick circle
      const g = sv('g', {}, parent); g.style.filter = SH;
      sv('circle', { cx, cy, r: 30, fill: GOLD }, g);
      sv('path', { d: `M${cx - 14} ${cy + 1} L${cx - 4} ${cy + 11} L${cx + 15} ${cy - 11}`, ...stroke('#111', 6) }, g);
      pop(g, t); return g;
    }
    function markX(parent, cx, cy, t) {      // grey X circle
      const g = sv('g', {}, parent); g.style.filter = SH;
      sv('circle', { cx, cy, r: 30, fill: MID }, g);
      sv('path', { d: `M${cx - 12} ${cy - 12} L${cx + 12} ${cy + 12} M${cx + 12} ${cy - 12} L${cx - 12} ${cy + 12}`, ...stroke('#fff', 6) }, g);
      pop(g, t); return g;
    }
    function chipText(parent, x, y, txt, size, fill, anchor, group) {   // label on a dark chip (readable over the dotted layers)
      const g = sv('g', {}, parent); const tx = svText(g, x, y, txt, size, fill, anchor, group); const bb = tx.getBBox();
      const bg = sv('rect', { x: (bb.x - 16).toFixed(1), y: (bb.y - 6).toFixed(1), width: (bb.width + 32).toFixed(1), height: (bb.height + 12).toFixed(1), rx: 14, fill: 'rgba(0,0,0,.55)' }, g); g.insertBefore(bg, tx); return g;
    }
    function vdim(x, y0, y1, label, side, t, group) {   // vertical gold dimension line; chip label to the left (side -1) or right (+1)
      const g = sv('g', {}, svg); g.style.filter = SH;
      const L = { stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' };
      sv('line', Object.assign({ x1: x, y1: y0, x2: x, y2: y1 }, L), g);
      sv('line', Object.assign({ x1: x - 22, y1: y0, x2: x + 22, y2: y0 }, L), g);
      sv('line', Object.assign({ x1: x - 22, y1: y1, x2: x + 22, y2: y1 }, L), g);
      chipText(g, x + side * 40, (y0 + y1) / 2 + 17, label, 48, GOLD, side < 0 ? 'end' : 'start', group);
      growUp(g, t, .5); return g;
    }

    /* ---- the section lives in a clipped group: nothing left of the cut face at x 420 is ever painted (the inset ends at x 392) ---- */
    const cid = 'tlclip' + part + (opts.cont ? 'c' : '');
    const defs = sv('defs', {}, svg); const cp = sv('clipPath', { id: cid }, defs); sv('rect', { x: XL, y: 0, width: 1080 - XL, height: 782 }, cp);
    const sec = sv('g', { 'clip-path': `url(#${cid})` }, svg);

    /* ---- base: soil, grade line, house wall (built with tb) ---- */
    const soil = sv('polygon', { points: `${XL},${surf(XL)} ${XH},${surf(XH)} ${XH},782 ${XL},782`, fill: SOIL }, sec); fadeIn(soil, tb, .3);
    const grade = sv('line', { x1: XL, y1: surf(XL), x2: XH, y2: surf(XH), stroke: MID, 'stroke-width': 4 }, sec); fadeIn(grade, tb, .3);
    const house = sv('g', {}, svg);
    sv('rect', { x: XH, y: 90, width: 80, height: surf(XH) - 90 + 2, fill: MID }, house);
    for (let y = 120; y < surf(XH) - 40; y += 30) sv('line', { x1: XH, y1: y, x2: 1080, y2: y, stroke: '#333333', 'stroke-width': 3 }, house);   // siding
    sv('rect', { x: XH, y: surf(XH) - 34, width: 80, height: 36, fill: LIGHT }, house);   // foundation
    fadeIn(house, tb + .1, .3);

    /* ---- part 1: dig out 4-6 IN (VO at 1.25x: "Dig out four to six inches" beat 0.12-1.70, "lay a weed barrier" 1.94-2.89, "then three to four inches of
            compacted crushed gravel" 3.14-5.84; t1 = beat + 0.2) ---- */
    const cut = poly(XL, XH, 0, D, '#2b2b2b', sec); fadeIn(cut, t1 + .3, .4); tw(cut, t1 + 4.0, t1 + 4.4, { o: 0 }, EO);   // the dug-out zone (filled again by the base)
    const dashed = sv('line', { x1: XL, y1: surf(XL) + D, x2: XH, y2: surf(XH) + D, stroke: OFF, 'stroke-width': 4, 'stroke-dasharray': '18 14' }, sec);
    slideIn(dashed, t1 + .45, -40); tw(dashed, t1 + 1.9, t1 + 2.4, { o: 0 }, EO);   // the cut line disappears under the fabric
    /* ---- gravel base in two lifts, each compacted (squash + hit sfx from the script at beat +4.55 and +4.9) ---- */
    const lift1 = sv('g', {}, sec); poly(XL, XH, D - 70, D, MID, lift1); dots(lift1, XL, XH, D - 64, D - 6, 80, 2.5, 5.5);
    growUp(lift1, t1 + 2.95, .45); tw(lift1, t1 + 4.35, t1 + 4.45, { sy: .93 }, EO); tw(lift1, t1 + 4.45, t1 + 4.6, { sy: 1 }, EO);
    const lift2 = sv('g', {}, sec); poly(XL, XH, GT, D - 70, MID, lift2); dots(lift2, XL, XH, GT + 6, D - 76, 80, 2.5, 5.5);
    growUp(lift2, t1 + 3.45, .45); tw(lift2, t1 + 4.35, t1 + 4.45, { sy: .93 }, EO); tw(lift2, t1 + 4.45, t1 + 4.6, { sy: 1 }, EO); tw(lift2, t1 + 4.7, t1 + 4.8, { sy: .94 }, EO); tw(lift2, t1 + 4.8, t1 + 4.95, { sy: 1 }, EO);
    const glow = poly(XL, XH, GT, D, GOLD, sec); reg(glow, { o: 0 }); tw(glow, t1 + 4.35, t1 + 4.75, { o: .18 }, EO); tw(glow, t1 + 5.6, t1 + 5.9, { o: .10 }, EO);   // the base is the layer being talked about
    /* ---- weed barrier: thin line on the subgrade (above the gravel in z-order so it stays visible); a gold copy lights it up while the voice names it ---- */
    const barrier = sv('line', { x1: XL, y1: surf(XL) + D - 2, x2: XH, y2: surf(XH) + D - 2, stroke: OFF, 'stroke-width': 5, 'stroke-linecap': 'round' }, sec);
    barrier.style.filter = SH; drawOn(barrier, t1 + 1.75, .6);
    const barrierG = sv('line', { x1: XL, y1: surf(XL) + D - 2, x2: XH, y2: surf(XH) + D - 2, stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' }, sec);
    barrierG.style.filter = SH; drawOn(barrierG, t1 + 1.75, .6); tw(barrierG, t1 + 3.0, t1 + 3.5, { o: 0 }, EO);   // gold while "lay a weed barrier", off-white once the gravel starts
    /* ---- turf: backing, blades, infill dots ---- */
    const turf = sv('g', {}, sec);
    poly(XL, XH, TB, GT, LIGHT, turf);
    for (let x = XL + 3; x < XH; x += 9) { const h = 16 + rnd() * 16, lean = (rnd() - .5) * 8; sv('line', { x1: x, y1: (surf(x) + TB + 1).toFixed(1), x2: (x + lean).toFixed(1), y2: (surf(x) + TB - h).toFixed(1), stroke: BLADE, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, turf); }
    dots(turf, XL, XH, TB - 10, TB - 2, 70, 1.6, 2.8, .9);
    growUp(turf, t1 + 4.95, .45); tw(grade, t1 + 4.95, t1 + 5.25, { o: 0 }, EO);
    /* ---- labels and arrows (on top, outside the clip so their shadows are not cut) ---- */
    vdim(940, surf(940), surf(940) + D, '4-6 IN', -1, t1 + .7, 'dim46');
    const wb = svText(svg, 462, 662, 'WEED BARRIER', 40, OFF, 'start', 'wb'); slideIn(wb, t1 + 2.1);
    vdim(490, surf(490) + GT, surf(490) + D, '3-4 IN', 1, t1 + 3.8, 'dim34');
    arrow(svg, `M930 ${(surf(930) - 56).toFixed(1)} L560 ${(surf(560) - 56).toFixed(1)}`, [930, surf(930) - 56], [560, surf(560) - 56], GOLD, t1 + 5.05, .5, 8, 26);
    const sl = svText(svg, 745, 292, 'AWAY FROM HOUSE', 40, OFF, 'middle', 'slope'); slideIn(sl, t1 + 5.15);
    const f1 = svText(svg, 960, 150, 'TYPICAL. WET CLAY: MAY', 40, OFF, 'end', 'foot'); slideIn(f1, t1 + 4.1);
    const f2 = svText(svg, 960, 196, 'NEED MORE BASE OR A DRAIN', 40, OFF, 'end', 'foot'); slideIn(f2, t1 + 4.25);

    if (part >= 2) {
      /* ---- part 2 (VO at 1.25x: "Never plastic underneath." beat 0.18-1.31, "It traps the water." 1.54-2.42; t0 = beat + 0.2): plastic under the turf
              traps water (grey X); plastic out, water drains through to the gravel (gold tick) ---- */
      const OUT = XH - XL + 20;   // fully hidden behind the clip when offset by this much to the left
      const sheet = poly(XL, XH, GT, GT + 8, PLASTIC, sec); sheet.style.filter = SH; reg(sheet, { x: -OUT }); tw(sheet, t0, t0 + .5, { x: 0 }, EO);   // slides in under the turf through the cut face
      const water = poly(XL, XH, 10, GT, 'rgba(38,126,206,.7)', sec); growUp(water, t0 + .8, .6);
      const X = markX(svg, 640, surf(640) + 34, t0 + 1.4);
      tw(sheet, t0 + 2.1, t0 + 2.5, { x: -OUT }, EI);   // the sheet slides back out the way it came
      tw(X, t0 + 2.1, t0 + 2.35, { o: 0, s: .6 }, EI);
      tw(water, t0 + 2.3, t0 + 2.9, { sy: .04, o: .25 }, EI);
      [[688, 0], [714, .1], [740, .2]].forEach(([x, dl]) => arrow(svg, `M${x} ${(surf(x) + 64).toFixed(1)} L${x} ${(surf(x) + 184).toFixed(1)}`, [x, surf(x) + 64], [x, surf(x) + 184], BLUE, t0 + 2.35 + dl, .5, 6, 22));
      markTick(svg, 640, surf(640) + 34, t0 + 2.8);
    }
  }
});
