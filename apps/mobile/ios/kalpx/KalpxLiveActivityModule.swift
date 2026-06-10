import Foundation
import ActivityKit

@objc(KalpxLiveActivityModule)
class KalpxLiveActivityModule: NSObject {

    // Typed as Any? to avoid @available requirement at stored-property level.
    // Cast to Activity<...> inside #available blocks.
    private var chantActivity: Any?
    private var sankalpActivity: Any?

    @objc static func requiresMainQueueSetup() -> Bool { false }

    // MARK: - Quick Chant

    @objc func startActivity(
        _ mantraName: String,
        devanagari: String,
        params: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else { resolve(NSNull()); return }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            reject("UNAVAILABLE", "Live Activities not enabled", nil); return
        }
        let sessionCount  = params["sessionCount"]  as? Int ?? 0
        let weekCount     = params["weekCount"]     as? Int ?? 0
        let yearCount     = params["yearCount"]     as? Int ?? 0
        let totalCount    = params["totalCount"]    as? Int ?? 0
        let elapsedSeconds = params["elapsedSeconds"] as? Int ?? 0
        let deepLink      = params["deepLinkURL"]   as? String ?? "kalpx://mitra/quick_chant/home"

        let attributes = KalpxChantAttributes(
            mantraName: mantraName,
            mantraDevanagari: devanagari,
            deepLinkURL: deepLink
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
            let activity: Activity<KalpxChantAttributes> = try Activity.request(
                attributes: attributes,
                contentState: state,
                pushType: nil
            )
            chantActivity = activity
            resolve(activity.id)
        } catch {
            reject("START_FAILED", error.localizedDescription, error)
        }
    }

    @objc func updateActivity(
        _ params: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else { resolve(NSNull()); return }
        guard let activity = chantActivity as? Activity<KalpxChantAttributes> else { resolve(NSNull()); return }
        let sessionCount   = params["sessionCount"]   as? Int ?? 0
        let weekCount      = params["weekCount"]      as? Int ?? 0
        let yearCount      = params["yearCount"]      as? Int ?? 0
        let totalCount     = params["totalCount"]     as? Int ?? 0
        let elapsedSeconds = params["elapsedSeconds"] as? Int ?? 0
        let newState = KalpxChantAttributes.ContentState(
            sessionCount: sessionCount,
            weekCount: weekCount,
            yearCount: yearCount,
            totalCount: totalCount,
            elapsedSeconds: elapsedSeconds,
            isCompleted: false
        )
        Task {
            await activity.update(using: newState)
            resolve(nil)
        }
    }

    @objc func completeChantActivity(
        _ finalCount: Int,
        elapsedSeconds: Double,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else { resolve(NSNull()); return }
        guard let activity = chantActivity as? Activity<KalpxChantAttributes> else { resolve(NSNull()); return }
        let completedState = KalpxChantAttributes.ContentState(
            sessionCount: finalCount,
            weekCount: 0,
            yearCount: 0,
            totalCount: 0,
            elapsedSeconds: Int(elapsedSeconds),
            isCompleted: true
        )
        Task {
            await activity.update(using: completedState)
            try? await Task.sleep(nanoseconds: 3_000_000_000)
            await activity.end(using: completedState, dismissalPolicy: .after(Date().addingTimeInterval(5)))
            chantActivity = nil
            resolve(nil)
        }
    }

    @objc func endActivity(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else { resolve(NSNull()); return }
        if let activity = chantActivity as? Activity<KalpxChantAttributes> {
            Task {
                await activity.end(dismissalPolicy: .immediate)
                chantActivity = nil
            }
        }
        if let activity = sankalpActivity as? Activity<KalpxSankalpAttributes> {
            Task {
                await activity.end(dismissalPolicy: .immediate)
                sankalpActivity = nil
            }
        }
        resolve(nil)
    }

    // MARK: - Sankalp

    @objc func startSankalpActivity(
        _ title: String,
        line: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard #available(iOS 16.2, *) else { resolve(NSNull()); return }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            reject("UNAVAILABLE", "Live Activities not enabled", nil); return
        }
        let attributes = KalpxSankalpAttributes(
            title: title,
            deepLinkURL: "kalpx://mitra/quick_chant/home"
        )
        let state = KalpxSankalpAttributes.ContentState(line: line)
        do {
            let activity: Activity<KalpxSankalpAttributes> = try Activity.request(
                attributes: attributes,
                contentState: state,
                pushType: nil
            )
            sankalpActivity = activity
            resolve(activity.id)
        } catch {
            reject("START_SANKALP_FAILED", error.localizedDescription, error)
        }
    }

    // MARK: - Widget increment queue (AppGroup shared)

    @objc func getPendingIncrements(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        let appGroupID = "group.com.kalpx.app"
        let defaults = UserDefaults(suiteName: appGroupID)
        let count = defaults?.integer(forKey: "pendingChantIncrements") ?? 0
        if count > 0 {
            defaults?.set(0, forKey: "pendingChantIncrements")
        }
        resolve(count)
    }
}
