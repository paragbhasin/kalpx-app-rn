import SwiftUI

struct MantraPickerView: View {
    @EnvironmentObject var engine: WatchJapaEngine
    @EnvironmentObject var connectivity: WatchConnectivityManager
    @State private var selectedMantra = CuratedMantra.default
    @State private var showGoalPicker = false

    var body: some View {
        if showGoalPicker {
            GoalPickerView(mantra: selectedMantra) { goalType, goalValue in
                engine.startSession(mantra: selectedMantra, goalType: goalType, goalValue: goalValue)
            }
        } else if let mantras = connectivity.mantras {
            List(mantras) { mantra in
                Button {
                    selectedMantra = mantra
                    showGoalPicker = true
                } label: {
                    VStack(alignment: .leading, spacing: 2) {
                        if let label = mantra.label {
                            Text(labelDisplay(label))
                                .font(.system(size: 9, weight: .semibold))
                                .foregroundColor(.accentColor)
                        }
                        Text(mantra.name)
                            .font(.system(size: 13, weight: .medium))
                        if !mantra.devanagari.isEmpty {
                            Text(mantra.devanagari)
                                .font(.system(size: 11))
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
            .navigationTitle("Quick Chant")
        } else {
            // Not logged in — no mantras pushed from iPhone yet
            VStack(spacing: 8) {
                Text("ॐ")
                    .font(.system(size: 32))
                Text("Open KalpX on iPhone to begin.")
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding()
            .onAppear {
                connectivity.reloadMantras()
                if connectivity.mantras == nil {
                    connectivity.requestMantrasFromPhone()
                }
            }
        }
    }

    private func labelDisplay(_ label: String) -> String {
        switch label {
        case "inner_path":  return "Inner Path"
        case "Morning":     return "Morning Rhythm"
        case "Afternoon":   return "Afternoon Rhythm"
        case "Night":       return "Night Rhythm"
        default:            return label
        }
    }
}
