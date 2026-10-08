# edu.html template notes (read before adding a video or a diagram)

## Files
- `edu.html`: the 1080x1920 stage, CSS, tween engine (`reg`/`tw`/`seek`), scene builders (hook/photo/diagram/card/end), captions, cover mode, QA sampler. Do NOT edit it for one video; if a feature is missing for every video, report it.
- `diagrams/*.js`: one module per diagram family, loaded after the main script. Each registers `DIAGRAMS.<name> = function (svg, t0, opts) {...}` and/or `CALLOUTS.<name> = function (svg, t0, o) {...}`. `fence_posts.js` = post_rot + post_depth (videos 01, 03), `wind.js` = wind callout (01), `callouts.js` = shared generic callouts (ring, dimH, arrow, dash, tag; read-only, add new callout types in your own module). Edit only your own module.
- `render.py`: `VID=NN python3 render.py plan | preview t1 t2 ... | all | cover | qa`. `ESTIMATE=1` lets `plan` run before the VO exists (text-length estimate; previews/QA only).
- `tools/make.sh NN`: the one-command build: promo check, VO hash check, audiofix (1.2x), plan, render all, encode, mux, cover, QA + mp4check + stills (qa/NN_stills, with _375 phone-size copies), promo check on the rendered strings. Takes 4-6 minutes per video.
- `scripts/NN_slug.json`: one script per video (see `scripts/01_leaning_fence.json`). Photos live in `photos/jpg/<driveId>.jpg` (640 px viewing copies in `photos/view/`).

## Coordinates and zones
- Frame 1080x1920. Band area = frame y 330-1112 (782 tall). Diagram and callout SVGs are 1080x782 with their origin at frame (0,330): band y = frame y - 330.
- QA fails if: any text/logo above frame y 250 or below 1470; any text outside x 65-1015; anything below frame y 1000 (band y 670) right of x 920; a card top above 1152; two visible text boxes overlapping (unless they share `data-g`); a sharp photo over 1.30x its file pixels; a panned/zoomed photo exposing an edge of its band or the frame.
- Fixed elements: series pill at (65,300) and small logo at x 740-1004, y 290 (hook + all beats; the logo hides on the end card). BUILT RIGHT pill and in-band label at (72, 1030) = band y 700, left side. Diagram inset: 320 px wide at x 72-392, bottom at frame y 1090 (band y 760), height 320*h/w (a 4:3 inset covers band y 520-760; a 3:4 inset covers band y 333-760): keep diagram labels out of that rectangle. Headline zone frame y 1130-1330 (beats without a card). Caption pill 1350-1436. Card from 1152 down (badge/tick at x 72, row centred on y 1220, small line at 1284-1334).
- The photo box is sized to exactly cover its frame/band (object-fit fill), aligned by `pos`; `kb` zooms about the box centre and pans it. Zoom and pan are applied as layout (deterministic, resampled every frame).

