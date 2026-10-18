/* bedding (video 06, beat 3): two small paver sections side by side. Left [X]: a lumpy base with thick bedding filling the dips, the pavers
   drop in flat, then settle to follow the lumps ("the bumps show through"). Right [TICK]: a flat compacted base, an even ~1 IN bedding
   layer (gold dimension) and flat pavers. Band coordinates 1080x782. The 4:3 inset (320x240) covers x 72-392, y 520-760, so the whole
   drawing sits at x 430-1050; labels stay above y 240 and left of x 1015. Scale: 30 px = 1 in (bedding 30 px, thick bedding up to 90 px).
   Also registers CALLOUTS.dimV, a vertical gold dimension tick for photo/clip beats: {x, y0, y1, label, t, side ('right'|'left'), size}. */
Object.assign(DIAGRAMS, {
  bedding(svg, t0, opts) {
    opts = opts || {};
    const SOIL = '#1c1c1c', MID = '#434343', LIGHT = '#6b6b6b', PAVER = '#8a8a8a', PAVER2 = '#9a9a9a';
    const SH = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))';
    const GROUND = 560;                                        // bottom of both sections (soil below)
    function markX(x, y, t) { const g = sv('g', {}, svg); g.style.filter = SH; sv('circle', { cx: x, cy: y, r: 34, fill: MID }, g);
      sv('path', { d: `M${x - 13} ${y - 13} L${x + 13} ${y + 13} M${x + 13} ${y - 13} L${x - 13} ${y + 13}`, stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; reg(g, { o: 0, s: .4 }); tw(g, t, t + .4, { o: 1, s: 1 }, EOB); return g; }
    function markTick(x, y, t) { const g = sv('g', {}, svg); g.style.filter = SH; sv('circle', { cx: x, cy: y, r: 34, fill: GOLD }, g);
      sv('path', { d: `M${x - 15} ${y + 1} L${x - 4} ${y + 12} L${x + 16} ${y - 11}`, fill: 'none', stroke: '#111', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; reg(g, { o: 0, s: .4 }); tw(g, t, t + .4, { o: 1, s: 1 }, EOB); return g; }
    function dimV(x, y0, y1, label, t, group) {               // gold vertical dimension with the label to the right
      const gr = sv('g', {}, svg); const L = { stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' };
      sv('line', Object.assign({ x1: x, y1: y0, x2: x, y2: y1 }, L), gr); sv('line', Object.assign({ x1: x - 20, y1: y0, x2: x + 20, y2: y0 }, L), gr); sv('line', Object.assign({ x1: x - 20, y1: y1, x2: x + 20, y2: y1 }, L), gr);
      svText(gr, x + 32, (y0 + y1) / 2 + 16, label, 44, GOLD, 'start', group); gr.style.filter = SH;
      gr.style.transformBox = 'fill-box'; gr.style.transformOrigin = 'left center'; reg(gr, { o: 0, sx: .3 }); tw(gr, t, t + .45, { o: 1, sx: 1 }, EOX); return gr; }
    // soil across the drawing
    const soil = sv('rect', { x: 430, y: GROUND, width: 650, height: 782 - GROUND, fill: SOIL }, svg); fadeIn(soil, t0, .3);

    /* ---- LEFT: lumpy base, thick bedding, pavers that settle [X] ---- */
    const LX0 = 440, LX1 = 690, TOP = 330;                    // paver top line (both sections)
    const lumps = `M${LX0} ${GROUND} L${LX0} 470 Q${LX0 + 40} 400 ${LX0 + 80} 460 Q${LX0 + 120} 520 ${LX0 + 160} 440 Q${LX0 + 200} 380 ${LX0 + 240} 470 L${LX1} 450 L${LX1} ${GROUND} Z`;
    const lbase = sv('path', { d: lumps, fill: MID }, svg); growUp(lbase, t0 + .1, .5);
    const lgrav = gravel(svg, LX0 + 6, LX1 - 6, 470, GROUND - 8, 11); fadeIn(lgrav, t0 + .4, .3);
    const lbed = sv('path', { d: `M${LX0} 400 L${LX1} 400 L${LX1} 450 L${LX1 - 40} 470 Q${LX1 - 80} 380 ${LX1 - 120} 440 Q${LX1 - 160} 520 ${LX1 - 200} 460 Q${LX1 - 240} 400 ${LX0} 470 Z`, fill: LIGHT }, svg); fadeIn(lbed, t0 + .6, .35);
    const lpav = []; for (let i = 0; i < 4; i++) { const p = sv('rect', { x: LX0 + 4 + i * 61, y: TOP, width: 56, height: 70, fill: i % 2 ? PAVER2 : PAVER, rx: 2 }, svg); p.style.transformBox = 'fill-box'; p.style.transformOrigin = 'center';
      reg(p, { o: 0, y: -80 }); const ta = t0 + .9 + i * .12; tw(p, ta, ta + .1, { o: 1 }, LIN); tw(p, ta, ta + .4, { y: 0 }, EOB); lpav.push(p); }
    // the bumps show through: pavers settle into the dips (deepest bedding sinks most)
    const settle = [[14, 3], [-6, -4], [18, 4], [4, -2]]; const ts = t0 + 1.5;
    lpav.forEach((p, i) => tw(p, ts, ts + .9, { y: settle[i][0], r: settle[i][1] }, EIO));
    const l1 = svText(svg, LX0, 130, 'LUMPY BASE', 40, OFF, 'start', 'lumpy'); slideIn(l1, t0 + .5);
    const l2 = svText(svg, LX0, 178, 'THICK BEDDING', 40, OFF, 'start', 'thick'); slideIn(l2, t0 + .8);
    markX(LX1 - 20, 250, t0 + 1.9);

    /* ---- RIGHT: flat compacted base, ~1 IN bedding, flat pavers [TICK] ---- */
    const RX0 = 780, RX1 = 1050, BEDH = 30, tr = t0 + 1.9;   // right section starts while the left pavers settle (beat is ~4.3 s)
    const rbase = sv('rect', { x: RX0, y: TOP + 70 + BEDH, width: RX1 - RX0, height: GROUND - (TOP + 70 + BEDH), fill: MID }, svg); growUp(rbase, tr, .45);
    const rgrav = gravel(svg, RX0 + 6, RX1 - 6, TOP + 70 + BEDH + 8, GROUND - 8, 23); fadeIn(rgrav, tr + .3, .3);
    const rbed = sv('rect', { x: RX0, y: TOP + 70, width: RX1 - RX0, height: BEDH, fill: LIGHT }, svg); growUp(rbed, tr + .45, .3);
    for (let i = 0; i < 4; i++) { const p = sv('rect', { x: RX0 + 4 + i * 66, y: TOP, width: 60, height: 70, fill: i % 2 ? PAVER2 : PAVER, rx: 2 }, svg);
      reg(p, { o: 0, y: -80 }); const ta = tr + .8 + i * .12; tw(p, ta, ta + .1, { o: 1 }, LIN); tw(p, ta, ta + .4, { y: 0 }, EOB); }
    dimV(RX0 - 34, TOP + 70, TOP + 70 + BEDH, '', tr + 1.2, 'dim1');   // the number sits in the EVEN ~1 IN header (no room for a label between the sections)
    const r1 = svText(svg, RX0, 130, 'FLAT BASE', 40, OFF, 'start', 'flat'); slideIn(r1, tr + .3);
    const r2 = svText(svg, RX0, 178, 'EVEN ~1 IN', 40, GOLD, 'start', 'even'); slideIn(r2, tr + 1.3);
    markTick(RX1 - 60, 250, tr + 1.7);
  }
});
// vertical gold dimension tick over a photo/clip band: {x, y0, y1, label, t (.4), side 'right' (default) | 'left', size (44), group}
CALLOUTS.dimV = function (svg, t0, o) {
  const gr = sv('g', {}, svg); gr.style.filter = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))'; const L = { stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' };
  sv('line', Object.assign({ x1: o.x, y1: o.y0, x2: o.x, y2: o.y1 }, L), gr); sv('line', Object.assign({ x1: o.x - 22, y1: o.y0, x2: o.x + 22, y2: o.y0 }, L), gr); sv('line', Object.assign({ x1: o.x - 22, y1: o.y1, x2: o.x + 22, y2: o.y1 }, L), gr);
  const left = o.side === 'left'; svText(gr, left ? o.x - 34 : o.x + 34, (o.y0 + o.y1) / 2 + 16, o.label, o.size || 44, GOLD, left ? 'end' : 'start', o.group || 'dimV');
  gr.style.transformBox = 'fill-box'; gr.style.transformOrigin = left ? 'right center' : 'left center'; const d = o.t === undefined ? .4 : o.t;
  reg(gr, { o: 0, sx: .3 }); tw(gr, t0 + d, t0 + d + .45, { o: 1, sx: 1 }, EOX); return gr;
};
