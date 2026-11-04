import React from 'react';
import {CalculateMetadataFunction, Composition, staticFile} from 'remotion';
import {Ad, AdProps} from './Ad';
import {config, Format} from './config';

/** audio files are optional slots: if a file is missing, the composition renders without it */
const exists = async (url: string) => {
  try { const r = await fetch(url, {method: 'HEAD'}); return r.ok; } catch { return false; }
};
const calculateMetadata: CalculateMetadataFunction<AdProps> = async ({props}) => ({
  props: {
    ...props,
    voiceover: (await exists(staticFile(config.audio.voiceover))) ? config.audio.voiceover : null,
    music: (await exists(staticFile(config.audio.music))) ? config.audio.music : null,
  },
});

export const RemotionRoot: React.FC = () => (
  <>
    {(['4x5', '9x16'] as Format[]).map((format) => {
      const L = config.layout[format];
      return (
        <Composition
          key={format}
          id={format === '4x5' ? 'InstantPrice45' : 'InstantPrice916'}
          component={Ad}
          width={L.width}
          height={L.height}
          fps={config.fps}
          durationInFrames={Math.round(config.durationSeconds * config.fps)}
          defaultProps={{format, voiceover: null, music: null}}
          calculateMetadata={calculateMetadata}
        />
      );
    })}
  </>
);
