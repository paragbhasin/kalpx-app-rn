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
            if let raw = ctx["mantras"] as? [[String: String]], !raw.isEmpty {
                WatchAppGroupStorage.shared.saveMantras(raw)
                self.mantras = WatchAppGroupStorage.shared.loadMantras()
            }
            if let pdRaw = ctx["pathData"] as? [String: Any] {
                self.applyPathData(pdRaw)
            }

            // 3. Request from iPhone if either mantras or pathData is missing
            if self.mantras == nil || self.pathData == nil {
                self.requestMantrasFromPhone()
            }
        }
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        if let raw = applicationContext["mantras"] as? [[String: String]], !raw.isEmpty {
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
            if let raw = message["mantras"] as? [[String: String]] {
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
            WatchAppGroupStorage.shared.savePathData(decoded)
            DispatchQueue.main.async { self.pathData = decoded }
        } catch {
            NSLog("[WatchPath-Watch] applyPathData: DECODE FAILED: %@", error.localizedDescription)
        }
    }
}
