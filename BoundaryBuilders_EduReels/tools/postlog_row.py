#!/usr/bin/env python3
"""postlog_row.py NN [scheduled|...]: print the Instagram Post Log row for a video as tab-separated text, in the sheet's exact columns:
Project folder | Source (Past/New) | Post (1 of 1...) | Format | Files used | Files skipped + why | Scheduled for | Caption | Status | Date logged"""
import json, glob, sys, os, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NN = sys.argv[1]; status = sys.argv[2] if len(sys.argv) > 2 else "Scheduled"
S = json.load(open(sorted(glob.glob(os.path.join(ROOT, "scripts", f"{NN}_*.json")))[0])); p = S["post"]
folders = sorted({ph.get("folder", "").split(" (")[0] for ph in S["photos"].values() if ph.get("folder")})
files = "; ".join(f"{ph.get('name','?')} ({ph.get('driveId','no id')})" for ph in S["photos"].values())
skipped = "; ".join(f"{k}: {ph['note']}" for k, ph in S["photos"].items() if ph.get("note")) or "-"
row = [f"Edu Reel {NN}: {S['title']} ({', '.join(folders)})", "Past", "1 of 1", "Reel", files, skipped, f"{p['date']} {p.get('time','10:00')} America/Vancouver", p["caption"] + "\n\n" + " ".join(p["hashtags"]), status, datetime.date.today().isoformat()]
print("\t".join(c.replace("\t", " ") for c in row))
