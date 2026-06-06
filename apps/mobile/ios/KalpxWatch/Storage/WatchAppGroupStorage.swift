import Foundation

class WatchAppGroupStorage {
    static let shared = WatchAppGroupStorage()

    private let defaults: UserDefaults?
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    private init() {
        defaults = UserDefaults(suiteName: KalpxAppGroupKeys.groupID)
    }

    // MARK: - Current session (crash recovery)

    func saveCurrentSession(_ session: WatchLocalSession) {
        guard let data = try? encoder.encode(session) else { return }
        defaults?.set(data, forKey: KalpxAppGroupKeys.watchCurrentSession)
    }

    func loadCurrentSession() -> WatchLocalSession? {
        guard let data = defaults?.data(forKey: KalpxAppGroupKeys.watchCurrentSession),
              let session = try? decoder.decode(WatchLocalSession.self, from: data)
        else { return nil }
        return session
    }

    func clearCurrentSession() {
        defaults?.removeObject(forKey: KalpxAppGroupKeys.watchCurrentSession)
    }

    // MARK: - Mantras (pushed from iPhone after login)

    func saveMantras(_ mantras: [[String: String]]) {
        guard let data = try? JSONSerialization.data(withJSONObject: mantras) else { return }
        defaults?.set(data, forKey: "kalpx_watch_mantras")
    }

    // Returns nil when not logged in — Watch shows "Open iPhone" screen instead
    func loadMantras() -> [CuratedMantra]? {
        guard let data = defaults?.data(forKey: "kalpx_watch_mantras"),
              let raw  = try? JSONSerialization.jsonObject(with: data) as? [[String: String]]
        else { return nil }

        let result = raw.enumerated().compactMap { i, dict -> CuratedMantra? in
            guard let ref  = dict["ref"],
                  let name = dict["name"] else { return nil }
            return CuratedMantra(
                id:         "\(i)",
                ref:        ref,
                name:       name,
                devanagari: dict["devanagari"] ?? "",
                label:      dict["label"]
            )
        }
        return result.isEmpty ? nil : result
    }

    func clearMantras() {
        defaults?.removeObject(forKey: "kalpx_watch_mantras")
    }

    // MARK: - Sankalp (written by iPhone app)

    func loadSankalp() -> (title: String, line: String)? {
        guard let dict  = defaults?.dictionary(forKey: KalpxAppGroupKeys.sankalpToday),
              let title = dict["title"] as? String,
              let line  = dict["line"]  as? String
        else { return nil }
        return (title, line)
    }

    // MARK: - Path data (written by iPhone on homeData load)

    func savePathData(_ pathData: WatchPathData) {
        guard let data = try? encoder.encode(pathData) else { return }
        defaults?.set(data, forKey: KalpxAppGroupKeys.watchPathData)
    }

    func loadPathData() -> WatchPathData? {
        guard let data = defaults?.data(forKey: KalpxAppGroupKeys.watchPathData),
              let pathData = try? decoder.decode(WatchPathData.self, from: data)
        else { return nil }
        return pathData
    }

    // MARK: - Today's japa count (accumulates across sessions; reset by iPhone on new day)

    func addTodayJapaCount(_ delta: Int) {
        let current = defaults?.integer(forKey: KalpxAppGroupKeys.todayJapaCount) ?? 0
        defaults?.set(current + delta, forKey: KalpxAppGroupKeys.todayJapaCount)
    }

    func loadTodayJapaCount() -> Int {
        defaults?.integer(forKey: KalpxAppGroupKeys.todayJapaCount) ?? 0
    }
}
