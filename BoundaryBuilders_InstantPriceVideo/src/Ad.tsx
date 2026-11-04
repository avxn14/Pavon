import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {config, Format} from './config';
import {ramp} from './util';
import {TextBlock} from './TextBlock';
import {Phone} from './Phone';
import {PhotoCard} from './PhotoCard';
import {Sticker} from './Sticker';
import {Urgency} from './Urgency';
import {EndCard} from './EndCard';

const fontReady = loadFont({family: config.font.family, url: staticFile(config.font.file), weight: '100 900', format: 'woff2'});

export type AdProps = {format: Format; voiceover: string | null; music: string | null};

export const Ad: React.FC<AdProps> = ({format, voiceover, music}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const [handle] = useState(() => delayRender('Outfit font'));
  useEffect(() => { fontReady.then(() => continueRender(handle)).catch(() => continueRender(handle)); }, [handle]);
  const L = config.layout[format];
  const {colors, beats, audio} = config;
  const endFrame = Math.round(beats.endCard * fps);
  const musicVolume = (f: number) => {
    const tt = f / fps;
    return audio.musicVolume * ramp(tt, 0, 0.6) * (1 - ramp(tt, config.durationSeconds - audio.musicFadeOut, audio.musicFadeOut));
  };
  return (
    <AbsoluteFill style={{background: colors.yellow, color: colors.charcoal, fontFamily: `'${config.font.family}', sans-serif`, fontSize: 16, lineHeight: 'normal', WebkitFontSmoothing: 'antialiased', overflow: 'hidden'}}>
      <style>{`* { box-sizing: border-box; }`}</style>
      {t < beats.endCard + 0.6 && (
        <>
          <TextBlock t={t} L={L} />
          <Phone t={t} L={L} fps={fps} />
          <PhotoCard t={t} L={L} />
          <Urgency t={t} L={L} />
          <Sticker t={t} L={L} />
        </>
      )}
      <Sequence from={endFrame} layout="none"><EndCard t={t - beats.endCard} L={L} /></Sequence>
      {voiceover && <Sequence from={Math.round(audio.voStart * fps)} layout="none"><Audio src={staticFile(voiceover)} /></Sequence>}
      {music && <Audio src={staticFile(music)} volume={musicVolume} />}
    </AbsoluteFill>
  );
};
