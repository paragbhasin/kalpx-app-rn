import SwiftUI
import AVFoundation

struct MantraAudioPlayerView: View {
    let audioUrl: String
    @StateObject private var state = AudioState()

    private let gold = Color(red: 0.85, green: 0.63, blue: 0.34)

    var body: some View {
        Button {
            state.toggle(url: audioUrl)
        } label: {
            HStack(spacing: 5) {
                Image(systemName: state.isPlaying ? "pause.fill" : "play.fill")
                    .font(.system(size: 10, weight: .semibold))
                Text(state.isPlaying ? "Playing..." : "Guided Audio")
                    .font(.system(size: 10, weight: .medium))
            }
            .foregroundColor(gold)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(
                Capsule()
                    .stroke(gold.opacity(0.45), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
        .onDisappear { state.stop() }
    }
}

private class AudioState: ObservableObject {
    @Published var isPlaying = false
    private var player: AVPlayer?
    private var observer: Any?

    func toggle(url: String) {
        if isPlaying {
            player?.pause()
            isPlaying = false
        } else {
            if player == nil, let u = URL(string: url) {
                let item = AVPlayerItem(url: u)
                player = AVPlayer(playerItem: item)
                observer = NotificationCenter.default.addObserver(
                    forName: .AVPlayerItemDidPlayToEndTime,
                    object: item,
                    queue: .main
                ) { [weak self] _ in
                    self?.player?.seek(to: .zero)
                    self?.player?.play()
                }
            }
            player?.play()
            isPlaying = true
        }
    }

    func stop() {
        player?.pause()
        if let obs = observer { NotificationCenter.default.removeObserver(obs) }
        observer = nil
        player = nil
        isPlaying = false
    }
}
