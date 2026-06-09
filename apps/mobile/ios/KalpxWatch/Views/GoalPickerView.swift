import SwiftUI

struct GoalPickerView: View {
    let mantra: CuratedMantra
    let onSelect: (String, Int?) -> Void

    private let goals: [(label: String, type: String, value: Int?)] = [
        ("Short return",    "count",      27),
        ("Deeper practice", "count",      54),
        ("Full mala",       "count",     108),
        ("Open practice",   "unlimited", nil),
    ]

    var body: some View {
        List(goals, id: \.label) { goal in
            Button {
                onSelect(goal.type, goal.value)
            } label: {
                Text(goal.label)
                    .font(.system(size: 13))
                    .foregroundColor(KalpXWatchTheme.textPrimary)
            }
            .listRowBackground(KalpXWatchTheme.surface)
        }
        .navigationTitle(mantra.name)
        .background(KalpXWatchTheme.background)
        .scrollContentBackground(.hidden)
    }
}
