/* wall_base (video 14, beats 2-4): side section of a BLOCK WALL being built. Scale 10 px = 1 in.
   part 1 (beat 2): low ground with a trench, a compacted crushed-rock pad grows in two lifts (compactor thumps at diagram t0 + 0.9 / 1.8 =
                    beat offsets 1.1 / 2.0 for the hit sfx), gold dimension 6 IN MIN.
   part 2 (beat 3, cont): the first course drops in, the soil in front comes back so the course sits 6 IN below grade (gold 6 IN bracket),
                    labels BURIED: 6 IN MIN / MORE ON TALL WALLS.
   part 3 (beat 4, cont): courses stack with a setback (gold arc + SETBACK), the backfill behind the wall fills in lifts (MAX 8 IN / LIFTS),
                    the drain rock and pipe flash gold once, footnote BLOCK SPECS VARY. / TALL WALLS: / GEOGRID + ENGINEER.
   Band coordinates 1080x782. The 3:4 inset (IMG_3329, 320x433) covers x 72-392, y 327-760, so the drawing sits at x 430-1080. */
Object.assign(DIAGRAMS, {
  wall_base(svg, t0, opts) {
    opts = opts || {}; const part = Number(opts.part) || 1; const tb = opts.cont ? t0 - 20 : t0;
    const t1 = part === 1 ? t0 : tb, t2 = part === 2 ? t0 : tb, t3 = t0;
    const SOIL = '#1c1c1c', MID = '#434343', BLOCK = '#6b6b6b', CAP = '#7a7a7a', STEEL = '#a0a0a0';
    const SH = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))', GLOW = 'drop-shadow(0 0 12px rgba(255,197,39,.8))';
    const G = 600, TX0 = 580, TX1 = 750, PAD_T = 660, PAD_B = 720, WX = 620, WW = 90, CH = 80, SB = 14, NC = 5;   // grade, trench, pad, wall x / width, course height, setback per course
    const L = { stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' };
    function dimV(x, y0, y1, label, t, group, side) { const gr = sv('g', {}, svg); gr.style.filter = SH;
      sv('line', Object.assign({ x1: x, y1: y0, x2: x, y2: y1 }, L), gr); sv('line', Object.assign({ x1: x - 20, y1: y0, x2: x + 20, y2: y0 }, L), gr); sv('line', Object.assign({ x1: x - 20, y1: y1, x2: x + 20, y2: y1 }, L), gr);
      if (label) svText(gr, side === 'right' ? x + 30 : x - 30, (y0 + y1) / 2 + 15, label, 40, GOLD, side === 'right' ? 'start' : 'end', group);
      gr.style.transformBox = 'fill-box'; gr.style.transformOrigin = 'center bottom'; reg(gr, { o: 0, sy: .3 }); tw(gr, t, t + .45, { o: 1, sy: 1 }, EOX); return gr; }
    function compactor(restY, t) { const g = sv('g', {}, svg); g.style.filter = SH; const cx = 665;
      sv('rect', { x: cx - 60, y: restY - 14, width: 120, height: 14, rx: 4, fill: STEEL }, g); sv('rect', { x: cx - 30, y: restY - 62, width: 60, height: 46, rx: 6, fill: MID, stroke: OFF, 'stroke-width': 3 }, g);
      sv('path', { d: `M${cx + 24} ${restY - 52} L${cx + 96} ${restY - 112} L${cx + 118} ${restY - 96}`, fill: 'none', stroke: STEEL, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      reg(g, { o: 0, y: -60 }); tw(g, t, t + .12, { o: 1 }, EO); tw(g, t + .12, t + .3, { y: 0 }, EI); tw(g, t + .3, t + .4, { y: -8 }, EO); tw(g, t + .4, t + .55, { y: 0 }, EO); tw(g, t + .75, t + .95, { o: 0, y: -40 }, EI); return g; }
    const hillTop = 200;                                                       // retained ground on the right (native cut slope from the trench back corner)
    const slope = `M${TX1} ${G} L${TX1 + 230} ${hillTop} L1080 ${hillTop} L1080 782 L${TX1} 782 Z`;
    /* ---- native soil: left of the trench, under the trench, the hill on the right ---- */
    const sL = sv('rect', { x: 430, y: G, width: TX0 - 430, height: 782 - G, fill: SOIL }, svg); fadeIn(sL, tb, .3);
    const sB = sv('rect', { x: TX0, y: PAD_B, width: TX1 - TX0, height: 782 - PAD_B, fill: SOIL }, svg); fadeIn(sB, tb, .3);
    const sR = sv('path', { d: slope, fill: SOIL }, svg); fadeIn(sR, tb, .3);
    let b1 = null, b2 = null;                                                  // part 2 labels (faded out again in part 3 so the footnote has the top-left column)
    const bw = svText(svg, 440, 80, 'BLOCK WALL', 40, OFF, 'start', 'blockwall'); slideIn(bw, tb + .2);
    /* ---- part 1: pad in two lifts with thumps ---- */
    [[PAD_B - 30, PAD_B, t1 + .6, 11], [PAD_T, PAD_B - 30, t1 + 1.5, 23]].forEach(([y0, y1, ta, seed]) => {
      const g = sv('g', {}, svg); sv('rect', { x: TX0, y: y0, width: TX1 - TX0, height: y1 - y0, fill: MID }, g); gravel(g, TX0 + 5, TX1 - 5, y0 + 4, y1 - 4, seed); growUp(g, ta, .3);
      compactor(y0, ta + .3); const f = sv('rect', { x: TX0, y: y0, width: TX1 - TX0, height: y1 - y0, fill: GOLD }, svg); reg(f, { o: 0 }); tw(f, ta + .6, ta + .66, { o: .7 }, LIN); tw(f, ta + .66, ta + 1.1, { o: 0 }, EO);
    });
    dimV(TX1 + 30, PAD_T, PAD_B, '6 IN MIN', t1 + 2.6, 'padmin', 'right');
    const cr = svText(svg, 440, 134, 'COMPACTED', 40, OFF, 'start', 'crushed'); slideIn(cr, t1 + 2.9);
    const cr2 = svText(svg, 440, 182, 'CRUSHED ROCK', 40, OFF, 'start', 'crushed'); slideIn(cr2, t1 + 3.05);
    if (part >= 2) {
      /* ---- part 2: first course, soil back in front, buried bracket ---- */
      [cr, cr2].forEach(e => tw(e, t2, t2 + .3, { o: 0 }, EO));
      const c0 = sv('rect', { x: WX, y: PAD_T - CH, width: WW, height: CH, fill: BLOCK, stroke: '#2a2a2a', 'stroke-width': 2 }, svg); reg(c0, { o: 0, y: -120 }); tw(c0, t2 + .3, t2 + .75, { o: 1, y: 0 }, EOB);
      const front = sv('rect', { x: TX0, y: G, width: WX - TX0, height: PAD_T - G, fill: SOIL }, svg); growUp(front, t2 + 1.2, .5);
      const back0 = sv('rect', { x: WX + WW, y: G, width: TX1 - WX - WW, height: PAD_T - G, fill: SOIL }, svg); growUp(back0, t2 + 1.2, .5);
      dimV(TX0 - 30, G, PAD_T, '6 IN', t2 + 1.9, 'buried', 'left');
      b1 = svText(svg, 440, 134, 'BURIED: 6 IN MIN', 40, GOLD, 'start', 'bur'); slideIn(b1, t2 + 2.0);
      b2 = svText(svg, 440, 182, 'MORE ON TALL WALLS', 40, OFF, 'start', 'bur'); slideIn(b2, t2 + 3.0);
    }
    if (part >= 3) {
      /* ---- part 3: courses with setback, backfill lifts, drain rock + pipe flash, footnote ---- */
      [b1, b2].forEach(e => { if (e) tw(e, t3, t3 + .3, { o: 0 }, EO); });
      for (let k = 1; k < NC; k++) { const c = sv('rect', { x: WX + SB * k, y: PAD_T - CH * (k + 1), width: WW, height: CH, fill: k === NC - 1 ? CAP : BLOCK, stroke: '#2a2a2a', 'stroke-width': 2 }, svg);
        reg(c, { o: 0, y: -100 }); const ta = t3 + .1 + (k - 1) * .22; tw(c, ta, ta + .4, { o: 1, y: 0 }, EOB); }
      const topY = PAD_T - CH * NC, backX = k => WX + WW + SB * k;
      const arc = sv('path', { d: `M${WX} ${PAD_T - 200} A200 200 0 0 1 ${WX + 200 * Math.sin(Math.atan2(SB * (NC - 1), CH * NC))} ${PAD_T - 200 * Math.cos(Math.atan2(SB * (NC - 1), CH * NC))}`, fill: 'none', stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' }, svg);
      const vert = sv('line', { x1: WX, y1: PAD_T, x2: WX, y2: topY - 20, stroke: GOLD, 'stroke-width': 4, 'stroke-dasharray': '12 10' }, svg); fadeIn(vert, t3 + 1.1, .3); drawPath(arc, t3 + 1.2, .5); arc.style.filter = SH;
      const sb = svText(svg, 430, 300, 'SETBACK', 40, GOLD, 'start', 'setback'); slideIn(sb, t3 + 1.3);
      // backfill lifts between the wall back and the cut slope: horizontal bands from y 600 up to the hill top
      const lifts = [[G, PAD_T], [G - 100, G], [G - 200, G - 100], [G - 300, G - 200], [hillTop, G - 300]];
      lifts.forEach(([y0, y1], i) => { const xb = backX((PAD_T - y1) / CH); const xs = TX1 + 230 * (G - y0) / (G - hillTop);   // slope x at the top of the lift
        const p = sv('path', { d: `M${WX + WW} ${y1} L${TX1 + 230 * (G - y1) / (G - hillTop)} ${y1} L${Math.min(xs, 1080)} ${y0} L${WX + WW + SB * ((PAD_T - y0) / CH)} ${y0} Z`, fill: '#262626', stroke: '#3a3a3a', 'stroke-width': 2 }, svg);
        p.style.transformBox = 'fill-box'; p.style.transformOrigin = '50% 100%'; reg(p, { o: 0, sy: .3 }); const ta = t3 + 1.7 + i * .28; tw(p, ta, ta + .3, { o: 1, sy: 1 }, EO); });
      const dl = dimV(900, G - 200, G - 100, '', t3 + 2.4, 'lift', 'right');
      const m1 = svText(svg, 900, G - 236, 'MAX 8 IN', 40, GOLD, 'middle', 'maxlift'); slideIn(m1, t3 + 2.5); const m2 = svText(svg, 900, G - 318, 'LIFTS', 40, GOLD, 'middle', 'maxlift'); slideIn(m2, t3 + 2.55);
      // drain rock column against the back of the wall + pipe (callback to video 02)
      const dr = sv('g', {}, svg); const col = sv('path', { d: `M${WX + WW} ${PAD_T} L${WX + WW + 50} ${PAD_T} L${WX + WW + 50 + SB * (NC - 1)} ${topY + 40} L${WX + WW + SB * (NC - 1)} ${topY + 40} Z`, fill: '#2a2a2a' }, dr);
      gravel(dr, WX + WW + 6, WX + WW + 56, topY + 50, PAD_T - 8, 31); sv('circle', { cx: WX + WW + 26, cy: PAD_T - 22, r: 15, fill: 'none', stroke: OFF, 'stroke-width': 5 }, dr);
      reg(dr, { o: 0 }); tw(dr, t3 + 3.0, t3 + 3.3, { o: 1 }, EO);
      const drG = sv('path', { d: `M${WX + WW} ${PAD_T} L${WX + WW + 50} ${PAD_T} L${WX + WW + 50 + SB * (NC - 1)} ${topY + 40} L${WX + WW + SB * (NC - 1)} ${topY + 40} Z`, fill: GOLD }, svg); drG.style.filter = GLOW;
      reg(drG, { o: 0 }); tw(drG, t3 + 3.2, t3 + 3.4, { o: .6 }, EO); tw(drG, t3 + 3.4, t3 + 4.0, { o: 0 }, EO);
      const f1 = svText(svg, 1010, 134, 'BLOCK SPECS VARY.', 40, OFF, 'end', 'foot'); slideIn(f1, t3 + 3.3);
      const f2 = svText(svg, 1010, 182, 'TALL WALLS:', 40, OFF, 'end', 'foot'); slideIn(f2, t3 + 3.45);
      const f3 = svText(svg, 1010, 230, 'GEOGRID + ENGINEER.', 40, OFF, 'end', 'foot'); slideIn(f3, t3 + 3.6);
    }
  }
});
