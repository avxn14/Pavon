import React from 'react';
import {Easing} from 'remotion';
import {config, Layout} from './config';
import {bump, ramp} from './util';

/** Round black sticker on the card's top-right corner: ring text, snowflake, slow rotation, pulse on "last chance". */
export const Sticker: React.FC<{t: number; L: Layout}> = ({t, L}) => {
  const {sticker, intro, beats, colors, text} = config;
  const d = sticker.diameter, r = d / 2, ringR = r - 21, circ = 2 * Math.PI * ringR;
  const enter = ramp(t, intro.sticker, 0.55, Easing.out(Easing.back(1.6)));
  const opacity = ramp(t, intro.sticker, 0.25);
  const pulse = bump(t, beats.lastChance, 0.42, 0.14) * bump(t, beats.lastChance + 0.5, 0.42, 0.09);
  const rot = (t / sticker.rotateSeconds) * 360;
  const cx = L.card.x + L.card.w - 14, cy = L.card.y + 14;
  return (
    <div style={{position: 'absolute', left: cx - r, top: cy - r, width: d, height: d, opacity, transform: `scale(${(0.6 + 0.4 * enter) * pulse})`, filter: 'drop-shadow(0 10px 18px rgba(0,0,0,.22))'}}>
      <svg width={d} height={d} viewBox={`0 0 ${d} ${d}`} style={{display: 'block', transform: `rotate(${rot}deg)`}}>
        <circle cx={r} cy={r} r={r} fill={colors.charcoal} />
        <defs>
          <path id="bb-ring" d={`M ${r} ${r} m ${-ringR} 0 a ${ringR} ${ringR} 0 1 1 ${2 * ringR} 0 a ${ringR} ${ringR} 0 1 1 ${-2 * ringR} 0`} />
        </defs>
        <text fill={colors.yellow} fontSize={20} fontWeight={800} fontFamily={`'${config.font.family}', sans-serif`} letterSpacing={1}>
          <textPath href="#bb-ring" textLength={circ} lengthAdjust="spacing">{text.sticker}</textPath>
        </text>
        <g transform={`translate(${r} ${r})`} stroke={colors.yellow} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <g key={a} transform={`rotate(${a})`}>
              <line x1={0} y1={0} x2={0} y2={-31} />
              <path d="M -7 -16 L 0 -22 L 7 -16" />
              <path d="M -5 -25 L 0 -30 L 5 -25" />
            </g>
          ))}
          <circle cx={0} cy={0} r={3.5} fill={colors.yellow} stroke="none" />
        </g>
      </svg>
    </div>
  );
};
