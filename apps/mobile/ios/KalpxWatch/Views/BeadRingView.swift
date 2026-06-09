import SwiftUI

struct BeadRingView: View {
    let beadInRound: Int     // current position in 27-bead cycle
    let totalBeads  = 27

    var body: some View {
        HStack(spacing: 3) {
            ForEach(0..<totalBeads, id: \.self) { i in
                Circle()
                    .fill(color(for: i))
                    .frame(width: 5, height: 5)
                    .animation(.easeIn(duration: 0.08), value: beadInRound)
            }
        }
    }

    private func color(for i: Int) -> Color {
        let pos = beadInRound % totalBeads
        if i < pos        { return KalpXWatchTheme.gold }
        if i == pos       { return KalpXWatchTheme.gold.opacity(0.55) }
        return KalpXWatchTheme.textTertiary.opacity(0.25)
    }
}
