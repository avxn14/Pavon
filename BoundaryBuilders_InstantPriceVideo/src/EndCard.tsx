import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {config, Layout} from './config';
import {ramp} from './util';

const up = (t: number, start: number, extraOpacity = 1): React.CSSProperties => {
  const p = ramp(t, start, 0.45);
  return {opacity: p * extraOpacity, transform: `translateY(${(1 - p) * 22}px)`};
};

/** the button label with a drawn arrow wherever the config text has '\u2192' (the font's own arrow glyph is a thin fallback) */
const ButtonLabel: React.FC<{label: string}> = ({label}) => {
  const parts = label.split('\u2192');
  return (
    <>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <svg width={40} height={28} viewBox="0 0 40 28" style={{display: 'block', flex: 'none'}}>
              <path d="M 4 14 H 34 M 23 4 L 34 14 L 23 24" fill="none" stroke={config.colors.yellow} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <span>{p.trim()}</span>
        </React.Fragment>
      ))}
    </>
  );
};

/** Last ~4 s: logo, "Last chance.", sale line, price pill, big button, proof row, fine print. `t` is relative to the card start. */
export const EndCard: React.FC<{t: number; L: Layout}> = ({t, L}) => {
  const {text, colors} = config;
  const pillText = `${text.pill.metal} · ${text.pill.cedar} · ${text.pill.tail}`;
  return (
    <AbsoluteFill style={{background: colors.yellow, opacity: ramp(t, 0, 0.35)}}>
      <div style={{position: 'absolute', left: 80, width: L.width - 160, top: L.endCenterY, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: colors.charcoal}}>
        <Img src={staticFile(config.logo)} style={{width: 300, height: 'auto', ...up(t, 0.08)}} />
        <div style={{fontSize: 128, fontWeight: 900, lineHeight: 1, letterSpacing: -3, marginTop: 34, ...up(t, 0.15)}}>{text.endCard.title}</div>
        <div style={{fontSize: 40, fontWeight: 600, marginTop: 16, ...up(t, 0.22)}}>{text.endCard.sub}</div>
        <div style={{marginTop: 18, ...up(t, 0.29)}}>
          <div style={{display: 'inline-block', background: colors.charcoal, color: colors.yellow, fontWeight: 700, fontSize: 30, lineHeight: 1, padding: '17px 30px 15px', borderRadius: 999, whiteSpace: 'nowrap', letterSpacing: 0.3}}>{pillText}</div>
        </div>
        <div style={{marginTop: 64, background: colors.charcoal, color: colors.yellow, fontSize: 40, fontWeight: 800, lineHeight: 1, padding: '32px 56px 30px', borderRadius: 28, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 18, ...up(t, 0.36)}}><ButtonLabel label={text.endCard.button} /></div>
        <div style={{fontSize: 26, fontWeight: 600, marginTop: 34, ...up(t, 0.43)}}>{text.endCard.row}</div>
        <div style={{fontSize: 24, fontWeight: 500, marginTop: 16, maxWidth: 820, lineHeight: 1.3, ...up(t, 0.5, 0.85)}}>{text.endCard.fine.split(/(?<=\.) /).map((line, i) => <div key={i}>{line}</div>)}</div>
      </div>
    </AbsoluteFill>
  );
};
