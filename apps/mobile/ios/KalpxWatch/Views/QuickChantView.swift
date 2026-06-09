import SwiftUI

struct QuickChantView: View {
    @EnvironmentObject var engine: WatchJapaEngine
    @EnvironmentObject var connectivity: WatchConnectivityManager
    @State private var showCompletion = false

    var body: some View {
        ZStack {
            KalpXWatchTheme.background.ignoresSafeArea()

            if showCompletion {
                CompletionView(
                    count: engine.sessionCount,
                    onDone:     { engine.completeSession(); showCompletion = false },
                    onContinue: { showCompletion = false }
                )
            } else {
                chantView
            }
        }
        .onChange(of: engine.isGoalReached) { reached in
            if reached { showCompletion = true }
        }
    }

    private var chantView: some View {
        VStack(spacing: 0) {
            // Whole upper section is the tap target
            VStack(spacing: 6) {
                Spacer(minLength: 4)

                Text("\(engine.sessionCount)")
                    .font(.system(size: 56, weight: .bold, design: .rounded))
                    .foregroundColor(KalpXWatchTheme.textPrimary)
                    .contentTransition(.numericText())
                    .animation(.spring(duration: 0.12), value: engine.sessionCount)

                if engine.malaRoundsCompleted > 0 {
                    Text("Round \(engine.malaRoundsCompleted)")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(KalpXWatchTheme.gold)
                        .transition(.opacity)
                }

                BeadRingView(beadInRound: engine.beadInRound)
                    .padding(.horizontal, 8)
                    .padding(.top, 2)

                if engine.sessionCount > 0 || (connectivity.pathData?.mantraStats?[engine.currentMantraRef]) != nil {
                    statsRow()
                        .transition(.opacity)
                }

                Text("tap to chant")
                    .font(.system(size: 10, weight: .regular))
                    .foregroundColor(KalpXWatchTheme.textTertiary)
                    .opacity(engine.sessionCount == 0 ? 1 : 0)

                Spacer(minLength: 4)
            }
            .frame(maxWidth: .infinity)
            .contentShape(Rectangle())
            .onTapGesture {
                engine.increment()
            }
            .accessibilityAddTraits(.isButton)
            .accessibilityLabel("Count one bead. \(engine.sessionCount) counted")

            // Guided audio player — shown if mantra has audio
            if let url = engine.currentAudioUrl, !url.isEmpty {
                MantraAudioPlayerView(audioUrl: url)
                    .padding(.bottom, 2)
            }

            // Small icon controls at the bottom
            HStack {
                Button { engine.discardSession() } label: {
                    Image(systemName: "xmark.circle")
                        .foregroundColor(KalpXWatchTheme.textTertiary)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Discard session")

                Spacer()

                if engine.sessionCount > 0 {
                    Button { engine.undo() } label: {
                        Image(systemName: "arrow.uturn.backward.circle")
                            .foregroundColor(KalpXWatchTheme.textTertiary)
                    }
                    .buttonStyle(.plain)
                    .disabled(!engine.canUndo)
                    .accessibilityLabel("Undo last bead")

                    Button { showCompletion = true } label: {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(KalpXWatchTheme.gold)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Complete session")
                }
            }
            .font(.system(size: 20))
            .padding(.horizontal, 10)
            .padding(.bottom, 4)
            .frame(height: 36)
        }
    }

    private func statsRow() -> some View {
        let base     = connectivity.pathData?.mantraStats?[engine.currentMantraRef]
        let today    = (base?.todayCount    ?? 0) + engine.sessionCount
        let week     = (base?.weekCount     ?? 0) + engine.sessionCount
        let year     = (base?.yearCount     ?? 0) + engine.sessionCount
        let lifetime = (base?.lifetimeCount ?? 0) + engine.sessionCount

        return HStack(spacing: 0) {
            statCell("Today",  today)
            if week > today    { statCell("Week",  week) }
            if year > week     { statCell("Year",  year) }
            if lifetime > year { statCell("Life",  lifetime) }
        }
        .padding(.top, 2)
    }

    private func statCell(_ label: String, _ count: Int) -> some View {
        VStack(spacing: 1) {
            Text(formatCount(count))
                .font(.system(size: 11, weight: .semibold, design: .rounded))
                .foregroundColor(KalpXWatchTheme.textPrimary)
            Text(label)
                .font(.system(size: 9))
                .foregroundColor(KalpXWatchTheme.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }

    private func formatCount(_ n: Int) -> String {
        if n >= 1_000_000 { return String(format: "%.1fM", Double(n) / 1_000_000) }
        if n >= 1_000     { return String(format: "%.1fK", Double(n) / 1_000) }
        return "\(n)"
    }
}
