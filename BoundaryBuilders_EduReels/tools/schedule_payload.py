#!/usr/bin/env python3
"""schedule_payload.py NN <mp4_public_url> <cover_jpg_public_url> [date YYYY-MM-DD]
Prints the exact arguments for Metricool createScheduledPost (blogId 7175840, Instagram REEL + Facebook, 10:00 America/Vancouver,
offset computed with zoneinfo for that date, autoPublish true, isAiGenerated false, showReelOnFeed true)."""
import json, glob, sys, os
from datetime import datetime
from zoneinfo import ZoneInfo
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NN, mp4, cover = sys.argv[1:4]
S = json.load(open(sorted(glob.glob(os.path.join(ROOT, "scripts", f"{NN}_*.json")))[0])); p = S["post"]
date = sys.argv[4] if len(sys.argv) > 4 else p["date"]; time = p.get("time", "10:00")
tz = "America/Vancouver"; local = datetime.fromisoformat(f"{date}T{time}:00").replace(tzinfo=ZoneInfo(tz))
text = p["caption"] + "\n\n" + " ".join(p["hashtags"])
info = {"autoPublish": True, "draft": False, "providers": [{"network": "instagram"}, {"network": "facebook"}],
        "instagramData": {"type": "REEL", "showReelOnFeed": True, "isAiGenerated": False},
        "facebookData": {"type": "REEL"},
        "text": text, "media": [mp4], "videoThumbnailUrl": cover, "mediaAltText": [p["alt"]],
        "publicationDate": {"dateTime": f"{date}T{time}:00", "timezone": tz}}
print(json.dumps({"blogId": "7175840", "date": local.isoformat(), "info": info}, indent=1, ensure_ascii=False))
