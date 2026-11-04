import React from 'react';
import {Easing, Img, staticFile} from 'remotion';
import {config, Layout} from './config';
import {clamp, ramp} from './util';

/** White rounded card on the right: fence photos rotate with a crossfade and a slow zoom; a style pill sits on each photo. */
export const PhotoCard: React.FC<{t: number; L: Layout}> = ({t, L}) => {
  const {photos, photoEverySeconds: every, crossfadeSeconds: cf, photoZoom, intro, beats, colors} = config;
  const enter = ramp(t, intro.card, 0.7);
  const w = L.card.w - 20, h = L.card.h - 20;
  return (
    <div style={{position: 'absolute', left: L.card.x, top: L.card.y, width: L.card.w, height: L.card.h, background: '#FFFFFF', borderRadius: 30, padding: 10,
      boxShadow: '0 24px 50px rgba(0,0,0,.18), 0 4px 10px rgba(0,0,0,.08)', opacity: enter, transform: `translateY(${(1 - enter) * 40}px)`}}>
      <div style={{position: 'relative', width: w, height: h, borderRadius: 22, overflow: 'hidden', background: '#DDD'}}>
        {photos.map((p, i) => {
          const last = i === photos.length - 1;
          const start = i * every, end = last ? beats.endCard : (i + 1) * every;
          if (t < start - cf / 2 || (!last && t >= end + cf / 2)) return null;
          const fadeIn = i === 0 ? 1 : ramp(t, start - cf / 2, cf, Easing.inOut(Easing.quad));
          const zoomP = clamp((t - (start - cf / 2)) / (end - start + cf), 0, 1);
          const s = 1 + (photoZoom - 1) * zoomP;
          return (
            <div key={i} style={{position: 'absolute', inset: 0, opacity: fadeIn}}>
              <Img src={staticFile(p.file)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})`, transformOrigin: '50% 50%'}} />
              <div style={{position: 'absolute', left: 16, bottom: 16, background: colors.charcoal, color: colors.yellow, fontWeight: 700, fontSize: L.sizes.photoPill, lineHeight: 1,
                padding: '12px 18px 11px', borderRadius: 999, whiteSpace: 'nowrap', letterSpacing: 0.3}}>{p.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
