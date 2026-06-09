import SwiftUI
import AVFoundation

struct MantraAudioPlayerView: View {
    let audioUrl: String

    @State private var player: AVPlayer?
    @State private var isPlaying = false

    var body: some View {
        Button {
            togglePlayback()
        } label: {
            HStack(spacing: 4) {
                Image(systemName: isPlaying ? "pause.circle.fill" : "play.circle.fill")
                    .font(.system(size: 18))
                Text(isPlaying ? "Pause" : "Audio")
                    .font(.system(size: 11))
            }
            .foregroundColor(isPlaying ? KalpXWatchTheme.gold : KalpXWatchTheme.textSecondary)
        }
        .buttonStyle(.plain)
        .onDisappear {
            player?.pause()
            player = nil
            isPlaying = false
        }
    }

    private func togglePlayback() {
        if player == nil, let url = URL(string: audioUrl) {
            player = AVPlayer(url: url)
        }
        if isPlaying {
            player?.pause()
        } else {
            player?.play()
        }
        isPlaying.toggle()
    }
}
