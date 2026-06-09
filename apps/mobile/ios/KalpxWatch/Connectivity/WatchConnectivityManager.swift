import Foundation
import WatchConnectivity

// Watch-side WCSession singleton. Activated at app startup.
// Handles sending sync batches to iPhone and receiving server session IDs back.

class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
    static let shared = WatchConnectivityManager()

    @Published var isPhoneReachable = false
    @Published var mantras: [CuratedMantra]? = WatchAppGroupStorage.shared.loadMantras()
    @Published var pathData: WatchPathData? = WatchAppGroupStorage.shared.loadPathData()

    var onMessageReceived: (([String: Any]) -> Void)?
    var onReachabilityChanged: ((Bool) -> Void)?

    private override init() { super.init() }

    func activate() {
        guard WCSession.isSupported() else { return }
        WCSession.default.delegate = self
        WCSession.default.activate()
    }

    func reloadMantras() {
        let loaded = WatchAppGroupStorage.shared.loadMantras()
        DispatchQueue.main.async { self.mantras = loaded }
    }

    func reloadPathData() {
        let loaded = WatchAppGroupStorage.shared.loadPathData()
        DispatchQueue.main.async { self.pathData = loaded }
    }

    // MARK: - Send to iPhone

    func sendToPhone(_ message: [String: Any], isCritical: Bool = false) {
        let session = WCSession.default
        guard session.activationState == .activated else { return }

        if !isCritical && session.isReachable {
            session.sendMessage(message, replyHandler: nil) { _ in
                session.transferUserInfo(message)
            }
        } else {
            session.transferUserInfo(message)
        }
    }

    // MARK: - WCSessionDelegate

    func session(_ session: WCSession,
                 activationDidCompleteWith state: WCSessionActivationState,
                 error: Error?) {
        DispatchQueue.main.async {
            self.isPhoneReachable = session.isReachable

            // 1. App group — device-reliable, instant
            if let fromAppGroup = WatchAppGroupStorage.shared.loadMantras() {
                self.mantras = fromAppGroup
            }
            if let pd = WatchAppGroupStorage.shared.loadPathData() {
                self.pathData = pd
            }

            // 2. applicationContext — works on simulator without isWatchAppInstalled
            let ctx = session.receivedApplicationContext
            if let rawAny = ctx["mantras"] as? [[String: Any]], !rawAny.isEmpty {
                let raw = rawAny.map { self.stringifyDict($0) }
                WatchAppGroupStorage.shared.saveMantras(raw)
                self.mantras = WatchAppGroupStorage.shared.loadMantras()
            }
            if let pdRaw = ctx["pathData"] as? [String: Any] {
                self.applyPathData(pdRaw)
            }

            // 3. Always request fresh data from iPhone on activation
            //    (ensures updated catalog fields like iast/devanagari are reflected)
            self.requestMantrasFromPhone()
        }
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        if let rawAny = applicationContext["mantras"] as? [[String: Any]], !rawAny.isEmpty {
            let raw = rawAny.map { self.stringifyDict($0) }
            WatchAppGroupStorage.shared.saveMantras(raw)
            let updated = WatchAppGroupStorage.shared.loadMantras()
            DispatchQueue.main.async { self.mantras = updated }
        }
        if let pdRaw = applicationContext["pathData"] as? [String: Any] {
            applyPathData(pdRaw)
        }
    }

    func requestMantrasFromPhone() {
        sendToPhone(["type": "request_path_data"])
    }

    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async {
            self.isPhoneReachable = session.isReachable
            self.onReachabilityChanged?(session.isReachable)
        }
    }

    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        handle(message)
    }

    func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any]) {
        handle(userInfo)
    }

    // MARK: - Private

    private func handle(_ message: [String: Any]) {
        guard let type = message["type"] as? String else {
            DispatchQueue.main.async { self.onMessageReceived?(message) }
            return
        }

        switch type {
        case "mantra_list":
            if let rawAny = message["mantras"] as? [[String: Any]], !rawAny.isEmpty {
                let raw = rawAny.map { self.stringifyDict($0) }
                WatchAppGroupStorage.shared.saveMantras(raw)
                let updated = WatchAppGroupStorage.shared.loadMantras()
                DispatchQueue.main.async { self.mantras = updated }
            }

        case "path_data":
            if let payload = message["payload"] as? [String: Any] {
                applyPathData(payload)
            }

        default:
            break
        }

        DispatchQueue.main.async { self.onMessageReceived?(message) }
    }

    private func applyPathData(_ raw: [String: Any]) {
        NSLog("[WatchPath-Watch] applyPathData: raw keys = %@", raw.keys.joined(separator: ","))
        guard let jsonData = try? JSONSerialization.data(withJSONObject: raw) else {
            NSLog("[WatchPath-Watch] applyPathData: JSONSerialization failed")
            return
        }
        let rawStr = String(data: jsonData, encoding: .utf8) ?? "non-utf8"
        NSLog("[WatchPath-Watch] applyPathData: json = %@", rawStr)
        do {
            let decoded = try JSONDecoder().decode(WatchPathData.self, from: jsonData)
            NSLog("[WatchPath-Watch] applyPathData: decoded OK — innerPath=%@, rhythm=%@",
                  decoded.innerPath != nil ? "yes(hasActivePath=\(decoded.innerPath!.hasActivePath))" : "nil",
                  decoded.rhythm    != nil ? "yes(hasRhythm=\(decoded.rhythm!.hasRhythm))" : "nil")

            // Don't overwrite richer existing data with a partial push.
            // This prevents a slow applicationContext delivery from downgrading
            // a full pathData that arrived earlier via sendMessage.
            let existing = WatchAppGroupStorage.shared.loadPathData()
            let wouldLoseInnerPath = decoded.innerPath == nil && existing?.innerPath?.hasActivePath == true
            let wouldLoseRhythm   = decoded.rhythm    == nil && existing?.rhythm?.hasRhythm        == true
            if wouldLoseInnerPath || wouldLoseRhythm {
                NSLog("[WatchPath-Watch] applyPathData: SKIP — would downgrade existing data (innerPath=%@, rhythm=%@)",
                      wouldLoseInnerPath ? "would lose" : "ok",
                      wouldLoseRhythm   ? "would lose" : "ok")
                return
            }

            WatchAppGroupStorage.shared.savePathData(decoded)
            DispatchQueue.main.async { self.pathData = decoded }
        } catch {
            NSLog("[WatchPath-Watch] applyPathData: DECODE FAILED: %@", error.localizedDescription)
        }
    }

    // Convert [String: Any] → [String: String], dropping non-string values.
    // Needed because WCSession delivers mantra dicts as [[String: Any]] over plist.
    private func stringifyDict(_ dict: [String: Any]) -> [String: String] {
        var result: [String: String] = [:]
        for (key, value) in dict {
            if let s = value as? String { result[key] = s }
        }
        return result
    }
}
