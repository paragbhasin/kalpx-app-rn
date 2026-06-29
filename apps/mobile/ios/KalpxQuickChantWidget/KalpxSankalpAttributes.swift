import ActivityKit
import Foundation

struct KalpxSankalpAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var line: String
    }

    var title: String
    var deepLinkURL: String
    /// "sankalp" or "practice" — drives the lock-screen and DI label copy.
    var anchorType: String

    enum CodingKeys: String, CodingKey {
        case title, deepLinkURL, anchorType
    }

    init(title: String, deepLinkURL: String, anchorType: String = "sankalp") {
        self.title = title
        self.deepLinkURL = deepLinkURL
        self.anchorType = anchorType
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        title      = try c.decode(String.self, forKey: .title)
        deepLinkURL = (try? c.decode(String.self, forKey: .deepLinkURL)) ?? "kalpx://mitra/quick_chant/home?source=la"
        anchorType  = (try? c.decode(String.self, forKey: .anchorType)) ?? "sankalp"
    }
}
