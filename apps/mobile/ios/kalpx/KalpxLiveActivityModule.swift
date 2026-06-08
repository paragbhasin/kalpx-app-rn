import ActivityKit
import Foundation

private let kAppGroupID = "group.com.kalpx.app"
private let kPendingKey = "kalpx_pending_chant_increments"

@objc(KalpxLiveActivityModule)
class KalpxLiveActivityModule: NSObject {

    private var activityID: String?
    private var sankalpActivityID: String?
    private var lastDeepLinkURL: String = "kalpx://mitra/quick_chant/home"

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
                    content: ActivityContent(state: state, staleDate: nil),
                    pushType: nil
                )
                self.activityID = activity.id
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
            await activity.update(ActivityContent(state: state, staleDate: nil))
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
                await activity.update(ActivityContent(state: state, staleDate: nil))
            }
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

            let attrs = KalpxSankalpAttributes(title: title, deepLinkURL: self.lastDeepLinkURL)
            let state = KalpxSankalpAttributes.ContentState(line: line)

            do {
                let activity = try Activity<KalpxSankalpAttributes>.request(
                    attributes: attrs,
                    content: ActivityContent(state: state, staleDate: nil),
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
    }

    @available(iOS 16.2, *)
    private func endCurrentSankalpActivity() async {
        for activity in Activity<KalpxSankalpAttributes>.activities {
            await activity.end(dismissalPolicy: .immediate)
        }
        sankalpActivityID = nil
    }

    @objc static func requiresMainQueueSetup() -> Bool { false }
}
