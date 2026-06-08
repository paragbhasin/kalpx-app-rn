import ActivityKit
import Foundation

struct KalpxChantAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var sessionCount: Int
        var weekCount: Int
        var yearCount: Int
        var totalCount: Int
        var elapsedSeconds: Int
        var isCompleted: Bool
    }

    var mantraName: String
    var mantraDevanagari: String
    var deepLinkURL: String

    // Custom decoder so activities started before deepLinkURL was added still decode
    enum CodingKeys: String, CodingKey {
        case mantraName, mantraDevanagari, deepLinkURL
    }

    init(mantraName: String, mantraDevanagari: String, deepLinkURL: String) {
        self.mantraName = mantraName
        self.mantraDevanagari = mantraDevanagari
        self.deepLinkURL = deepLinkURL
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        mantraName       = try c.decode(String.self, forKey: .mantraName)
        mantraDevanagari = try c.decode(String.self, forKey: .mantraDevanagari)
        deepLinkURL      = (try? c.decode(String.self, forKey: .deepLinkURL)) ?? "kalpx://mitra/quick_chant/home"
    }
}
