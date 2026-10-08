/* post_rot and post_depth (videos 01 and 03): a wood post in soil with its footing. opts.part = 'depth' (video 01), 'full', 'water'; opts.cont continues the previous beat. */
Object.assign(DIAGRAMS, {
  // Wood post in soil with a concrete footing; the soil line glows gold as the ROT ZONE.
  post_rot(svg, t0, opts) {
    const GY = 400, PX = 560;
    const soil = sv('rect', { x: 0, y: GY, width: 1080, height: 782 - GY, fill: '#1c1c1c' }, svg); fadeIn(soil, t0, .3);
    const gline = sv('line', { x1: 0, y1: GY, x2: 1080, y2: GY, stroke: '#434343', 'stroke-width': 4 }, svg); fadeIn(gline, t0, .3);
    const foot = sv('path', { d: `M${PX-62} ${GY+6} L${PX+62} ${GY+6} L${PX+62} ${GY+300} Q${PX} ${GY+330} ${PX-62} ${GY+300} Z`, fill: '#434343' }, svg); growUp(foot, t0 + .25, .45);
    const grav = gravel(svg, PX - 70, PX + 70, GY + 300, GY + 345, 5); fadeIn(grav, t0 + .55, .3);
    const post = sv('rect', { x: PX - 26, y: 110, width: 52, height: GY + 280 - 110, fill: '#6b6b6b', rx: 3 }, svg); growUp(post, t0 + .5, .55);
    const cap = sv('rect', { x: PX - 34, y: 96, width: 68, height: 16, fill: '#8a8a8a', rx: 3 }, svg); fadeIn(cap, t0 + .9, .3);
    // rot zone glow
    const glow = sv('rect', { x: PX - 46, y: GY - 26, width: 92, height: 52, fill: GOLD, opacity: .95, rx: 10 }, svg); glow.style.filter = 'drop-shadow(0 0 18px rgba(255,197,39,.9))';
    reg(glow, { o: 0, s: .6 }); glow.style.transformBox = 'fill-box'; glow.style.transformOrigin = 'center'; tw(glow, t0 + 1.3, t0 + 1.7, { o: 1, s: 1 }, EOB);
    for (let i = 0; i < 6; i++) { const a = t0 + 1.8 + i * .7; tw(glow, a, a + .35, { s: 1.12 }, EO); tw(glow, a + .35, a + .7, { s: 1 }, EO); }
    const lead = sv('line', { x1: PX + 50, y1: GY, x2: PX + 150, y2: GY, stroke: GOLD, 'stroke-width': 4 }, svg); fadeIn(lead, t0 + 1.6, .3);
    const rz = svText(svg, PX + 162, GY + 16, 'ROT ZONE', 48, GOLD, 'start', 'rotzone'); slideIn(rz, t0 + 1.65);
    const air = svText(svg, PX + 162, GY - 100, 'AIR', 40, OFF, 'start', 'air'); slideIn(air, t0 + 2.1);
    const ws = svText(svg, PX + 162, GY + 120, 'WET SOIL', 40, OFF, 'start', 'wetsoil'); slideIn(ws, t0 + 2.3);
    // blue drip arrows at the line
    [[PX - 110, 0], [PX + 110, .15]].forEach(([x, dl]) => {
      const p = sv('path', { d: `M${x} ${GY-90} L${x} ${GY-14} M${x-16} ${GY-34} L${x} ${GY-14} L${x+16} ${GY-34}`, fill: 'none', stroke: BLUE, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
      drawPath(p, t0 + 2.4 + dl, .5);
    });
  },
  // Post + footing with gold dimension arrows: 6 FT above ground, 2-3 FT below, gravel at the bottom, RULE OF THUMB tag.
  post_depth(svg, t0, opts) {
    opts = opts || {}; const GY = 420, PX = 600, TOP = 70, BOT = GY + 300;
    const tb = opts.cont ? t0 - 20 : t0;   // cont: the base drawing is already built when the beat starts (continuation of the previous beat)
    const soil = sv('rect', { x: 0, y: GY, width: 1080, height: 782 - GY, fill: '#1c1c1c' }, svg); fadeIn(soil, tb, .3);
    const gline = sv('line', { x1: 0, y1: GY, x2: 1080, y2: GY, stroke: '#434343', 'stroke-width': 4 }, svg); fadeIn(gline, tb, .3);
    const grav = gravel(svg, PX - 70, PX + 70, BOT - 40, BOT, 9); fadeIn(grav, tb + .3, .3);
    const foot = sv('path', { d: `M${PX-62} ${GY-8} Q${PX} ${GY-30} ${PX+62} ${GY-8} L${PX+62} ${BOT-40} L${PX-62} ${BOT-40} Z`, fill: '#434343' }, svg); growUp(foot, tb + .45, .45);
    const post = sv('rect', { x: PX - 26, y: TOP, width: 52, height: BOT - 52 - TOP, fill: '#6b6b6b', rx: 3 }, svg); growUp(post, tb + .7, .6);
    const cap = sv('rect', { x: PX - 34, y: TOP - 14, width: 68, height: 16, fill: '#8a8a8a', rx: 3 }, svg); fadeIn(cap, tb + 1.1, .3);
    dimArrow(svg, PX + 110, TOP, GY - 6, '6 FT', tb + 1.3, 'dim6');
    dimArrow(svg, PX + 110, GY + 6, BOT, '2-3 FT', tb + 1.7, 'dim23');
    const tag = svText(svg, 110, 150, 'RULE OF THUMB', 40, GOLD, 'start', 'tag'); slideIn(tag, tb + 2.1);
    if (opts.part === 'full') {
      const wp = svText(svg, PX - 70, TOP + 60, 'WOOD POST', 40, OFF, 'end', 'woodpost'); slideIn(wp, t0 + 1.0, 30);
      const l1 = svText(svg, 110, 230, 'ABOUT 1/3 IN THE GROUND', 40, OFF, 'start', 'third'); slideIn(l1, t0 + 2.4);
      const l2 = svText(svg, 110, 300, '6 FT FENCE: 2-3 FT DEEP', 40, OFF, 'start', 'sixft'); slideIn(l2, t0 + 2.7);
      const l3 = svText(svg, 430, 760, "STEEL POSTS: MAKER'S FOOTING SPEC", 40, OFF, 'start', 'steel'); slideIn(l3, t0 + 3.2);
    }
    if (opts.part === 'water') {   // video 03 beat 4: gravel drains, crowned top sheds rain
      [[PX - 40, 0], [PX + 40, .12]].forEach(([x, dl]) => { const p = sv('path', { d: `M${x} ${BOT-70} L${x} ${BOT+20} M${x-14} ${BOT} L${x} ${BOT+20} L${x+14} ${BOT}`, fill: 'none', stroke: BLUE, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg); drawPath(p, t0 + 1.3 + dl, .5); });
      [[-1, 0], [1, .12]].forEach(([d, dl]) => { const x0 = PX + d * 40, x1 = PX + d * 130; const p = sv('path', { d: `M${x0} ${GY-40} Q${x0+d*40} ${GY-24} ${x1} ${GY+40} M${x1-d*22} ${GY+34} L${x1} ${GY+40} L${x1-d*6} ${GY+16}`, fill: 'none', stroke: BLUE, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg); drawPath(p, t0 + 2.0 + dl, .5); });
      const g1 = svText(svg, 110, 230, 'GRAVEL DRAINS', 40, OFF, 'start', 'gd'); slideIn(g1, t0 + 1.5);
      const g2 = svText(svg, 110, 300, 'CROWN SHEDS RAIN', 40, OFF, 'start', 'cr'); slideIn(g2, t0 + 2.2);
    }
  }
});
