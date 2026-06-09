import SwiftUI

struct WatchHomeListView: View {
    @EnvironmentObject var engine: WatchJapaEngine
    @EnvironmentObject var connectivity: WatchConnectivityManager

    private let innerPathTeal = Color(red: 0.27, green: 0.75, blue: 0.72)

    var body: some View {
        let pathData = connectivity.pathData

        if pathData == nil && connectivity.mantras == nil {
            EmptyStateView()
                .onAppear {
                    connectivity.reloadMantras()
                    connectivity.reloadPathData()
                    if connectivity.mantras == nil && connectivity.pathData == nil {
                        connectivity.requestMantrasFromPhone()
                    }
                }
        } else {
            List {
                // ── Header ──────────────────────────────────
                VStack(spacing: 3) {
                    Text("ॐ")
                        .font(.system(size: 22, weight: .medium))
                        .foregroundColor(KalpXWatchTheme.gold)
                    Text("KalpX")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(KalpXWatchTheme.textPrimary)
                    Text("Stay centered")
                        .font(.system(size: 11))
                        .foregroundColor(KalpXWatchTheme.textTertiary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 6)
                .listRowBackground(Color.clear)

                // ── My Rhythm ───────────────────────────────
                if let rh = pathData?.rhythm, rh.hasRhythm {
                    NavigationLink {
                        RhythmDetailView(rhythm: rh)
                            .environmentObject(engine)
                            .environmentObject(connectivity)
                    } label: {
                        RitualRow(icon: "◈", title: "My Rhythm")
                    }
                    .listRowBackground(KalpXWatchTheme.surface)
                }

                // ── Inner Path ──────────────────────────────
                if let ip = pathData?.innerPath, ip.hasActivePath {
                    NavigationLink {
                        InnerPathDetailView(innerPath: ip)
                            .environmentObject(engine)
                            .environmentObject(connectivity)
                    } label: {
                        RitualRow(
                            icon: "◉",
                            title: "Inner Path",
                            subtitle: "Day \(ip.dayNumber) of \(ip.totalDays)",
                            iconColor: innerPathTeal
                        )
                    }
                    .listRowBackground(KalpXWatchTheme.surface)
                }

                // ── Quick Chant ─────────────────────────────
                NavigationLink {
                    MantraPickerView()
                } label: {
                    RitualRow(icon: "ॐ", title: "Quick Chant", subtitle: todayChantSubtitle)
                }
                .listRowBackground(KalpXWatchTheme.surface)

                // ── Check-In ────────────────────────────────
                NavigationLink {
                    CheckInView()
                } label: {
                    RitualRow(icon: "◇", title: "Check-In")
                }
                .listRowBackground(KalpXWatchTheme.surface)
            }
            .navigationTitle("")
            .background(KalpXWatchTheme.background)
            .scrollContentBackground(.hidden)
            .onAppear { connectivity.reloadPathData() }
        }
    }

    private var todayChantSubtitle: String? {
        guard let stats = connectivity.pathData?.mantraStats, !stats.isEmpty else { return nil }
        let total = stats.values.reduce(0) { $0 + $1.todayCount }
        guard total > 0 else { return nil }
        return total == 1 ? "1 chant today" : "\(total) chants today"
    }
}
