/* Boundary Builders instant-price video ad: EVERYTHING editable lives here (text, prices, timings, file paths, layout).
   Times are in seconds of video time. Files are relative to public/.
   Beats come from the voice-over: run `python3 tools/retime.py` after dropping audio/voiceover.mp3 + audio/voiceover.words.json. */
export type Format = '4x5' | '9x16';

export const config = {
  fps: 30,
  durationSeconds: 30,

  colors: { yellow: '#F5C400', charcoal: '#1A1A1A', white: '#FFFFFF' },
  font: { family: 'Outfit', file: 'fonts/Outfit-Variable.woff2' },

  text: {
    headlineLead: 'See your fence price',          // headline = lead + ' ' + tail; the tail never breaks across lines
    headlineTail: 'in 2 minutes.',
    subhead: 'No phone call. No waiting a week.',
    pill: { metal: 'Metal $220/panel', cedar: 'Cedar $210/panel', tail: 'installed' },   // shown as "Metal $220/panel · Cedar $210/panel · installed"
    line4: 'Winter Sale pricing until December 31',
    site: 'boundarybuilders.ca',
    urgency: ['Don’t wait for spring', 'We install all winter', 'Last chance to lock in this price'],
    sticker: 'WINTER SALE · ENDS DEC 31 · ',
    endCard: {
      title: 'Last chance.',
      sub: 'Winter Sale pricing ends December 31',
      button: 'Get your price → boundarybuilders.ca',
      row: '8+ years in business · 22+ years crew experience',
      fine: 'Per panel, installed, plus tax. Online price is an estimate; final price confirmed on site.',
    },
  },

  // Rotating fence photos (right-hand card), in order. Each shows for `photoEverySeconds`, the last one until the end card.
  photos: [
    { file: 'fences/black_metal.jpg',  label: 'Black Metal · $220/panel' },
    { file: 'fences/brown_metal.jpg',  label: 'Brown Metal · $220/panel' },
    { file: 'fences/cedar.jpg',        label: 'Cedar · $210/panel' },
    { file: 'fences/composite.jpg',    label: 'Composite' },
    { file: 'fences/black_metal.jpg',  label: 'Black Metal · $220/panel' },
  ],
  photoEverySeconds: 4,
  crossfadeSeconds: 0.6,
  photoZoom: 1.06,

  // Screen recording of the quote flow inside the phone (built by tools/build_demo.py from the capture)
  demo: {
    file: 'demo/demo.mp4',
    firstFrame: 'demo/first.png',
    lastFrame: 'demo/last.png',
    landing: 12.6,                 // seconds INTO THE FILE where the price screen is on; it is placed at beats.priceScreen in the video
    priceFocus: [0.5533, 0.3868],  // where the price sits in the recording (fraction of width/height), from capture/demo_meta.json
    zoomOrigin: [0.15, 0.42],      // the slow zoom scales about this point: keeps the page's left edge on screen while the price drifts to centre
    zoomTo: 1.18,
    zoomSeconds: 13,
  },

  logo: 'img/logo_gold.png',   // the wordmark as used on the site header (black badge, gold letters); img/logo_charcoal.png is a one-colour fallback

  audio: {
    voiceover: 'audio/voiceover.mp3',   // slot: drop the ElevenLabs file here
    music: 'audio/music.mp3',           // slot: light upbeat instrumental
    voStart: 0.5,                       // video time at which the voice-over file begins
    musicVolume: 0.16,
    musicFadeOut: 1.5,
  },

  // When things happen (video seconds). ESTIMATED from the script until the real voice-over is in (see tools/retime.py).
  beats: {
    urgency1: 2.6,      // "Don't put it off till spring"  -> "Don't wait for spring"
    priceScreen: 12.6,  // "...and there's your price"      -> recording lands on the price screen
    metal: 14.2,        // "Metal, two-twenty a panel"      -> price pill pops, Metal highlighted
    cedar: 16.3,        // "Cedar, two-ten"                 -> Cedar highlighted
    urgency2: 18.7,     // "And yes, we're installing all winter" -> "We install all winter"
    urgency3: 24.4,     // "This is your last chance"       -> "Last chance to lock in this price"
    lastChance: 25.0,   // "last chance"                    -> sticker pulses
    endCard: 26.0,      // "Lock it in at boundary builders dot C-A" -> end card
  },

  // Entrance timing of the opening (headline is on from frame 1)
  intro: { subhead: 0.15, pill: 0.3, line4: 0.45, phone: 0.35, card: 0.55, sticker: 0.95, site: 0.6 },
  sticker: { diameter: 176, rotateSeconds: 24 },

  // Geometry per format (pixels). 4x5 = the approved image, 1:1 with cards.html. 9x16 keeps text out of the top 250 / bottom 650 px.
  layout: {
    '4x5':  { width: 1080, height: 1350, block: { x: 80, y: 104, w: 920 }, sizes: { h1: 68, h2: 36, pill: 26, l4: 26, urgency: 38, site: 26, photoPill: 22 },
              phone: { x: 80, y: 462, w: 389, h: 808 }, card: { x: 509, y: 691, w: 491, h: 350 }, urgencyY: 1075, siteY: 1185, endCenterY: 690 },
    '9x16': { width: 1080, height: 1920, block: { x: 80, y: 250, w: 920 }, sizes: { h1: 68, h2: 36, pill: 26, l4: 26, urgency: 36, site: 26, photoPill: 22 },
              phone: { x: 80, y: 614, w: 319, h: 656 }, card: { x: 439, y: 614, w: 561, h: 400 }, urgencyY: 1048, siteY: 1162, endCenterY: 760 },
  } as Record<Format, Layout>,
};

export type Layout = {
  width: number; height: number; block: { x: number; y: number; w: number };
  sizes: { h1: number; h2: number; pill: number; l4: number; urgency: number; site: number; photoPill: number };
  phone: { x: number; y: number; w: number; h: number }; card: { x: number; y: number; w: number; h: number };
  urgencyY: number; siteY: number; endCenterY: number;
};
