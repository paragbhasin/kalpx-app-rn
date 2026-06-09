import SwiftUI

struct QuickResetPromptView: View {
    let mantra: WatchQuickResetMantra
    let feeling: String

    @EnvironmentObject var engine: WatchJapaEngine
    @Environment(\.dismiss) var dismiss
    @State private var showGoalPicker = false

    var body: some View {
        if showGoalPicker {
            GoalPickerView(
                mantra: CuratedMantra(
                    id: mantra.itemId,
                    ref: mantra.itemId,
                    name: mantra.title,
                    devanagari: mantra.devanagari,
                    audioUrl: mantra.audioUrl
                )
            ) { type, value in
                engine.startSession(
                    mantra: CuratedMantra(
                        id: mantra.itemId,
                        ref: mantra.itemId,
                        name: mantra.title,
                        devanagari: mantra.devanagari,
                        audioUrl: mantra.audioUrl
                    ),
                    goalType: type,
                    goalValue: value
                )
            }
        } else {
            ScrollView {
                VStack(spacing: 10) {
                    Text(feeling)
                        .font(.system(size: 11))
                        .foregroundColor(KalpXWatchTheme.textTertiary)

                    Text(mantra.devanagari)
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(KalpXWatchTheme.textPrimary)
                        .multilineTextAlignment(.center)

                    Text(mantra.title)
                        .font(.system(size: 12))
                        .foregroundColor(KalpXWatchTheme.textSecondary)
                        .multilineTextAlignment(.center)

                    VStack(spacing: 6) {
                        WatchPrimaryButton(label: "Begin") {
                            showGoalPicker = true
                        }
                        WatchSecondaryButton(label: "Later") {
                            dismiss()
                        }
                    }
                    .padding(.top, 4)
                }
                .padding(.horizontal, 4)
            }
            .navigationTitle("A moment of reset")
            .background(KalpXWatchTheme.background)
        }
    }
}
