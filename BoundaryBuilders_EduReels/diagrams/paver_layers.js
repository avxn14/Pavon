/* paver_layers (video 04; reused in video 11): side section of a paver patio on wet clay. opts.part = 1, 2 or 3; opts.cont continues the previous beat.
   part 1 (beat 3): clay subgrade, fabric line, gravel base growing to INDUSTRY MIN 4 IN (IDEAL GROUND); that label gives way to WET CLAY: 6 IN+ (gold)
                    and the base grows to the gold dimension 6 IN+ with the tag PATIO, WET CLAY.
   part 2 (beat 4, cont): the base rebuilds in 3 lifts and a plate-compactor icon thumps each one (thumps at diagram t0 + 0.6 / 1.7 / 2.8 = beat offsets 0.8 / 1.9 / 3.0
                    for the "hit" sfx), the fabric lights up gold with FABRIC KEEPS CLAY OUT, then DRIVEWAYS: MORE.
   part 3 (beat 5, cont): ~1 IN of bedding, the pavers drop in, and an edge restraint with its spike appears at the right end; the base runs on past it.
   Band coordinates 1080x782 (frame y - 330). The 4:3 inset (320x240) covers x 72-392, y 520-760, so the section is cut at x 600, the dimension column sits
   at x 566 with its labels right-aligned at x 530 (all above y 500), and the top-left label column (x 110) stays above y 200. Scale: 30 px = 1 in. */
