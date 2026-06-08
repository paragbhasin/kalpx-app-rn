import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Design tokens
private extension Color {
    static let kalpxGold      = Color(red: 0.82, green: 0.62, blue: 0.18)
    static let kalpxGoldLight = Color(red: 1.00, green: 0.85, blue: 0.38)
    static let kalpxBrown     = Color(red: 0.48, green: 0.30, blue: 0.13)
    static let kalpxBrownDark = Color(red: 0.25, green: 0.13, blue: 0.04)
    static let kalpxText      = Color(red: 0.18, green: 0.12, blue: 0.06) // dark brown
    static let kalpxMuted     = Color(red: 0.48, green: 0.38, blue: 0.26) // medium brown
    static let kalpxCardBg    = Color(red: 0.97, green: 0.92, blue: 0.82) // very light beige
    static let kalpxDivider   = Color(red: 0.55, green: 0.40, blue: 0.20).opacity(0.18)
}

// MARK: - Single rudraksha bead
private struct BeadView: View {
    enum State { case filled, current, empty }
    let state: State

    var body: some View {
        switch state {
        case .current:
            Circle()
                .fill(RadialGradient(
                    colors: [.kalpxGoldLight, .kalpxGold],
                    center: UnitPoint(x: 0.35, y: 0.30),
                    startRadius: 0, endRadius: 7
                ))
                .frame(width: 12, height: 12)
                .shadow(color: .kalpxGold.opacity(0.9), radius: 5)
        case .filled:
            Circle()
                .fill(RadialGradient(
                    colors: [.kalpxBrown, .kalpxBrownDark],
                    center: UnitPoint(x: 0.35, y: 0.30),
                    startRadius: 0, endRadius: 5
                ))
                .frame(width: 8, height: 8)
                .shadow(color: .black.opacity(0.4), radius: 1, x: 0.5, y: 0.5)
        case .empty:
            Circle()
                .fill(RadialGradient(
                    colors: [.kalpxBrown.opacity(0.30), .kalpxBrownDark.opacity(0.18)],
                    center: UnitPoint(x: 0.35, y: 0.30),
                    startRadius: 0, endRadius: 4
                ))
                .frame(width: 7, height: 7)
        }
    }
}

// MARK: - 27-bead mala ring
private struct MalaRing: View {
    let sessionCount: Int
    var ringRadius: CGFloat = 36
    private let total = 27

    private var progress: Int { sessionCount % total }

    var body: some View {
        ZStack {
            ForEach(0..<total, id: \.self) { i in
                BeadView(state: beadState(i))
                    .offset(y: -ringRadius)
                    .rotationEffect(.degrees(Double(i) * (360.0 / Double(total)) - 90))
            }
            // Center: count + TODAY
            VStack(spacing: 1) {
                Text("\(sessionCount)")
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundColor(.kalpxText)
                Text("TODAY")
                    .font(.system(size: 7, weight: .semibold))
                    .foregroundColor(.kalpxMuted)
                    .tracking(0.8)
            }
        }
        .frame(width: ringRadius * 2 + 18, height: ringRadius * 2 + 18)
    }

    private func beadState(_ i: Int) -> BeadView.State {
        if i == progress { return .current }
        if i < progress  { return .filled  }
        return .empty
    }
}

