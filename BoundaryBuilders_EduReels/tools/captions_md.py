#!/usr/bin/env python3
"""captions_md.py: rebuild captions.md and schedule.md from scripts/*.json (STEP 4 deliverables). Run any time."""
import json, glob, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
scripts = [json.load(open(f)) for f in sorted(glob.glob(os.path.join(ROOT, "scripts", "[0-9][0-9]_*.json")))]
out = ["# Boundary Builders educational Reels: captions, hashtags, alt text, covers and photos", "", "Posting time 10:00 America/Vancouver. Instagram @boundarybuilders_bc, cross-posted to the Facebook Page.", ""]
for S in scripts:
    p = S["post"]; out += [f"## {S['id']}: {S['title']}", "", f"- Post date: {p['date']} {p.get('time','10:00')}", f"- Series pill: {S['series']} | Category: {S['category']}", f"- Cover title: {' / '.join(S['cover']['title'])} (photo {S['cover']['photo']})", f"- File: final/{S['id']}.mp4 | Cover: final/{S['id']}_cover.jpg", "", "Caption:", "", p["caption"], "", " ".join(p["hashtags"]), "", f"Alt text: {p['alt']}", "", "Photos used:"]
    for k, ph in S["photos"].items(): out.append(f"- {k}: {ph.get('name','?')} ({ph.get('driveId','no id')}), {ph.get('folder','')}, {ph.get('w')}x{ph.get('h')}" + (f" - {ph['note']}" if ph.get('note') else ""))
    out.append("")
open(os.path.join(ROOT, "captions.md"), "w").write("\n".join(out))
# schedule.md: carousels already scheduled + Reels from the scripts (dates slide if the owner's reviews run late)
carousels = [("2026-10-09", "Fri", "carousel Langley fire pit (scheduled)", "PAVERS"), ("2026-10-11", "Sun", "carousel burnaby entrance (scheduled)", "PAVERS"), ("2026-10-12", "Mon", "Reel paver vid clip (scheduled)", "PAVERS"), ("2026-10-14", "Wed", "carousel front entrance (scheduled)", "PAVERS"), ("2026-10-16", "Fri", "carousel Port Moody kitchen (scheduled)", "LANDSCAPING")]
rows = [(c[0], c[1], c[2], c[3], "", "existing post") for c in carousels]
import datetime
for S in scripts:
    d = S["post"]["date"]; wd = datetime.date.fromisoformat(d).strftime("%a")
    rows.append((d, wd, f"REEL {S['id'][:2]} {S['title']}", S["category"], f"final/{S['id']}.mp4", S.get("status", "built, awaiting OK")))
rows.sort()
out = ["# Posting schedule (10:00 AM America/Vancouver unless noted)", "", "| Date | Day | Post | Category | File | Status |", "|---|---|---|---|---|---|"]
prev = None
for r in rows:
    flag = " **(same category as the previous post: check)**" if prev and prev[3] == r[3] and not (prev[0] == "2026-10-11" and r[0] == "2026-10-12") else ""
    out.append(f"| {r[0]} | {r[1]} | {r[2]}{flag} | {r[3]} | {r[4]} | {r[5]} |"); prev = r
out += ["", "Rules: never two posts in a row in the same category (Oct 11-12 pavers back to back is the owner's existing pair); if a review runs late, slide every later Reel by the same amount, keeping about every 2 days and never on a day that already has a post.", "Reels not yet written appear once their script exists."]
open(os.path.join(ROOT, "schedule.md"), "w").write("\n".join(out)); print("wrote captions.md and schedule.md for", [S["id"] for S in scripts])
