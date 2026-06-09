import SwiftUI

struct WatchHomeListView: View {
    @EnvironmentObject var engine: WatchJapaEngine
    @EnvironmentObject var connectivity: WatchConnectivityManager

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
                if let rh = pathData?.rhythm, rh.hasRhythm {
                    NavigationLink {
                        RhythmDetailView(rhythm: rh)
                            .environmentObject(engine)
                    } label: {
                        RitualRow(icon: "◈", title: "My Rhythm")
                    }
                }

                if let ip = pathData?.innerPath, ip.hasActivePath {
                    NavigationLink {
                        InnerPathDetailView(innerPath: ip)
                            .environmentObject(engine)
                    } label: {
                        VStack(alignment: .leading, spacing: 4) {
                            RitualRow(icon: "◉", title: "Inner Path")
                            StateChip(label: "Day \(ip.dayNumber) of \(ip.totalDays)", variant: .neutral)
                        }
                    }
                }

                NavigationLink {
                    MantraPickerView()
                } label: {
                    RitualRow(icon: "ॐ", title: "Quick Chant")
                }

                NavigationLink {
                    CheckInView()
                } label: {
                    RitualRow(icon: "◇", title: "Check-In")
                }
            }
            .navigationTitle("KalpX")
            .background(KalpXWatchTheme.background)
            .scrollContentBackground(.hidden)
            .onAppear {
                connectivity.reloadPathData()
            }
        }
    }
}
