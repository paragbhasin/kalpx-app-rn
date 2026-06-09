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
            Button {
                engine.startSession(mantra: curated, goalType: "unlimited", goalValue: nil)
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
            NavigationLink {
                SankalpView(
                    title: item.title,
                    line:  item.howToLive ?? item.subtitle,
                    source: "inner_path:\(item.itemId)"
                )
                .environmentObject(connectivity)
            } label: {
                RitualRow(icon: "◈", title: item.title)
            }
            .listRowBackground(KalpXWatchTheme.surface)
        }
    }
}
