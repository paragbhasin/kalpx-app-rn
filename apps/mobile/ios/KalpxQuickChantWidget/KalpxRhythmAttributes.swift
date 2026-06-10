import ActivityKit
import Foundation

struct KalpxRhythmAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var band: String
        var bandLabel: String
        var anchorTitle: String
        var anchorType: String
        var anchorDevanagari: String
        var bandDone: Bool
    }

    var deepLinkURL: String

    enum CodingKeys: String, CodingKey {
        case deepLinkURL
    }

    init(deepLinkURL: String) {
        self.deepLinkURL = deepLinkURL
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        deepLinkURL = (try? c.decode(String.self, forKey: .deepLinkURL)) ?? "kalpx://mitra/rhythm"
    }
}
