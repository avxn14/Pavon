/* post_rot and post_depth (videos 01 and 03): a wood post in soil with its footing. opts.part = 'depth' (video 01), 'full', 'water' (video 03); opts.cont continues the previous beat.
   Also CALLOUTS.dimChip (video 03 beat 5): a horizontal gold dimension line whose label sits on a dark chip, for light photos. */
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
  // Geometry (band px): ground line GY 420, post centre PX 600 (post x 574-626, top 70), footing x 538-662 crowned to y 390, dims at x 710.
  // part 'depth' (video 01, approved): footing to y 720 (gravel 680-720), unchanged. parts 'full' / 'water' (video 03): the buried part is drawn
  // to scale with the numbers (160 px below grade vs 350 above = about 2.7 ft on 6 ft), footing to y 540, gravel 540-580, which also frees the soil
  // right of the inset (x 430-910, y 610-710) for the STEEL POSTS footnote. Free zones: left air x 110-545 / y 170-410; left soil x 110-530 / y 440-560 (16:9 inset top at 580).
  post_depth(svg, t0, opts) {
    opts = opts || {}; const v03 = opts.part === 'full' || opts.part === 'water';
    const GY = 420, PX = 600, TOP = 70, BOT = GY + (v03 ? 160 : 300);
    const tb = opts.cont ? t0 - 20 : t0;   // cont: the base drawing is already built when the beat starts (continuation of the previous beat)
    const soil = sv('rect', { x: 0, y: GY, width: 1080, height: 782 - GY, fill: '#1c1c1c' }, svg); fadeIn(soil, tb, .3);
    const gline = sv('line', { x1: 0, y1: GY, x2: 1080, y2: GY, stroke: '#434343', 'stroke-width': 4 }, svg); fadeIn(gline, tb, .3);
    const grav = gravel(svg, PX - 70, PX + 70, BOT - 40, BOT, 9); fadeIn(grav, tb + .3, .3);
    const foot = sv('path', { d: `M${PX-62} ${GY-8} Q${PX} ${GY-30} ${PX+62} ${GY-8} L${PX+62} ${BOT-40} L${PX-62} ${BOT-40} Z`, fill: '#434343' }, svg); growUp(foot, tb + .45, .45);
    const post = sv('rect', { x: PX - 26, y: TOP, width: 52, height: BOT - 52 - TOP, fill: '#6b6b6b', rx: 3 }, svg); growUp(post, tb + .7, .6);
    const cap = sv('rect', { x: PX - 34, y: TOP - 14, width: 68, height: 16, fill: '#8a8a8a', rx: 3 }, svg); fadeIn(cap, tb + 1.1, .3);
    const d6 = dimArrow(svg, PX + 110, TOP, GY - 6, '6 FT', tb + 1.3, 'dim6');
    const d23 = dimArrow(svg, PX + 110, GY + 6, BOT, '2-3 FT', tb + 1.7, 'dim23');
    // video 03 'full' says "Rule of thumb" in its first second, so the tag comes in with the words there; 'depth' (video 01) keeps its original time.
    const tag = svText(svg, 110, 150, 'RULE OF THUMB', 40, GOLD, 'start', 'tag'); slideIn(tag, opts.part === 'full' ? t0 + .3 : tb + 2.1);
    void d6; void d23;   // (svText now sets the fill inline, so the dimension numbers and the tag render gold in every part)
    const blueArrow = (d, t) => { const p = sv('path', { d, fill: 'none', stroke: BLUE, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg); p.style.filter = 'drop-shadow(0 3px 8px rgba(0,0,0,.5))'; drawPath(p, t, .5); return p; };
    const headD = (x1, y1, dx, dy, s) => { const a = Math.atan2(dy, dx); return ` M${(x1 - s * Math.cos(a - .5)).toFixed(1)} ${(y1 - s * Math.sin(a - .5)).toFixed(1)} L${x1} ${y1} L${(x1 - s * Math.cos(a + .5)).toFixed(1)} ${(y1 - s * Math.sin(a + .5)).toFixed(1)}`; };
    if (opts.part === 'full') {   // video 03 beat 3: WOOD POST, about 1/3 in the ground, 6 ft fence 2-3 ft deep, steel posts note
      const wp = svText(svg, PX - 55, 360, 'WOOD POST', 40, OFF, 'end', 'woodpost'); slideIn(wp, t0 + 1.2);          // right-aligned just left of the post, above grade
      const l1 = svText(svg, 110, 222, 'ABOUT 1/3', 40, OFF, 'start', 'third'); slideIn(l1, t0 + 1.4);
      const l1b = svText(svg, 110, 272, 'IN THE GROUND', 40, OFF, 'start', 'third'); slideIn(l1b, t0 + 1.55);
      // the buried part of the post lights up gold ("goes in the ground")
      const buried = sv('rect', { x: PX - 26, y: GY + 2, width: 52, height: BOT - 52 - GY - 2, fill: GOLD, opacity: .85, rx: 3 }, svg); fadeIn(buried, t0 + 2.3, .4);
      const l2 = svText(svg, 110, 500, '6 FT FENCE:', 40, OFF, 'start', 'sixft'); slideIn(l2, t0 + 3.6);           // in the soil, next to the 2-3 FT arrow, above the inset
      const l2b = svText(svg, 110, 550, '2-3 FT DEEP', 40, OFF, 'start', 'sixft'); slideIn(l2b, t0 + 4.4);
      const l3 = svText(svg, 430, 650, 'STEEL POSTS:', 40, OFF, 'start', 'steel'); slideIn(l3, t0 + 3.0);           // footnote in the soil below the footing, right of the inset (x 430-910, frame y 940-1040; left of x 920)
      const l3b = svText(svg, 430, 700, "MAKER'S FOOTING SPEC", 40, OFF, 'start', 'steel'); slideIn(l3b, t0 + 3.15);
    }
    if (opts.part === 'water') {   // video 03 beat 4: gravel drains, crowned top sheds rain
      const gglow = gravel(svg, PX - 70, PX + 70, BOT - 40, BOT, 9); [...gglow.children].forEach(c => { c.setAttribute('fill', GOLD); c.setAttribute('opacity', 1); }); fadeIn(gglow, t0 + .3, .4);   // the same seeded gravel dots light up gold
      const g1 = svText(svg, 110, 548, 'GRAVEL DRAINS', 40, OFF, 'start', 'gd'); slideIn(g1, t0 + .4);   // level with the gravel, 22 px above the inset
      [[PX - 35, 0], [PX, .1], [PX + 35, .2]].forEach(([x, dl]) => blueArrow(`M${x} ${BOT-50} L${x} ${BOT+28}` + headD(x, BOT + 28, 0, 1, 20), t0 + 1.0 + dl));   // water down through the gravel
      const crown = sv('path', { d: `M${PX-62} ${GY-8} Q${PX} ${GY-30} ${PX+62} ${GY-8}`, fill: 'none', stroke: GOLD, 'stroke-width': 8, 'stroke-linecap': 'round' }, svg); drawPath(crown, t0 + 2.4, .5);   // the crown lights up
      const g2 = svText(svg, 110, 350, 'CROWN SHEDS RAIN', 40, OFF, 'start', 'cr'); slideIn(g2, t0 + 2.5);
      [[PX - 52, 0], [PX + 52, .1]].forEach(([x, dl]) => blueArrow(`M${x} ${GY-124} L${x} ${GY-54}` + headD(x, GY - 54, 0, 1, 20), t0 + 3.4 + dl));   // rain falling on the crown
      blueArrow(`M${PX-44} ${GY-22} Q${PX-84} ${GY-10} ${PX-132} ${GY+16}` + headD(PX - 132, GY + 16, -48, 26, 20), t0 + 3.9);   // runs off the crown, away from the post
    }
  }
});
// horizontal gold dimension line with end ticks and the label on a dark chip centred on the line: {x0, x1, y, label, t (default .4), size (48), group}
Object.assign(CALLOUTS, {
  dimChip(svg, t0, o) {
    const gr = sv('g', {}, svg); gr.style.filter = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))';
    const y = o.y, size = o.size || 48, mid = (o.x0 + o.x1) / 2, dl = o.t === undefined ? .4 : o.t;
    const tx = svText(gr, mid, y + Math.round(size * .36), o.label, size, GOLD, 'middle', o.group || 'dimChip'); tx.style.fill = GOLD;   // inline: the .callout text CSS would make it off-white
    const bb = tx.getBBox(); const padX = 26, h = size + 22;
    const chip = sv('rect', { x: bb.x - padX, y: y - h / 2, width: bb.width + 2 * padX, height: h, rx: 18, fill: 'rgba(0,0,0,.66)' }, gr); gr.insertBefore(chip, tx);
    const L = { stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' };
    sv('line', Object.assign({ x1: o.x0, y1: y, x2: bb.x - padX - 12, y2: y }, L), gr);
    sv('line', Object.assign({ x1: bb.x + bb.width + padX + 12, y1: y, x2: o.x1, y2: y }, L), gr);
    sv('line', Object.assign({ x1: o.x0, y1: y - 22, x2: o.x0, y2: y + 22 }, L), gr);
    sv('line', Object.assign({ x1: o.x1, y1: y - 22, x2: o.x1, y2: y + 22 }, L), gr);
    gr.style.transformBox = 'fill-box'; gr.style.transformOrigin = 'left center'; reg(gr, { o: 0, sx: .2 }); tw(gr, t0 + dl, t0 + dl + .5, { o: 1, sx: 1 }, EOX);
    return gr;
  }
});
