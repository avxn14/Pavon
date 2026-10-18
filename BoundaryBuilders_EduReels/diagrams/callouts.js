/* Generic callouts drawn over a photo band. Coordinates: x 0-1080, y 0-782 inside the band area (frame y 330-1110).
   Used from a beat's "callouts": [{"type": "ring", ...}]. Every function gets (svg, t0 = beat start, o = the callout object). */
(function () {
  const SH = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))';
  function polyD(pts) { let d = `M${pts[0][0]} ${pts[0][1]}`; for (let i = 1; i < pts.length; i++) d += ` L${pts[i][0]} ${pts[i][1]}`; return d; }
  function arrowHead(parent, x0, y0, x1, y1, color, size, w) {   // open head at (x1,y1), pointing away from (x0,y0)
    const a = Math.atan2(y1 - y0, x1 - x0), s = size || 34;
    const p1 = [x1 - s * Math.cos(a - .5), y1 - s * Math.sin(a - .5)], p2 = [x1 - s * Math.cos(a + .5), y1 - s * Math.sin(a + .5)];
    return sv('path', { d: `M${p1[0]} ${p1[1]} L${x1} ${y1} L${p2[0]} ${p2[1]}`, fill: 'none', stroke: color, 'stroke-width': w || 10, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
  }
  const dl = (o, def) => (o.t === undefined ? def : o.t);
  // gold ring around a detail: {x, y, r (default 90), w (stroke 10), t (delay .4), pulse (default true)}
  CALLOUTS.ring = function (svg, t0, o) {
    const c = sv('circle', { cx: o.x, cy: o.y, r: o.r || 90, fill: 'none', stroke: GOLD, 'stroke-width': o.w || 10, 'stroke-linecap': 'round' }, svg);
    c.style.filter = SH; c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center'; drawPath(c, t0 + dl(o, .4), .7);
    if (o.pulse !== false) for (let i = 0; i < 4; i++) { const a = t0 + dl(o, .4) + 1.0 + i * 1.2; tw(c, a, a + .4, { s: 1.06 }, EO); tw(c, a + .4, a + .9, { s: 1 }, EO); }
    return c;
  };
  // horizontal gold dimension line with end ticks and a label: {x0, x1, y, label, t, above (default true), size (48), group}
  CALLOUTS.dimH = function (svg, t0, o) {
    const gr = sv('g', {}, svg); const y = o.y; gr.style.filter = SH;
    sv('line', { x1: o.x0, y1: y, x2: o.x1, y2: y, stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' }, gr);
    sv('line', { x1: o.x0, y1: y - 22, x2: o.x0, y2: y + 22, stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' }, gr);
    sv('line', { x1: o.x1, y1: y - 22, x2: o.x1, y2: y + 22, stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' }, gr);
    svText(gr, (o.x0 + o.x1) / 2, o.above === false ? y + 64 : y - 28, o.label, o.size || 48, GOLD, 'middle', o.group || 'dimH');
    gr.style.transformBox = 'fill-box'; gr.style.transformOrigin = 'left center'; reg(gr, { o: 0, sx: .2 }); tw(gr, t0 + dl(o, .4), t0 + dl(o, .4) + .5, { o: 1, sx: 1 }, EOX);
    return gr;
  };
  // arrow drawn along points: {pts: [[x,y],...], color: 'gold'|'blue', w (10), head (34), t, dur (.7), label, lx, ly, size (40), anchor, group}
  CALLOUTS.arrow = function (svg, t0, o) {
    const col = o.color === 'blue' ? BLUE : GOLD; const pts = o.pts, n = pts.length;
    const gr = sv('g', {}, svg); gr.style.filter = SH;
    const p = sv('path', { d: polyD(pts), fill: 'none', stroke: col, 'stroke-width': o.w || 10, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gr);
    const h = arrowHead(gr, pts[n - 2][0], pts[n - 2][1], pts[n - 1][0], pts[n - 1][1], col, o.head, o.w);
    const d0 = t0 + dl(o, .4), dur = o.dur || .7; drawPath(p, d0, dur); fadeIn(h, d0 + dur - .15, .2);
    if (o.label) { const tx = svText(gr, o.lx === undefined ? pts[n - 1][0] : o.lx, o.ly === undefined ? pts[n - 1][1] - 30 : o.ly, o.label, o.size || 40, col === BLUE ? OFF : GOLD, o.anchor || 'middle', o.group || 'arrowlbl'); slideIn(tx, d0 + .4); }
    return gr;
  };
  // dashed gold line along points: {pts, w (8), t}
  CALLOUTS.dash = function (svg, t0, o) {
    const p = sv('path', { d: polyD(o.pts), fill: 'none', stroke: GOLD, 'stroke-width': o.w || 8, 'stroke-linecap': 'round', 'stroke-dasharray': '22 20' }, svg); p.style.filter = SH;
    fadeIn(p, t0 + dl(o, .4), .4); return p;
  };
  // short text on a dark plate inside the band: {x, y (baseline), text, t, color ('gold' or off-white), anchor, size (40), group}
  CALLOUTS.tag = function (svg, t0, o) {
    const gr = sv('g', {}, svg); const tx = svText(gr, o.x, o.y, o.text, o.size || 40, o.color === 'gold' ? GOLD : OFF, o.anchor || 'start', o.group || 'tag');
    const bb = tx.getBBox(); const bg = sv('rect', { x: bb.x - 20, y: bb.y - 12, width: bb.width + 40, height: bb.height + 24, rx: 16, fill: 'rgba(0,0,0,.66)' }, gr); gr.insertBefore(bg, tx);
    slideIn(gr, t0 + dl(o, .4)); return gr;
  };
})();
