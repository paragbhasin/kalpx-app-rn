import SwiftUI

struct PracticeView: View {
    let title: String
    let description: String
    let source: String

    @EnvironmentObject var connectivity: WatchConnectivityManager
    @Environment(\.dismiss) var dismiss
    @State private var marked = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))

                if !description.isEmpty {
                    Text(description)
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Divider()

                if marked {
                    HStack {
                        Text("◎ Done")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.accentColor)
                    }
                } else {
                    Button {
                        connectivity.sendToPhone([
                            "type":   "practice_done",
                            "source": source,
                        ])
                        marked = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                            dismiss()
                        }
                    } label: {
                        Text("Mark Done")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
            .padding(.horizontal, 4)
        }
        .navigationTitle("Practice")
    }
}
