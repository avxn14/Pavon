# Boundary Builders "Winter install" Meta ad (2026-11-01)

20 s, 1080x1920 (winter_install_9x16.mp4) and 1080x1350 (winter_install_4x5.mp4), H.264 + AAC, 30 fps, under 30 MB.
Owner's brief: AD_BRIEF.txt. Approved preview: qa/preview.png (3x6 contact sheet, t = 1..18 s). Decisions after the preview
(2026-11-01): no crew clip (keep the finished-fence still under "Installed by our own crew"), no sale end date (caption is
"Best price of the year."), wood-grain close-up confirmed, estimator screens captured from the owner's "Boundary Builders
Instant Quote" artifact rendered locally at phone size (estimator/shoot.py -> estimator/shots, four screens in photos/screens).

Pipeline: scripts/winter.json (shots, crops, captions, formats) -> tools/prep.py (exact-pixel crops + fills) -> render_winter.py
(FMT=916|45; preview/all/qa; PREVIEW=1 adds preview-only placeholder tags) -> tools/build.py encode + mux (audio/clips.json:
the 20 s instrumental bed at 0.32, fade from 19 s) -> tools/make_winter.sh [916 45]. QA: safe zones (9:16 y 269-1536,
4:5 y 189-1080), photo scale <= 1.30x, end card still for 1.5 s, captions byte-equal to scripts/lines.txt, tools/motion_check.py.

Photos: 15.jpg (opener and closer, bookend), 13.jpg left half (scene 2 stand-in; its back run is a gate assembly), 16.jpg
(close-up), 17.jpg left two-thirds (yard), 14.jpg skipped (person-shaped shadow, gates at both ends, screenshot-grade file).
