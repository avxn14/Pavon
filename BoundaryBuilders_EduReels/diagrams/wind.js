/* wind callout (video 01): #267ECE wind arrows drawing across the fence panels. */
Object.assign(CALLOUTS, {
  wind(svg, t0) {   // #267ECE wind arrows drawing across the panels
    [[420, 0], [525, .15], [630, .3]].forEach(([y, dl]) => {
      const p = sv('path', { d: `M80 ${y} C 300 ${y-30}, 520 ${y+30}, 760 ${y} M700 ${y-40} L760 ${y} L700 ${y+40}`, fill: 'none', stroke: BLUE, 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
      p.style.filter = 'drop-shadow(0 4px 10px rgba(0,0,0,.6))'; drawPath(p, t0 + .5 + dl, .8);
      for (let i = 0; i < 4; i++) { const a = t0 + 1.5 + dl + i * 1.1; tw(p, a, a + .5, { x: 30 }, EIO); tw(p, a + .5, a + 1.1, { x: 0 }, EIO); }
    });
  }
});
