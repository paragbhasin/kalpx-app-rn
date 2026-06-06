import SwiftUI

struct GoalPickerView: View {
    let mantra: CuratedMantra
    let onSelect: (String, Int?) -> Void

    private let goals: [(label: String, type: String, value: Int?)] = [
        ("27 beads",   "count",     27),
        ("54 beads",   "count",     54),
        ("108 beads",  "count",    108),
        ("Unlimited",  "unlimited", nil),
    ]

    var body: some View {
        List(goals, id: \.label) { goal in
            Button {
                onSelect(goal.type, goal.value)
            } label: {
                Text(goal.label)
                    .font(.system(size: 13))
            }
        }
        .navigationTitle(mantra.name)
    }
}
