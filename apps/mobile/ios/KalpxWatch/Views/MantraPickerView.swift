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
                    VStack(alignment: .leading, spacing: 4) {
                        if let label = mantra.label {
                            StateChip(label: labelDisplay(label), variant: .gold)
                        }
                        RitualRow(
                            icon: "ॐ",
                            title: mantra.name,
                            subtitle: mantra.devanagari.isEmpty ? nil : mantra.devanagari
                        )
                    }
                }
                .listRowBackground(KalpXWatchTheme.surface)
            }
            .navigationTitle("Quick Chant")
            .background(KalpXWatchTheme.background)
            .scrollContentBackground(.hidden)
        } else {
            EmptyStateView()
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
        case "Morning":     return "Morning"
        case "Afternoon":   return "Afternoon"
        case "Night":       return "Night"
        default:            return label
        }
    }
}
