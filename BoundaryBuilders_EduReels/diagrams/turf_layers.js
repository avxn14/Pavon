/* turf_layers (video 05): an artificial-turf section that slopes gently down away from a house wall at the right edge. opts.part = 1 or 2; opts.cont continues.
   part 1 (beat 2): dark soil and the house wall; the dug-out zone lightens, a dashed excavation line slides in with a gold 4-6 IN dimension; the weed barrier
     (thin off-white line) draws along the bottom of the cut; the gravel base builds in two lifts (off-white dots), compacted together (two squashes with hit sfx from the
     script), a gold tint and a gold 3-4 IN dimension; the turf (backing, blades, infill dots) lands on top; a gold slope arrow AWAY FROM HOUSE; the footnote
     TYPICAL. WET CLAY: MAY NEED MORE BASE OR A DRAIN.
   part 2 (beat 3, cont): a plastic sheet slides in under the turf, BLUE water pools on it with a grey X; the sheet slides out, the water drains down through
     the gravel (blue arrows) and a gold tick replaces the X.
   Band coordinates 1080x782. The section spans the whole band width (the inset, photo A 320x400 at x 72-392 / y 360-760, sits over its left end), so every
   label lives right of x 430 or above band y 340: dimension labels on dark chips over the layers, WEED BARRIER in the soil, the slope label above the turf,
   the two footnote lines in the sky above the section (right-aligned at x 960, clear of the small logo which ends at band y 74 and of the house wall at x 1000). */
