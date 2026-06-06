import SwiftUI
import WatchKit

struct CheckInView: View {
    @EnvironmentObject var connectivity: WatchConnectivityManager
    @State private var selected: String? = nil

    private let feelings: [(label: String, pranaType: String)] = [
        ("Agitated", "agitated"),
        ("Drained",  "drained"),
        ("Steady",   "balanced"),
        ("Open",     "energized"),
    ]

    var body: some View {
        if let sel = selected {
            VStack(spacing: 8) {
                Text("✓")
                    .font(.system(size: 28))
                Text(sel)
                    .font(.system(size: 14, weight: .medium))
                Text("Noted")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }
            .accessibilityLabel("Check-in recorded: \(sel)")
        } else {
            List(feelings, id: \.label) { feeling in
                Button {
                    selected = feeling.label
                    connectivity.sendToPhone([
                        "type":      "checkin_recorded",
                        "state":     feeling.label,
                        "pranaType": feeling.pranaType,
                    ])
                    DispatchQueue.main.async {
                        WKInterfaceDevice.current().play(.click)
                    }
                } label: {
                    Text(feeling.label)
                        .font(.system(size: 14))
                }
                .accessibilityLabel(feeling.label)
            }
            .navigationTitle("How are you?")
        }
    }
}
