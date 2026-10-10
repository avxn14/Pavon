/* edge_restraint (video 11, beats 2-3): side section of the EDGE of a paver patio (same layer stack and scale as paver_layers: 30 px = 1 in).
   part 1 (beat 2): the section appears with no restraint; the outer pavers creep outward, the joints open [X].
   part 2 (beat 3, cont): the pavers snap back, the restraint drops in with its spikes, a gold bracket marks the 1 IN+ CONTACT on the paver
                    face, and the base extension past the restraint lights up with the dimensions SAME AS BASE DEPTH / 6 IN [TICK].
   Band coordinates 1080x782. The 4:3 inset (320x240) covers x 72-392, y 520-760, so the section is cut at x 430 and runs off the right edge. */
Object.assign(DIAGRAMS, {
  edge_restraint(svg, t0, opts) {
    opts = opts || {}; const part = Number(opts.part) || 1; const tb = opts.cont ? t0 - 20 : t0;
    const t1 = part === 1 ? t0 : tb, t2 = t0;
    const SX = 430, PAV_TOP = 230, PAV_H = 70, BED_TOP = 300, BED_H = 30, BASE_TOP = 330, FAB_Y = 510, RES_X = 816, EXT = 180;   // EXT = base thickness (6 in)
    const SOIL = '#1c1c1c', GREY = '#222222', MID = '#434343', LIGHT = '#6b6b6b', PAVER = '#8a8a8a', STEEL = '#a0a0a0';
    const SH = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))', GLOW = 'drop-shadow(0 0 12px rgba(255,197,39,.8))';
    const L = { stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' };
    function markX(x, y, t) { const g = sv('g', {}, svg); g.style.filter = SH; sv('circle', { cx: x, cy: y, r: 34, fill: MID }, g);
      sv('path', { d: `M${x - 13} ${y - 13} L${x + 13} ${y + 13} M${x + 13} ${y - 13} L${x - 13} ${y + 13}`, stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; reg(g, { o: 0, s: .4 }); tw(g, t, t + .4, { o: 1, s: 1 }, EOB); return g; }
    function markTick(x, y, t) { const g = sv('g', {}, svg); g.style.filter = SH; sv('circle', { cx: x, cy: y, r: 34, fill: GOLD }, g);
      sv('path', { d: `M${x - 15} ${y + 1} L${x - 4} ${y + 12} L${x + 16} ${y - 11}`, fill: 'none', stroke: '#111', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; reg(g, { o: 0, s: .4 }); tw(g, t, t + .4, { o: 1, s: 1 }, EOB); return g; }
    /* ---- base section (instant on a continuation, quick build otherwise) ---- */
    const clay = sv('rect', { x: SX, y: FAB_Y, width: 1080 - SX, height: 782 - FAB_Y, fill: SOIL }, svg); fadeIn(clay, tb, .3);
    const soilR = sv('rect', { x: RES_X + EXT, y: PAV_TOP, width: 1080 - RES_X - EXT, height: FAB_Y - PAV_TOP, fill: SOIL }, svg); fadeIn(soilR, tb, .3);   // native soil beyond the base extension
    const base = sv('g', {}, svg); sv('rect', { x: SX, y: BASE_TOP, width: RES_X + EXT - SX, height: FAB_Y - BASE_TOP, fill: MID }, base);
    gravel(base, SX + 6, RES_X + EXT - 6, BASE_TOP + 6, FAB_Y - 6, 9); growUp(base, tb + .1, .4);
    const fab = sv('line', { x1: SX, y1: FAB_Y, x2: RES_X + EXT, y2: FAB_Y, stroke: OFF, 'stroke-width': 5, 'stroke-linecap': 'round' }, svg); fadeIn(fab, tb + .2, .3);
    const bed = sv('rect', { x: SX, y: BED_TOP, width: RES_X - SX, height: BED_H, fill: LIGHT }, svg); growUp(bed, tb + .4, .3);
    const pav = []; for (let i = 0; i < 4; i++) { const p = sv('rect', { x: SX + 4 + i * 96, y: PAV_TOP, width: 92, height: PAV_H, fill: i % 2 ? '#9a9a9a' : PAVER, rx: 2 }, svg);
      p.style.transformBox = 'fill-box'; p.style.transformOrigin = '50% 100%'; reg(p, { o: 0, y: -60 }); tw(p, tb + .5 + i * .08, tb + .9 + i * .08, { o: 1, y: 0 }, EOB); pav.push(p); }
    const soilTop = sv('rect', { x: RES_X + EXT, y: PAV_TOP, width: 1080 - RES_X - EXT, height: 2, fill: '#2a2a2a' }, svg); reg(soilTop, { o: 0 });
    if (part === 1) {
      /* no restraint: the outer pavers creep out, bedding spills, joints open, X */
      const nr = svText(svg, 440, 130, 'NO RESTRAINT', 40, OFF, 'start', 'nores'); slideIn(nr, t1 + .9);
      const spill = sv('path', { d: `M${RES_X} ${BED_TOP} L${RES_X + 70} ${BASE_TOP} L${RES_X} ${BASE_TOP} Z`, fill: LIGHT }, svg); reg(spill, { o: 0 }); tw(spill, t1 + 2.0, t1 + 4.5, { o: 1 }, LIN);
      tw(pav[3], t1 + 1.6, t1 + 5.0, { x: 46, r: 5, y: 8 }, EI); tw(pav[2], t1 + 1.9, t1 + 5.0, { x: 22, r: 2, y: 3 }, EI); tw(pav[1], t1 + 2.4, t1 + 5.0, { x: 8 }, EI);
      const cr = svText(svg, 1010, 206, 'PAVERS CREEP', 40, OFF, 'end', 'creep'); slideIn(cr, t1 + 2.6);
      markX(900, 125, t1 + 3.8);
    } else {
      /* part 2: pavers back in line, restraint + spikes, 1 IN+ contact, base extension dimensions, tick */
      const nr = svText(svg, 440, 130, 'NO RESTRAINT', 40, OFF, 'start', 'nores'); reg(nr, { o: 1 }); tw(nr, t2, t2 + .3, { o: 0 }, EO);
      const er = svText(svg, 440, 130, 'EDGE RESTRAINT', 40, GOLD, 'start', 'er'); slideIn(er, t2 + .5);
      const res = sv('g', {}, svg); res.style.filter = SH;
      sv('rect', { x: RES_X, y: PAV_TOP + 6, width: 12, height: BASE_TOP - PAV_TOP - 6, fill: STEEL }, res);           // lip against the paver face
      sv('rect', { x: RES_X, y: BASE_TOP - 10, width: 74, height: 10, fill: STEEL }, res);                          // flange on the base
      reg(res, { o: 0, y: -70 }); tw(res, t2 + .5, t2 + .9, { o: 1, y: 0 }, EOB);
      [RES_X + 30, RES_X + 56].forEach((x, i) => { const s = sv('line', { x1: x, y1: BASE_TOP - 4, x2: x, y2: BASE_TOP + 120, stroke: STEEL, 'stroke-width': 8, 'stroke-linecap': 'round' }, svg); drawPath(s, t2 + 1.0 + i * .15, .35); });
      const br = sv('g', {}, svg); br.style.filter = SH;                                                              // contact bracket on the paver face
      sv('path', { d: `M${RES_X + 34} ${PAV_TOP + 8} L${RES_X + 46} ${PAV_TOP + 8} L${RES_X + 46} ${BED_TOP} L${RES_X + 34} ${BED_TOP}`, fill: 'none', stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, br);
      reg(br, { o: 0, x: -10 }); tw(br, t2 + 1.5, t2 + 1.85, { o: 1, x: 0 }, EO);
      const ct = svText(svg, 1010, 206, '1 IN+ CONTACT', 40, GOLD, 'end', 'contact'); slideIn(ct, t2 + 1.6);
      const glow = sv('rect', { x: RES_X + 12, y: BASE_TOP, width: EXT - 12, height: FAB_Y - BASE_TOP, fill: GOLD }, svg); reg(glow, { o: 0 });
      tw(glow, t2 + 2.6, t2 + 2.8, { o: .55 }, EO); tw(glow, t2 + 2.8, t2 + 3.6, { o: 0 }, EO);                       // the extension lights up once
      const dh = sv('g', {}, svg); dh.style.filter = SH; const y = FAB_Y + 34;
      sv('line', Object.assign({ x1: RES_X + 12, y1: y, x2: RES_X + EXT, y2: y }, L), dh); sv('line', Object.assign({ x1: RES_X + 12, y1: y - 20, x2: RES_X + 12, y2: y + 20 }, L), dh); sv('line', Object.assign({ x1: RES_X + EXT, y1: y - 20, x2: RES_X + EXT, y2: y + 20 }, L), dh);
      dh.style.transformBox = 'fill-box'; dh.style.transformOrigin = 'left center'; reg(dh, { o: 0, sx: .3 }); tw(dh, t2 + 2.7, t2 + 3.1, { o: 1, sx: 1 }, EOX);
      const s1 = svText(svg, 1010, 586, 'SAME AS', 40, GOLD, 'end', 'same'); slideIn(s1, t2 + 2.9);
      const s2 = svText(svg, 1010, 632, 'BASE DEPTH', 40, GOLD, 'end', 'same'); slideIn(s2, t2 + 3.05);
      const dv = sv('g', {}, svg); dv.style.filter = SH; const x = RES_X + 120;
      sv('line', Object.assign({ x1: x, y1: BASE_TOP, x2: x, y2: FAB_Y }, L), dv); sv('line', Object.assign({ x1: x - 20, y1: BASE_TOP, x2: x + 20, y2: BASE_TOP }, L), dv); sv('line', Object.assign({ x1: x - 20, y1: FAB_Y, x2: x + 20, y2: FAB_Y }, L), dv);
      svText(dv, x, BASE_TOP - 16, '6 IN', 40, GOLD, 'middle', 'six'); dv.style.transformBox = 'fill-box'; dv.style.transformOrigin = 'center bottom'; reg(dv, { o: 0, sy: .3 }); tw(dv, t2 + 3.6, t2 + 4.0, { o: 1, sy: 1 }, EOX);
      markTick(900, 125, t2 + 4.3);
    }
  }
});
