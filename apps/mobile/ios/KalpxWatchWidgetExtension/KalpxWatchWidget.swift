import WidgetKit
import SwiftUI

// MARK: - Timeline Entry

struct KalpxWatchEntry: TimelineEntry {
    let date: Date
    let todayCount: Int
    let innerPathDay: Int?
    let innerPathMantra: String?
    let rhythmSlot: String?
    let rhythmDone: Bool
    let sankalpTitle: String?
}

// MARK: - Lite Codable models (widget can't import Watch app types directly)

private struct PathDataLite: Codable {
    struct InnerPath: Codable {
        struct Mantra: Codable { let name: String }
        let hasActivePath: Bool
        let dayNumber: Int
        let mantra: Mantra?
    }
    struct Rhythm: Codable {
        let hasRhythm: Bool
        let currentSlot: String
        let slotDone: Bool
    }
    let innerPath: InnerPath?
    let rhythm: Rhythm?
}

// MARK: - Provider

struct KalpxWatchProvider: TimelineProvider {
    func placeholder(in context: Context) -> KalpxWatchEntry {
        KalpxWatchEntry(
            date: Date(), todayCount: 108, innerPathDay: 4,
            innerPathMantra: "Om Namah Shivaya", rhythmSlot: "morning",
            rhythmDone: false, sankalpTitle: "My Sankalp"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (KalpxWatchEntry) -> Void) {
        completion(entry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<KalpxWatchEntry>) -> Void) {
        let e = entry()
        // Refresh every 15 minutes
        let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        completion(Timeline(entries: [e], policy: .after(next)))
    }

    private func entry() -> KalpxWatchEntry {
        let defaults = UserDefaults(suiteName: "group.com.kalpx.app")
        let todayCount = defaults?.integer(forKey: "kalpx_today_japa_count") ?? 0

        var innerPathDay:    Int?    = nil
        var innerPathMantra: String? = nil
        var rhythmSlot:      String? = nil
        var rhythmDone               = false

        if let data = defaults?.data(forKey: "kalpx_watch_path_data"),
           let pd = try? JSONDecoder().decode(PathDataLite.self, from: data) {
            if let ip = pd.innerPath, ip.hasActivePath {
                innerPathDay    = ip.dayNumber
                innerPathMantra = ip.mantra?.name
            }
            if let rh = pd.rhythm, rh.hasRhythm {
                rhythmSlot = rh.currentSlot
                rhythmDone = rh.slotDone
            }
        }

        var sankalpTitle: String? = nil
        if let dict  = defaults?.dictionary(forKey: "kalpx_sankalp_today"),
           let title = dict["title"] as? String, !title.isEmpty {
            sankalpTitle = title
        }

        return KalpxWatchEntry(
            date:            Date(),
            todayCount:      todayCount,
            innerPathDay:    innerPathDay,
            innerPathMantra: innerPathMantra,
            rhythmSlot:      rhythmSlot,
            rhythmDone:      rhythmDone,
            sankalpTitle:    sankalpTitle
        )
    }
}

// MARK: - Entry View

struct KalpxWatchWidgetView: View {
    var entry: KalpxWatchEntry
    @Environment(\.widgetFamily) var family
    @Environment(\.widgetRenderingMode) var renderingMode

    var body: some View {
        switch family {
        case .accessoryCircular:    circular
        case .accessoryRectangular: rectangular
        case .accessoryCorner:      corner
        default:                    circular
        }
    }

    // MARK: accessoryCircular — icon + day or count

    @ViewBuilder private var circular: some View {
        ZStack {
            if let day = entry.innerPathDay {
                VStack(spacing: 1) {
                    Text("ॐ")
                        .font(.system(size: 12, weight: .medium))
                        .widgetAccentable()
                    Text("Day \(day)")
                        .font(.system(size: 10, weight: .semibold))
                        .minimumScaleFactor(0.7)
                }
            } else if entry.todayCount > 0 {
                VStack(spacing: 1) {
                    Text("ॐ")
                        .font(.system(size: 11, weight: .medium))
                        .widgetAccentable()
                    Text("\(entry.todayCount)")
                        .font(.system(size: 13, weight: .bold))
                        .minimumScaleFactor(0.6)
                }
            } else {
                Text("ॐ")
                    .font(.system(size: 22, weight: .medium))
                    .widgetAccentable()
            }
        }
    }

    // MARK: accessoryRectangular — 2-line info strip

    @ViewBuilder private var rectangular: some View {
        VStack(alignment: .leading, spacing: 2) {
            if let day = entry.innerPathDay, let mantra = entry.innerPathMantra {
                Text("Day \(day)")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.tint)
                    .widgetAccentable()
                Text(mantra)
                    .font(.system(size: 13, weight: .medium))
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            } else if entry.todayCount > 0 {
                Text("Quick Chant")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.tint)
                    .widgetAccentable()
                Text("\(entry.todayCount) today")
                    .font(.system(size: 13, weight: .medium))
            } else if let sankalp = entry.sankalpTitle {
                Text("Sankalp")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.tint)
                    .widgetAccentable()
                Text(sankalp)
                    .font(.system(size: 12))
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)
            } else {
                Text("ॐ KalpX")
                    .font(.system(size: 13, weight: .semibold))
                    .widgetAccentable()
                Text("Begin practice")
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
            }
        }
    }

    // MARK: accessoryCorner — icon + rhythm or inner-path label

    @ViewBuilder private var corner: some View {
        Text("ॐ")
            .font(.system(size: 14, weight: .medium))
            .widgetAccentable()
            .widgetLabel {
                if let slot = entry.rhythmSlot {
                    Text(slotLabel(slot) + (entry.rhythmDone ? " ✓" : ""))
                } else if let day = entry.innerPathDay {
                    Text("Day \(day)")
                } else {
                    Text("KalpX")
                }
            }
    }

    private func slotLabel(_ slot: String) -> String {
        switch slot {
        case "morning":   return "Morning"
        case "afternoon": return "Afternoon"
        case "night":     return "Night"
        default:          return slot.capitalized
        }
    }
}

// MARK: - Widget Configuration

@main
struct KalpxWatchWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "KalpxWatchWidget", provider: KalpxWatchProvider()) { entry in
            KalpxWatchWidgetView(entry: entry)
        }
        .configurationDisplayName("KalpX")
        .description("Your practice at a glance.")
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryCorner])
    }
}
