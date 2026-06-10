import ActivityKit
import Foundation

struct KalpxResetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var mantraTitle: String
        var mantraDevanagari: String
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
        deepLinkURL = (try? c.decode(String.self, forKey: .deepLinkURL)) ?? "kalpx://mitra/quick_reset"
    }
}
