# Boundary Builders instant-price video ad (Remotion)

30 s Facebook/Instagram ad built from the approved instant-price image (`../BoundaryBuilders_InstantPrice/cards.html`):
same fonts, colours and spacing; the phone plays a screen recording of the quote flow, the photo card rotates fence
styles, and the yellow space on the right carries the sticker and urgency lines. Master 1080x1350 (4:5), 30 fps, H.264;
plus a 1080x1920 (9:16) version with the content kept out of the top 250 px / bottom 650 px.

Everything editable (text, prices, timings, file paths, layout) is in `src/config.ts`.

## Render
    npm install                      # once
    tools/render.sh stills           # out/still_2s.png, still_13s.png, still_end.png (approval)
    tools/render.sh 4x5              # out/instant_price_4x5.mp4
    tools/render.sh 9x16             # out/instant_price_9x16.mp4
The CLI flags in `tools/render.sh` point Remotion at the pre-installed Chromium (`/opt/pw-browsers/chromium`, new headless mode).

## Audio slots
- `public/audio/voiceover.mp3` + `public/audio/voiceover.words.json` (ElevenLabs word timestamps) -> then `python3 tools/retime.py`
  rewrites the `beats` in `src/config.ts` so every text beat lands on the spoken words.
- `public/audio/music.mp3` light upbeat instrumental, mixed at `audio.musicVolume`.
Missing audio files are skipped automatically (the composition checks for them).

## Screen recording of the quote flow
`tools/capture_demo.py` drives the local copy of boundarybuilders.ca/quote (`../BoundaryBuilders_WinterInstall/estimator/site`)
at phone size with all network blocked (no lead or pixel can leave), records it with the DevTools screencast, and
strips the placeholder name from the result screen. `tools/build_demo.py <landing>` trims the waits, plays typing at 2x,
cuts the frames where placeholder contact details are typed, and encodes `public/demo/demo.mp4` so the price screen
sits at `landing` seconds into the file (`config.demo.landing`).

## Photos
`public/fences/*.jpg` (git-ignored): `black_metal.jpg` is the owner's photo from the image; brown metal, cedar and composite
are stand-ins taken from the quote page's own style images until job photos are supplied (see the delivery note).