Object.assign(DIAGRAMS, {
  turf_layers(svg, t0, opts) {
    opts = opts || {}; const part = Number(opts.part) || 1;
    const tb = opts.cont ? t0 - 20 : t0;                 // base already finished when a continuation beat starts
    const t1 = part === 1 ? t0 : tb;                     // part 1 animation times
    const XH = 1000, K = 0.05, X0 = 440, S0 = 400;       // house wall face; slope (rises toward the house); surface y 400 at x 440
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

    /* ---- base: soil, grade line, house wall (built with tb) ---- */
    const soil = sv('polygon', { points: `0,${surf(0)} 1080,${surf(1080)} 1080,782 0,782`, fill: SOIL }, svg); fadeIn(soil, tb, .3);
    const grade = sv('line', { x1: 0, y1: surf(0), x2: XH, y2: surf(XH), stroke: MID, 'stroke-width': 4 }, svg); fadeIn(grade, tb, .3);
    const house = sv('g', {}, svg);
    sv('rect', { x: XH, y: 90, width: 80, height: surf(XH) - 90 + 2, fill: MID }, house);
    for (let y = 120; y < surf(XH) - 40; y += 30) sv('line', { x1: XH, y1: y, x2: 1080, y2: y, stroke: '#333333', 'stroke-width': 3 }, house);   // siding
    sv('rect', { x: XH, y: surf(XH) - 34, width: 80, height: 36, fill: LIGHT }, house);   // foundation
    fadeIn(house, tb + .1, .3);

    /* ---- part 1: dig out 4-6 IN ---- */
    const cut = poly(0, XH, 0, D, '#2b2b2b'); fadeIn(cut, t1 + .4, .4); tw(cut, t1 + 4.2, t1 + 4.6, { o: 0 }, EO);   // the dug-out zone (filled again by the base)
    const dashed = sv('line', { x1: 0, y1: surf(0) + D, x2: XH, y2: surf(XH) + D, stroke: OFF, 'stroke-width': 4, 'stroke-dasharray': '18 14' }, svg);
    slideIn(dashed, t1 + .5, -40); tw(dashed, t1 + 2.1, t1 + 2.7, { o: 0 }, EO);   // the cut line disappears under the fabric
    /* ---- gravel base in two lifts, each compacted (squash + hit sfx from the script at beat +3.9 and +4.6) ---- */
    const lift1 = sv('g', {}, svg); poly(0, XH, D - 70, D, MID, lift1); dots(lift1, 0, XH, D - 64, D - 6, 130, 2.5, 5.5);
    growUp(lift1, t1 + 2.9, .45); tw(lift1, t1 + 4.4, t1 + 4.5, { sy: .93 }, EO); tw(lift1, t1 + 4.5, t1 + 4.65, { sy: 1 }, EO);
    const lift2 = sv('g', {}, svg); poly(0, XH, GT, D - 70, MID, lift2); dots(lift2, 0, XH, GT + 6, D - 76, 130, 2.5, 5.5);
    growUp(lift2, t1 + 3.5, .45); tw(lift2, t1 + 4.4, t1 + 4.5, { sy: .93 }, EO); tw(lift2, t1 + 4.5, t1 + 4.65, { sy: 1 }, EO); tw(lift2, t1 + 4.8, t1 + 4.9, { sy: .94 }, EO); tw(lift2, t1 + 4.9, t1 + 5.05, { sy: 1 }, EO);
    const glow = poly(0, XH, GT, D, GOLD); reg(glow, { o: 0 }); tw(glow, t1 + 4.9, t1 + 5.3, { o: .18 }, EO); tw(glow, t1 + 5.8, t1 + 6.2, { o: .10 }, EO);   // the base is the layer being talked about
    /* ---- weed barrier: thin off-white line on the subgrade (drawn above the gravel in z-order so it stays visible) ---- */
    const barrier = sv('line', { x1: 0, y1: surf(0) + D - 2, x2: XH, y2: surf(XH) + D - 2, stroke: OFF, 'stroke-width': 5, 'stroke-linecap': 'round' }, svg);
    barrier.style.filter = SH; drawOn(barrier, t1 + 1.9, .7);
    /* ---- turf: backing, blades, infill dots ---- */
    const turf = sv('g', {}, svg);
    poly(0, XH, TB, GT, LIGHT, turf);
    for (let x = 3; x < XH; x += 9) { const h = 16 + rnd() * 16, lean = (rnd() - .5) * 8; sv('line', { x1: x, y1: (surf(x) + TB + 1).toFixed(1), x2: (x + lean).toFixed(1), y2: (surf(x) + TB - h).toFixed(1), stroke: BLADE, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, turf); }
    dots(turf, 0, XH, TB - 10, TB - 2, 120, 1.6, 2.8, .9);
    growUp(turf, t1 + 5.1, .5); tw(grade, t1 + 5.1, t1 + 5.4, { o: 0 }, EO);
    /* ---- labels and arrows (on top) ---- */
    vdim(940, surf(940), surf(940) + D, '4-6 IN', -1, t1 + .9, 'dim46');
    const wb = svText(svg, 460, 662, 'WEED BARRIER', 40, OFF, 'start', 'wb'); slideIn(wb, t1 + 2.2);
    vdim(480, surf(480) + GT, surf(480) + D, '3-4 IN', 1, t1 + 3.6, 'dim34');
    arrow(svg, `M930 ${(surf(930) - 56).toFixed(1)} L560 ${(surf(560) - 56).toFixed(1)}`, [930, surf(930) - 56], [560, surf(560) - 56], GOLD, t1 + 5.4, .6, 8, 26);
    const sl = svText(svg, 745, 292, 'AWAY FROM HOUSE', 40, OFF, 'middle', 'slope'); slideIn(sl, t1 + 5.6);
    const f1 = svText(svg, 960, 150, 'TYPICAL. WET CLAY: MAY', 40, OFF, 'end', 'foot'); slideIn(f1, t1 + 4.3);
    const f2 = svText(svg, 960, 196, 'NEED MORE BASE OR A DRAIN', 40, OFF, 'end', 'foot'); slideIn(f2, t1 + 4.45);

    if (part >= 2) {
      /* ---- part 2: plastic under the turf traps water (grey X); plastic out, water drains through to the gravel (gold tick) ---- */
      const sheet = poly(0, XH, GT, GT + 8, PLASTIC); sheet.style.filter = SH; reg(sheet, { o: 0, x: 320 }); tw(sheet, t0, t0 + .5, { o: 1, x: 0 }, EO);
      const water = poly(0, XH, 10, GT, 'rgba(38,126,206,.7)'); growUp(water, t0 + .9, .6);
      const X = markX(svg, 640, surf(640) + 34, t0 + 1.5);
      tw(sheet, t0 + 2.3, t0 + 2.7, { x: 340, o: 0 }, EI);
      tw(X, t0 + 2.3, t0 + 2.55, { o: 0, s: .6 }, EI);
      tw(water, t0 + 2.5, t0 + 3.1, { sy: .04, o: .25 }, EI);
      [[688, 0], [714, .1], [740, .2]].forEach(([x, dl]) => arrow(svg, `M${x} ${(surf(x) + 64).toFixed(1)} L${x} ${(surf(x) + 184).toFixed(1)}`, [x, surf(x) + 64], [x, surf(x) + 184], BLUE, t0 + 2.55 + dl, .5, 6, 22));
      markTick(svg, 640, surf(640) + 34, t0 + 3.0);
    }
  }
});
