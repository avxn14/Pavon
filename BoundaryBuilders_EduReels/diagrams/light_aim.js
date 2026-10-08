/* light_aim (video 12).
   CALLOUTS.light_aim_mini (beat 2, over the night-walkway photo): a small plate with two fixtures: light cone aimed DOWN [TICK] vs GLARE up and
   sideways [X]. {x, y (top-left in band coordinates), t}. About 320 x 240.
   DIAGRAMS.light_aim (beat 4, plan view): a path with a straight double row of lights = RUNWAY [X]; the lights then stagger side to side [TICK],
   with the gold dimension ~6-8 FT and the tag RULE OF THUMB. The 4:3 inset covers x 72-392, y 520-760, so the drawing sits at x 430-1080. */
(function () {
  const SH = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))', MID = '#434343', LIGHT = '#6b6b6b';
  function markX(svg, x, y, t) { const g = sv('g', {}, svg); g.style.filter = SH; sv('circle', { cx: x, cy: y, r: 30, fill: MID }, g);
    sv('path', { d: `M${x - 11} ${y - 11} L${x + 11} ${y + 11} M${x + 11} ${y - 11} L${x - 11} ${y + 11}`, stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; reg(g, { o: 0, s: .4 }); tw(g, t, t + .4, { o: 1, s: 1 }, EOB); return g; }
  function markTick(svg, x, y, t) { const g = sv('g', {}, svg); g.style.filter = SH; sv('circle', { cx: x, cy: y, r: 30, fill: GOLD }, g);
    sv('path', { d: `M${x - 13} ${y + 1} L${x - 3} ${y + 10} L${x + 14} ${y - 10}`, fill: 'none', stroke: '#111', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; reg(g, { o: 0, s: .4 }); tw(g, t, t + .4, { o: 1, s: 1 }, EOB); return g; }
  function fixture(parent, x, y) {   // small path light seen from the side: post + hat, standing at (x, y = ground)
    const g = sv('g', {}, parent); sv('rect', { x: x - 5, y: y - 90, width: 10, height: 90, fill: '#9a9a9a' }, g);
    sv('path', { d: `M${x - 26} ${y - 90} L${x + 26} ${y - 90} L${x + 14} ${y - 108} L${x - 14} ${y - 108} Z`, fill: '#c9c9c9' }, g); return g; }
  CALLOUTS.light_aim_mini = function (svg, t0, o) {
    const X = o.x, Y = o.y, d = o.t === undefined ? .4 : o.t; const g = sv('g', {}, svg); g.style.filter = SH;
    sv('rect', { x: X, y: Y, width: 320, height: 240, rx: 18, fill: 'rgba(0,0,0,.66)' }, g);
    const G = Y + 170;                                                           // ground line inside the plate
    const good = sv('g', {}, g); const cone = sv('path', { d: `M${X + 80} ${G - 92} L${X + 22} ${G} L${X + 138} ${G} Z`, fill: GOLD, opacity: .35 }, good); fixture(good, X + 80, G);
    const bad = sv('g', {}, g); fixture(bad, X + 240, G);
    [[-1, -1], [1, -1], [-1, 0], [1, 0], [0, -1]].forEach(([dx, dy]) => sv('line', { x1: X + 240 + dx * 30, y1: G - 100 + dy * 20, x2: X + 240 + dx * 70, y2: G - 100 + dy * 70, stroke: '#9a9a9a', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-dasharray': '10 10' }, bad));
    reg(g, { o: 0, y: 20 }); tw(g, t0 + d, t0 + d + .4, { o: 1, y: 0 }, EO);
    cone.style.transformBox = 'fill-box'; cone.style.transformOrigin = '50% 0%'; reg(cone, { o: 0, sy: .1 }); tw(cone, t0 + d + .5, t0 + d + 1.0, { o: .35, sy: 1 }, EO);
    reg(bad, { o: 0 }); tw(bad, t0 + d + 1.4, t0 + d + 1.7, { o: 1 }, EO);
    const l1 = svText(g, X + 80, Y + 222, 'DOWN', 40, GOLD, 'middle', 'aimdown'); slideIn(l1, t0 + d + .9);
    const l2 = svText(g, X + 240, Y + 222, 'GLARE', 40, OFF, 'middle', 'glare'); slideIn(l2, t0 + d + 1.8);
    markTick(g, X + 80, Y + 40, t0 + d + 1.1); markX(g, X + 240, Y + 40, t0 + d + 2.0);
    return g;
  };
  Object.assign(DIAGRAMS, {
    light_aim(svg, t0, opts) {
      const PX0 = 430, PY0 = 300, PY1 = 470;                                  // path (plan view) across the band
      const path = sv('g', {}, svg); sv('rect', { x: PX0, y: PY0, width: 1080 - PX0, height: PY1 - PY0, fill: '#3a3a3a' }, path);
      sv('line', { x1: PX0, y1: PY0, x2: 1080, y2: PY0, stroke: LIGHT, 'stroke-width': 4 }, path); sv('line', { x1: PX0, y1: PY1, x2: 1080, y2: PY1, stroke: LIGHT, 'stroke-width': 4 }, path);
      for (let x = PX0 + 30; x < 1080; x += 60) sv('line', { x1: x, y1: PY0 + 4, x2: x, y2: PY1 - 4, stroke: '#333', 'stroke-width': 2 }, path);   // paver joints
      fadeIn(path, t0, .4);
      const lawnT = sv('rect', { x: PX0, y: 240, width: 650, height: PY0 - 240, fill: '#223a1c' }, svg); fadeIn(lawnT, t0, .4);
      const lawnB = sv('rect', { x: PX0, y: PY1, width: 650, height: 90, fill: '#223a1c' }, svg); fadeIn(lawnB, t0, .4);
      const XS = [520, 650, 780, 910, 1040]; const top = [], bot = [];
      function light(x, y, t) { const g = sv('g', {}, svg); sv('circle', { cx: x, cy: y, r: 34, fill: GOLD, opacity: .22 }, g); sv('circle', { cx: x, cy: y, r: 9, fill: OFF }, g);
        g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; reg(g, { o: 0, s: .3 }); tw(g, t, t + .3, { o: 1, s: 1 }, EOB); return g; }
      XS.forEach((x, i) => { top.push(light(x, PY0 - 28, t0 + .5 + i * .1)); bot.push(light(x, PY1 + 28, t0 + .6 + i * .1)); });
      const rw = svText(svg, 440, 130, 'RUNWAY', 40, OFF, 'start', 'runway'); slideIn(rw, t0 + 1.2);
      const x1 = markX(svg, 980, 170, t0 + 1.4);
      /* stagger: the bottom row slides half a spacing, the last bottom light goes */
      const ts = t0 + 2.4;
      bot.forEach((g, i) => tw(g, ts, ts + .7, { x: 65 }, EOX)); tw(bot[4], ts, ts + .3, { o: 0 }, EO);
      tw(rw, ts, ts + .3, { o: 0 }, EO); tw(x1, ts, ts + .3, { o: 0 }, EO);
      const st = svText(svg, 440, 130, 'STAGGERED', 40, GOLD, 'start', 'stag'); slideIn(st, ts + .5);
      markTick(svg, 980, 170, ts + .8);
      const dg = sv('g', {}, svg); dg.style.filter = SH; const L = { stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' }; const y = PY1 + 72, xa = XS[1] + 65, xb = XS[2] + 65;   // between two staggered bottom lights
      sv('line', Object.assign({ x1: xa, y1: y, x2: xb, y2: y }, L), dg); sv('line', Object.assign({ x1: xa, y1: y - 18, x2: xa, y2: y + 18 }, L), dg); sv('line', Object.assign({ x1: xb, y1: y - 18, x2: xb, y2: y + 18 }, L), dg);
      svText(dg, (xa + xb) / 2, y + 58, '~6-8 FT', 40, GOLD, 'middle', 'dim68'); dg.style.transformBox = 'fill-box'; dg.style.transformOrigin = 'left center'; reg(dg, { o: 0, sx: .3 }); tw(dg, ts + 1.1, ts + 1.5, { o: 1, sx: 1 }, EOX);
      const rt = svText(svg, 440, 178, 'RULE OF THUMB', 40, OFF, 'start', 'rot'); slideIn(rt, ts + 1.6);
    }
  });
})();
