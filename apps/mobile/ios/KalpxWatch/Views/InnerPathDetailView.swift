import SwiftUI

struct InnerPathDetailView: View {
    let innerPath: WatchInnerPathData

    @EnvironmentObject var engine: WatchJapaEngine
    @EnvironmentObject var connectivity: WatchConnectivityManager

    var body: some View {
        List(innerPath.triad, id: \.itemId) { item in
            itemRow(item)
        }
        .navigationTitle("Day \(innerPath.dayNumber)")
        .background(KalpXWatchTheme.background)
        .scrollContentBackground(.hidden)
    }

    @ViewBuilder
    private func itemRow(_ item: WatchTriadItem) -> some View {
        switch item.slot {
        case "mantra":
            let curated = connectivity.mantras?.first(where: { $0.ref == item.itemId })
                ?? CuratedMantra(id: item.itemId, ref: item.itemId, name: item.title, devanagari: item.subtitle, audioUrl: item.audioUrl)
            NavigationLink {
                GoalPickerView(mantra: curated) { type, value in
                    engine.startSession(mantra: curated, goalType: type, goalValue: value)
                }
            } label: {
                RitualRow(
                    icon: "ॐ",
                    title: item.title,
                    subtitle: item.subtitle.isEmpty ? nil : item.subtitle
                )
            }
            .listRowBackground(KalpXWatchTheme.surface)
        case "practice":
            NavigationLink {
                PracticeView(title: item.title, description: item.subtitle, source: "inner_path")
                    .environmentObject(connectivity)
            } label: {
                RitualRow(icon: "◎", title: item.title)
            }
            .listRowBackground(KalpXWatchTheme.surface)
        default: // sankalp
            VStack(alignment: .leading, spacing: 4) {
                RitualRow(icon: "◈", title: item.title)
                if let how = item.howToLive, !how.isEmpty {
                    Text(how)
                        .font(.system(size: 11))
                        .foregroundColor(KalpXWatchTheme.textTertiary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .listRowBackground(KalpXWatchTheme.surface)
        }
    }
}
