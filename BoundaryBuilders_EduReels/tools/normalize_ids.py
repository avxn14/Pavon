#!/usr/bin/env python3
"""normalize_ids.py: give every script the brief's slug (NN_slug), renaming scripts/NN_NN_slug.json -> scripts/NN_slug.json and
the matching final/ files. Safe to run twice."""
import json, glob, os, re, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for f in sorted(glob.glob(os.path.join(ROOT, "scripts", "[0-9][0-9]_*.json"))):
    base = os.path.basename(f)[:-5]; nn = base[:2]
    slug = re.sub(r"^(\d\d)_\1_", r"\1_", base)          # 03_03_fence_posts -> 03_fence_posts
    S = json.load(open(f)); old_id = S.get("id")
    if slug == base and old_id == slug: continue
    S["id"] = slug
    newf = os.path.join(ROOT, "scripts", slug + ".json"); json.dump(S, open(newf, "w"), indent=1, ensure_ascii=False); open(newf, "a").write("\n")
    if newf != f: os.remove(f)
    for suffix in (".mp4", "_cover.png", "_cover.jpg"):
        for cand in {old_id, base}:
            src = os.path.join(ROOT, "final", cand + suffix); dst = os.path.join(ROOT, "final", slug + suffix)
            if cand and os.path.exists(src) and src != dst: shutil.move(src, dst)
    for cand in {old_id, base}:
        src = os.path.join(ROOT, "qa", cand + "_REVIEW_COPY.mp4"); dst = os.path.join(ROOT, "qa", slug + "_REVIEW_COPY.mp4")
        if cand and os.path.exists(src) and src != dst: shutil.move(src, dst)
    print(f"{base} (id {old_id}) -> {slug}")
print("done")
