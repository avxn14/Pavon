#!/usr/bin/env python3
"""frames.py <video.mp4> <outDir> t1 t2 ...   exact-time frame extraction from the ENCODED file (ffmpeg accurate seek).
   frames.py <video.mp4> <outDir> --clip t0 t1  every frame at 30 fps between t0 and t1 as f_0000.jpg ... (for the paver clip)."""
import sys, os, subprocess
v, outd = sys.argv[1], sys.argv[2]; os.makedirs(outd, exist_ok=True)
if sys.argv[3] == "--clip":
    t0, t1 = float(sys.argv[4]), float(sys.argv[5])
    subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{t0:.3f}","-to",f"{t1:.3f}","-i",v,"-vf","fps=30","-q:v","2","-start_number","0",os.path.join(outd,"f_%04d.jpg")],check=True)
else:
    for t in sys.argv[3:]:
        t=float(t); subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{t:.3f}","-i",v,"-frames:v","1","-update","1",os.path.join(outd,f"t{t:06.2f}.png")],check=True)
print("ok", outd)
