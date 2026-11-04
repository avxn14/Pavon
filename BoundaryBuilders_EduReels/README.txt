BOUNDARY BUILDERS EDU REELS - HOW TO RE-RENDER

ONE RULE TO REMEMBER
- On-screen text edit = ONE COMMAND:   tools/make.sh NN
  (edit the words in scripts/NN_slug.json, then run the command; it re-renders, re-encodes, re-muxes, remakes the cover and runs QA)
- Spoken line edit = ASK CLAUDE IN A CHAT to regenerate that line, THEN run the command.
  make.sh checks a fingerprint of every beat's spoken text against audio/vo/NN_hashes.json. If a line changed or its
  audio file is missing, make.sh stops and prints exactly which beats need new voice-over. The ElevenLabs tools only
  exist inside a Claude chat, so a shell script cannot make voice-over. Claude saves the new file as audio/vo/NN_bK.mp3,
  updates NN_hashes.json, and then tools/make.sh NN runs clean.

WHAT THE COMMAND DOES (tools/make.sh NN)
 1. tools/check_promo.sh on scripts/NN_*.json (no prices, no promo words; any hit stops the build)
 2. voice-over check (see above)
 3. tools/audiofix.py on every beat (1.2x pitch-preserving stretch, silence trim, gaps capped at 0.25 s) -> .caf
 4. render.py plan   (scene timings from the VO lengths -> renders/NN_plan.json, renders/NN_clips.json)
 5. render.py all    (every frame at 30 fps from edu.html -> frames/NN/)
 6. tools/build.py encode  (H.264 1080x1920 30 fps, ~11 Mbps, moov before mdat)
 7. tools/build.py mux     (VO + music + SFX into ONE AAC track)        -> final/NN_slug.mp4
 8. render.py cover  (final/NN_slug_cover.png + .jpg, qa/NN_grid_preview.png)
 9. render.py qa     (safe zones, overlaps, card top, 1.30x photo limit) + tools/mp4check.py + stills in qa/NN_stills/
10. tools/check_promo.sh on the rendered on-screen strings (qa/NN_strings.txt)

WHERE THINGS ARE
- edu.html                 the one template (scene types hook / photo / diagram / card / myth / clip / end, diagrams in SVG)
- scripts/NN_slug.json     one script per video: photos (with Drive ids), beats, on-screen text, VO, cover, caption
- audio/vo/NN_bK.mp3       voice-over per beat (ElevenLabs Sia), NN_bK.caf = the fixed version make.sh renders with
- audio/music/edu_bed.*    the shared music bed; audio/sfx/whoosh.mp3 and hit.mp3
- photos/raw, photos/jpg   originals from Drive and sRGB JPEG working copies (never AI-edited); photos/view = small viewing copies
- final/                   finished MP4s and covers;  qa/  QA reports, strings, stills, grid previews
- STATUS.txt               what is built, approved, scheduled and logged, plus every owner answer

REQUIREMENTS TO RUN THE COMMAND ON A MAC
- ffmpeg (brew install ffmpeg), Python 3 with Pillow and numpy (pip3 install pillow numpy), and Chrome or Chromium.
  Set CHROME=/path/to/chrome if it is not Google Chrome in /Applications. The cloud session this was built in has all of these.
