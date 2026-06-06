import SwiftUI

struct QuickChantView: View {
    @EnvironmentObject var engine: WatchJapaEngine
    @State private var showCompletion = false

    var body: some View {
        ZStack {
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
        VStack(spacing: 2) {
            // Count — the hero
            Text("\(engine.sessionCount)")
                .font(.system(size: 54, weight: .bold, design: .rounded))
                .foregroundColor(.primary)
                .contentTransition(.numericText())
                .animation(.spring(duration: 0.12), value: engine.sessionCount)
                .accessibilityLabel("Session count: \(engine.sessionCount) beads")

            // Mala rounds indicator — appears after first complete mala (108 beads)
            if engine.malaRoundsCompleted > 0 {
                Text("Round \(engine.malaRoundsCompleted)")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.accentColor)
                    .transition(.opacity)
            }

            BeadRingView(beadInRound: engine.beadInRound)
                .padding(.horizontal, 4)

            // Tap button — full width, generous target
            Button {
                engine.increment()
            } label: {
                Text("TAP")
                    .font(.system(size: 16, weight: .semibold))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
            }
            .buttonStyle(.borderedProminent)
            .accessibilityLabel("Count one bead. Current count: \(engine.sessionCount)")

            // Controls: cancel (always) | undo | complete
            HStack {
                Button {
                    engine.discardSession()
                } label: {
                    Image(systemName: "xmark")
                }
                .foregroundColor(.secondary)
                .accessibilityLabel("Discard and return home")

                Spacer()

                if engine.sessionCount > 0 {
                    Button {
                        engine.undo()
                    } label: {
                        Image(systemName: "arrow.uturn.backward")
                    }
                    .disabled(!engine.canUndo)
                    .foregroundColor(.secondary)
                    .accessibilityLabel("Undo last bead")

                    Spacer()

                    Button {
                        showCompletion = true
                    } label: {
                        Image(systemName: "checkmark.circle")
                    }
                    .foregroundColor(.secondary)
                    .accessibilityLabel("Complete session")
                }
            }
            .font(.system(size: 14))
            .padding(.horizontal, 2)
        }
        .padding(.horizontal, 6)
    }
}