## Script JSON (beat fields)
- `type`: `hook` | `photo` | `diagram` | `end` (myth and clip arrive in batch 06-10).
- `photo`: key; `layout`: `band` | `full`; `band`: `{w,h}` smaller centred band for small photos (e.g. 640x427 -> `{"w":800}`); `pos`: `"50% 50%"` alignment of the cover-sized box (`"100% 50%"` = right edge, `"50% 0%"` = top); `kb`: `{from:[scale,dx,dy], to:[scale,dx,dy]}` linear over the beat, dx/dy in px (pan room = (box - frame)/2 each side; the box must keep covering).
- `fill`: photo key for the blurred background (defaults to `photo`). Diagram beats: `diagram`: name, `opts`: object passed to the function (`opts.cont` and `opts.beatLen` are added automatically), `cont: true` when the beat continues the previous beat's diagram (base already built, only the new part animates), `inset`: photo key.
- `wipe: true` = gold wipe INTO this beat (plan adds the whoosh). Max 2-3 wipes per video; otherwise a 0.3 s crossfade.
- `builtRight: true` = BUILT RIGHT pill from the first frame ([BR] beats; the pill is also mandatory anywhere a problem word sits over the owner's finished work). `label`: in-band label at (72,1030), or (72,350) when builtRight.
- `headline`: `["LINE 1", "*GOLD* LINE 2"]` (1-2 lines, each <= 850 px; auto 104/92/84 px); `card`: `{mark: "badge"|"tick"|"grey", n: 1, row: "ROW *TEXT*", small: "SMALL LINE"}` (row <= 712 px next to a badge, 754 next to a tick/grey; small <= 840 px); `prompt` (end beats, <= 800 px pill).
- `callouts`: `[{type, ...}]` in band coordinates: `ring {x,y,r,w,t,pulse}`, `dimH {x0,x1,y,label,t,above,size}`, `arrow {pts:[[x,y],...], color:'gold'|'blue', w, head, t, dur, label, lx, ly, size, anchor}`, `dash {pts,w,t}`, `tag {x,y,text,t,color,anchor,size}`. `t` = seconds after the beat start (default .4). Callout text is QA text too (keep it in the safe zones).
- `blurs`: `[{x,y,w,h,r}]` plain CSS blur boxes in FRAME coordinates (faces, plates, house numbers, lettering). Give them margin so the Ken Burns move never uncovers the object. Cropping (pos/kb/band) is the better fix when possible.
- `sfx`: `[{file:"hit"|"whoosh", offset: seconds after beat start, vol}]` extra sounds (compactor thumps etc.). plan() already adds a whoosh for each wipe, and a hit for each card and for the end card.
- `lead`/`tail`/`min`: timing overrides (defaults hook .30/.30/2.6, end .35/1.60/3.5, others .18/.35/2.4). Beat length = max(min, lead + VO + tail). Diagram functions get t0 = beat start + 0.2; headline words pop in from beat start + .15 (hook: + .05).
- `vo`: the spoken line; `*asterisks*` mark gold caption words and are stripped for TTS. The text must match the generated audio exactly (make.sh compares a sha1 with `audio/vo/NN_hashes.json`), so copy the brief's VO lines verbatim.
- Top level: `id`, `title`, `category`, `series`, `target [24,34]`, `stretch 1.2`, `music {file, volume 0.2, offset}` (different offset per video), `photos {KEY: {file, driveId, name, folder, w, h}}`, `cover {photo, layout, pos, kb, band, blurs, title: [..]}` (cover blurs use the same frame-coordinate boxes as a beat), `post {date, time "10:00", caption, hashtags (5), alt}`.

## Diagram authoring (`diagrams/<name>.js`)
- `DIAGRAMS.name = function (svg, t0, opts) {...}`; `svg` is the 1080x782 band SVG. Build with `sv(tag, attrs, parent)` and `svText(parent, x, y, text, size, fill, anchor, group)` (adds class `q` + `data-g` so QA sees it).
- Animate ONLY through the tween registry: `reg(el, base)` then `tw(el, t0, t1, to, ease)` on keys `o` (opacity), `x`, `y` (px), `s`/`sx`/`sy` (scale), `r` (deg), `dash` (stroke-dashoffset). Helpers: `fadeIn(e,t,d)`, `slideIn(e,t,dx)`, `growUp(e,t,d)` (scaleY from the bottom), `drawPath(path,t,d)` (stroke draw-on), `dimArrow(parent,x,y0,y1,label,t,group)` (vertical gold dimension), `gravel(parent,x0,x1,y0,y1,seed)`. Easings `EO EI EIO EOB EOX LIN`. Colours `GOLD` `BLUE` `OFF` (#F9F9F9); greys #222222 #434343 #6b6b6b; soil #1c1c1c. Every frame must be a pure function of t: no timers, CSS animations or unseeded Math.random. For an SVG element that you transform, set `e.style.transformBox='fill-box'` and a `transformOrigin` (the helpers do this).
- Continuations: `const tb = opts.cont ? t0 - 20 : t0;` build the base with `tb` (already finished when the beat starts), the new part with `t0`. `opts.part` selects what to add. Looping motion (pulses, shaking) can be written as a few repeated tweens; keep it under `opts.beatLen`.
- Brief style rules: flat grey layers, soil darkest, gravel = small off-white dots, the layer being talked about lights up gold, dimension arrows and numbers gold, water and wind arrows BLUE, wrong-way = grey X mark (circle #434343, white X), right-way = gold tick (circle #FFC527, #111 tick), labels Outfit 800, 40-48 px (never smaller than 40), <= 600 px wide (wrap to 2 lines), numbers only from the video spec, RULE OF THUMB / TYPICAL tags where the brief says so. Keep labels inside x 65-1015, out of the inset rectangle, and left of x 920 when below band y 670. Each diagram beat is 6 s or less.
- Hit SFX for thumps: add `sfx` entries to the beat with offsets that match your animation (t0 = beat start + 0.2).

## Preview / QA loop
    VID=NN python3 render.py plan                      # (ESTIMATE=1 only if the VO is missing)
    VID=NN python3 render.py preview 0 0.9 4.2 ...     # stills -> renders/NN_preview/tXXX.XX.png; LOOK at them (Read tool)
    VID=NN python3 render.py qa                        # safe zones, overlaps, 1.3x, exposed edges -> qa/NN_qa.json, qa/NN_strings.txt
    tools/check_promo.sh scripts/NN_slug.json qa/NN_strings.txt
    tools/make.sh NN                                   # full build -> final/NN_slug.mp4, cover, qa/NN_stills (look at the _375 copies too)
- "FIT WARNINGS" printed by preview/qa/cover mean a headline, row, label or prompt does not fit: shorten it (and say so in your report).
- Headline sizes: 2-line headlines are capped at 92 px (84 if needed) so they stay inside y 1130-1330.
