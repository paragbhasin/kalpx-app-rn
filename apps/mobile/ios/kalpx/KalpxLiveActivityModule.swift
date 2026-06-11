import ActivityKit
import Foundation

private let kAppGroupID      = "group.com.kalpx.app"
private let kPendingKey      = "kalpx_pending_chant_increments"
private let kActivityIDKey   = "kalpx_la_activity_id"
private let kRhythmIDKey     = "kalpx_la_rhythm_id"
private let kInnerPathIDKey  = "kalpx_la_inner_path_id"

@objc(KalpxLiveActivityModule)
class KalpxLiveActivityModule: NSObject {

    private var activityID: String?
    private var sankalpActivityID: String?
    private var resetActivityID: String?
    private var rhythmActivityID: String?
    private var innerPathActivityID: String?
    private var lastDeepLinkURL: String = "kalpx://mitra/quick_chant/home"

    // Restore persisted IDs so update guards survive module re-instantiation
    // (memory pressure, OTA JS reload, extended background).
    override init() {
        let d = UserDefaults(suiteName: kAppGroupID)
        activityID      = d?.string(forKey: kActivityIDKey)
        rhythmActivityID    = d?.string(forKey: kRhythmIDKey)
        innerPathActivityID = d?.string(forKey: kInnerPathIDKey)
        super.init()
    }

    private func saveID(_ id: String?, forKey key: String) {
        let d = UserDefaults(suiteName: kAppGroupID)
        if let id { d?.set(id, forKey: key) } else { d?.removeObject(forKey: key) }
    }

    // MARK: - Start

    @objc func startActivity(
        _ mantraName: String,
        devanagari: String,
        counts: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else {
            resolve(NSNull())
            return
        }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            reject("DISABLED", "Live Activities are disabled by user", nil)
            return
        }

        let sessionCount   = (counts["sessionCount"]   as? Int) ?? 0
        let weekCount      = (counts["weekCount"]      as? Int) ?? 0
        let yearCount      = (counts["yearCount"]      as? Int) ?? 0
        let totalCount     = (counts["totalCount"]     as? Int) ?? 0
        let elapsedSeconds = (counts["elapsedSeconds"] as? Int) ?? 0
        let deepLinkURL    = (counts["deepLinkURL"]    as? String) ?? "kalpx://mitra/quick_chant/home"
        self.lastDeepLinkURL = deepLinkURL

