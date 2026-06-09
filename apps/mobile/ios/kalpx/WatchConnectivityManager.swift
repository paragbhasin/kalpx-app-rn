import ActivityKit
import Foundation
import WatchConnectivity

// iPhone-side WCSession manager. Singleton activated at app startup.
// Handles all Watch→iPhone messages natively — including Live Activity updates
// that must bypass the RN bridge (which may be suspended when iPhone is backgrounded).

class WatchConnectivityManager: NSObject, WCSessionDelegate {
    static let shared = WatchConnectivityManager()

    // Callbacks forwarded to KalpxWatchConnectivityModule → React Native
    var onMessageReceived: (([String: Any]) -> Void)?
    var onReachabilityChanged: ((Bool) -> Void)?

    private override init() { super.init() }

    func activate() {
        guard WCSession.isSupported() else { return }
        WCSession.default.delegate = self
        WCSession.default.activate()
    }

    // MARK: - Send to Watch

    // Push mantras via applicationContext — works even when isWatchAppInstalled = false.
    // The Watch reads this on every session activation, making it the most reliable
    // initial-delivery path on both simulator and device.
    func pushMantrasViaContext(_ mantras: [[String: Any]]) {
        guard WCSession.default.activationState == .activated else { return }
        // Merge with existing context so pathData key is not overwritten
        var context = WCSession.default.applicationContext
        context["mantras"] = mantras
        do {
            try WCSession.default.updateApplicationContext(context)
            NSLog("[WCSession] applicationContext updated with %d mantras", mantras.count)
        } catch {
            NSLog("[WCSession] updateApplicationContext failed: %@", error.localizedDescription)
        }
    }

    // Push pathData via applicationContext — merges with existing mantras key so both survive.
    // Most reliable delivery to Watch on simulator (works without isWatchAppInstalled).
    func pushPathDataViaContext(_ pathData: [String: Any]) {
        guard WCSession.default.activationState == .activated else { return }
        // WCSession rejects NSNull (JS null) — strip before sending
        let sanitized = stripNulls(pathData)
        var context = WCSession.default.applicationContext
        context["pathData"] = sanitized
        do {
            try WCSession.default.updateApplicationContext(context)
            NSLog("[WCSession] applicationContext updated with pathData keys=%@", sanitized.keys.joined(separator: ","))
        } catch {
            NSLog("[WCSession] updateApplicationContext(pathData) failed: %@", error.localizedDescription)
        }
    }

    func sendToWatch(_ message: [String: Any], completion: ((Error?) -> Void)? = nil) {
        let session = WCSession.default
        NSLog("[WCSession] sendToWatch: state=%d paired=%d installed=%d reachable=%d type=%@",
              session.activationState.rawValue,
              session.isPaired ? 1 : 0,
              session.isWatchAppInstalled ? 1 : 0,
              session.isReachable ? 1 : 0,
              (message["type"] as? String) ?? "?")
        guard session.activationState == .activated else {
            completion?(nil)
            return
        }
        // WCSession rejects NSNull — strip from entire message before sending
        let safeMessage = stripNulls(message)
        if session.isReachable {
            session.sendMessage(safeMessage, replyHandler: nil) { error in
                NSLog("[WCSession] sendMessage failed: %@, trying transferUserInfo", error.localizedDescription)
                session.transferUserInfo(safeMessage)
                completion?(nil)
            }
        } else {
            // Not reachable — queue for background delivery
            session.transferUserInfo(safeMessage)
            completion?(nil)
        }
    }

    // Recursively remove NSNull values so WCSession plist encoding never rejects the payload.
    // Swift Codable optional fields decode as nil when the key is absent — safe to drop nulls.
    private func stripNulls(_ dict: [String: Any]) -> [String: Any] {
        var result: [String: Any] = [:]
        for (key, value) in dict {
            if value is NSNull { continue }
            if let nested = value as? [String: Any] {
                result[key] = stripNulls(nested)
            } else if let arr = value as? [[String: Any]] {
                result[key] = arr.map { stripNulls($0) }
            } else {
                result[key] = value
            }
        }
        return result
    }

    // MARK: - Receive from Watch

    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        handle(message)
    }

    func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any]) {
        handle(userInfo)
    }

    private func handle(_ message: [String: Any]) {
        guard let type = message["type"] as? String else { return }

        // Native fallback: Watch asked for mantras — serve from app group immediately,
        // no RN bridge needed. RN will also get this and can push fresh data on top.
        if type == "request_mantras" {
            if let cached = cachedMantrasFromAppGroup() {
                sendToWatch(["type": "mantra_list", "mantras": cached])
            }
        }

        // Update Live Activity natively — does not go through RN bridge
        if #available(iOS 16.2, *) {
            switch type {
            case "japa_sync_batch":    nativeUpdateLiveActivity(message)
            case "japa_session_complete": nativeCompleteLiveActivity(message)
            default: break
            }
        }

        // Forward to RN for Redux state and backend sync (when bridge is active)
        DispatchQueue.main.async {
            self.onMessageReceived?(message)
        }
    }

    private func cachedMantrasFromAppGroup() -> [[String: String]]? {
        guard let defaults = UserDefaults(suiteName: "group.com.kalpx.app"),
              let data = defaults.data(forKey: "kalpx_watch_mantras"),
              let raw = try? JSONSerialization.jsonObject(with: data) as? [[String: String]],
              !raw.isEmpty
        else { return nil }
        return raw
    }

    // MARK: - Native Live Activity (bypasses RN bridge)

    @available(iOS 16.2, *)
    private func nativeUpdateLiveActivity(_ message: [String: Any]) {
        let sessionCount   = message["cumulativeCount"] as? Int ?? 0
        let elapsedSeconds = message["elapsedSeconds"]  as? Int ?? 0
        Task {
            for activity in Activity<KalpxChantAttributes>.activities {
                let cur   = activity.content.state
                let state = KalpxChantAttributes.ContentState(
                    sessionCount:   sessionCount,
                    weekCount:      cur.weekCount,
                    yearCount:      cur.yearCount,
                    totalCount:     cur.totalCount,
                    elapsedSeconds: elapsedSeconds,
                    isCompleted:    false
                )
                await activity.update(ActivityContent(state: state, staleDate: nil))
            }
        }
    }

    @available(iOS 16.2, *)
    private func nativeCompleteLiveActivity(_ message: [String: Any]) {
        let finalCount     = message["finalCount"]      as? Int ?? 0
        let elapsedSeconds = message["elapsedSeconds"]  as? Int ?? 0
        Task {
            for activity in Activity<KalpxChantAttributes>.activities {
                let cur   = activity.content.state
                let state = KalpxChantAttributes.ContentState(
                    sessionCount:   finalCount,
                    weekCount:      cur.weekCount,
                    yearCount:      cur.yearCount,
                    totalCount:     cur.totalCount,
                    elapsedSeconds: elapsedSeconds,
                    isCompleted:    true
                )
                await activity.update(ActivityContent(state: state, staleDate: nil))
            }
        }
    }

    // MARK: - WCSessionDelegate

    func session(_ session: WCSession,
                 activationDidCompleteWith state: WCSessionActivationState,
                 error: Error?) {}

    func sessionDidBecomeInactive(_ session: WCSession) {}

    func sessionDidDeactivate(_ session: WCSession) {
        WCSession.default.activate()
    }

    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async {
            self.onReachabilityChanged?(session.isReachable)
        }
    }
}