// MARK: - Stat column for lock screen
private struct StatColumn: View {
    let icon: String
    let label: String
    let count: Int

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.kalpxGold)
            Text("\(count)")
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundColor(.kalpxText)
            Text(label.uppercased())
                .font(.system(size: 8, weight: .semibold))
                .foregroundColor(.kalpxMuted)
                .tracking(0.9)
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
                // Leading — branding only (OM + label), mirrors Sankalp design
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 5) {
                        Text("ॐ")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.kalpxGold)
                        Text("MANTRA")
                            .font(.system(size: 8, weight: .semibold))
                            .foregroundColor(.kalpxGold.opacity(0.7))
                            .tracking(1.2)
                    }
                    .padding(.leading, 4)
                }
                // Bottom — full mantra name + devanagari, full width
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(spacing: 6) {
                        Rectangle()
                            .fill(Color.kalpxGold.opacity(0.20))
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
                            .foregroundColor(.kalpxGold.opacity(0.75))
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
                        .foregroundColor(.kalpxGold)
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
                    // Tiny bead dot
                    Circle()
                        .fill(Color.kalpxGold)
                        .frame(width: 5, height: 5)
                        .shadow(color: .kalpxGold.opacity(0.8), radius: 2)
                    Text("\(context.state.sessionCount)")
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .monospacedDigit()
                        .foregroundColor(.kalpxGold)
                }
            } minimal: {
                Text("\(context.state.sessionCount)")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundColor(.kalpxGold)
            }
        }
    }

    // MARK: - Lock Screen card
    @ViewBuilder
    private func lockScreenView(
        context: ActivityViewContext<KalpxChantAttributes>
    ) -> some View {
        VStack(spacing: 8) {

            if context.state.isCompleted {
                // Completion state
                VStack(spacing: 6) {
                    Text("✓")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.kalpxGold)
                    Text("Practice complete")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.kalpxText)
                    Text(context.attributes.mantraName)
                        .font(.system(size: 12))
                        .foregroundColor(.kalpxMuted)
                    Text("\(context.state.sessionCount) chants · \(elapsedString(context.state.elapsedSeconds))")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.kalpxGold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
            } else {
                // Active state — Row 1: mantra left, ring right
                HStack(alignment: .center, spacing: 8) {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(alignment: .top, spacing: 4) {
                            Text("ॐ")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.kalpxGold)
                            Text(context.attributes.mantraName)
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.kalpxText)
                                .fixedSize(horizontal: false, vertical: true)
                                .lineLimit(3)
                        }
                        if !context.attributes.mantraDevanagari.isEmpty {
                            Text(context.attributes.mantraDevanagari)
                                .font(.system(size: 10))
                                .foregroundColor(.kalpxMuted)
                                .fixedSize(horizontal: false, vertical: true)
                                .lineLimit(3)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    MalaRing(sessionCount: context.state.sessionCount, ringRadius: 24)
                }

                // Divider
                Rectangle().fill(Color.kalpxDivider).frame(height: 1)

                // Stats row
                HStack(spacing: 0) {
                    Spacer()
                    statCell(icon: "sun.min",  label: "Today",    count: context.state.sessionCount)
                    Spacer()
                    Rectangle().fill(Color.kalpxDivider).frame(width: 1, height: 22)
                    Spacer()
                    statCell(icon: "calendar", label: "Week",     count: context.state.weekCount)
                    Spacer()
                    Rectangle().fill(Color.kalpxDivider).frame(width: 1, height: 22)
                    Spacer()
                    statCell(icon: "infinity", label: "Lifetime", count: context.state.totalCount)
                    Spacer()
                }

                // TODO: Re-enable once AppIntents registration is confirmed working
//                if #available(iOS 17.0, *) {
//                    Button(intent: IncrementChantIntent()) {
//                        Text("ॐ  Tap to Chant")
//                            .font(.system(size: 12, weight: .semibold))
//                            .foregroundColor(.kalpxBrown)
//                        .frame(maxWidth: .infinity)
//                        .padding(.vertical, 6)
//                        .background(Color.kalpxGold.opacity(0.15))
//                        .cornerRadius(8)
//                        .overlay(
//                            RoundedRectangle(cornerRadius: 8)
//                                .stroke(Color.kalpxGold.opacity(0.35), lineWidth: 1)
//                        )
//                    }
//                    .buttonStyle(.plain)
//                }
            }

        }
        .padding(10)
        .background(
            ZStack {
                // Base warm cream gradient
                LinearGradient(
                    stops: [
                        .init(color: Color(red: 1.00, green: 0.97, blue: 0.91), location: 0.0),
                        .init(color: Color(red: 0.97, green: 0.91, blue: 0.80), location: 0.55),
                        .init(color: Color(red: 0.93, green: 0.86, blue: 0.72), location: 1.0),
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                // Sunlight reflection highlight (top-left glow)
                RadialGradient(
                    colors: [
                        Color.white.opacity(0.45),
                        Color.clear
                    ],
                    center: UnitPoint(x: 0.15, y: 0.10),
                    startRadius: 0,
                    endRadius: 120
                )
            }
            .opacity(0.92)
        )
        .activityBackgroundTint(Color(red: 0.96, green: 0.90, blue: 0.78))
    }

    // MARK: - Compact stat cell for lock screen
    @ViewBuilder
    private func statCell(icon: String, label: String, count: Int) -> some View {
        VStack(spacing: 1) {
            Image(systemName: icon)
                .font(.system(size: 9, weight: .medium))
                .foregroundColor(.kalpxGold)
            Text("\(count)")
                .font(.system(size: 13, weight: .bold, design: .rounded))
                .foregroundColor(.kalpxText)
            Text(label.uppercased())
                .font(.system(size: 7, weight: .semibold))
                .foregroundColor(.kalpxMuted)
                .tracking(0.7)
        }
    }

    // MARK: - Helpers
    @ViewBuilder
    private func diStat(_ label: String, _ count: Int) -> some View {
        VStack(spacing: 2) {
            Text("\(count)")
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundColor(.kalpxGold)
            Text(label.uppercased())
                .font(.system(size: 8, weight: .semibold))
                .foregroundColor(.white.opacity(0.50))
                .tracking(0.7)
        }
    }

    @ViewBuilder
    private func diStatText(_ label: String, _ value: String) -> some View {
        VStack(spacing: 1) {
            Text(value)
                .font(.system(size: 13, weight: .bold, design: .rounded))
                .foregroundColor(.kalpxGold)
            Text(label.uppercased())
                .font(.system(size: 8, weight: .medium))
                .foregroundColor(.white.opacity(0.45))
                .tracking(0.5)
        }
    }

    private func firstLine(_ text: String) -> String {
        text.components(separatedBy: "\n").first ?? text
    }

    private func elapsedString(_ seconds: Int) -> String {
        let m = seconds / 60
        let s = seconds % 60
        return m > 0 ? "\(m)m \(s)s" : "\(s)s"
    }
}
