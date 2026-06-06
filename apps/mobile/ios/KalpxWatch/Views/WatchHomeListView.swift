import SwiftUI

struct WatchHomeListView: View {
    @EnvironmentObject var engine: WatchJapaEngine
    @EnvironmentObject var connectivity: WatchConnectivityManager

    var body: some View {
        let pathData = connectivity.pathData

        if pathData == nil && connectivity.mantras == nil {
            notLoggedInView
        } else {
            List {
                // My Rhythm card — shows if user has rhythm set up
                if let rh = pathData?.rhythm, rh.hasRhythm {
                    NavigationLink {
                        RhythmDetailView(rhythm: rh)
                            .environmentObject(engine)
                    } label: {
                        WatchListRow(icon: "◈", title: "My Rhythm", subtitle: nil)
                    }
                }

                // Inner Path card — shows if user has active path
                if let ip = pathData?.innerPath, ip.hasActivePath {
                    NavigationLink {
                        InnerPathDetailView(innerPath: ip)
                            .environmentObject(engine)
                    } label: {
                        WatchListRow(icon: "◉", title: "Inner Path", subtitle: "Day \(ip.dayNumber) of \(ip.totalDays)")
                    }
                }

                // Quick Chant — always visible
                NavigationLink {
                    MantraPickerView()
                } label: {
                    WatchListRow(icon: "ॐ", title: "Quick Chant", subtitle: nil)
                }

                // Check-In — always visible
                NavigationLink {
                    CheckInView()
                } label: {
                    WatchListRow(icon: "◇", title: "Check-In", subtitle: nil)
                }
            }
            .navigationTitle("KalpX")
            .onAppear {
                connectivity.reloadPathData()
            }
        }
    }

    // MARK: - Not logged in

    private var notLoggedInView: some View {
        VStack(spacing: 8) {
            Text("ॐ")
                .font(.system(size: 32))
            Text("Open KalpX on iPhone to begin.")
                .font(.system(size: 12))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .onAppear {
            connectivity.reloadMantras()
            connectivity.reloadPathData()
            if connectivity.mantras == nil && connectivity.pathData == nil {
                connectivity.requestMantrasFromPhone()
            }
        }
    }
}

// MARK: - Reusable row

struct WatchListRow: View {
    let icon: String
    let title: String
    let subtitle: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 5) {
                Text(icon)
                    .font(.system(size: 11))
                Text(title)
                    .font(.system(size: 14, weight: .medium))
            }
            if let sub = subtitle {
                Text(sub)
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }
        }
    }
}
