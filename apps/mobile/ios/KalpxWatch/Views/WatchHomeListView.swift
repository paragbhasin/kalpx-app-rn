import SwiftUI

struct WatchHomeListView: View {
    @EnvironmentObject var engine: WatchJapaEngine
    @EnvironmentObject var connectivity: WatchConnectivityManager

    var body: some View {
        let pathData = connectivity.pathData
        let sankalp  = WatchAppGroupStorage.shared.loadSankalp()

        if pathData == nil && connectivity.mantras == nil {
            notLoggedInView
        } else {
            List {
                if let ip = pathData?.innerPath, ip.hasActivePath {
                    innerPathSection(ip, sankalp: sankalp)
                }

                if let rh = pathData?.rhythm, rh.hasRhythm {
                    rhythmSection(rh)
                }

                quickChantSection

                checkinSection(pathData?.checkin)
            }
            .navigationTitle("KalpX")
            .onAppear {
                // Re-read app group on every home appearance so Inner Path / Rhythm
                // show up even when the Watch launched before the iPhone pushed data.
                connectivity.reloadPathData()
            }
        }
    }

    // MARK: - Inner Path

    private func innerPathSection(_ ip: WatchInnerPathData, sankalp: (title: String, line: String)?) -> some View {
        Section {
            if let mantra = ip.mantra {
                let cm = CuratedMantra(id: mantra.ref, ref: mantra.ref,
                                       name: mantra.name, devanagari: mantra.devanagari,
                                       label: "inner_path")
                NavigationLink {
                    GoalPickerView(mantra: cm) { type, value in
                        engine.startSession(mantra: cm, goalType: type, goalValue: value)
                    }
                } label: {
                    WatchListRow(icon: "ॐ", title: "Mantra", subtitle: mantra.name)
                }
            }

            if let s = sankalp {
                NavigationLink {
                    SankalpView(title: s.title, line: s.line, source: "inner_path")
                } label: {
                    WatchListRow(icon: "◈", title: "Sankalp", subtitle: shortened(s.line))
                }
            }

            if let practice = ip.practice {
                NavigationLink {
                    PracticeView(title: practice.title, description: practice.description, source: "inner_path")
                } label: {
                    WatchListRow(icon: "◎", title: "Practice", subtitle: practice.title)
                }
            }
        } header: {
            Text("Inner Path · Day \(ip.dayNumber)")
        }
    }

    // MARK: - Rhythm

    private func rhythmSection(_ rh: WatchRhythmData) -> some View {
        let header = rh.currentSlot.capitalized + " Rhythm" + (rh.slotDone ? " · Done ✓" : "")
        return Section {
            if let mantra = rh.mantra {
                let cm = CuratedMantra(id: mantra.ref, ref: mantra.ref,
                                       name: mantra.name, devanagari: mantra.devanagari,
                                       label: rh.currentSlot.capitalized)
                NavigationLink {
                    GoalPickerView(mantra: cm) { type, value in
                        engine.startSession(mantra: cm, goalType: type, goalValue: value)
                    }
                } label: {
                    WatchListRow(icon: "ॐ", title: "Mantra", subtitle: mantra.name)
                        .opacity(rh.slotDone ? 0.55 : 1)
                }
            }

            if let s = rh.sankalp {
                NavigationLink {
                    SankalpView(title: s.title, line: s.line, source: "rhythm")
                } label: {
                    WatchListRow(icon: "◈", title: "Sankalp", subtitle: shortened(s.line))
                        .opacity(rh.slotDone ? 0.55 : 1)
                }
            }

            if let practice = rh.practice {
                NavigationLink {
                    PracticeView(title: practice.title, description: practice.description, source: "rhythm")
                } label: {
                    WatchListRow(icon: "◎", title: "Practice", subtitle: practice.title)
                        .opacity(rh.slotDone ? 0.55 : 1)
                }
            }
        } header: {
            Text(header)
        }
    }

    // MARK: - Quick Chant (always)

    private var quickChantSection: some View {
        Section {
            NavigationLink {
                MantraPickerView()
            } label: {
                WatchListRow(icon: "◉", title: "Quick Chant", subtitle: nil)
            }
        }
    }

    // MARK: - Check-In

    private func checkinSection(_ checkin: WatchCheckinData?) -> some View {
        Section {
            NavigationLink {
                CheckInView()
            } label: {
                WatchListRow(
                    icon: "◇",
                    title: "Check-In",
                    subtitle: checkin?.windowActive == true ? (checkin?.pranaLabel ?? "How are you?") : nil
                )
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

    private func shortened(_ line: String) -> String {
        line.count > 28 ? String(line.prefix(28)) + "…" : line
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
