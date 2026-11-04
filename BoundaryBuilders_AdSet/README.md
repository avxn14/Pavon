# Boundary Builders Meta ad set (F06 / F07 / F08)

    python3 build_ads.py            # all nine drafts -> out/, plus out/preview_contact_sheet.png and out/qa.md
    python3 build_ads.py f07        # rerun one creative (f06 | f07 | f08)
    python3 build_ads.py all --final   # also writes out/final/<name>.png

Everything editable is in `config.json`: sale end date, every line of copy, source files, crop focal points.
Sources live in `inputs/` (owner's own job photos, the quote-page screenshot, the logo); fonts in `fonts/`
(Montserrat Bold / ExtraBold, OFL, instanced from the Google Fonts variable file).
The script enforces the brief's gates: min font 44 px, text area < 25 %, contrast >= 4.5:1 against the worst
5 % of the background under each line, 9:16 text and logo inside y 14 %..80 %, PNG < 1 MB (palette-quantised if needed).
F08 uses the split before/after layout automatically if `inputs/f08_before.*` and `inputs/f08_after.*` exist;
otherwise the 3-photo grid, with city labels read from the `f08_city_<name>.jpg` file names.
