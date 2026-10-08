#!/usr/bin/env python3
"""build: ffmpeg port of the Winter Reel's build.swift.
  build.py encode <framesDir> <fps> <out.mp4>      H.264 High, ~11 Mbps, yuv420p, keyint 2s, moov before mdat
  build.py mux <video.mp4> <out.mp4> <clips.json>  one mixed AAC track from clips [{file,start,volume,fadeOut?,offset?}]
offset = seconds into the source file to start reading (new, per the brief); fadeOut = absolute time in the
video where the clip starts ramping to silence (ramp ends at the video end), as in build.swift."""
import sys, os, json, subprocess, glob
def dur(p): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p],capture_output=True,text=True).stdout.strip())
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: sys.exit(r.stderr[-4000:])
def encode(framesDir, fps, out):
    files = sorted(glob.glob(os.path.join(framesDir, "*.png")))
    if not files: sys.exit("no frames")
    run(["ffmpeg","-v","error","-y","-framerate",str(fps),"-pattern_type","glob","-i",os.path.join(framesDir,"*.png"),
         "-c:v","libx264","-preset","slow","-profile:v","high","-pix_fmt","yuv420p","-b:v","11M","-maxrate","14M","-bufsize","22M",
         "-g",str(int(fps)*2),"-r",str(fps),"-colorspace","bt709","-color_primaries","bt709","-color_trc","bt709",
         "-movflags","+faststart","-an",out])
    print(f"wrote {out} ({len(files)} frames @ {fps}fps)")
def mux(video, out, clipsJSON):
    clips = json.load(open(clipsJSON)); total = dur(video)
    inputs = ["-i", video]; parts = []; labels = []
    for i, c in enumerate(clips):
        off = float(c.get("offset", 0.0))
        inputs += ["-ss", f"{off:.3f}", "-i", c["file"]]
        start = float(c["start"]); vol = float(c["volume"])
        f = f"[{i+1}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume={vol}"
        delay = int(round(start*1000)); f += f",adelay={delay}|{delay}"
        if c.get("fadeOut") is not None:
            st = float(c["fadeOut"]); d = max(0.05, total - st); f += f",afade=t=out:st={st:.3f}:d={d:.3f}"
        f += f",atrim=0:{total:.3f}[a{i}]"; parts.append(f); labels.append(f"[a{i}]")
    fc = ";".join(parts) + ";" + "".join(labels) + f"amix=inputs={len(clips)}:normalize=0:duration=longest,alimiter=limit=0.98:level=false,atrim=0:{total:.3f},apad=whole_dur={total:.3f}[mix]"
    run(["ffmpeg","-v","error","-y"] + inputs + ["-filter_complex", fc, "-map","0:v","-map","[mix]","-c:v","copy","-c:a","aac","-b:a","192k","-ar","48000",
         "-movflags","+faststart","-shortest",out])
    print(f"wrote {out} with {len(clips)} audio clips")
if __name__ == "__main__":
    a = sys.argv
    if len(a) >= 5 and a[1] == "encode": encode(a[2], int(a[3]), a[4])
    elif len(a) >= 5 and a[1] == "mux": mux(a[2], a[3], a[4])
    else: sys.exit("usage: build.py encode <framesDir> <fps> <out.mp4> | build.py mux <video.mp4> <out.mp4> <clips.json>")
