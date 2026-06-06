import Foundation
import WatchConnectivity

// TurboModule bridge for WatchConnectivity.
// Follows the exact same pattern as KalpxLiveActivityModule.swift.
// DO NOT modify KalpxLiveActivityModule — this is a separate, additive module.

@objc(KalpxWatchConnectivityModule)
class KalpxWatchConnectivityModule: RCTEventEmitter {

    private var hasListeners = false

    override init() {
        super.init()
        let manager = WatchConnectivityManager.shared
        manager.onMessageReceived = { [weak self] message in
            guard let self, self.hasListeners else { return }
            self.sendEvent(withName: "watchMessage", body: message)
        }
        manager.onReachabilityChanged = { [weak self] reachable in
            guard let self, self.hasListeners else { return }
            self.sendEvent(withName: "watchReachabilityChanged", body: reachable)
        }
    }

    // Activate WCSession — called once from watchConnectivity.ts on app start
    @objc func setup() {
        WatchConnectivityManager.shared.activate()
    }

    // Send message to Watch — uses sendMessage with transferUserInfo fallback
    @objc func sendToWatch(
        _ message: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        WatchConnectivityManager.shared.sendToWatch(message as! [String: Any]) { error in
            if let error {
                reject("SEND_FAILED", error.localizedDescription, error)
            } else {
                resolve(nil)
            }
        }
    }

    @objc func isWatchReachable(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject _: @escaping RCTPromiseRejectBlock
    ) {
        resolve(WCSession.isSupported() && WCSession.default.isReachable)
    }

    // Push mantras via WCSession applicationContext — works without isWatchAppInstalled.
    // Delivered to Watch on next session activation (simulator + device).
    @objc func pushMantrasViaContext(
        _ mantras: NSArray,
        resolve: @escaping RCTPromiseResolveBlock,
        reject _: @escaping RCTPromiseRejectBlock
    ) {
        let raw = mantras as? [[String: Any]] ?? []
        WatchConnectivityManager.shared.pushMantrasViaContext(raw)
        resolve(true)
    }

    // Write mantras directly to shared app group — Watch reads on every launch.
    // More reliable than WatchConnectivity for initial data delivery.
    @objc func writeMantrasToAppGroup(
        _ mantras: NSArray,
        resolve: @escaping RCTPromiseResolveBlock,
        reject _: @escaping RCTPromiseRejectBlock
    ) {
        let defaults = UserDefaults(suiteName: KalpxAppGroupKeys.groupID)
        guard let data = try? JSONSerialization.data(withJSONObject: mantras) else {
            resolve(false); return
        }
        defaults?.set(data, forKey: "kalpx_watch_mantras")
        resolve(true)
    }

    // Push pathData via applicationContext — merges with mantras so both survive.
    // Most reliable delivery for simulator; also works on device without app group race.
    @objc func pushPathDataViaContext(
        _ pathData: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject _: @escaping RCTPromiseRejectBlock
    ) {
        let raw = pathData as! [String: Any]
        WatchConnectivityManager.shared.pushPathDataViaContext(raw)
        resolve(true)
    }

    // Write structured path data (inner path + rhythm + checkin) to app group.
    // Watch reads this on every launch to render the home list.
    @objc func writePathDataToAppGroup(
        _ pathData: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject _: @escaping RCTPromiseRejectBlock
    ) {
        let defaults = UserDefaults(suiteName: KalpxAppGroupKeys.groupID)
        guard let data = try? JSONSerialization.data(withJSONObject: pathData) else {
            resolve(false); return
        }
        defaults?.set(data, forKey: KalpxAppGroupKeys.watchPathData)
        resolve(true)
    }

    // Write today's japa count from iPhone homeData to app group for Watch complications.
    // iPhone calls this on homeData load. Watch accumulates from its own sessions on top.
    @objc func writeTodayStatsToAppGroup(
        _ stats: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject _: @escaping RCTPromiseRejectBlock
    ) {
        let defaults = UserDefaults(suiteName: KalpxAppGroupKeys.groupID)
        if let count = stats["todayJapaCount"] as? Int {
            defaults?.set(count, forKey: KalpxAppGroupKeys.todayJapaCount)
        }
        if let ipRaw = stats["innerPathToday"] {
            if let data = try? JSONSerialization.data(withJSONObject: ipRaw) {
                defaults?.set(data, forKey: KalpxAppGroupKeys.innerPathToday)
            }
        }
        resolve(true)
    }

    // MARK: - RCTEventEmitter

    override func startObserving()  { hasListeners = true  }
    override func stopObserving()   { hasListeners = false }

    override func supportedEvents() -> [String] {
        ["watchMessage", "watchReachabilityChanged"]
    }

    @objc override static func requiresMainQueueSetup() -> Bool { false }
}
