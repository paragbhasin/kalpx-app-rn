import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Progress ring (108-count cycle)
private struct MalaRing: View {
    let sessionCount: Int
    var size: CGFloat = 64
    private let total = 108
    private let strokeWidth: CGFloat = 5

    private var fraction: Double { Double(sessionCount % total) / Double(total) }

    var body: some View {
        ZStack {
            // Glow halo
            Circle()
                .stroke(Color.laGold.opacity(0.18), lineWidth: 10)
                .blur(radius: 4)

            // Ring track
            Circle()
                .stroke(Color.white.opacity(0.10), lineWidth: strokeWidth)

            // Gold progress arc
            Circle()
                .trim(from: 0, to: max(fraction, 0.012))
                .stroke(
                    AngularGradient(
                        colors: [Color.laGold.opacity(0.45), .laGold, .laGoldLight],
                        center: .center,
                        startAngle: .degrees(-90),
                        endAngle: .degrees(270)
                    ),
                    style: StrokeStyle(lineWidth: strokeWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))

            // Flame at arc tip
            if sessionCount % total > 0 {
                Image(systemName: "flame.fill")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.laGoldLight)
                    .shadow(color: Color.laGold.opacity(0.8), radius: 3)
                    .offset(y: -(size / 2))
                    .rotationEffect(.degrees(360 * fraction))
            }

            // Center: count + Today label
            VStack(spacing: 1) {
                Text("\(sessionCount)")
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                Text("Today")
                    .font(.system(size: 8, weight: .medium))
                    .foregroundColor(.white.opacity(0.60))
            }
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Stat cell (dark theme, no icon)
private struct StatCell: View {
    let label: String
    let count: Int

    var body: some View {
        VStack(spacing: 4) {
            Text("\(count)")
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            Text(label)
                .font(.system(size: 9, weight: .medium))
                .foregroundColor(.white.opacity(0.50))
        }
    }
}

// MARK: - Widget
struct KalpxQuickChantLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: KalpxChantAttributes.self) { context in
            lockScreenView(context: context)
                .widgetURL(URL(string: context.attributes.deepLinkURL))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 5) {
                        Text("ॐ")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.laGold)
                        Text("Chanting now")
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
                        Text(context.attributes.mantraName)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                            .fixedSize(horizontal: false, vertical: true)
                            .lineLimit(3)
                            .padding(.horizontal, 4)
                        Text(context.attributes.mantraDevanagari)
                            .font(.system(size: 11))
                            .foregroundColor(.laGold.opacity(0.75))
                            .multilineTextAlignment(.center)
                            .fixedSize(horizontal: false, vertical: true)
                            .lineLimit(2)
                            .padding(.horizontal, 4)
                    }
                    .padding(.bottom, 6)
                }
            } compactLeading: {
                HStack(spacing: 4) {
                    Text("ॐ")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.laGold)
                        .fixedSize()
                    Text(context.attributes.mantraName)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                        .truncationMode(.tail)
                        .minimumScaleFactor(0.7)
                        .frame(maxWidth: 130, alignment: .leading)
                }
            } compactTrailing: {
                HStack(spacing: 3) {
                    Circle()
                        .fill(Color.laGold)
                        .frame(width: 5, height: 5)
                        .shadow(color: .laGold.opacity(0.8), radius: 2)
                    Text("\(context.state.sessionCount)")
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .monospacedDigit()
                        .foregroundColor(.laGold)
                }
            } minimal: {
                Text("\(context.state.sessionCount)")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundColor(.laGold)
            }
            .widgetURL(URL(string: context.attributes.deepLinkURL))
        }
    }

    // MARK: - Lock Screen card
    @ViewBuilder
    private func lockScreenView(
        context: ActivityViewContext<KalpxChantAttributes>
    ) -> some View {
        ZStack {
            // Dark spiritual brown gradient
            LinearGradient(
                colors: [.laBackground, .laSurface, .laWarmBrown],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            // Subtle gold radial glow near ring (top-right)
            RadialGradient(
                colors: [Color.laGold.opacity(0.08), Color.clear],
                center: UnitPoint(x: 0.82, y: 0.18),
                startRadius: 0,
                endRadius: 80
            )

            VStack(spacing: 0) {
                if context.state.isCompleted {
                    VStack(spacing: 6) {
                        Text("✦")
                            .font(.system(size: 26, weight: .bold))
                            .foregroundColor(.laGold)
                            .shadow(color: Color.laGold.opacity(0.6), radius: 6)
                        Text("Practice offered")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                        Text(context.attributes.mantraName)
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.50))
                        Text("\(context.state.sessionCount) chants")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.laGold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                } else {

                    // Top row: logo | mantra + devanagari | ring
                    HStack(alignment: .center, spacing: 12) {
                        Image("new_logo")
                            .resizable()
                            .scaledToFill()
                            .frame(width: 44, height: 44)
                            .clipShape(Circle())
                            .shadow(color: Color.laGold.opacity(0.40), radius: 6, x: 0, y: 2)

                        VStack(alignment: .leading, spacing: 3) {
                            Text(context.attributes.mantraName)
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(.white)
                                .lineLimit(2)
                                .minimumScaleFactor(0.78)
                                .fixedSize(horizontal: false, vertical: true)
                            if !context.attributes.mantraDevanagari.isEmpty {
                                Text(context.attributes.mantraDevanagari)
                                    .font(.system(size: 10))
                                    .foregroundColor(.white.opacity(0.40))
                                    .lineLimit(1)
                            }
                        }

                        Spacer()

                        MalaRing(sessionCount: context.state.sessionCount)
                    }
                    .padding(.horizontal, 12)
                    .padding(.top, 12)
                    .padding(.bottom, 10)

                    // Divider
                    Rectangle()
                        .fill(Color.white.opacity(0.10))
                        .frame(height: 1)
                        .padding(.horizontal, 14)

                    // Stats row: Weekly | Yearly | Lifetime (no icons)
                    HStack(spacing: 0) {
                        Spacer()
                        StatCell(label: "Weekly",   count: context.state.weekCount)
                        Spacer()
                        Rectangle().fill(Color.white.opacity(0.10)).frame(width: 0.5, height: 32)
                        Spacer()
                        StatCell(label: "Yearly",   count: context.state.yearCount)
                        Spacer()
                        Rectangle().fill(Color.white.opacity(0.10)).frame(width: 0.5, height: 32)
                        Spacer()
                        StatCell(label: "Lifetime", count: context.state.totalCount)
                        Spacer()
                    }
                    .padding(.horizontal, 12)
                    .padding(.top, 8)
                    .padding(.bottom, 12)
                }
            }
        }
        .activityBackgroundTint(Color.laBackground)
    }
}
