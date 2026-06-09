import SwiftUI

struct RhythmDetailView: View {
    let rhythm: WatchRhythmData

    @EnvironmentObject var engine: WatchJapaEngine
    @EnvironmentObject var connectivity: WatchConnectivityManager

    var body: some View {
        List {
            ForEach(rhythm.bands, id: \.band) { band in
                Section(header: bandHeader(band)) {
                    ForEach(band.items, id: \.itemId) { item in
                        itemRow(item, isDone: band.isDone)
                    }
                }
            }
        }
        .navigationTitle("My Rhythm")
        .background(KalpXWatchTheme.background)
        .scrollContentBackground(.hidden)
    }

    @ViewBuilder
    private func bandHeader(_ band: WatchRhythmBand) -> some View {
        HStack(spacing: 4) {
            GoldDot()
            Text(bandLabel(band.band))
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(KalpXWatchTheme.textTertiary)
        }
    }

    @ViewBuilder
    private func itemRow(_ item: WatchRhythmItem, isDone: Bool) -> some View {
        switch item.itemType {
        case "mantra":
            let curated = connectivity.mantras?.first(where: { $0.ref == item.itemId })
                ?? CuratedMantra(id: item.itemId, ref: item.itemId, name: item.title, devanagari: "", audioUrl: item.audioUrl)
            Button {
                engine.startSession(mantra: curated, goalType: "unlimited", goalValue: nil)
            } label: {
                RitualRow(icon: isDone ? "✓" : "ॐ", title: item.title, isDimmed: isDone)
            }
            .listRowBackground(KalpXWatchTheme.surface)
        case "practice":
            NavigationLink {
                PracticeView(title: item.title, description: item.description, source: "rhythm")
                    .environmentObject(connectivity)
            } label: {
                RitualRow(icon: isDone ? "✓" : "◎", title: item.title, isDimmed: isDone)
            }
            .listRowBackground(KalpXWatchTheme.surface)
        default: // sankalp
            NavigationLink {
                SankalpView(
                    title:  item.title,
                    line:   item.description,
                    source: "rhythm:\(item.itemId)"
                )
                .environmentObject(connectivity)
            } label: {
                RitualRow(
                    icon:     isDone ? "✓" : "◈",
                    title:    item.title,
                    isDimmed: isDone
                )
            }
            .listRowBackground(KalpXWatchTheme.surface)
        }
    }

    private func bandLabel(_ band: String) -> String {
        band.prefix(1).uppercased() + band.dropFirst()
    }
}
