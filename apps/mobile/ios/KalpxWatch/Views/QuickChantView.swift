import SwiftUI

struct QuickChantView: View {
    @EnvironmentObject var engine: WatchJapaEngine
    @EnvironmentObject var connectivity: WatchConnectivityManager
    @State private var showCompletion = false

    var body: some View {
        ZStack {
            KalpXWatchTheme.background.ignoresSafeArea()
            if showCompletion {
                CompletionView(
                    count: engine.sessionCount,
                    onDone:     { engine.completeSession(); showCompletion = false },
                    onContinue: { showCompletion = false }
                )
            } else {
                chantView
            }
        }
        .onChange(of: engine.isGoalReached) { reached in
            if reached { showCompletion = true }
        }
    }

    // MARK: - Main layout

    private var chantView: some View {
        VStack(spacing: 0) {
            // FIXED: X | ॐ + count | ✓  — always visible
            compactHeader
                .contentShape(Rectangle())
                .onTapGesture { engine.increment() }

            // FIXED: bead ring — always visible
            BeadRingView(beadInRound: engine.beadInRound)
                .padding(.horizontal, 12)
                .frame(height: 26)
                .contentShape(Rectangle())
                .onTapGesture { engine.increment() }

            // SCROLLABLE: mantra name + full text + divider + stats
            // Crown scrolls all of this; tap anywhere still counts.
            ScrollView {
                VStack(spacing: 0) {
                    if let mantra = currentMantra {
                        Text(mantra.name)
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(KalpXWatchTheme.gold)
                            .multilineTextAlignment(.center)
                            .lineLimit(2)
                            .fixedSize(horizontal: false, vertical: true)
                            .padding(.top, 5)
                            .padding(.bottom, 3)
                            .frame(maxWidth: .infinity)

                        if let iast = mantra.iast, !iast.isEmpty {
                            Text(iast)
                                .font(.system(size: 9))
                                .foregroundColor(KalpXWatchTheme.textSecondary)
                                .multilineTextAlignment(.center)
                                .fixedSize(horizontal: false, vertical: true)
                                .padding(.bottom, 4)
                        }

                        if !mantra.devanagari.isEmpty {
                            Text(mantra.devanagari)
                                .font(.system(size: 10))
                                .foregroundColor(KalpXWatchTheme.textTertiary)
                                .multilineTextAlignment(.center)
                                .fixedSize(horizontal: false, vertical: true)
                                .padding(.bottom, 6)
                        }
                    }

                    Rectangle()
                        .fill(KalpXWatchTheme.textTertiary.opacity(0.25))
                        .frame(height: 0.5)

                    statsRow()
                        .frame(height: 36)
                        .padding(.bottom, 4)
                }
                .padding(.horizontal, 14)
                .frame(maxWidth: .infinity)
                .contentShape(Rectangle())
            }
            .simultaneousGesture(TapGesture().onEnded { engine.increment() })
        }
    }

    // MARK: - Compact header  (X | ॐ + count | ✓)

    private var compactHeader: some View {
        HStack(spacing: 0) {
            Button {
                engine.discardSession()
            } label: {
                Image(systemName: "xmark.circle")
                    .font(.system(size: 16))
                    .foregroundColor(KalpXWatchTheme.textTertiary)
            }
            .buttonStyle(.plain)
            .frame(width: 34)

            Spacer()

            VStack(spacing: 0) {
                Text("ॐ")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(KalpXWatchTheme.gold)
                Text("\(engine.sessionCount)")
                    .font(.system(size: 26, weight: .bold, design: .rounded))
                    .foregroundColor(KalpXWatchTheme.textPrimary)
                    .contentTransition(.numericText())
                    .animation(.spring(duration: 0.12), value: engine.sessionCount)
                if engine.malaRoundsCompleted > 0 {
                    Text("Round \(engine.malaRoundsCompleted)")
                        .font(.system(size: 8, weight: .semibold))
                        .foregroundColor(KalpXWatchTheme.gold)
                }
            }

            Spacer()

            Group {
                if engine.sessionCount > 0 {
                    Button {
                        showCompletion = true
                    } label: {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 16))
                            .foregroundColor(KalpXWatchTheme.gold)
                    }
                    .buttonStyle(.plain)
                } else {
                    Color.clear
                }
            }
            .frame(width: 34)
        }
        .padding(.horizontal, 6)
        .frame(height: 42)
        .animation(.easeInOut(duration: 0.2), value: engine.sessionCount > 0)
    }

    // MARK: - Stats row

    private func statsRow() -> some View {
        let base     = connectivity.pathData?.mantraStats?[engine.currentMantraRef]
        let week     = (base?.weekCount     ?? 0) + engine.sessionCount
        let year     = (base?.yearCount     ?? 0) + engine.sessionCount
        let lifetime = (base?.lifetimeCount ?? 0) + engine.sessionCount

        return HStack(spacing: 0) {
            statCell(count: week,     label: "Weekly")
            Divider().frame(height: 18)
            statCell(count: year,     label: "Yearly")
            Divider().frame(height: 18)
            statCell(count: lifetime, label: "Lifetime")
        }
    }

    private func statCell(count: Int, label: String) -> some View {
        VStack(spacing: 1) {
            Text(formatCount(count))
                .font(.system(size: 11, weight: .semibold, design: .rounded))
                .foregroundColor(KalpXWatchTheme.textPrimary)
            Text(label)
                .font(.system(size: 8))
                .foregroundColor(KalpXWatchTheme.textTertiary)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Helpers

    private var currentMantra: CuratedMantra? {
        connectivity.mantras?.first(where: { $0.ref == engine.currentMantraRef })
    }

    private func formatCount(_ n: Int) -> String {
        if n >= 1_000_000 { return String(format: "%.1fM", Double(n) / 1_000_000) }
        if n >= 1_000     { return String(format: "%.1fK", Double(n) / 1_000) }
        return "\(n)"
    }
}
