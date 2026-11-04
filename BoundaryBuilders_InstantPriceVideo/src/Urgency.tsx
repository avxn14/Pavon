import React from 'react';
import {config, Layout} from './config';
import {ramp} from './util';

/** One bold urgency line at a time under the photo card, swapping on the voice beats; the site address stays underneath. */
export const Urgency: React.FC<{t: number; L: Layout}> = ({t, L}) => {
  const {text, beats, colors, intro} = config;
  const starts = [beats.urgency1, beats.urgency2, beats.urgency3];
  const idx = starts.filter((s) => t >= s).length - 1;
  const base: React.CSSProperties = {position: 'absolute', left: L.card.x, width: L.card.w, fontWeight: 800, fontSize: L.sizes.urgency, lineHeight: 1.1, color: colors.charcoal};
  const lines: React.ReactNode[] = [];
  if (idx >= 0) {
    const p = ramp(t, starts[idx], 0.42);
    lines.push(<div key={idx} style={{...base, top: L.urgencyY, opacity: p, transform: `translateY(${(1 - p) * 22}px)`}}>{text.urgency[idx]}</div>);
    if (idx > 0) {
      const q = ramp(t, starts[idx], 0.3);
      if (q < 1) lines.push(<div key={idx - 1} style={{...base, top: L.urgencyY, opacity: 1 - q, transform: `translateY(${-q * 18}px)`}}>{text.urgency[idx - 1]}</div>);
    }
  }
  const siteP = ramp(t, intro.site, 0.5);
  return (
    <>
      {lines}
      <div style={{position: 'absolute', left: L.card.x, top: L.siteY, fontWeight: 700, fontSize: L.sizes.site, color: colors.charcoal, opacity: 0.85 * siteP, letterSpacing: 0.2}}>{text.site}</div>
    </>
  );
};
