import ActivityKit
import Foundation

struct KalpxInnerPathAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var dayNumber: Int
        var totalDays: Int
        var mantraTitle: String
        var mantraDevanagari: String
        var sankalpTitle: String
        var practiceTitle: String
        var mantraDone: Bool
        var sankalpDone: Bool
        var practiceDone: Bool
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
        deepLinkURL = (try? c.decode(String.self, forKey: .deepLinkURL)) ?? "kalpx://mitra/inner_path"
    }
}
