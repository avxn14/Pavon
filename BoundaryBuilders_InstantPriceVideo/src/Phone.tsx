import React from 'react';
import {Easing, Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {config, Layout} from './config';
import {ramp} from './util';

/** White rounded phone frame with the quote-flow recording inside; slow zoom onto the price once it lands. */
export const Phone: React.FC<{t: number; L: Layout; fps: number}> = ({t, L, fps}) => {
  const {demo, beats, intro} = config;
  const enter = ramp(t, intro.phone, 0.7);
  const sw = L.phone.w - 28;
  const z = 1 + (demo.zoomTo - 1) * ramp(t, beats.priceScreen, demo.zoomSeconds, Easing.inOut(Easing.quad));
  const offset = beats.priceScreen - demo.landing;           // video time at which the file's t=0 sits
  const from = Math.round(Math.max(0, offset) * fps);
  const startFrom = Math.round(Math.max(0, -offset) * fps);
  const still: React.CSSProperties = {width: sw, height: 'auto', display: 'block'};
  return (
    <div style={{position: 'absolute', left: L.phone.x, top: L.phone.y, width: L.phone.w, height: L.phone.h, background: '#FFFFFF', borderRadius: 58, padding: 14,
      boxShadow: '0 22px 46px rgba(0,0,0,.20), 0 4px 10px rgba(0,0,0,.08)', opacity: enter, transform: `translateY(${(1 - enter) * 60}px)`}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 44, overflow: 'hidden', background: '#F3F3F3'}}>
        <div style={{width: sw, transform: `scale(${z})`, transformOrigin: `${demo.priceFocus[0] * 100}% ${demo.priceFocus[1] * 100}%`}}>
          {t < Math.max(0, offset) ? (
            <Img src={staticFile(demo.firstFrame)} style={still} />
          ) : (
            <Sequence from={from} layout="none">
              <OffthreadVideo src={staticFile(demo.file)} muted startFrom={startFrom} style={still} />
            </Sequence>
          )}
        </div>
      </div>
    </div>
  );
};
