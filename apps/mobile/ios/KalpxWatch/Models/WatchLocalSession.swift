import Foundation

struct WatchLocalSession: Codable {
    var watchSessionId: String
    var localSessionId: String
    var serverSessionId: Int?
    var mantraRef: String
    var sessionCount: Int
    var unsyncedDelta: Int
    var lastSyncedCount: Int
    var sourceSurface: String
    var goalType: String         // "count" | "time" | "unlimited"
    var goalValue: Int?
    var startedAt: Date
    var timezone: String
    var malaRoundsCompleted: Int

    static func fresh(mantraRef: String, goalType: String, goalValue: Int?) -> WatchLocalSession {
        WatchLocalSession(
            watchSessionId:       UUID().uuidString,
            localSessionId:       UUID().uuidString,
            serverSessionId:      nil,
            mantraRef:            mantraRef,
            sessionCount:         0,
            unsyncedDelta:        0,
            lastSyncedCount:      0,
            sourceSurface:        "watch",
            goalType:             goalType,
            goalValue:            goalValue,
            startedAt:            Date(),
            timezone:             TimeZone.current.identifier,
            malaRoundsCompleted:  0
        )
    }
}
