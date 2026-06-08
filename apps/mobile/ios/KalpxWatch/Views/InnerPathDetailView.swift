import SwiftUI

struct InnerPathDetailView: View {
    let innerPath: WatchInnerPathData
    @EnvironmentObject var engine: WatchJapaEngine

    var body: some View {
        List {
            ForEach(innerPath.triad, id: \.slot) { item in
                row(for: item)
            }
        }
        .navigationTitle("Day \(innerPath.dayNumber)")
    }

    @ViewBuilder
    private func row(for item: WatchTriadItem) -> some View {
        switch item.slot {
        case "mantra":
            let cm = CuratedMantra(
                id:         item.itemId,
                ref:        item.itemId,
                name:       item.title,
                devanagari: "",
                label:      "inner_path",
                audioUrl:   item.audioUrl
            )
            NavigationLink {
                GoalPickerView(mantra: cm) { type, value in
                    engine.startSession(mantra: cm, goalType: type, goalValue: value)
                }
            } label: {
                WatchListRow(icon: "ॐ", title: item.title, subtitle: item.subtitle.isEmpty ? nil : item.subtitle)
            }

        case "sankalp":
            NavigationLink {
                SankalpView(
                    title:  item.title,
                    line:   item.howToLive ?? item.subtitle,
                    source: "inner_path"
                )
            } label: {
                WatchListRow(icon: "◈", title: item.title, subtitle: item.subtitle.isEmpty ? nil : item.subtitle)
            }

        case "practice":
            NavigationLink {
                PracticeView(
                    title:       item.title,
                    description: item.subtitle,
                    source:      "inner_path"
                )
            } label: {
                WatchListRow(icon: "◎", title: item.title, subtitle: item.subtitle.isEmpty ? nil : item.subtitle)
            }

        default:
            WatchListRow(icon: "·", title: item.title, subtitle: nil)
        }
    }
}
