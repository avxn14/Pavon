import Foundation
import AVFoundation
import AppKit
import CoreVideo

struct Clip: Decodable { let file: String; let start: Double; let volume: Float; let fadeOut: Double? }

func fail(_ msg: String) -> Never { FileHandle.standardError.write((msg + "\n").data(using: .utf8)!); exit(1) }

func loadCG(_ path: String) -> CGImage? {
    guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil) else { return nil }
    return CGImageSourceCreateImageAtIndex(src, 0, nil)
}

func encode(framesDir: String, fps: Int32, out: String) {
    let fm = FileManager.default
    guard let names = try? fm.contentsOfDirectory(atPath: framesDir) else { fail("no frames dir") }
    let files = names.filter { $0.hasSuffix(".png") }.sorted()
    guard let cg0 = loadCG(framesDir + "/" + files[0]) else { fail("cannot read first frame") }
    let w = cg0.width, h = cg0.height
    let url = URL(fileURLWithPath: out); try? fm.removeItem(at: url)
    guard let writer = try? AVAssetWriter(outputURL: url, fileType: .mp4) else { fail("writer") }
    let settings: [String: Any] = [
        AVVideoCodecKey: AVVideoCodecType.h264,
        AVVideoWidthKey: w, AVVideoHeightKey: h,
        AVVideoCompressionPropertiesKey: [
            AVVideoAverageBitRateKey: 16_000_000,
            AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
            AVVideoMaxKeyFrameIntervalKey: Int(fps) * 2,
            AVVideoExpectedSourceFrameRateKey: Int(fps),
            AVVideoAllowFrameReorderingKey: true
        ]
    ]
    let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
    input.expectsMediaDataInRealTime = false
    let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
        kCVPixelBufferWidthKey as String: w, kCVPixelBufferHeightKey as String: h])
    writer.add(input)
    guard writer.startWriting() else { fail("startWriting: \(String(describing: writer.error))") }
    writer.startSession(atSourceTime: .zero)
    let cs = CGColorSpaceCreateDeviceRGB()
    for (i, f) in files.enumerated() {
        guard let cg = loadCG(framesDir + "/" + f) else { fail("bad frame \(f)") }
        var pbOpt: CVPixelBuffer?
        guard let pool = adaptor.pixelBufferPool else { fail("no pool") }
        CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pbOpt)
        guard let pb = pbOpt else { fail("no pixel buffer") }
        CVPixelBufferLockBaseAddress(pb, [])
        guard let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb), width: w, height: h, bitsPerComponent: 8,
                                  bytesPerRow: CVPixelBufferGetBytesPerRow(pb), space: cs,
                                  bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue) else { fail("ctx") }
        ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
        CVPixelBufferUnlockBaseAddress(pb, [])
        while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.004) }
        if !adaptor.append(pb, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: fps)) { fail("append failed at \(i): \(String(describing: writer.error))") }
        if i % 100 == 0 { print("encoded \(i)/\(files.count)") }
    }
    input.markAsFinished()
    let sem = DispatchSemaphore(value: 0)
    writer.finishWriting { sem.signal() }
    sem.wait()
    if writer.status != .completed { fail("writer failed: \(String(describing: writer.error))") }
    print("wrote \(out) (\(files.count) frames @ \(fps)fps)")
}

func mux(video: String, out: String, clipsJSON: String) {
    guard let data = FileManager.default.contents(atPath: clipsJSON), let clips = try? JSONDecoder().decode([Clip].self, from: data) else { fail("bad clips json") }
    let comp = AVMutableComposition()
    let vAsset = AVURLAsset(url: URL(fileURLWithPath: video))
    guard let vTrack = vAsset.tracks(withMediaType: .video).first else { fail("no video track") }
    guard let cv = comp.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid) else { fail("comp video") }
    let total = vAsset.duration
    do { try cv.insertTimeRange(CMTimeRange(start: .zero, duration: total), of: vTrack, at: .zero) } catch { fail("insert video: \(error)") }
    cv.preferredTransform = vTrack.preferredTransform
    var params: [AVMutableAudioMixInputParameters] = []
    for c in clips {
        let a = AVURLAsset(url: URL(fileURLWithPath: c.file))
        guard let at = a.tracks(withMediaType: .audio).first else { print("skip (no audio): \(c.file)"); continue }
        guard let ca = comp.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) else { continue }
        let start = CMTime(seconds: c.start, preferredTimescale: 600)
        var dur = a.duration
        let remaining = CMTimeSubtract(total, start)
        if CMTimeCompare(dur, remaining) > 0 { dur = remaining }
        if CMTimeCompare(dur, .zero) <= 0 { continue }
        do { try ca.insertTimeRange(CMTimeRange(start: .zero, duration: dur), of: at, at: start) } catch { fail("insert audio \(c.file): \(error)") }
        let p = AVMutableAudioMixInputParameters(track: ca)
        p.setVolume(c.volume, at: .zero)
        if let fo = c.fadeOut {
            let fs = CMTime(seconds: fo, preferredTimescale: 600)
            p.setVolumeRamp(fromStartVolume: c.volume, toEndVolume: 0, timeRange: CMTimeRange(start: fs, end: total))
        }
        params.append(p)
    }
    let mix = AVMutableAudioMix(); mix.inputParameters = params
    let url = URL(fileURLWithPath: out); try? FileManager.default.removeItem(at: url)
    guard let ex = AVAssetExportSession(asset: comp, presetName: AVAssetExportPresetHighestQuality) else { fail("export session") }
    ex.outputURL = url; ex.outputFileType = .mp4; ex.audioMix = mix; ex.shouldOptimizeForNetworkUse = true
    let sem = DispatchSemaphore(value: 0)
    ex.exportAsynchronously { sem.signal() }
    sem.wait()
    if ex.status != .completed { fail("export failed: \(String(describing: ex.error))") }
    print("wrote \(out) with \(params.count) audio clips")
}

let args = CommandLine.arguments
if args.count >= 5 && args[1] == "encode" { encode(framesDir: args[2], fps: Int32(args[3]) ?? 30, out: args[4]) }
else if args.count >= 5 && args[1] == "mux" { mux(video: args[2], out: args[3], clipsJSON: args[4]) }
else { fail("usage: build encode <framesDir> <fps> <out.mp4> | build mux <video.mp4> <out.mp4> <clips.json>") }
