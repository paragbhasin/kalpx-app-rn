import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Widget
struct KalpxSankalpLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: KalpxSankalpAttributes.self) { context in
            lockScreenView(context: context)
                .widgetURL(URL(string: context.attributes.deepLinkURL))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 5) {
                        Text("◈")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.laGold)
                        Text("Your sankalp")
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
                        Text(context.attributes.title)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                            .fixedSize(horizontal: false, vertical: true)
                            .lineLimit(5)
                            .padding(.horizontal, 4)
                    }
                    .padding(.bottom, 6)
                }
            } compactLeading: {
                Text(context.attributes.title)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.white)
                    .lineLimit(2)
                    .minimumScaleFactor(0.6)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.leading, 6)
            } compactTrailing: {
                Text("◈")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.laGold)
            } minimal: {
                Text("◈")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.laGold)
            }
        }
    }

    // MARK: - Lock Screen card
    @ViewBuilder
    private func lockScreenView(
        context: ActivityViewContext<KalpxSankalpAttributes>
    ) -> some View {
        VStack(alignment: .leading, spacing: 10) {

            HStack(spacing: 8) {
                Text("◈")
                    .font(.system(size: 22, weight: .medium))
                    .foregroundColor(.laGold)
                VStack(alignment: .leading, spacing: 1) {
                    Text("A sankalp for today")
                        .font(.system(size: 8, weight: .medium))
                        .foregroundColor(.laMuted)
                    Text(context.attributes.title)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.laText)
                        .lineLimit(2)
                        .minimumScaleFactor(0.85)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            Rectangle().fill(Color.laDivider).frame(height: 1)

            if !context.state.line.isEmpty {
                HStack(alignment: .top, spacing: 6) {
                    Rectangle()
                        .fill(Color.laGold)
                        .frame(width: 2)
                        .cornerRadius(1)
                    Text(context.state.line)
                        .font(.system(size: 12, weight: .regular))
                        .foregroundColor(.laMuted)
                        .lineLimit(3)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
        .padding(14)
        .background(
            ZStack {
                LinearGradient(
                    stops: [
                        .init(color: Color(red: 1.00, green: 0.97, blue: 0.91), location: 0.0),
                        .init(color: Color(red: 0.97, green: 0.91, blue: 0.80), location: 0.55),
                        .init(color: Color(red: 0.93, green: 0.86, blue: 0.72), location: 1.0),
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                RadialGradient(
                    colors: [Color.white.opacity(0.40), Color.clear],
                    center: UnitPoint(x: 0.15, y: 0.10),
                    startRadius: 0,
                    endRadius: 100
                )
            }
            .opacity(0.92)
        )
        .activityBackgroundTint(Color(red: 0.96, green: 0.90, blue: 0.78))
    }
}
