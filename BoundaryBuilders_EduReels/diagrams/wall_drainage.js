/* wall_drainage (video 02): a block retaining wall section. opts.part = 1, 2 or 3; opts.cont continues the previous beat.
   part 1: the soil behind the wall fills with BLUE water, blue pressure arrows push on the wall, the wall shakes about 2 px.
   part 2: a drain-rock zone (12 IN, TYPICAL) fills in behind the wall and lights up gold (gold outline + gold gravel, as video 03's gravel does),
           a perforated pipe (gold dashed ring) appears at the base, the water arrows turn down into it.
   part 3: the pipe outlet arrow goes to APPROVED OUTLET (gold tick); the part-2 down-arrows clear, then the arrow toward NEIGHBOUR gets a grey X.
   Band coordinates 1080x782. The diagram inset (photo A, 320x439) covers x 72-392, y 321-760, so the section lives in the right 60% of the band
   and every label stays above y 321 on the left, inside x 65-1015, and left of x 920 below y 670. */
Object.assign(DIAGRAMS, {
  wall_drainage(svg, t0, opts) {
    opts = opts || {}; const part = Number(opts.part) || 1;
    const tb = opts.cont ? t0 - 20 : t0;                 // base already finished when a continuation beat starts
    const t1 = (part === 1) ? t0 : tb;                   // part 1 animations
    const t2 = (part === 2) ? t0 : tb;                   // part 2 animations (only built for part >= 2)
    const WX = 560, WB = 650, BY = 690, CH = 62, NC = 7, TOP = BY - NC * CH;   // wall face, wall back, base line, course height, courses, top of blocks
    const FG = 628, BG = 250;                            // front grade (first course buried), grade behind the wall
    const DRX = WB, DRW = 120;                           // drain rock zone x and width (12 IN)
    const PIPE = { x: WB + DRW / 2, y: BY - 40, r: 26 };
    const SOIL = '#1c1c1c', GREY = '#222222', MID = '#434343', LIGHT = '#6b6b6b';
    const SH = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))';
    const stroke = (col, w) => ({ fill: 'none', stroke: col, 'stroke-width': w || 10, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    function head(parent, x0, y0, x1, y1, col, size, w) {   // open arrow head at (x1,y1) pointing away from (x0,y0)
      const a = Math.atan2(y1 - y0, x1 - x0), s = size || 30;
      return sv('path', { d: `M${x1 - s * Math.cos(a - .5)} ${y1 - s * Math.sin(a - .5)} L${x1} ${y1} L${x1 - s * Math.cos(a + .5)} ${y1 - s * Math.sin(a + .5)}`, ...stroke(col, w) }, parent);
    }
    function arrow(parent, d, tail, tip, col, t, dur, w) {   // path d drawn on, then its head fades in; tail/tip give the head direction
      const gr = sv('g', {}, parent); gr.style.filter = SH;
      const p = sv('path', { d, ...stroke(col, w) }, gr); const h = head(gr, tail[0], tail[1], tip[0], tip[1], col, 30, w);
      drawPath(p, t, dur); fadeIn(h, t + dur - .12, .18); return gr;
    }
    function pop(e, t, d) { e.style.transformBox = 'fill-box'; e.style.transformOrigin = 'center'; reg(e, { o: 0, s: .3 }); tw(e, t, t + (d || .4), { o: 1, s: 1 }, EOB); }
    function markTick(parent, cx, cy, t) {   // gold tick circle
      const g = sv('g', {}, parent); g.style.filter = SH;
      sv('circle', { cx, cy, r: 28, fill: GOLD }, g);
      sv('path', { d: `M${cx - 13} ${cy + 1} L${cx - 4} ${cy + 10} L${cx + 14} ${cy - 10}`, ...stroke('#111', 6) }, g);
      pop(g, t); return g;
    }
    function markX(parent, cx, cy, t) {      // grey X circle
      const g = sv('g', {}, parent); g.style.filter = SH;
      sv('circle', { cx, cy, r: 28, fill: MID }, g);
      sv('path', { d: `M${cx - 11} ${cy - 11} L${cx + 11} ${cy + 11} M${cx + 11} ${cy - 11} L${cx - 11} ${cy + 11}`, ...stroke('#fff', 6) }, g);
      pop(g, t); return g;
    }

    /* ---- base: ground, retained soil, levelling pad, block wall with cap (builds with tb; animated in beat 2 only) ---- */
    const GX = 400;                                      // ground starts right of the inset (x 72-392): nothing drawn behind or left of it
    const ground = sv('rect', { x: GX, y: FG, width: 1080 - GX, height: 782 - FG, fill: GREY }, svg); fadeIn(ground, tb, .3);
    const fline = sv('line', { x1: GX, y1: FG, x2: WX, y2: FG, stroke: MID, 'stroke-width': 4 }, svg); fadeIn(fline, tb, .3);
    const soil = sv('rect', { x: WB, y: BG, width: 1080 - WB, height: 782 - BG, fill: SOIL }, svg); fadeIn(soil, tb + .1, .35);
    const bline = sv('line', { x1: WB, y1: BG, x2: 1080, y2: BG, stroke: MID, 'stroke-width': 4 }, svg); fadeIn(bline, tb + .1, .35);
    const pad = sv('g', {}, svg); sv('rect', { x: WX - 30, y: BY, width: 270, height: 46, fill: MID }, pad); gravel(pad, WX - 24, WX + 234, BY + 6, BY + 42, 11); fadeIn(pad, tb + .25, .3);
    const wall = sv('g', {}, svg); reg(wall, {});
    const back = sv('rect', { x: WX, y: TOP, width: WB - WX, height: BY - TOP, fill: GREY }, wall); growUp(back, tb + .35, .5);
    for (let k = 0; k < NC; k++) {   // courses from the bottom up, running bond
      const y = BY - (k + 1) * CH; const c = sv('g', {}, wall);
      if (k % 2 === 0) sv('rect', { x: WX, y: y + 2, width: WB - WX, height: CH - 4, fill: LIGHT }, c);
      else { sv('rect', { x: WX, y: y + 2, width: (WB - WX) / 2 - 2, height: CH - 4, fill: LIGHT }, c); sv('rect', { x: WX + (WB - WX) / 2 + 2, y: y + 2, width: (WB - WX) / 2 - 2, height: CH - 4, fill: LIGHT }, c); }
      growUp(c, tb + .4 + k * .07, .45);
    }
    const cap = sv('rect', { x: WX - 12, y: TOP - 30, width: WB - WX + 24, height: 30, fill: '#8a8a8a', rx: 3 }, wall); fadeIn(cap, tb + 1.0, .3);

    /* ---- part 1: water fills the soil behind the wall, pressure arrows, the wall shakes ---- */
    const water = sv('rect', { x: WB, y: BG + 46, width: 1080 - WB, height: BY - BG - 46, fill: 'rgba(38,126,206,.55)' }, svg); growUp(water, t1 + 1.0, 1.2);
    const pushArrows = [], downArrows = [];
    [[350, 0], [460, .15], [570, .3]].forEach(([y, dl]) => {
      const gr = arrow(svg, `M900 ${y} L${WB + 54} ${y}`, [900, y], [WB + 54, y], BLUE, t1 + 2.0 + dl, .5);
      pushArrows.push(gr);
    });
    { let a = t1 + 2.6; for (let i = 0; i < 6; i++) { tw(wall, a, a + .07, { x: 2 }, LIN); tw(wall, a + .07, a + .14, { x: -2 }, LIN); a += .14; } tw(wall, a, a + .07, { x: 0 }, LIN); }
    if (part >= 2) {
      /* ---- part 2: drain rock (12 IN, TYPICAL), perforated pipe at the base, water arrows turn down into it ---- */
      pushArrows.forEach(gr => tw(gr, t2 + 1.3, t2 + 1.7, { o: 0 }, EO));
      const rock = sv('g', {}, svg); sv('rect', { x: DRX + 3, y: BG + 3, width: DRW - 6, height: BY - BG - 3, fill: MID, stroke: GOLD, 'stroke-width': 5 }, rock);   // the layer being talked about lights up gold
      [21, 33, 47].forEach(seed => { const gd = gravel(rock, DRX + 6, DRX + DRW - 6, BG + 8, BY - 6, seed); [...gd.children].forEach(c => { c.setAttribute('fill', GOLD); c.setAttribute('opacity', .9); }); });
      growUp(rock, t2 + 1.4, .9);
      CALLOUTS.dimH(svg, t2, { x0: DRX, x1: DRX + DRW, y: 200, label: '12 IN', t: 2.3, group: 'dim12' });
      const typ = svText(svg, DRX + DRW + 34, 172, 'TYPICAL', 40, OFF, 'start', 'typical'); slideIn(typ, t2 + 2.6);
      const pipe = sv('g', {}, svg);
      sv('circle', { cx: PIPE.x, cy: PIPE.y, r: PIPE.r, fill: GREY, stroke: GOLD, 'stroke-width': 6, 'stroke-dasharray': '10 7' }, pipe);   // perforations as a gold dashed ring
      sv('circle', { cx: PIPE.x, cy: PIPE.y, r: 9, fill: MID }, pipe);
      pipe.style.filter = SH; pop(pipe, t2 + 3.6);
      downArrows.push(arrow(svg, `M860 360 L860 560 Q860 640 ${PIPE.x + PIPE.r + 18} ${PIPE.y}`, [860, 640], [PIPE.x + PIPE.r + 18, PIPE.y], BLUE, t2 + 4.0, .6));
      downArrows.push(arrow(svg, `M960 450 L960 600 Q960 690 ${PIPE.x + PIPE.r + 28} ${PIPE.y + 24}`, [960, 690], [PIPE.x + PIPE.r + 28, PIPE.y + 24], BLUE, t2 + 4.15, .6));
      tw(water, t2 + 4.3, t2 + 5.6, { sy: .3 }, EO);   // the water drains down toward the pipe
    }
    if (part >= 3) {
      /* ---- part 3: outlet arrow to APPROVED OUTLET (gold tick); arrow toward NEIGHBOUR (grey X) ---- */
      const OX = 476;   // outlet column between the inset (x 72-392) and the wall face (560)
      arrow(svg, `M${PIPE.x} ${PIPE.y + PIPE.r} L${PIPE.x} ${BY + 24} L${OX} ${BY + 24} L${OX} 356`, [OX, 500], [OX, 356], BLUE, t0 + .3, .9);
      const box = sv('g', {}, svg); box.style.filter = SH;   // the APPROVED OUTLET box (above the inset, left of the wall cap)
      sv('rect', { x: 282, y: 184, width: 256, height: 100, rx: 14, fill: 'rgba(0,0,0,.45)', stroke: OFF, 'stroke-width': 4 }, box);
      svText(box, 522, 226, 'APPROVED', 40, OFF, 'end', 'outlet'); svText(box, 522, 266, 'OUTLET', 40, OFF, 'end', 'outlet');
      slideIn(box, t0 + 1.0);
      markTick(svg, OX, 316, t0 + 1.3);
      downArrows.forEach(gr => tw(gr, t0 + 1.7, t0 + 2.05, { o: 0 }, EO));   // the water-into-pipe arrows clear so the NEIGHBOUR arrow, X and label sit in clear water
      arrow(svg, `M${PIPE.x + PIPE.r + 2} ${PIPE.y - 10} L850 ${PIPE.y - 10}`, [780, PIPE.y - 10], [850, PIPE.y - 10], BLUE, t0 + 2.0, .5);
      const nb = svText(svg, 1008, 556, 'NEIGHBOUR', 40, OFF, 'end', 'neighbour'); slideIn(nb, t0 + 2.3);   // in the dark soil just above the drained water band (top at y 572), clear of the X and the rock outline
      markX(svg, 892, PIPE.y - 10, t0 + 2.5);
    }
  }
});
