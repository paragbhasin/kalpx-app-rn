import SwiftUI
import WatchKit

struct QuickResetPromptView: View {
    let mantra: WatchQuickResetMantra
    let feeling: String
    @EnvironmentObject var engine: WatchJapaEngine
    @State private var done = false
    @State private var showGoalPicker = false

    var body: some View {
        if done {
            VStack(spacing: 8) {
                Text("✓")
                    .font(.system(size: 28))
                Text(feeling)
                    .font(.system(size: 14, weight: .medium))
                Text("Noted")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }
        } else if showGoalPicker {
            let cm = curatedMantra
            GoalPickerView(mantra: cm) { goalType, goalValue in
                engine.startSession(mantra: cm, goalType: goalType, goalValue: goalValue)
            }
        } else {
            VStack(spacing: 8) {
                Text("Quick Reset?")
                    .font(.system(size: 14, weight: .semibold))

                Text(mantra.title)
                    .font(.system(size: 11))
                    .foregroundColor(.accentColor)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .padding(.horizontal, 4)

                Button {
                    WKInterfaceDevice.current().play(.click)
                    showGoalPicker = true
                } label: {
                    Text("Start")
                        .font(.system(size: 13, weight: .semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 4)
                }
                .buttonStyle(.borderedProminent)

                Button { done = true } label: {
                    Text("Skip")
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 8)
        }
    }

    private var curatedMantra: CuratedMantra {
        CuratedMantra(
            id:         mantra.itemId,
            ref:        mantra.itemId,
            name:       mantra.title,
            devanagari: mantra.devanagari,
            label:      "quick_reset",
            audioUrl:   mantra.audioUrl
        )
    }
}
