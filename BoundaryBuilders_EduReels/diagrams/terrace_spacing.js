/* terrace_spacing (video 08, beat 4): side section. LEFT [X]: two short walls stacked close together; a dashed outline of one tall wall
   wraps both (they act like one tall wall). RIGHT [TICK]: the same two walls pulled apart until the terrace between them is at least as
   deep as the taller wall is high; gold dimensions H (wall height) and AT LEAST H (terrace depth); note BURNABY RULE.
   Drawn on a plain #110000 background. The inset (IMG_3327 cropped, 320x240) covers x 72-392, y 520-760, so the drawing sits at x 426-1072.
   Timed for a ~5 s beat: left part done by t0+1.6, right part by t0+3.8. */
Object.assign(DIAGRAMS, {
  terrace_spacing(svg, t0, opts) {
    opts = opts || {};
    const SOIL = '#1c1c1c', BLOCK = '#6b6b6b', LINE = '#434343', DASH = '#8a8a8a';
    const SH = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))';
    const H = 150, W = 54, GND = 690;                           // wall height, wall thickness, ground line
    function markX(x, y, t) { const g = sv('g', {}, svg); g.style.filter = SH; sv('circle', { cx: x, cy: y, r: 34, fill: LINE }, g);
      sv('path', { d: `M${x - 13} ${y - 13} L${x + 13} ${y + 13} M${x + 13} ${y - 13} L${x - 13} ${y + 13}`, stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; reg(g, { o: 0, s: .4 }); tw(g, t, t + .4, { o: 1, s: 1 }, EOB); return g; }
    function markTick(x, y, t) { const g = sv('g', {}, svg); g.style.filter = SH; sv('circle', { cx: x, cy: y, r: 34, fill: GOLD }, g);
      sv('path', { d: `M${x - 15} ${y + 1} L${x - 4} ${y + 12} L${x + 16} ${y - 11}`, fill: 'none', stroke: '#111', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; reg(g, { o: 0, s: .4 }); tw(g, t, t + .4, { o: 1, s: 1 }, EOB); return g; }
    function wall(x, yTop, t) {                                 // a block wall W wide, H tall, standing on yTop + H
      const g = sv('g', {}, svg); sv('rect', { x, y: yTop, width: W, height: H, fill: BLOCK }, g);
      for (let k = 1; k < 5; k++) sv('line', { x1: x, y1: yTop + k * H / 5, x2: x + W, y2: yTop + k * H / 5, stroke: LINE, 'stroke-width': 3 }, g);
      sv('rect', { x: x - 4, y: yTop - 8, width: W + 8, height: 10, fill: '#7a7a7a', rx: 2 }, g);           // cap
      growUp(g, t, .45); return g;
    }
    function dimVL(x, y0, y1, label, t, group) {                // vertical gold dimension, label to the left
      const gr = sv('g', {}, svg); const L = { stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' };
      sv('line', Object.assign({ x1: x, y1: y0, x2: x, y2: y1 }, L), gr); sv('line', Object.assign({ x1: x - 20, y1: y0, x2: x + 20, y2: y0 }, L), gr); sv('line', Object.assign({ x1: x - 20, y1: y1, x2: x + 20, y2: y1 }, L), gr);
      svText(gr, x - 32, (y0 + y1) / 2 + 16, label, 48, GOLD, 'end', group); gr.style.transformBox = 'fill-box'; gr.style.transformOrigin = 'center bottom';
      reg(gr, { o: 0, sy: .3 }); tw(gr, t, t + .45, { o: 1, sy: 1 }, EOX); return gr; }
    function dimHL(x0, x1, y, label, t, group) {                // horizontal gold dimension, label above
      const gr = sv('g', {}, svg); const L = { stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' };
      sv('line', Object.assign({ x1: x0, y1: y, x2: x1, y2: y }, L), gr); sv('line', Object.assign({ x1: x0, y1: y - 20, x2: x0, y2: y + 20 }, L), gr); sv('line', Object.assign({ x1: x1, y1: y - 20, x2: x1, y2: y + 20 }, L), gr);
      svText(gr, (x0 + x1) / 2, y - 26, label, 40, GOLD, 'middle', group); gr.style.transformBox = 'fill-box'; gr.style.transformOrigin = 'left center';
      reg(gr, { o: 0, sx: .3 }); tw(gr, t, t + .45, { o: 1, sx: 1 }, EOX); return gr; }

    /* ---- LEFT: too close -> one tall wall [X] ---- */
    const LX = 440, LUX = 540;                                  // lower wall x; upper wall x (46 px gap: too close)
    const lgnd = sv('rect', { x: 426, y: GND, width: 274, height: 782 - GND, fill: SOIL }, svg); fadeIn(lgnd, t0, .3);
    const lsoil = sv('path', { d: `M${LX + W} ${GND} L${LX + W} ${GND - H} L${LUX + W} ${GND - H} L${LUX + W} ${GND - 2 * H} L700 ${GND - 2 * H} L700 ${GND} Z`, fill: SOIL }, svg); fadeIn(lsoil, t0 + .1, .4);
    wall(LX, GND - H, t0 + .2); wall(LUX, GND - 2 * H, t0 + .5);
    const outline = sv('rect', { x: LX - 14, y: GND - 2 * H - 22, width: LUX + W - LX + 28, height: 2 * H + 22, fill: 'none', stroke: DASH, 'stroke-width': 6, 'stroke-dasharray': '18 14', rx: 6 }, svg);
    outline.style.filter = SH; fadeIn(outline, t0 + 1.0, .4);
    const tall = svText(svg, 440, 150, 'TOO CLOSE', 40, OFF, 'start', 'close'); slideIn(tall, t0 + .4);
    const tall2 = svText(svg, 440, 198, '= ONE TALL WALL', 40, OFF, 'start', 'close'); slideIn(tall2, t0 + 1.1);
    markX(660, GND - 2 * H - 60, t0 + 1.5);

    /* ---- RIGHT: spaced out, terrace at least H deep [TICK] ---- */
    const RX = 740, GAP = 190, tr = t0 + 1.8;                   // lower wall x; upper wall x = RX + W + GAP (GAP >= H)
    const UX = RX + W + GAP;                                    // 984: upper wall 984-1038
    const rgnd = sv('rect', { x: 720, y: GND, width: 360, height: 782 - GND, fill: SOIL }, svg); fadeIn(rgnd, tr, .3);
    const rsoil = sv('path', { d: `M${RX + W} ${GND} L${RX + W} ${GND - H} L${UX + W} ${GND - H} L${UX + W} ${GND - 2 * H} L1080 ${GND - 2 * H} L1080 ${GND} Z`, fill: SOIL }, svg); fadeIn(rsoil, tr + .7, .4);
    wall(RX, GND - H, tr + .2);
    const up = wall(UX, GND - 2 * H, tr + .5);
    tw(up, tr + .5, tr + 1.0, { x: 0 }, EOX, { x: -GAP + 46 });                                            // slides apart from the close position
    dimVL(RX - 30, GND - H, GND, 'H', tr + 1.0, 'dimH');
    dimHL(RX + W, UX, GND - H - 44, 'AT LEAST H', tr + 1.3, 'dimT');
    const sp = svText(svg, 1010, 150, 'SPACED OUT', 40, GOLD, 'end', 'spaced'); slideIn(sp, tr + .8);
    const br = svText(svg, 1010, 246, 'BURNABY RULE', 40, OFF, 'end', 'burnaby'); slideIn(br, tr + 1.6);   // third line: clear of = ONE TALL WALL on the left
    markTick(930, 310, tr + 1.9);
  }
});
