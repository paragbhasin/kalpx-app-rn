import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Design tokens (shared with QuickChant)
private extension Color {
    static let sGold      = Color(red: 0.82, green: 0.62, blue: 0.18)
    static let sGoldLight = Color(red: 1.00, green: 0.85, blue: 0.38)
    static let sBrown     = Color(red: 0.48, green: 0.30, blue: 0.13)
    static let sBrownDark = Color(red: 0.25, green: 0.13, blue: 0.04)
    static let sText      = Color(red: 0.18, green: 0.12, blue: 0.06)
    static let sMuted     = Color(red: 0.48, green: 0.38, blue: 0.26)
    static let sDivider   = Color(red: 0.55, green: 0.40, blue: 0.20).opacity(0.18)
}

// MARK: - Widget
struct KalpxSankalpLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: KalpxSankalpAttributes.self) { context in
            lockScreenView(context: context)
                .widgetURL(URL(string: context.attributes.deepLinkURL))
        } dynamicIsland: { context in
            DynamicIsland {
                // Leading — branding only (🪷 + label)
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 5) {
                        Text("🪷")
                            .font(.system(size: 14))
                        Text("SANKALP")
                            .font(.system(size: 8, weight: .semibold))
                            .foregroundColor(.sGold.opacity(0.7))
                            .tracking(1.2)
                    }
                    .padding(.leading, 4)
                }
                // Bottom — full sankalp title, unrestricted width
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(spacing: 6) {
                        Rectangle()
                            .fill(Color.sGold.opacity(0.20))
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
                Text("🪷")
                    .font(.system(size: 13))
            } minimal: {
                Text("🪷")
                    .font(.system(size: 12))
            }
        }
    }

    // MARK: - Lock Screen card
    @ViewBuilder
    private func lockScreenView(
        context: ActivityViewContext<KalpxSankalpAttributes>
    ) -> some View {
        VStack(alignment: .leading, spacing: 10) {

            // Header row — lotus + "My Sankalp" label
            HStack(spacing: 8) {
                Text("🪷")
                    .font(.system(size: 22))
                VStack(alignment: .leading, spacing: 1) {
                    Text("MY SANKALP")
                        .font(.system(size: 8, weight: .semibold))
                        .foregroundColor(.sMuted)
                        .tracking(1.5)
                    Text(context.attributes.title)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.sText)
                        .lineLimit(2)
                        .minimumScaleFactor(0.85)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            // Divider
            Rectangle().fill(Color.sDivider).frame(height: 1)

            // Intention line
            if !context.state.line.isEmpty {
                HStack(alignment: .top, spacing: 6) {
                    Rectangle()
                        .fill(Color.sGold)
                        .frame(width: 2)
                        .cornerRadius(1)
                    Text(context.state.line)
                        .font(.system(size: 12, weight: .regular))
                        .foregroundColor(.sMuted)
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
