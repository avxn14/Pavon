import React from 'react';
import {interpolateColors} from 'remotion';
import {config, Layout} from './config';
import {bump, ramp, rise} from './util';

/** The approved image's text block: headline, subhead, price pill, Line 4. Same CSS values as cards.html. */
export const TextBlock: React.FC<{t: number; L: Layout}> = ({t, L}) => {
  const {text, colors, beats, intro} = config;
  const metalOn = ramp(t, beats.metal, 0.25) - ramp(t, beats.cedar, 0.25);
  const cedarOn = ramp(t, beats.cedar, 0.25);
  const pop = bump(t, beats.metal, 0.5, 0.08) * bump(t, beats.cedar, 0.4, 0.05);
  return (
    <div style={{position: 'absolute', left: L.block.x, top: L.block.y, width: L.block.w, color: colors.charcoal}}>
      <div style={{fontWeight: 900, fontSize: L.sizes.h1, lineHeight: 1.04, letterSpacing: -1.5}}>
        {text.headlineLead} <span style={{whiteSpace: 'nowrap'}}>{text.headlineTail}</span>
      </div>
      <div style={{fontWeight: 600, fontSize: L.sizes.h2, lineHeight: 1.2, marginTop: 14, ...rise(t, intro.subhead, 0.5)}}>{text.subhead}</div>
      <div style={rise(t, intro.pill, 0.5)}>
        <div style={{display: 'inline-block', marginTop: 18, background: colors.charcoal, color: colors.yellow, fontWeight: 700, fontSize: L.sizes.pill, lineHeight: 1,
          padding: '15px 26px 13px', borderRadius: 999, whiteSpace: 'nowrap', letterSpacing: 0.3, transform: `scale(${pop})`, transformOrigin: '12% 50%'}}>
          <Seg label={text.pill.metal} on={metalOn} />{' · '}<Seg label={text.pill.cedar} on={cedarOn} />{' · '}{text.pill.tail}
        </div>
      </div>
      <div style={{fontWeight: 600, fontSize: L.sizes.l4, lineHeight: 1.2, marginTop: 16, ...rise(t, intro.line4, 0.5)}}>{text.line4}</div>
    </div>
  );
};

/** one price inside the pill; `on` 0..1 inverts it (yellow chip, charcoal text) when the voice says that price */
const Seg: React.FC<{label: string; on: number}> = ({label, on}) => {
  const {colors} = config;
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
      <span style={{position: 'absolute', left: -10, right: -10, top: -9, bottom: -8, borderRadius: 999, background: colors.yellow, opacity: on}} />
      <span style={{position: 'relative', color: interpolateColors(on, [0, 1], [colors.yellow, colors.charcoal])}}>{label}</span>
    </span>
  );
};
