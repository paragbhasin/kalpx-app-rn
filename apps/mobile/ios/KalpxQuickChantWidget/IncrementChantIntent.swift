import ActivityKit
import AppIntents
import Foundation

private let appGroupID  = "group.com.kalpx.app"
private let kPendingKey = "kalpx_pending_chant_increments"

@available(iOS 17.0, *)
struct IncrementChantIntent: LiveActivityIntent {
    static var title: LocalizedStringResource = "Add chant"

    func perform() async throws -> some IntentResult {
        for activity in Activity<KalpxChantAttributes>.activities {
            var state = activity.content.state
            state.sessionCount += 1
            state.weekCount    += 1
            state.yearCount    += 1
            state.totalCount   += 1

            if let defaults = UserDefaults(suiteName: appGroupID) {
                let pending = defaults.integer(forKey: kPendingKey)
                defaults.set(pending + 1, forKey: kPendingKey)
            }

            await activity.update(ActivityContent(state: state, staleDate: nil))
        }
        return .result()
    }
}
