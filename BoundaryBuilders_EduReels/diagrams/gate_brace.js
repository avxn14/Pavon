/* gate_brace (video 07, beats 3-4): a wood gate seen face-on between a hinge post (left) and a latch post (right).
   part 1 (beat 3): a brace from the TOP hinge corner to the BOTTOM latch corner draws in grey, the gate droops (rotates about the top hinge)
                    and gets an [X]; then that brace fades, a gold brace from the BOTTOM hinge corner to the TOP latch corner draws in and
                    the gate lifts square [TICK].
   part 2 (beat 4, cont): the gold brace fades, the gate droops again, a cable with a turnbuckle appears from the top hinge corner to the
                    bottom latch corner, the turnbuckle spins and the latch side lifts square [TICK].
   Band coordinates 1080x782. The inset (IMG_2819, 320x197) covers x 72-392, y 563-760, so the gate sits at x 440-1050; labels at the top. */
Object.assign(DIAGRAMS, {
  gate_brace(svg, t0, opts) {
    opts = opts || {}; const part = Number(opts.part) || 1; const tb = opts.cont ? t0 - 20 : t0;
    const t1 = part === 1 ? t0 : tb, t2 = t0;
    const POST = '#434343', WOOD = '#6b6b6b', PICK = '#555555', STEEL = '#c9c9c9', GREY = '#8a8a8a';
    const SH = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))', GLOW = 'drop-shadow(0 0 12px rgba(255,197,39,.8))';
    // geometry
    const HPX = 470, LPX = 1000, PW = 40, PTOP = 150, PBOT = 740;      // posts (x of left edges), top, bottom
    const GX0 = 520, GX1 = 950, GY0 = 240, GY1 = 670, R = 26;          // gate frame outer box, rail/stile thickness
    const HINGE = [GY0 + 50, GY1 - 50];                                 // hinge y positions on the hinge post
    const TH = [GX0 + 14, GY0 + 14], BL = [GX1 - 14, GY1 - 14], BH = [GX0 + 14, GY1 - 14], TL = [GX1 - 14, GY0 + 14];   // corners: top hinge, bottom latch, bottom hinge, top latch
    function markX(x, y, t) { const g = sv('g', {}, svg); g.style.filter = SH; sv('circle', { cx: x, cy: y, r: 34, fill: POST }, g);
      sv('path', { d: `M${x - 13} ${y - 13} L${x + 13} ${y + 13} M${x + 13} ${y - 13} L${x - 13} ${y + 13}`, stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; reg(g, { o: 0, s: .4 }); tw(g, t, t + .4, { o: 1, s: 1 }, EOB); return g; }
    function markTick(x, y, t) { const g = sv('g', {}, svg); g.style.filter = SH; sv('circle', { cx: x, cy: y, r: 34, fill: GOLD }, g);
      sv('path', { d: `M${x - 15} ${y + 1} L${x - 4} ${y + 12} L${x + 16} ${y - 11}`, fill: 'none', stroke: '#111', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; reg(g, { o: 0, s: .4 }); tw(g, t, t + .4, { o: 1, s: 1 }, EOB); return g; }
    /* ---- base: posts, hinges, gate frame (built with tb on a continuation) ---- */
    const base = sv('g', {}, svg); base.style.filter = SH;
    sv('rect', { x: HPX, y: PTOP, width: PW, height: PBOT - PTOP, fill: POST, rx: 3 }, base);
    sv('rect', { x: HPX - 6, y: PTOP - 12, width: PW + 12, height: 14, fill: POST, rx: 3 }, base);          // post cap
    sv('rect', { x: LPX, y: PTOP, width: PW, height: PBOT - PTOP, fill: POST, rx: 3 }, base);
    sv('rect', { x: LPX - 6, y: PTOP - 12, width: PW + 12, height: 14, fill: POST, rx: 3 }, base);
    HINGE.forEach(y => sv('rect', { x: HPX + PW - 4, y: y - 14, width: 34, height: 28, fill: '#111', rx: 4 }, base)); // hinge straps on the post
    fadeIn(base, tb, .35);
    const gate = sv('g', {}, svg); gate.style.filter = SH;
    for (let i = 0; i < 7; i++) sv('rect', { x: GX0 + R + 6 + i * 56, y: GY0 + 6, width: 44, height: GY1 - GY0 - 12, fill: PICK }, gate);   // pickets
    sv('rect', { x: GX0, y: GY0, width: R, height: GY1 - GY0, fill: WOOD }, gate); sv('rect', { x: GX1 - R, y: GY0, width: R, height: GY1 - GY0, fill: WOOD }, gate);   // stiles
    sv('rect', { x: GX0, y: GY0, width: GX1 - GX0, height: R, fill: WOOD }, gate); sv('rect', { x: GX0, y: GY1 - R, width: GX1 - GX0, height: R, fill: WOOD }, gate);  // rails
    sv('rect', { x: GX1 - 10, y: (GY0 + GY1) / 2 - 10, width: 44, height: 20, fill: '#111', rx: 3 }, gate);                                     // latch
    gate.style.transformBox = 'fill-box'; gate.style.transformOrigin = `${TH[0] - GX0}px ${HINGE[0] - GY0}px`;                                   // rotates about the top hinge
    reg(gate, { o: 0, r: 0 }); tw(gate, tb + .15, tb + .5, { o: 1 }, EO);
    const hs = svText(svg, HPX - 30, 128, 'HINGE SIDE', 40, OFF, 'start', 'hinge'); slideIn(hs, tb + .4);   // labels sit under the small logo (frame y 404)
    const ls = svText(svg, 1010, 128, 'LATCH SIDE', 40, OFF, 'end', 'latch'); slideIn(ls, tb + .55, 30);
    const braceD = (a, b) => `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;
    const goodBrace = sv('path', { d: braceD(BH, TL), stroke: GOLD, 'stroke-width': 18, 'stroke-linecap': 'round' }, gate); goodBrace.style.filter = GLOW;
    if (part === 1) {
      /* wrong brace: top hinge -> bottom latch; the gate droops; X */
      const bad = sv('path', { d: braceD(TH, BL), stroke: GREY, 'stroke-width': 18, 'stroke-linecap': 'round' }, gate); drawPath(bad, t1 + .5, .5);
      tw(gate, t1 + 1.0, t1 + 1.7, { r: 4 }, EIO);                                                        // latch side drops
      const x = markX(735, 340, t1 + 1.5); const sag = svText(svg, 735, 212, 'SAGS', 40, OFF, 'middle', 'sags'); slideIn(sag, t1 + 1.6);
      tw(bad, t1 + 2.3, t1 + 2.55, { o: 0 }, EO); tw(x, t1 + 2.3, t1 + 2.55, { o: 0 }, EO); tw(sag, t1 + 2.3, t1 + 2.55, { o: 0 }, EO);
      /* right brace: bottom hinge -> top latch; the gate lifts square; tick */
      drawPath(goodBrace, t1 + 2.5, .5); tw(gate, t1 + 2.7, t1 + 3.3, { r: 0 }, EOX);
      markTick(735, 340, t1 + 3.3); const sq = svText(svg, 735, 212, 'STAYS SQUARE', 40, GOLD, 'middle', 'square'); slideIn(sq, t1 + 3.4);
    } else {
      reg(goodBrace, { o: 1 }); const sq = svText(svg, 735, 212, 'STAYS SQUARE', 40, GOLD, 'middle', 'square'); reg(sq, { o: 1 });
      const tk = markTick(735, 340, tb);
      /* part 2: brace and tick go, the gate droops, the cable + turnbuckle appear and lift it */
      [goodBrace, sq, tk].forEach(e => tw(e, t2, t2 + .3, { o: 0 }, EO));
      tw(gate, t2 + .3, t2 + 1.0, { r: 4 }, EIO);
      const cable = sv('path', { d: braceD(TH, BL), stroke: STEEL, 'stroke-width': 6, 'stroke-linecap': 'round' }, gate); drawPath(cable, t2 + 1.3, .6);
      const cx = (TH[0] + BL[0]) / 2, cy = (TH[1] + BL[1]) / 2, ang = Math.atan2(BL[1] - TH[1], BL[0] - TH[0]) * 180 / Math.PI;
      const tbkPos = sv('g', { transform: `translate(${cx} ${cy}) rotate(${ang})` }, gate);   // unregistered: keeps its SVG transform
      const tbk = sv('g', {}, tbkPos);
      const barrel = sv('g', {}, tbk);
      sv('rect', { x: -46, y: -13, width: 92, height: 26, rx: 8, fill: STEEL, stroke: '#111', 'stroke-width': 3 }, barrel);
      sv('rect', { x: -8, y: -20, width: 16, height: 40, rx: 3, fill: GOLD }, barrel);                       // the bar you turn
      sv('circle', { cx: -58, cy: 0, r: 9, fill: 'none', stroke: STEEL, 'stroke-width': 5 }, tbk); sv('circle', { cx: 58, cy: 0, r: 9, fill: 'none', stroke: STEEL, 'stroke-width': 5 }, tbk);   // eye ends
      reg(tbk, { o: 0 }); tw(tbk, t2 + 1.9, t2 + 2.2, { o: 1 }, EO);
      barrel.style.transformBox = 'fill-box'; barrel.style.transformOrigin = 'center'; reg(barrel, { sy: 1 });
      for (let i = 0; i < 4; i++) { const a = t2 + 2.4 + i * .25; tw(barrel, a, a + .125, { sy: -1 }, LIN); tw(barrel, a + .125, a + .25, { sy: 1 }, LIN); }   // spins
      tw(gate, t2 + 2.5, t2 + 3.4, { r: 0 }, EOX);                                                          // the latch side lifts
      const tl = svText(svg, 735, 212, 'TURNBUCKLE', 40, OFF, 'middle', 'turnb'); slideIn(tl, t2 + 2.0); tw(tl, t2 + 3.3, t2 + 3.5, { o: 0 }, EO);
      markTick(735, 340, t2 + 3.5); const lift = svText(svg, 735, 212, 'LIFTS THE LATCH SIDE', 40, GOLD, 'middle', 'lift'); slideIn(lift, t2 + 3.6);
    }
  }
});
