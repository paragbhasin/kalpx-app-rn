import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Widget
struct KalpxResetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: KalpxResetAttributes.self) { context in
            lockScreenView(context: context)
                .widgetURL(URL(string: context.attributes.deepLinkURL))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 5) {
                        Text("ॐ")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.laGold)
                        Text("Return slowly")
                            .font(.system(size: 8, weight: .medium))
                            .foregroundColor(.laGold.opacity(0.7))
                    }
                    .padding(.leading, 4)
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
                        } else {
                            Text("One breath at a time.")
                                .font(.system(size: 12, weight: .regular))
                                .foregroundColor(.white)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 4)
                        }
                    }
                    .padding(.bottom, 6)
                }
            } compactLeading: {
                let url = URL(string: context.attributes.deepLinkURL) ?? URL(string: "kalpx://mitra/quick_reset/home")!
                Link(destination: url) {
                    Text("ॐ")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.laGold)
                        .padding(.leading, 6)
                }
            } compactTrailing: {
                let url = URL(string: context.attributes.deepLinkURL) ?? URL(string: "kalpx://mitra/quick_reset/home")!
                Link(destination: url) {
                    Text("Reset")
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(.white)
                        .padding(.trailing, 4)
                }
            } minimal: {
                Text("ॐ")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.laGold)
            }
        }
    }

    // MARK: - Lock Screen card
    @ViewBuilder
    private func lockScreenView(
        context: ActivityViewContext<KalpxResetAttributes>
    ) -> some View {
        VStack(alignment: .leading, spacing: 10) {

            HStack(spacing: 8) {
                Text("ॐ")
                    .font(.system(size: 22, weight: .medium))
                    .foregroundColor(.laGold)
                VStack(alignment: .leading, spacing: 1) {
                    Text("A moment of reset")
                        .font(.system(size: 8, weight: .medium))
                        .foregroundColor(.laMuted)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            Rectangle().fill(Color.laDivider).frame(height: 1)

            if !context.state.mantraTitle.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Return with this mantra")
                        .font(.system(size: 10, weight: .regular))
                        .foregroundColor(.laMuted)
                    Text(context.state.mantraTitle)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.laText)
                        .lineLimit(2)
                        .minimumScaleFactor(0.85)
                    if !context.state.mantraDevanagari.isEmpty {
                        Text(context.state.mantraDevanagari)
                            .font(.system(size: 11, weight: .regular))
                            .foregroundColor(.laMuted)
                            .lineLimit(2)
                    }
                }
            } else {
                Text("One breath at a time.")
                    .font(.system(size: 13, weight: .regular))
                    .foregroundColor(.laText)
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
