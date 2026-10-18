/* fence_rules (video 13, beats 2-4). Three separate drawings (no continuation; the beats crossfade):
   part 1: top-down lot plan: house, front yard ~4 FT (gold front fence), side and back ~6 FT, TYPICAL. CHECK YOUR CITY.
   part 2: a corner lot: the sightline triangle at the street corner glows gold, label ~1 M, FENCES + HEDGES.
   part 3: side section: a fence on top of a retaining wall, FENCE and WALL brackets, one gold bracket for both, SOME CITIES: COUNT BOTH.
   Band coordinates 1080x782. The inset (metal-fence-1, 320x229) covers x 72-392, y 531-760, so everything sits at x 430-1080.
   Top-left labels start at baseline 130 (frame y 420+), under the small logo (frame y 290-404). */
Object.assign(DIAGRAMS, {
  fence_rules(svg, t0, opts) {
    opts = opts || {}; const part = Number(opts.part) || 1;
    const SH = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))', MID = '#434343', SOIL = '#1c1c1c', LAWN = '#223a1c', ROAD = '#2e2e2e';
    function markTick(x, y, t) { const g = sv('g', {}, svg); g.style.filter = SH; sv('circle', { cx: x, cy: y, r: 34, fill: GOLD }, g);
      sv('path', { d: `M${x - 15} ${y + 1} L${x - 4} ${y + 12} L${x + 16} ${y - 11}`, fill: 'none', stroke: '#111', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; reg(g, { o: 0, s: .4 }); tw(g, t, t + .4, { o: 1, s: 1 }, EOB); return g; }
    const LX0 = 460, LX1 = 1020, LY0 = 250, LY1 = 690;                      // lot (plan views)
    function lot(corner) {                                                     // lawn lot, street below (and to the right on a corner lot), house
      const g = sv('g', {}, svg);
      sv('rect', { x: 430, y: LY1, width: 650, height: 782 - LY1, fill: ROAD }, g);
      if (corner) sv('rect', { x: LX1, y: 200, width: 1080 - LX1, height: 782 - 200, fill: ROAD }, g);
      sv('rect', { x: LX0, y: LY0, width: LX1 - LX0, height: LY1 - LY0, fill: LAWN }, g);
      sv('rect', { x: 600, y: 360, width: 280, height: 180, fill: MID, rx: 4 }, g); sv('rect', { x: 720, y: 506, width: 40, height: 34, fill: '#5a5a5a' }, g);   // house + door
      fadeIn(g, t0, .4); return g;
    }
    function fence(d, color, w, t, dur) { const p = sv('path', { d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg); p.style.filter = SH; drawPath(p, t, dur || .6); return p; }
    if (part === 1) {
      lot(false);
      const st = svText(svg, 740, 742, 'STREET', 40, OFF, 'middle', 'street'); slideIn(st, t0 + .3);
      fence(`M${LX0} ${LY1} L${LX1} ${LY1}`, GOLD, 10, t0 + .6, .6);
      const f1 = svText(svg, 740, 628, 'FRONT ~4 FT', 44, GOLD, 'middle', 'front'); slideIn(f1, t0 + 1.0);
      fence(`M${LX0} ${LY1} L${LX0} ${LY0} L${LX1} ${LY0} L${LX1} ${LY1}`, '#bdbdbd', 10, t0 + 2.4, .9);
      const b1 = svText(svg, 740, 318, 'BACK ~6 FT', 44, OFF, 'middle', 'back'); slideIn(b1, t0 + 2.9);
      const s1 = svText(svg, 530, 465, '~6 FT', 40, OFF, 'middle', 'side'); slideIn(s1, t0 + 3.2); const s2 = svText(svg, 950, 465, '~6 FT', 40, OFF, 'middle', 'side'); slideIn(s2, t0 + 3.3);
      const n1 = svText(svg, 440, 130, 'TYPICAL.', 40, OFF, 'start', 'note'); slideIn(n1, t0 + 4.4); const n2 = svText(svg, 440, 178, 'CHECK YOUR CITY.', 40, OFF, 'start', 'note'); slideIn(n2, t0 + 4.55);
    } else if (part === 2) {
      lot(true);
      fence(`M${LX0} ${LY1} L${LX1} ${LY1} L${LX1} ${LY0}`, '#bdbdbd', 10, t0 + .5, .8);          // the two street-side fences
      const tri = sv('path', { d: `M${LX1} ${LY1} L${LX1 - 210} ${LY1} L${LX1} ${LY1 - 210} Z`, fill: GOLD, opacity: .3, stroke: GOLD, 'stroke-width': 6, 'stroke-dasharray': '16 12', 'stroke-linejoin': 'round' }, svg);
      tri.style.filter = SH; reg(tri, { o: 0 }); tw(tri, t0 + 1.4, t0 + 1.8, { o: 1 }, EO); for (let i = 0; i < 3; i++) { const a = t0 + 2.0 + i * 1.0; tw(tri, a, a + .5, { o: .55 }, EO); tw(tri, a + .5, a + 1.0, { o: 1 }, EO); }
      const low = sv('path', { d: `M${LX1 - 210} ${LY1} L${LX1} ${LY1} L${LX1} ${LY1 - 210}`, fill: 'none', stroke: GOLD, 'stroke-width': 4, 'stroke-linecap': 'round' }, svg); drawPath(low, t0 + 2.2, .5);   // the low fence inside the zone
      const m = svText(svg, 960, 462, '~1 M', 44, GOLD, 'middle', 'onem'); slideIn(m, t0 + 2.0);   // above the triangle's top vertex (gold on the gold fill would not read)
      const c1 = svText(svg, 440, 130, 'CORNER LOT:', 40, OFF, 'start', 'corner'); slideIn(c1, t0 + .4);
      const c2 = svText(svg, 440, 178, 'SIGHTLINE ZONE', 40, GOLD, 'start', 'sight'); slideIn(c2, t0 + 1.6);
      const c3 = svText(svg, 440, 226, 'FENCES + HEDGES', 40, OFF, 'start', 'hedges'); slideIn(c3, t0 + 2.6);
      markTick(740, 620, t0 + 3.2);
    } else {
      /* side section: low ground left, wall, high ground right, fence on the wall */
      const G = 660, WX0 = 560, WX1 = 620, WTOP = 330, FTOP = 150;
      const soil = sv('path', { d: `M430 ${G} L${WX0} ${G} L${WX0} ${WTOP} L1080 ${WTOP} L1080 782 L430 782 Z`, fill: SOIL }, svg); fadeIn(soil, t0, .4);
      const wall = sv('g', {}, svg); sv('rect', { x: WX0, y: WTOP, width: WX1 - WX0, height: G - WTOP, fill: '#6b6b6b' }, wall);
      for (let y = WTOP + 40; y < G; y += 40) sv('line', { x1: WX0, y1: y, x2: WX1, y2: y, stroke: MID, 'stroke-width': 3 }, wall); growUp(wall, t0 + .2, .5);
      const fen = sv('g', {}, svg); sv('rect', { x: WX0 + 10, y: FTOP, width: WX1 - WX0 - 20, height: WTOP - FTOP, fill: '#8a8a8a' }, fen);
      for (let y = FTOP + 24; y < WTOP; y += 24) sv('line', { x1: WX0 + 10, y1: y, x2: WX1 - 10, y2: y, stroke: '#5a5a5a', 'stroke-width': 3 }, fen);
      sv('rect', { x: WX0 + 4, y: FTOP - 10, width: WX1 - WX0 - 8, height: 12, fill: '#9a9a9a', rx: 3 }, fen); growUp(fen, t0 + .9, .5);
      const L = { stroke: '#bdbdbd', 'stroke-width': 5, 'stroke-linecap': 'round' }; const bx = 680;
      const b1 = sv('g', {}, svg); sv('line', Object.assign({ x1: bx, y1: FTOP, x2: bx, y2: WTOP - 4 }, L), b1); sv('line', Object.assign({ x1: bx - 16, y1: FTOP, x2: bx + 16, y2: FTOP }, L), b1); sv('line', Object.assign({ x1: bx - 16, y1: WTOP - 4, x2: bx + 16, y2: WTOP - 4 }, L), b1);
      svText(b1, bx + 30, (FTOP + WTOP) / 2 + 14, 'FENCE', 40, OFF, 'start', 'fh'); fadeIn(b1, t0 + 1.4, .3);
      const b2 = sv('g', {}, svg); sv('line', Object.assign({ x1: bx, y1: WTOP + 4, x2: bx, y2: G }, L), b2); sv('line', Object.assign({ x1: bx - 16, y1: WTOP + 4, x2: bx + 16, y2: WTOP + 4 }, L), b2); sv('line', Object.assign({ x1: bx - 16, y1: G, x2: bx + 16, y2: G }, L), b2);
      svText(b2, bx + 30, (WTOP + G) / 2 + 14, 'WALL', 40, OFF, 'start', 'wh'); fadeIn(b2, t0 + 1.6, .3);
      const GL = { stroke: GOLD, 'stroke-width': 8, 'stroke-linecap': 'round' }; const gx = 480;
      const b3 = sv('g', {}, svg); b3.style.filter = SH; sv('line', Object.assign({ x1: gx, y1: FTOP, x2: gx, y2: G }, GL), b3); sv('line', Object.assign({ x1: gx - 22, y1: FTOP, x2: gx + 22, y2: FTOP }, GL), b3); sv('line', Object.assign({ x1: gx - 22, y1: G, x2: gx + 22, y2: G }, GL), b3);
      b3.style.transformBox = 'fill-box'; b3.style.transformOrigin = 'center bottom'; reg(b3, { o: 0, sy: .2 }); tw(b3, t0 + 2.2, t0 + 2.7, { o: 1, sy: 1 }, EOX);
      const n2 = svText(svg, 1010, 130, 'SOME CITIES:', 40, OFF, 'end', 'some'); slideIn(n2, t0 + 2.3);
      const n3 = svText(svg, 1010, 178, 'COUNT BOTH', 40, GOLD, 'end', 'both'); slideIn(n3, t0 + 2.5);
    }
  }
});
