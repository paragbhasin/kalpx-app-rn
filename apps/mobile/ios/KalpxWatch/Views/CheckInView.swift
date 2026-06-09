import SwiftUI
import WatchKit

struct CheckInView: View {
    @EnvironmentObject var connectivity: WatchConnectivityManager
    @State private var selected: String? = nil
    @State private var showQuickReset = false

    private let feelings: [(label: String, pranaType: String)] = [
        ("Agitated", "agitated"),
        ("Drained",  "drained"),
        ("Steady",   "balanced"),
        ("Open",     "energized"),
    ]

    var body: some View {
        if let sel = selected, showQuickReset, let qr = connectivity.pathData?.quickReset {
            QuickResetPromptView(mantra: qr, feeling: sel)
        } else if let sel = selected {
            notedView(sel)
        } else {
            feelingsList
        }
    }

    private func notedView(_ feeling: String) -> some View {
        VStack(spacing: 8) {
            Text("✓")
                .font(.system(size: 28))
                .foregroundColor(KalpXWatchTheme.gold)
            Text(feeling)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(KalpXWatchTheme.textPrimary)
            Text("Noted")
                .font(.system(size: 11))
                .foregroundColor(KalpXWatchTheme.textTertiary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(KalpXWatchTheme.background)
        .accessibilityLabel("Check-in recorded: \(feeling)")
    }

    private var feelingsList: some View {
        List(feelings, id: \.label) { feeling in
            Button {
                selected = feeling.label
                connectivity.sendToPhone([
                    "type":      "checkin_recorded",
                    "state":     feeling.label,
                    "pranaType": feeling.pranaType,
                ])
                WKInterfaceDevice.current().play(.click)
                if feeling.pranaType == "agitated" || feeling.pranaType == "drained" {
                    showQuickReset = true
                }
            } label: {
                Text(feeling.label)
                    .font(.system(size: 14))
                    .foregroundColor(KalpXWatchTheme.textPrimary)
            }
            .listRowBackground(KalpXWatchTheme.surface)
            .accessibilityLabel(feeling.label)
        }
        .navigationTitle("How are you?")
        .background(KalpXWatchTheme.background)
        .scrollContentBackground(.hidden)
    }
}