Object.assign(DIAGRAMS, {
  paver_layers(svg, t0, opts) {
    opts = opts || {}; const part = Number(opts.part) || 1;
    const tb = opts.cont ? t0 - 20 : t0;                   // base already finished when a continuation beat starts
    const t1 = part === 1 ? t0 : tb;                       // part 1 animations
    const t2 = part === 2 ? t0 : tb;                       // part 2 animations (built for part >= 2)
    const t3 = t0;                                         // part 3 animations (built for part 3)
    /* ---- geometry (band px) ---- */
    const SX = 600, SR = 1080;                             // section cut edge; right edge runs off the frame
    const PAV_TOP = 230, PAV_H = 70;                       // pavers y 230-300
    const BED_TOP = 300, BED_H = 30;                       // bedding y 300-330 (~1 in)
    const BASE_TOP = 330, LIFT_H = 60, NLIFT = 3;          // base y 330-510: 3 lifts of 60 (4 in = the bottom 2 lifts, 6 in+ = all 3)
    const FAB_Y = BASE_TOP + NLIFT * LIFT_H;               // 510: fabric on top of the clay
    const DIMX = 566, LBL_X = 110;                         // dimension column; top-left label column
    const PAVERS = [[604, 96], [704, 96], [804, 96]];      // [x, width], 4 px joints; the run ends at RES_X
    const RES_X = 900;                                     // edge restraint lip; the base runs 180 px (= its thickness) past it
    const COMP_X = 790;                                    // compactor centre
    const SOIL = '#1c1c1c', GREY = '#222222', MID = '#434343', LIGHT = '#6b6b6b', PAVER = '#8a8a8a', STEEL = '#a0a0a0';
    const SH = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))', GLOW = 'drop-shadow(0 0 12px rgba(255,197,39,.8))';
    const L = { stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' };
    function dimL(x, y0, y1, label, t, group, dy) {        // vertical gold dimension line with its label to the LEFT (right-aligned at x-36)
      const gr = sv('g', {}, svg);
      sv('line', Object.assign({ x1: x, y1: y0, x2: x, y2: y1 }, L), gr);
      sv('line', Object.assign({ x1: x - 22, y1: y0, x2: x + 22, y2: y0 }, L), gr);
      sv('line', Object.assign({ x1: x - 22, y1: y1, x2: x + 22, y2: y1 }, L), gr);
      svText(gr, x - 36, (y0 + y1) / 2 + (dy === undefined ? 17 : dy), label, 48, GOLD, 'end', group);
      growUp(gr, t, .5); return gr;
    }
    function compactor(restY) {                            // plate compactor seen from the side, resting on y = restY; starts hovering 60 px up, hidden
      const g = sv('g', {}, svg); g.style.filter = SH; const cx = COMP_X;
      sv('rect', { x: cx - 70, y: restY - 16, width: 140, height: 16, rx: 4, fill: STEEL }, g);                                            // plate
      sv('rect', { x: cx - 36, y: restY - 70, width: 72, height: 50, rx: 6, fill: MID, stroke: OFF, 'stroke-width': 3 }, g);                 // engine
      sv('path', { d: `M${cx + 28} ${restY - 58} L${cx + 112} ${restY - 128} L${cx + 136} ${restY - 110}`, fill: 'none', stroke: STEEL, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);   // handle
      reg(g, { o: 0, y: -60 }); return g;
    }

    /* ---- part 1: clay, fabric, base to 4 IN (ideal ground) then to 6 IN+ (wet clay) ---- */
    const clay = sv('rect', { x: SX, y: FAB_Y, width: SR - SX, height: 782 - FAB_Y, fill: SOIL }, svg); fadeIn(clay, t1, .4);
    const clayL = svText(svg, SX + 40, 750, 'CLAY', 40, OFF, 'start', 'clay'); slideIn(clayL, t1 + .4);
    const lifts = []; const liftT = [t1 + 1.1, t1 + 1.4, t1 + 6.2];
    for (let k = 0; k < NLIFT; k++) {
      const top = FAB_Y - (k + 1) * LIFT_H; const g = sv('g', {}, svg);
      sv('rect', { x: SX, y: top, width: SR - SX, height: LIFT_H, fill: MID }, g);
      if (k > 0) sv('line', { x1: SX, y1: top + LIFT_H - 1, x2: SR, y2: top + LIFT_H - 1, stroke: GREY, 'stroke-width': 3 }, g);   // lift boundary
      gravel(g, SX + 6, SR - 6, top + 6, top + LIFT_H - 6, 5 + 8 * k);
      growUp(g, liftT[k], .45); lifts.push(g);
    }
    const fab = sv('line', { x1: SX, y1: FAB_Y, x2: SR, y2: FAB_Y, stroke: OFF, 'stroke-width': 5, 'stroke-linecap': 'round' }, svg); drawPath(fab, t1 + .5, .5);
    const glow = sv('rect', { x: SX, y: BASE_TOP, width: SR - SX, height: FAB_Y - BASE_TOP, fill: GOLD }, svg); reg(glow, { o: 0 });
    tw(glow, t1 + 6.6, t1 + 6.75, { o: .5 }, EO); tw(glow, t1 + 6.75, t1 + 7.4, { o: 0 }, EO);        // the finished base lights up once
    const l1a = svText(svg, LBL_X, 130, 'INDUSTRY MIN 4 IN', 40, OFF, 'start', 'ind'); slideIn(l1a, t1 + 1.7);
    const l1b = svText(svg, LBL_X, 182, '(IDEAL GROUND)', 40, OFF, 'start', 'ind'); slideIn(l1b, t1 + 3.2);
    [l1a, l1b].forEach(e => tw(e, t1 + 5.0, t1 + 5.3, { o: 0, x: 30 }, EI));                          // gives way to...
    const l2 = svText(svg, LBL_X, 134, 'WET CLAY: 6 IN+', 44, GOLD, 'start', 'wet'); slideIn(l2, t1 + 5.35);
    const dim4 = dimL(DIMX, FAB_Y - 2 * LIFT_H, FAB_Y, '4 IN', t1 + 1.9, 'dim4'); tw(dim4, t1 + 6.0, t1 + 6.3, { o: 0 }, EO);
    const dim6 = dimL(DIMX, BASE_TOP, FAB_Y, '6 IN+', t1 + 6.4, 'dim6', 5);
    const tag = svText(svg, DIMX - 36, 478, 'PATIO, WET CLAY', 40, OFF, 'end', 'patio'); slideIn(tag, t1 + 7.3, 30);

    if (part >= 2) {
      /* ---- part 2: the base rebuilds in 3 lifts, a compactor thumps each one; fabric keeps the clay out; driveways: more ---- */
      const r0 = t2 - .15;                                 // the collapse starts with the crossfade into the beat
      [1, 2].forEach(k => tw(lifts[k], r0, r0 + .3, { o: 0, sy: .2 }, EI));
      [dim6, tag].forEach(e => { tw(e, r0, r0 + .3, { o: 0 }, EO); tw(e, t2 + 2.9, t2 + 3.3, { o: 1 }, EO); });   // the 6 IN+ dimension returns with the full base
      [[t2 + .3, 0], [t2 + 1.4, 1], [t2 + 2.5, 2]].forEach(([ta, k]) => {   // ta = the compactor appears; thump at ta + .3
        if (k > 0) tw(lifts[k], ta - .4, ta - .05, { o: 1, sy: 1 }, EOX);  // the next lift goes down just before its compactor
        const top = FAB_Y - (k + 1) * LIFT_H;
        const f = sv('rect', { x: SX, y: top, width: SR - SX, height: LIFT_H, fill: GOLD }, svg); reg(f, { o: 0 });
        const c = compactor(top);
        tw(c, ta, ta + .12, { o: 1 }, EO);                 // appears hovering
        tw(c, ta + .12, ta + .3, { y: 0 }, EI);            // drops: thump
        tw(c, ta + .3, ta + .4, { y: -8 }, EO); tw(c, ta + .4, ta + .55, { y: 0 }, EO);   // bounce
        tw(f, ta + .3, ta + .36, { o: .7 }, LIN); tw(f, ta + .36, ta + .9, { o: 0 }, EO);  // the lift lights up gold
        tw(c, ta + .75, ta + .95, { o: 0, y: -40 }, EI);   // lifts away
      });
      const fabG = sv('line', { x1: SX, y1: FAB_Y, x2: SR, y2: FAB_Y, stroke: GOLD, 'stroke-width': 8, 'stroke-linecap': 'round' }, svg); fabG.style.filter = GLOW;
      drawPath(fabG, t2 + 3.2, .5); tw(fabG, t2 + 5.0, t2 + 5.5, { o: 0 }, EO);
      const f1 = svText(svg, SX + 40, 585, 'FABRIC KEEPS', 40, OFF, 'start', 'fab'); slideIn(f1, t2 + 3.3);
      const f2 = svText(svg, SX + 40, 633, 'CLAY OUT', 40, OFF, 'start', 'fab'); slideIn(f2, t2 + 3.45);
      const dr = svText(svg, LBL_X, 186, 'DRIVEWAYS: MORE', 40, OFF, 'start', 'drive'); slideIn(dr, t2 + 4.7);
    }
    if (part >= 3) {
      /* ---- part 3: ~1 IN bedding, pavers drop in, edge restraint at the side ---- */
      const bed = sv('rect', { x: SX, y: BED_TOP, width: RES_X - SX, height: BED_H, fill: LIGHT }, svg); growUp(bed, t3 + .2, .4);
      const sand = gravel(svg, SX + 4, RES_X - 4, BED_TOP + 7, BED_TOP + BED_H - 7, 41); [...sand.children].forEach(c => { c.setAttribute('r', 2); c.setAttribute('opacity', .5); }); fadeIn(sand, t3 + .45, .3);
      dimL(DIMX, BED_TOP, BED_TOP + BED_H, '~1 IN', t3 + .55, 'dim1');
      PAVERS.forEach(([x, w], i) => {
        const p = sv('rect', { x, y: PAV_TOP, width: w, height: PAV_H, fill: PAVER, rx: 2 }, svg); reg(p, { o: 0, y: -90 });
        const ta = t3 + 1.4 + i * .18; tw(p, ta, ta + .1, { o: 1 }, LIN); tw(p, ta, ta + .45, { y: 0 }, EOB);
      });
      const res = sv('g', {}, svg);
      sv('rect', { x: RES_X, y: PAV_TOP + 10, width: 12, height: BASE_TOP - PAV_TOP - 10, fill: STEEL }, res);   // lip against the last paver
      sv('rect', { x: RES_X, y: BASE_TOP - 10, width: 72, height: 10, fill: STEEL }, res);                      // flange on the base
      reg(res, { o: 0, x: 40 }); tw(res, t3 + 2.6, t3 + 2.95, { o: 1, x: 0 }, EO);
      const spike = sv('line', { x1: RES_X + 50, y1: BASE_TOP - 4, x2: RES_X + 50, y2: BASE_TOP + 120, stroke: STEEL, 'stroke-width': 8, 'stroke-linecap': 'round' }, svg); drawPath(spike, t3 + 2.95, .4);
      const resG = sv('path', { d: `M${RES_X + 6} ${PAV_TOP + 10} L${RES_X + 6} ${BASE_TOP - 5} L${RES_X + 72} ${BASE_TOP - 5} M${RES_X + 50} ${BASE_TOP - 5} L${RES_X + 50} ${BASE_TOP + 120}`, fill: 'none', stroke: GOLD, 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
      resG.style.filter = GLOW; reg(resG, { o: 0 }); tw(resG, t3 + 3.3, t3 + 3.5, { o: .9 }, EO); tw(resG, t3 + 3.5, t3 + 4.3, { o: 0 }, EO);   // lights up once
      const rl = svText(svg, 1008, 196, 'EDGE RESTRAINT', 40, OFF, 'end', 'res'); slideIn(rl, t3 + 2.9);
    }
  }
});
