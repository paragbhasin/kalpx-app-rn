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

                Text(line)
                    .font(.system(size: 13))
                    .foregroundColor(.secondary)
                    .fixedSize(horizontal: false, vertical: true)

                Divider()

                if marked {
                    HStack {
                        Text("◈ Held")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.accentColor)
                    }
                } else {
                    Button {
                        connectivity.sendToPhone([
                            "type":   "sankalp_held",
                            "source": source,
                        ])
                        marked = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                            dismiss()
                        }
                    } label: {
                        Text("Mark as Held")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
            .padding(.horizontal, 4)
        }
        .navigationTitle("Sankalp")
    }
}
