import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Widget
struct KalpxRhythmLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: KalpxRhythmAttributes.self) { context in
            lockScreenView(context: context)
                .widgetURL(URL(string: context.attributes.deepLinkURL))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 5) {
                        Text("◈")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.laGold)
                        Text(context.state.bandLabel)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.laGold.opacity(0.7))
                    }
                    .padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(spacing: 6) {
                        Rectangle()
                            .fill(Color.laGold.opacity(0.20))
                            .frame(height: 1)
                        if context.state.bandDone {
                            Text("Rhythm held ✓")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.laGold)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 4)
                        } else if !context.state.anchorTitle.isEmpty {
                            Text(context.state.anchorTitle)
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.white)
                                .multilineTextAlignment(.center)
                                .lineLimit(2)
                                .minimumScaleFactor(0.8)
                                .padding(.horizontal, 4)
                        }
                    }
                    .padding(.bottom, 6)
                }
            } compactLeading: {
                Text("◈")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.laGold)
                    .padding(.leading, 6)
            } compactTrailing: {
                Text(context.state.bandLabel)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.white)
                    .lineLimit(1)
                    .padding(.trailing, 4)
            } minimal: {
                Text("◈")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.laGold)
            }
            .widgetURL(URL(string: context.attributes.deepLinkURL))
        }
    }

    // MARK: - Lock Screen card
    @ViewBuilder
    private func lockScreenView(
        context: ActivityViewContext<KalpxRhythmAttributes>
    ) -> some View {
        VStack(alignment: .leading, spacing: 10) {

            HStack(spacing: 8) {
                Text("◈")
                    .font(.system(size: 22, weight: .medium))
                    .foregroundColor(.laGold)
                VStack(alignment: .leading, spacing: 1) {
                    Text("Daily Rhythm")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.laMuted)
                    Text(context.state.bandLabel)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.laText)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            Rectangle().fill(Color.laDivider).frame(height: 1)

            if context.state.bandDone {
                HStack(spacing: 6) {
                    Text("✓")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.laGold)
                    Text("Rhythm held for \(context.state.bandLabel.lowercased())")
                        .font(.system(size: 13, weight: .regular))
                        .foregroundColor(.laText)
                }
            } else if !context.state.anchorTitle.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text(context.state.anchorType.capitalized)
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.laMuted)
                        .kerning(1.2)
                    Text(context.state.anchorTitle)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.laText)
                        .lineLimit(2)
                        .minimumScaleFactor(0.85)
                    if !context.state.anchorDevanagari.isEmpty {
                        Text(context.state.anchorDevanagari)
                            .font(.system(size: 11, weight: .regular))
                            .foregroundColor(.laMuted)
                            .lineLimit(2)
                    }
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
}
