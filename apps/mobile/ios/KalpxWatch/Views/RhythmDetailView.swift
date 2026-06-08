import SwiftUI

struct RhythmDetailView: View {
    let rhythm: WatchRhythmData
    @EnvironmentObject var engine: WatchJapaEngine

    var body: some View {
        List {
            ForEach(rhythm.bands, id: \.band) { band in
                Section(header: bandHeader(band)) {
                    ForEach(band.items, id: \.itemId) { item in
                        row(for: item, band: band)
                    }
                }
            }
        }
        .navigationTitle("My Rhythm")
    }

    private func bandHeader(_ band: WatchRhythmBand) -> some View {
        let name: String
        switch band.band {
        case "morning":   name = "Morning"
        case "afternoon": name = "Afternoon"
        case "night":     name = "Night"
        default:          name = band.band.capitalized
        }
        let label = band.isDone ? "\(name) · Done ✓" : name
        return Text(label)
    }

    @ViewBuilder
    private func row(for item: WatchRhythmItem, band: WatchRhythmBand) -> some View {
        let dimmed = band.isDone

        switch item.itemType {
        case "mantra":
            let cm = CuratedMantra(
                id:         item.itemId,
                ref:        item.itemId,
                name:       item.title,
                devanagari: "",
                label:      band.band.capitalized,
                audioUrl:   item.audioUrl
            )
            NavigationLink {
                GoalPickerView(mantra: cm) { type, value in
                    engine.startSession(mantra: cm, goalType: type, goalValue: value)
                }
            } label: {
                WatchListRow(icon: "ॐ", title: item.title, subtitle: nil)
                    .opacity(dimmed ? 0.55 : 1)
            }

        case "sankalp":
            NavigationLink {
                SankalpView(
                    title:  item.title,
                    line:   item.description,
                    source: band.band
                )
            } label: {
                WatchListRow(icon: "◈", title: item.title, subtitle: nil)
                    .opacity(dimmed ? 0.55 : 1)
            }

        case "practice":
            NavigationLink {
                PracticeView(
                    title:       item.title,
                    description: item.description,
                    source:      band.band
                )
            } label: {
                WatchListRow(icon: "◎", title: item.title, subtitle: nil)
                    .opacity(dimmed ? 0.55 : 1)
            }

        default:
            WatchListRow(icon: "·", title: item.title, subtitle: nil)
                .opacity(dimmed ? 0.55 : 1)
        }
    }
}
