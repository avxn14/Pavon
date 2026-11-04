# Boundary Builders Facebook cover (2026-10-18)

cover.html renders the 1640x924 cover (Facebook shows the middle 1640x624 band on desktop at 820x312 and the whole 16:9 image on
mobile at 640x360). Text lives inside the desktop band and above the profile-picture overlap zone at the bottom-left.
Photos (owner's jobs, copied from the Edu Reels project, format-only operations): fence_metal_cedar (metal privacy fence Sep 29),
pool_loungers (north van pool), deck_planters_wall (Boundary Builders - Instagram folder, 4032x3024 downscaled to 2400).
Render: python3 render_cover.py d  ->  out/cover_d.png;  preview: python3 tools_preview.py out/cover_d.png out/preview.png
Variants a/b/c in cover.html swap the photos (b = charcoal fence hero, c = loungers pool + charcoal fence).
