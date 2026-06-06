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
        VStack(spacing: 0) {
            // Whole upper section is the tap target — no "TAP" button
            VStack(spacing: 6) {
                Spacer(minLength: 4)

                Text("\(engine.sessionCount)")
                    .font(.system(size: 56, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                    .contentTransition(.numericText())
                    .animation(.spring(duration: 0.12), value: engine.sessionCount)

                if engine.malaRoundsCompleted > 0 {
                    Text("Round \(engine.malaRoundsCompleted)")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.accentColor)
                        .transition(.opacity)
                }

                BeadRingView(beadInRound: engine.beadInRound)
                    .padding(.horizontal, 8)
                    .padding(.top, 2)

                Text("tap to chant")
                    .font(.system(size: 10, weight: .regular))
                    .foregroundColor(.secondary)
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

            // Small icon controls at the bottom
            HStack {
                Button { engine.discardSession() } label: {
                    Image(systemName: "xmark.circle")
                        .foregroundStyle(.secondary)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Discard session")

                Spacer()

                if engine.sessionCount > 0 {
                    Button { engine.undo() } label: {
                        Image(systemName: "arrow.uturn.backward.circle")
                            .foregroundStyle(.secondary)
                    }
                    .buttonStyle(.plain)
                    .disabled(!engine.canUndo)
                    .accessibilityLabel("Undo last bead")

                    Button { showCompletion = true } label: {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(.green)
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
}
