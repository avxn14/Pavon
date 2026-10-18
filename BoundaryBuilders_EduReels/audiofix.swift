import Foundation
import AVFoundation

// usage: audiofix <in> <out.caf> <rate> <maxGapSec> <threshDb>
// 1) pitch-preserving time stretch by <rate>, 2) trim leading/trailing silence,
// 3) shorten internal silences longer than <maxGapSec> down to <maxGapSec>.

func fail(_ m: String) -> Never { FileHandle.standardError.write((m + "\n").data(using: .utf8)!); exit(1) }

let a = CommandLine.arguments
guard a.count >= 6 else { fail("usage: audiofix <in> <out.caf> <rate> <maxGapSec> <threshDb>") }
let inURL = URL(fileURLWithPath: a[1]), outURL = URL(fileURLWithPath: a[2])
let rate = Float(a[3]) ?? 1.0, maxGap = Double(a[4]) ?? 0.25, threshDb = Float(a[5]) ?? -42

guard let file = try? AVAudioFile(forReading: inURL) else { fail("cannot open \(a[1])") }
let fmt = file.processingFormat
let srcLen = AVAudioFrameCount(file.length)
guard let src = AVAudioPCMBuffer(pcmFormat: fmt, frameCapacity: srcLen) else { fail("buffer") }
do { try file.read(into: src) } catch { fail("read: \(error)") }
let sr = fmt.sampleRate, ch = Int(fmt.channelCount)

// ---- 1. time stretch (offline render through AVAudioUnitTimePitch)
var stretched: [[Float]] = Array(repeating: [], count: ch)
if abs(rate - 1.0) < 0.001 {
    for c in 0..<ch { stretched[c] = Array(UnsafeBufferPointer(start: src.floatChannelData![c], count: Int(src.frameLength))) }
} else {
    let engine = AVAudioEngine(), player = AVAudioPlayerNode(), tp = AVAudioUnitTimePitch()
    tp.rate = rate; tp.pitch = 0; tp.overlap = 12
    engine.attach(player); engine.attach(tp)
    engine.connect(player, to: tp, format: fmt)
    engine.connect(tp, to: engine.mainMixerNode, format: fmt)
    do { try engine.enableManualRenderingMode(.offline, format: fmt, maximumFrameCount: 4096); try engine.start() } catch { fail("engine: \(error)") }
    player.scheduleBuffer(src, at: nil, options: [], completionHandler: nil)
    player.play()
    guard let rb = AVAudioPCMBuffer(pcmFormat: engine.manualRenderingFormat, frameCapacity: engine.manualRenderingMaximumFrameCount) else { fail("rb") }
    let target = AVAudioFramePosition(Double(src.frameLength) / Double(rate) + sr * 0.15)
    while engine.manualRenderingSampleTime < target {
        let n = min(rb.frameCapacity, AVAudioFrameCount(target - engine.manualRenderingSampleTime))
        let st: AVAudioEngineManualRenderingStatus
        do { st = try engine.renderOffline(n, to: rb) } catch { fail("render: \(error)") }
        if st == .success {
            for c in 0..<ch { stretched[c].append(contentsOf: UnsafeBufferPointer(start: rb.floatChannelData![c], count: Int(rb.frameLength))) }
        } else if st == .insufficientDataFromInputNode { continue } else { break }
    }
    player.stop(); engine.stop()
}
let n = stretched[0].count

// ---- 2/3. loudness windows, trim and gap compression
let win = Int(sr * 0.01)
let nWin = n / win
let thresh = powf(10, threshDb / 20)
var loud = [Bool](repeating: false, count: nWin)
for w in 0..<nWin {
    var s: Float = 0
    for c in 0..<ch { for i in (w * win)..<((w + 1) * win) { s += stretched[c][i] * stretched[c][i] } }
    loud[w] = sqrtf(s / Float(win * ch)) > thresh
}
guard let first = loud.firstIndex(of: true), let last = loud.lastIndex(of: true) else { fail("silent file") }
let pad = Int(0.03 * sr), maxGapS = Int(maxGap * sr)
var segs: [(Int, Int)] = []
var curStart = max(0, first * win - pad)
var i = first
while i <= last {
    if !loud[i] {
        var j = i
        while j <= last && !loud[j] { j += 1 }
        if (j - i) * win > maxGapS {
            let half = maxGapS / 2
            segs.append((curStart, i * win + half))
            curStart = j * win - half
        }
        i = j
    } else { i += 1 }
}
segs.append((curStart, min(n, (last + 1) * win + pad)))

let xf = Int(0.01 * sr)
var out: [[Float]] = Array(repeating: [], count: ch)
for (idx, sg) in segs.enumerated() {
    let s0 = max(0, sg.0), s1 = min(n, sg.1)
    if s1 <= s0 { continue }
    for c in 0..<ch {
        if idx > 0 && out[c].count >= xf && (s1 - s0) > xf {
            let base = out[c].count - xf
            for k in 0..<xf { let t = Float(k) / Float(xf); out[c][base + k] = out[c][base + k] * (1 - t) + stretched[c][s0 + k] * t }
            out[c].append(contentsOf: stretched[c][(s0 + xf)..<s1])
        } else {
            out[c].append(contentsOf: stretched[c][s0..<s1])
        }
    }
}
// short fade in/out to avoid clicks
let fadeN = min(Int(0.008 * sr), out[0].count / 2)
for c in 0..<ch { for k in 0..<fadeN { let g = Float(k) / Float(fadeN); out[c][k] *= g; out[c][out[c].count - 1 - k] *= g } }

let outLen = out[0].count
guard let ob = AVAudioPCMBuffer(pcmFormat: fmt, frameCapacity: AVAudioFrameCount(outLen)) else { fail("ob") }
ob.frameLength = AVAudioFrameCount(outLen)
for c in 0..<ch { out[c].withUnsafeBufferPointer { p in memcpy(ob.floatChannelData![c], p.baseAddress!, outLen * MemoryLayout<Float>.size) } }
try? FileManager.default.removeItem(at: outURL)
guard let of = try? AVAudioFile(forWriting: outURL, settings: fmt.settings, commonFormat: .pcmFormatFloat32, interleaved: false) else { fail("open out") }
do { try of.write(from: ob) } catch { fail("write: \(error)") }
print(String(format: "%@: %.2fs -> stretched %.2fs -> final %.2fs (%d gaps shortened)", a[1].split(separator: "/").last.map(String.init) ?? a[1], Double(src.frameLength) / sr, Double(n) / sr, Double(outLen) / sr, segs.count - 1))
