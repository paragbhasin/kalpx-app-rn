import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Widget
struct KalpxInnerPathLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: KalpxInnerPathAttributes.self) { context in
            lockScreenView(context: context)
                .widgetURL(URL(string: context.attributes.deepLinkURL))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 5) {
                        Text("✦")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.laGold)
                        Text("Inner Path")
                            .font(.system(size: 8, weight: .medium))
                            .foregroundColor(.laGold.opacity(0.7))
                    }
                    .padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("D\(context.state.dayNumber)")
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(.laMuted)
                        .padding(.trailing, 4)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(spacing: 6) {
                        Rectangle()
                            .fill(Color.laGold.opacity(0.20))
                            .frame(height: 1)
                        if !context.state.mantraTitle.isEmpty {
                            Text(context.state.mantraTitle)
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.white)
                                .multilineTextAlignment(.center)
                                .lineLimit(2)
                                .minimumScaleFactor(0.8)
                                .padding(.horizontal, 4)
                        }
                        if !context.state.sankalpTitle.isEmpty {
                            Text(context.state.sankalpTitle)
                                .font(.system(size: 10, weight: .regular))
                                .foregroundColor(.laGold.opacity(0.6))
                                .multilineTextAlignment(.center)
                                .lineLimit(1)
                                .minimumScaleFactor(0.8)
                                .padding(.horizontal, 4)
                        }
                    }
                    .padding(.bottom, 6)
                }
            } compactLeading: {
                let url = URL(string: context.attributes.deepLinkURL) ?? URL(string: "kalpx://mitra/inner_path/home")!
                Link(destination: url) {
                    Text("✦")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.laGold)
                        .padding(.leading, 6)
                }
            } compactTrailing: {
                let url = URL(string: context.attributes.deepLinkURL) ?? URL(string: "kalpx://mitra/inner_path/home")!
                Link(destination: url) {
                    Text("D\(context.state.dayNumber)")
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(.white)
                        .padding(.trailing, 4)
                }
            } minimal: {
                Text("✦")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.laGold)
            }
        }
    }

    // MARK: - Lock Screen card
    @ViewBuilder
    private func lockScreenView(
        context: ActivityViewContext<KalpxInnerPathAttributes>
    ) -> some View {
        VStack(alignment: .leading, spacing: 10) {

            HStack(spacing: 8) {
                Text("✦")
                    .font(.system(size: 22, weight: .medium))
                    .foregroundColor(.laGold)
                VStack(alignment: .leading, spacing: 1) {
                    Text("Inner Path")
                        .font(.system(size: 8, weight: .medium))
                        .foregroundColor(.laMuted)
                    Text("Day \(context.state.dayNumber) · \(context.state.totalDays)")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.laText)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            Rectangle().fill(Color.laDivider).frame(height: 1)

            VStack(alignment: .leading, spacing: 6) {
                if !context.state.mantraTitle.isEmpty {
                    triadRow(
                        label: "MANTRA",
                        title: context.state.mantraTitle,
                        devanagari: context.state.mantraDevanagari,
                        done: context.state.mantraDone
                    )
                }
                if !context.state.sankalpTitle.isEmpty {
                    triadRow(
                        label: "SANKALP",
                        title: context.state.sankalpTitle,
                        devanagari: nil,
                        done: context.state.sankalpDone
                    )
                }
                if !context.state.practiceTitle.isEmpty {
                    triadRow(
                        label: "PRACTICE",
                        title: context.state.practiceTitle,
                        devanagari: nil,
                        done: context.state.practiceDone
                    )
                }
            }
        }
        .padding(14)
        .background(
            LinearGradient(
                colors: [.laBackground, .laSurface, .laWarmBrown],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .activityBackgroundTint(Color.laBackground)
    }

    @ViewBuilder
    private func triadRow(label: String, title: String, devanagari: String?, done: Bool) -> some View {
        HStack(alignment: .top, spacing: 8) {
            Text(done ? "✓" : "·")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(done ? .laGold : .laMuted)
                .frame(width: 12)
            VStack(alignment: .leading, spacing: 1) {
                Text(label)
                    .font(.system(size: 8, weight: .bold))
                    .foregroundColor(.laMuted)
                    .kerning(1.0)
                Text(title)
                    .font(.system(size: 12, weight: done ? .regular : .semibold))
                    .foregroundColor(done ? .laMuted : .laText)
                    .lineLimit(1)
                    .minimumScaleFactor(0.85)
                if let deva = devanagari, !deva.isEmpty, !done {
                    Text(deva)
                        .font(.system(size: 10, weight: .regular))
                        .foregroundColor(.laMuted)
                        .lineLimit(1)
                }
            }
        }
    }
}
