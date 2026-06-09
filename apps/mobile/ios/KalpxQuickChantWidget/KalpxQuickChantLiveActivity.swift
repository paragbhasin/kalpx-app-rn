import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Single rudraksha bead
private struct BeadView: View {
    enum State { case filled, current, empty }
    let state: State

    var body: some View {
        switch state {
        case .current:
            Circle()
                .fill(RadialGradient(
                    colors: [.laGoldLight, .laGold],
                    center: UnitPoint(x: 0.35, y: 0.30),
                    startRadius: 0, endRadius: 7
                ))
                .frame(width: 12, height: 12)
                .shadow(color: .laGold.opacity(0.9), radius: 5)
        case .filled:
            Circle()
                .fill(RadialGradient(
                    colors: [.laBrown, .laBrownDark],
                    center: UnitPoint(x: 0.35, y: 0.30),
                    startRadius: 0, endRadius: 5
                ))
                .frame(width: 8, height: 8)
                .shadow(color: .black.opacity(0.4), radius: 1, x: 0.5, y: 0.5)
        case .empty:
            Circle()
                .fill(RadialGradient(
                    colors: [.laBrown.opacity(0.30), .laBrownDark.opacity(0.18)],
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
            Text("\(sessionCount)")
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundColor(.laText)
        }
        .frame(width: ringRadius * 2 + 18, height: ringRadius * 2 + 18)
    }

    private func beadState(_ i: Int) -> BeadView.State {
        if i == progress { return .current }
        if i < progress  { return .filled  }
        return .empty
    }
}

// MARK: - Stat column
private struct StatColumn: View {
    let label: String
    let count: Int

    var body: some View {
        VStack(spacing: 2) {
            Text("\(count)")
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundColor(.laText)
            Text(label)
                .font(.system(size: 8, weight: .medium))
                .foregroundColor(.laMuted)
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
        }
    }

    // MARK: - Lock Screen card
    @ViewBuilder
    private func lockScreenView(
        context: ActivityViewContext<KalpxChantAttributes>
    ) -> some View {
        VStack(spacing: 8) {

            if context.state.isCompleted {
                VStack(spacing: 6) {
                    Text("✦")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.laGold)
                    Text("Practice offered")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.laText)
                    Text(context.attributes.mantraName)
                        .font(.system(size: 12))
                        .foregroundColor(.laMuted)
                    Text("\(context.state.sessionCount) chants")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.laGold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
            } else {
                HStack(alignment: .center, spacing: 8) {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(alignment: .top, spacing: 4) {
                            Text("ॐ")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.laGold)
                            Text(context.attributes.mantraName)
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.laText)
                                .fixedSize(horizontal: false, vertical: true)
                                .lineLimit(3)
                        }
                        if !context.attributes.mantraDevanagari.isEmpty {
                            Text(context.attributes.mantraDevanagari)
                                .font(.system(size: 10))
                                .foregroundColor(.laMuted)
                                .fixedSize(horizontal: false, vertical: true)
                                .lineLimit(3)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    MalaRing(sessionCount: context.state.sessionCount, ringRadius: 24)
                }

                Rectangle().fill(Color.laDivider).frame(height: 1)

                HStack(spacing: 0) {
                    Spacer()
                    StatColumn(label: "Today",     count: context.state.sessionCount)
                    Spacer()
                    Rectangle().fill(Color.laDivider).frame(width: 1, height: 22)
                    Spacer()
                    StatColumn(label: "This week", count: context.state.weekCount)
                    Spacer()
                    Rectangle().fill(Color.laDivider).frame(width: 1, height: 22)
                    Spacer()
                    StatColumn(label: "Always",    count: context.state.totalCount)
                    Spacer()
                }

                // TODO: Re-enable once AppIntents registration is confirmed working
//                if #available(iOS 17.0, *) {
//                    Button(intent: IncrementChantIntent()) {
//                        Text("ॐ  Tap to Chant")
//                            .font(.system(size: 12, weight: .semibold))
//                            .foregroundColor(.laBrown)
//                        .frame(maxWidth: .infinity)
//                        .padding(.vertical, 6)
//                        .background(Color.laGold.opacity(0.15))
//                        .cornerRadius(8)
//                        .overlay(
//                            RoundedRectangle(cornerRadius: 8)
//                                .stroke(Color.laGold.opacity(0.35), lineWidth: 1)
//                        )
//                    }
//                    .buttonStyle(.plain)
//                }
            }

        }
        .padding(10)
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
}
