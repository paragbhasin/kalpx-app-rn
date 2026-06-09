import SwiftUI

struct KalpXWatchTheme {
    static let background    = Color(hex: "12100C")
    static let surface       = Color(hex: "211A14")
    static let elevated      = Color(hex: "30261C")
    static let textPrimary   = Color(hex: "F4E8D3")
    static let textSecondary = Color(hex: "B8AA96")
    static let textTertiary  = Color(hex: "827464")
    static let gold          = Color(hex: "D1A64A")
    static let goldSoft      = Color(hex: "D1A64A").opacity(0.22)
}

extension Color {
    init(hex: String) {
        let h = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: h).scanHexInt64(&int)
        self.init(
            red:   Double((int >> 16) & 0xFF) / 255,
            green: Double((int >> 8)  & 0xFF) / 255,
            blue:  Double( int        & 0xFF) / 255
        )
    }
}
