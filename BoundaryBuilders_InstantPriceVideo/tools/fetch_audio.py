#!/usr/bin/env python3
"""fetch_audio.py <voiceover_url> <music_url>: download the ElevenLabs files into public/audio/ and level them.
Voice-over -> voiceover.mp3 normalised to -16 LUFS (true peak -1.5 dBTP); music -> music.mp3 trimmed to the video length + 1 s.
After this run `python3 tools/retime.py` only if the words JSON changed, then `tools/render.sh all`."""
import os, sys, subprocess, re
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); A = os.path.join(HERE, "public", "audio"); os.makedirs(A, exist_ok=True)
vo_url, music_url = sys.argv[1], sys.argv[2]
dur = float(re.search(r"durationSeconds:\s*([\d.]+)", open(os.path.join(HERE, "src", "config.ts")).read()).group(1))
def get(url, path):
    subprocess.run(["curl", "-sS", "-L", "--fail", "-o", path, url], check=True); print("downloaded", path, os.path.getsize(path) // 1024, "KB")
get(vo_url, os.path.join(A, "voiceover_raw.mp3")); get(music_url, os.path.join(A, "music_raw.mp3"))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(A, "voiceover_raw.mp3"), "-af", "loudnorm=I=-16:TP=-1.5:LRA=9", "-ar", "48000", "-b:a", "192k", os.path.join(A, "voiceover.mp3")], check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(A, "music_raw.mp3"), "-t", str(dur + 1), "-ar", "48000", "-b:a", "192k", os.path.join(A, "music.mp3")], check=True)
for f in ("voiceover.mp3", "music.mp3"):
    out = subprocess.run(["ffmpeg", "-nostats", "-i", os.path.join(A, f), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    print(f, "integrated:", re.findall(r"I:\s+(-?[\d.]+) LUFS", out)[-1], "LUFS; peak:", re.findall(r"Peak:\s+(-?[\d.]+) dBFS", out)[-1], "dBFS")
