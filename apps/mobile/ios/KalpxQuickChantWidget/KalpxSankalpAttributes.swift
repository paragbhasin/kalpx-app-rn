import ActivityKit
import Foundation

struct KalpxSankalpAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var line: String
    }

    var title: String
    var deepLinkURL: String

    enum CodingKeys: String, CodingKey {
        case title, deepLinkURL
    }

    init(title: String, deepLinkURL: String) {
        self.title = title
        self.deepLinkURL = deepLinkURL
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        title       = try c.decode(String.self, forKey: .title)
        deepLinkURL = (try? c.decode(String.self, forKey: .deepLinkURL)) ?? "kalpx://mitra/quick_chant/home"
    }
}
