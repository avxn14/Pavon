/* grading (video 09, beats 2-3): side section of a house wall with a downspout, a paver patio and a small retaining wall.
   part 1 (beat 2): the downspout pours onto the patio; blue water seeps under the pavers and behind the small wall [X].
   part 2 (beat 3, cont): the water goes, the patio and the ground beyond the wall tilt to fall away from the house, blue arrows run
                    away from the house, labels ~2% AWAY / TYPICAL GUIDANCE / NOT CODE [TICK].
   Band coordinates 1080x782. The inset (IMG_0961, 320x410) covers x 72-392, y 350-760, so the drawing sits at x 430-1080; labels top right. */
Object.assign(DIAGRAMS, {
  grading(svg, t0, opts) {
    opts = opts || {}; const part = Number(opts.part) || 1; const tb = opts.cont ? t0 - 20 : t0;
    const t1 = part === 1 ? t0 : tb, t2 = t0;
    const SOIL = '#1c1c1c', MID = '#434343', LIGHT = '#6b6b6b', PAVER = '#8a8a8a', HOUSE = '#222222', WALLC = '#5a5a5a';
    const SH = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))';
    const HX0 = 440, HX1 = 560, HY0 = 150, GY = 520;            // house wall box; ground / patio top at the house
    const PX0 = 580, PX1 = 900, WX = 900, WW = 40, WTOP = 430;  // patio run, small wall x / thickness / top (soil beyond is higher)
    function markX(x, y, t) { const g = sv('g', {}, svg); g.style.filter = SH; sv('circle', { cx: x, cy: y, r: 34, fill: MID }, g);
      sv('path', { d: `M${x - 13} ${y - 13} L${x + 13} ${y + 13} M${x + 13} ${y - 13} L${x - 13} ${y + 13}`, stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; reg(g, { o: 0, s: .4 }); tw(g, t, t + .4, { o: 1, s: 1 }, EOB); return g; }
    function markTick(x, y, t) { const g = sv('g', {}, svg); g.style.filter = SH; sv('circle', { cx: x, cy: y, r: 34, fill: GOLD }, g);
      sv('path', { d: `M${x - 15} ${y + 1} L${x - 4} ${y + 12} L${x + 16} ${y - 11}`, fill: 'none', stroke: '#111', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; reg(g, { o: 0, s: .4 }); tw(g, t, t + .4, { o: 1, s: 1 }, EOB); return g; }
    function arrow(parent, pts, t, dur, w) {                   // blue water arrow drawn along points
      const g = sv('g', {}, parent); let d = `M${pts[0][0]} ${pts[0][1]}`; for (let i = 1; i < pts.length; i++) d += ` L${pts[i][0]} ${pts[i][1]}`;
      const p = sv('path', { d, fill: 'none', stroke: BLUE, 'stroke-width': w || 10, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      const [x0, y0] = pts[pts.length - 2], [x1, y1] = pts[pts.length - 1]; const a = Math.atan2(y1 - y0, x1 - x0), s = 30;
      const h = sv('path', { d: `M${x1 - s * Math.cos(a - .5)} ${y1 - s * Math.sin(a - .5)} L${x1} ${y1} L${x1 - s * Math.cos(a + .5)} ${y1 - s * Math.sin(a + .5)}`, fill: 'none', stroke: BLUE, 'stroke-width': w || 10, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      drawPath(p, t, dur || .6); fadeIn(h, t + (dur || .6) - .12, .2); g.style.filter = SH; return g; }
    function patio(tilt) {                                      // pavers + bedding + base as one group; tilt in degrees about the house end
      const g = sv('g', {}, svg);
      sv('rect', { x: PX0, y: GY + 10, width: PX1 - PX0 + 60, height: 90, fill: MID }, g); gravel(g, PX0 + 6, PX1 + 50, GY + 24, GY + 94, 17);
      sv('rect', { x: PX0, y: GY, width: PX1 - PX0 + 60, height: 10, fill: LIGHT }, g);
      for (let x = PX0; x < PX1; x += 40) sv('rect', { x: x + 1, y: GY - 22, width: 38, height: 22, fill: PAVER, rx: 2 }, g);
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = '0px 22px'; reg(g, { o: 0, r: tilt || 0 }); return g; }

    /* ---- base scene: soil, house, downspout, wall ---- */
    const soil = sv('rect', { x: 430, y: GY, width: 650, height: 782 - GY, fill: SOIL }, svg); fadeIn(soil, tb, .3);
    const house = sv('g', {}, svg); house.style.filter = SH;
    sv('rect', { x: HX0, y: HY0, width: HX1 - HX0, height: GY - HY0 + 60, fill: HOUSE }, house);
    sv('path', { d: `M${HX0 - 16} ${HY0} L${HX0 + 60} ${HY0 - 60} L${HX1 + 16} ${HY0} Z`, fill: '#333' }, house);                      // roof
    sv('rect', { x: HX1 - 2, y: HY0 - 2, width: 20, height: GY - HY0 - 30, fill: '#9a9a9a', rx: 4 }, house);                             // downspout
    sv('path', { d: `M${HX1 + 8} ${GY - 32} L${HX1 + 8} ${GY - 16} L${HX1 + 36} ${GY - 16}`, fill: 'none', stroke: '#9a9a9a', 'stroke-width': 16, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, house);   // elbow
    fadeIn(house, tb + .1, .4);
    const flat = patio(0); tw(flat, tb + .4, tb + .8, { o: 1 }, EO);
    const upper = sv('g', {}, svg); sv('path', { d: `M${WX + WW} ${WTOP} L1080 ${WTOP} L1080 ${GY} L${WX + WW} ${GY} Z`, fill: SOIL }, upper);  // higher ground behind the wall
    upper.style.transformBox = 'fill-box'; upper.style.transformOrigin = '0px 0px'; reg(upper, { o: 0, r: 0 }); tw(upper, tb + .5, tb + .9, { o: 1 }, EO);
    const wall = sv('g', {}, svg); wall.style.filter = SH; sv('rect', { x: WX, y: WTOP, width: WW, height: GY + 100 - WTOP, fill: WALLC }, wall);
    for (let k = 1; k < 5; k++) sv('line', { x1: WX, y1: WTOP + k * 38, x2: WX + WW, y2: WTOP + k * 38, stroke: MID, 'stroke-width': 3 }, wall);
    growUp(wall, tb + .6, .4);
    const lbl = svText(svg, 600, 130, 'SMALL WALL', 40, OFF, 'end', 'wl'); lbl.setAttribute('x', 1010); slideIn(lbl, tb + .9, 30);

    if (part === 1) {
      /* water pours onto the patio, seeps under the pavers and behind the wall */
      const stream = sv('path', { d: `M${HX1 + 36} ${GY - 16} Q${HX1 + 60} ${GY - 10} ${HX1 + 70} ${GY - 22}`, fill: 'none', stroke: BLUE, 'stroke-width': 10, 'stroke-linecap': 'round' }, svg); drawPath(stream, t1 + 1.0, .4);
      const pool = sv('ellipse', { cx: 640, cy: GY - 22, rx: 48, ry: 6, fill: BLUE, opacity: .85 }, svg); pool.style.transformBox = 'fill-box'; pool.style.transformOrigin = 'center';
      reg(pool, { o: 0, sx: .2 }); tw(pool, t1 + 1.3, t1 + 1.9, { o: 1, sx: 1 }, EO);
      const a1 = arrow(svg, [[640, GY - 10], [660, GY + 40], [700, GY + 80]], t1 + 1.9, .7);
      const a2 = arrow(svg, [[700, GY + 80], [800, GY + 90], [880, GY + 60], [892, GY + 10]], t1 + 2.6, .8);
      const w1 = svText(svg, 600, 196, 'ROOF WATER', 40, OFF, 'start', 'rw'); slideIn(w1, t1 + 1.1);
      const w2 = svText(svg, 600, 244, 'ONTO THE PATIO', 40, OFF, 'start', 'rw'); slideIn(w2, t1 + 1.3);
      markX(760, 330, t1 + 3.3);
    } else {
      /* part 2: the water goes; the patio and the upper ground tilt away from the house; blue arrows run away; labels; tick */
      const tilt = 3;                                           // exaggerated for legibility; the label says ~2%
      tw(flat, t2 + .2, t2 + .9, { r: tilt }, EIO);
      tw(upper, t2 + .3, t2 + 1.0, { r: tilt }, EIO);
      const s1 = arrow(svg, [[600, GY - 36], [860, GY - 36 + (260 * Math.tan(tilt * Math.PI / 180))]], t2 + 1.2, .7);
      const s2 = arrow(svg, [[950, WTOP - 14], [1060, WTOP - 14 + (110 * Math.tan(tilt * Math.PI / 180))]], t2 + 1.6, .5, 8);
      const g1 = svText(svg, 600, 200, '~2% AWAY', 48, GOLD, 'start', 'g1'); slideIn(g1, t2 + 1.3);   // below SMALL WALL (baseline 130)
      const g2 = svText(svg, 600, 252, 'TYPICAL GUIDANCE', 40, OFF, 'start', 'g2'); slideIn(g2, t2 + 2.0);
      const g3 = svText(svg, 600, 300, 'NOT CODE', 40, OFF, 'start', 'g2'); slideIn(g3, t2 + 2.15);
      markTick(760, 360, t2 + 3.0);
    }
  }
});
