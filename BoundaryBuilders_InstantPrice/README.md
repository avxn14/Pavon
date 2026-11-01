# Boundary Builders instant-price Meta image set

Static ad cards built from `cards.html` (yellow #F5C400 stage, charcoal #1A1A1A text, white phone frame, Outfit font),
screenshotted with headless Chromium.

- `render_cards.py <1x1|4x5|9x16>` -> `out/card_<f>.png` + `out/card_<f>.json` (text boxes, text-area %, strings)
- `tools/qa.py` -> exact size, PNG < 1 MB, strings byte-equal to `lines.txt`, text area < 25 %, 9:16 text inside y 269-1536, corners #F5C400
- `tools/preview.py` -> `out/preview.png` (three cards side by side; 9:16 UI zones shaded)
- `tools/export.py` -> after the owner's OK: re-render, QA, copy to `final/instant_price_<f>.png` + `final/preview.png`

Assets (git-ignored, see AD_BRIEF.txt): owner's fence photo `assets/fence_black_house.jpg`, estimator step-1 screen
`assets/estimator_step1.png` rendered from the owner's Instant Quote artifact (no price on that screen; nothing invented).
Line 4 still carries the `[SALE END DATE]` placeholder until the owner gives the date.
