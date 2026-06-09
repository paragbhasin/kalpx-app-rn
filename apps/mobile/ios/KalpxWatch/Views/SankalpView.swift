import SwiftUI

struct SankalpView: View {
    let title: String
    let line: String
    let source: String

    @EnvironmentObject var connectivity: WatchConnectivityManager
    @Environment(\.dismiss) var dismiss
    @State private var marked = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(KalpXWatchTheme.textPrimary)

                Text(line)
                    .font(.system(size: 13))
                    .foregroundColor(KalpXWatchTheme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)

                Divider()
                    .background(KalpXWatchTheme.elevated)

                if marked {
                    HStack {
                        Text("◈")
                            .foregroundColor(KalpXWatchTheme.gold)
                        Text("Held")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(KalpXWatchTheme.textPrimary)
                    }
                } else {
                    WatchPrimaryButton(label: "I held this") {
                        connectivity.sendToPhone([
                            "type":   "sankalp_held",
                            "source": source,
                        ])
                        marked = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                            dismiss()
                        }
                    }
                }
            }
            .padding(.horizontal, 4)
        }
        .navigationTitle("Sankalp")
        .background(KalpXWatchTheme.background)
    }
}