        Task {
            await self.endCurrentActivity()
            await self.endCurrentSankalpActivity() // Quick Chant takes Dynamic Island priority
            await self.endCurrentResetActivity()
            await self.endCurrentRhythmActivity()
            await self.endCurrentInnerPathActivity()

            let attrs = KalpxChantAttributes(
                mantraName: mantraName,
                mantraDevanagari: devanagari,
                deepLinkURL: deepLinkURL
            )
            let state = KalpxChantAttributes.ContentState(
                sessionCount: sessionCount,
                weekCount: weekCount,
                yearCount: yearCount,
                totalCount: totalCount,
                elapsedSeconds: elapsedSeconds,
                isCompleted: false
            )

            do {
                let activity = try Activity<KalpxChantAttributes>.request(
                    attributes: attrs,
                    content: ActivityContent(state: state, staleDate: Date().addingTimeInterval(4 * 60 * 60)),
                    pushType: nil
                )
                self.activityID = activity.id
                self.saveID(activity.id, forKey: kActivityIDKey)
                resolve(activity.id)
            } catch {
                reject("START_FAILED", error.localizedDescription, error)
            }
        }
    }

    // MARK: - Update

    @objc func updateActivity(
        _ counts: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else { resolve(NSNull()); return }
        guard let id = activityID,
              let activity = Activity<KalpxChantAttributes>.activities.first(where: { $0.id == id })
        else { resolve(NSNull()); return }

        let sessionCount   = (counts["sessionCount"]   as? Int) ?? 0
        let weekCount      = (counts["weekCount"]      as? Int) ?? 0
        let yearCount      = (counts["yearCount"]      as? Int) ?? 0
        let totalCount     = (counts["totalCount"]     as? Int) ?? 0
        let elapsedSeconds = (counts["elapsedSeconds"] as? Int) ?? 0

        Task {
            let state = KalpxChantAttributes.ContentState(
                sessionCount: sessionCount,
                weekCount: weekCount,
                yearCount: yearCount,
                totalCount: totalCount,
                elapsedSeconds: elapsedSeconds,
                isCompleted: false
            )
            await activity.update(ActivityContent(state: state, staleDate: Date().addingTimeInterval(4 * 60 * 60)))
            resolve(true)
        }
    }

    // MARK: - End

    @objc func endActivity(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else { resolve(NSNull()); return }
        Task {
            await self.endCurrentActivity()
            resolve(true)
        }
    }

    // MARK: - Pending increments (from Lock Screen taps)

    @objc func getPendingIncrements(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        let defaults = UserDefaults(suiteName: kAppGroupID)
        let pending = defaults?.integer(forKey: kPendingKey) ?? 0
        defaults?.set(0, forKey: kPendingKey)
        resolve(pending)
    }

    // MARK: - Complete Quick Chant (shows "Practice complete" state)

    @objc func completeChantActivity(
        _ finalCount: Int,
        elapsedSeconds: Int,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else { resolve(NSNull()); return }

        Task {
            for activity in Activity<KalpxChantAttributes>.activities {
                let current = activity.content.state
                let state = KalpxChantAttributes.ContentState(
                    sessionCount: finalCount,
                    weekCount: current.weekCount,
                    yearCount: current.yearCount,
                    totalCount: current.totalCount,
                    elapsedSeconds: elapsedSeconds,
                    isCompleted: true
                )
                await activity.update(ActivityContent(state: state, staleDate: Date().addingTimeInterval(5 * 60)))
            }
            resolve(true)
        }
    }

    // MARK: - Start Reset

    @objc func startResetActivity(
        _ mantraTitle: String,
        devanagari: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else {
            resolve(NSNull())
            return
        }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            reject("DISABLED", "Live Activities are disabled by user", nil)
            return
        }

        Task {
            await self.endCurrentActivity()
            await self.endCurrentSankalpActivity()
            await self.endCurrentResetActivity()
            await self.endCurrentRhythmActivity()
            await self.endCurrentInnerPathActivity()

            let attrs = KalpxResetAttributes(deepLinkURL: "kalpx://mitra/quick_reset")
            let state = KalpxResetAttributes.ContentState(
                mantraTitle: mantraTitle,
                mantraDevanagari: devanagari
            )

            do {
                let activity = try Activity<KalpxResetAttributes>.request(
                    attributes: attrs,
                    content: ActivityContent(
                        state: state,
                        staleDate: Date().addingTimeInterval(8 * 60)
                    ),
                    pushType: nil
                )
                self.resetActivityID = activity.id
                resolve(activity.id)
            } catch {
                reject("START_FAILED", error.localizedDescription, error)
            }
        }
    }

    // MARK: - End Reset

    @objc func endResetActivity(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else { resolve(NSNull()); return }
        Task {
            await self.endCurrentResetActivity()
            resolve(true)
        }
    }

    // MARK: - Start Sankalp

    @objc func startSankalpActivity(
        _ title: String,
        line: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else {
            resolve(NSNull())
            return
        }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            reject("DISABLED", "Live Activities are disabled by user", nil)
            return
        }

        Task {
            await self.endCurrentSankalpActivity()
            await self.endCurrentResetActivity()
            await self.endCurrentRhythmActivity()
            await self.endCurrentInnerPathActivity()

            let attrs = KalpxSankalpAttributes(title: title, deepLinkURL: self.lastDeepLinkURL)
            let state = KalpxSankalpAttributes.ContentState(line: line)

            do {
                let activity = try Activity<KalpxSankalpAttributes>.request(
                    attributes: attrs,
                    content: ActivityContent(state: state, staleDate: Date().addingTimeInterval(30 * 60)),
                    pushType: nil
                )
                self.sankalpActivityID = activity.id
                resolve(activity.id)
            } catch {
                reject("START_FAILED", error.localizedDescription, error)
            }
        }
    }

    // MARK: - Private

    @available(iOS 16.2, *)
    private func endCurrentActivity() async {
        for activity in Activity<KalpxChantAttributes>.activities {
            await activity.end(dismissalPolicy: .immediate)
        }
        activityID = nil
        saveID(nil, forKey: kActivityIDKey)
    }

    @available(iOS 16.2, *)
    private func endCurrentSankalpActivity() async {
        for activity in Activity<KalpxSankalpAttributes>.activities {
            await activity.end(dismissalPolicy: .immediate)
        }
        sankalpActivityID = nil
    }

    @available(iOS 16.2, *)
    private func endCurrentResetActivity() async {
        for activity in Activity<KalpxResetAttributes>.activities {
            await activity.end(dismissalPolicy: .immediate)
        }
        resetActivityID = nil
    }

    // MARK: - Start Rhythm

    @objc func startRhythmActivity(
        _ band: String,
        bandLabel: String,
        anchorTitle: String,
        anchorType: String,
        anchorDevanagari: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else {
            resolve(NSNull())
            return
        }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            reject("DISABLED", "Live Activities are disabled by user", nil)
            return
        }

        Task {
            await self.endCurrentActivity()
            await self.endCurrentSankalpActivity()
            await self.endCurrentResetActivity()
            await self.endCurrentRhythmActivity()
            await self.endCurrentInnerPathActivity()

            let attrs = KalpxRhythmAttributes(deepLinkURL: "kalpx://mitra/rhythm")
            let state = KalpxRhythmAttributes.ContentState(
                band: band,
                bandLabel: bandLabel,
                anchorTitle: anchorTitle,
                anchorType: anchorType,
                anchorDevanagari: anchorDevanagari,
                bandDone: false
            )

            do {
                let activity = try Activity<KalpxRhythmAttributes>.request(
                    attributes: attrs,
                    content: ActivityContent(
                        state: state,
                        staleDate: Date().addingTimeInterval(5 * 60 * 60)
                    ),
                    pushType: nil
                )
                self.rhythmActivityID = activity.id
                self.saveID(activity.id, forKey: kRhythmIDKey)
                resolve(activity.id)
            } catch {
                reject("START_FAILED", error.localizedDescription, error)
            }
        }
    }

    // MARK: - Update Rhythm

    @objc func updateRhythmActivity(
        _ bandDone: Bool,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else { resolve(NSNull()); return }
        guard let id = rhythmActivityID,
              let activity = Activity<KalpxRhythmAttributes>.activities.first(where: { $0.id == id })
        else { resolve(NSNull()); return }

        Task {
            let current = activity.content.state
            let state = KalpxRhythmAttributes.ContentState(
                band: current.band,
                bandLabel: current.bandLabel,
                anchorTitle: current.anchorTitle,
                anchorType: current.anchorType,
                anchorDevanagari: current.anchorDevanagari,
                bandDone: bandDone
            )
            await activity.update(ActivityContent(state: state, staleDate: Date().addingTimeInterval(5 * 60 * 60)))
            resolve(true)
        }
    }

    // MARK: - End Rhythm

    @objc func endRhythmActivity(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else { resolve(NSNull()); return }
        Task {
            await self.endCurrentRhythmActivity()
            resolve(true)
        }
    }

    // MARK: - Start Inner Path

    @objc func startInnerPathActivity(
        _ dayNumber: Int,
        totalDays: Int,
        mantraTitle: String,
        mantraDevanagari: String,
        sankalpTitle: String,
        practiceTitle: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else {
            resolve(NSNull())
            return
        }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            reject("DISABLED", "Live Activities are disabled by user", nil)
            return
        }

        Task {
            await self.endCurrentActivity()
            await self.endCurrentSankalpActivity()
            await self.endCurrentResetActivity()
            await self.endCurrentRhythmActivity()
            await self.endCurrentInnerPathActivity()

            let attrs = KalpxInnerPathAttributes(deepLinkURL: "kalpx://mitra/inner_path")
            let state = KalpxInnerPathAttributes.ContentState(
                dayNumber: dayNumber,
                totalDays: totalDays,
                mantraTitle: mantraTitle,
                mantraDevanagari: mantraDevanagari,
                sankalpTitle: sankalpTitle,
                practiceTitle: practiceTitle,
                mantraDone: false,
                sankalpDone: false,
                practiceDone: false
            )

            do {
                let activity = try Activity<KalpxInnerPathAttributes>.request(
                    attributes: attrs,
                    content: ActivityContent(
                        state: state,
                        staleDate: Date().addingTimeInterval(3 * 60 * 60)
                    ),
                    pushType: nil
                )
                self.innerPathActivityID = activity.id
                self.saveID(activity.id, forKey: kInnerPathIDKey)
                resolve(activity.id)
            } catch {
                reject("START_FAILED", error.localizedDescription, error)
            }
        }
    }

    // MARK: - Update Inner Path

    @objc func updateInnerPathActivity(
        _ mantraDone: Bool,
        sankalpDone: Bool,
        practiceDone: Bool,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else { resolve(NSNull()); return }
        guard let id = innerPathActivityID,
              let activity = Activity<KalpxInnerPathAttributes>.activities.first(where: { $0.id == id })
        else { resolve(NSNull()); return }

        Task {
            let current = activity.content.state
            let state = KalpxInnerPathAttributes.ContentState(
                dayNumber: current.dayNumber,
                totalDays: current.totalDays,
                mantraTitle: current.mantraTitle,
                mantraDevanagari: current.mantraDevanagari,
                sankalpTitle: current.sankalpTitle,
                practiceTitle: current.practiceTitle,
                mantraDone: mantraDone,
                sankalpDone: sankalpDone,
                practiceDone: practiceDone
            )
            await activity.update(ActivityContent(state: state, staleDate: Date().addingTimeInterval(3 * 60 * 60)))
            resolve(true)
        }
    }

    // MARK: - End Inner Path

    @objc func endInnerPathActivity(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else { resolve(NSNull()); return }
        Task {
            await self.endCurrentInnerPathActivity()
            resolve(true)
        }
    }

    // MARK: - Private

    @available(iOS 16.2, *)
    private func endCurrentRhythmActivity() async {
        for activity in Activity<KalpxRhythmAttributes>.activities {
            await activity.end(dismissalPolicy: .immediate)
        }
        rhythmActivityID = nil
        saveID(nil, forKey: kRhythmIDKey)
    }

    @available(iOS 16.2, *)
    private func endCurrentInnerPathActivity() async {
        for activity in Activity<KalpxInnerPathAttributes>.activities {
            await activity.end(dismissalPolicy: .immediate)
        }
        innerPathActivityID = nil
        saveID(nil, forKey: kInnerPathIDKey)
    }

    @objc static func requiresMainQueueSetup() -> Bool { false }
}
