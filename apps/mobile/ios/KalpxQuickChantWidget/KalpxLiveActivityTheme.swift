import SwiftUI

// Shared color tokens for all Live Activity views in KalpxQuickChantWidget target.
extension Color {
    // Gold / Saffron
    static let laGold      = Color(red: 0.918, green: 0.710, blue: 0.471) // #EAB578
    static let laGoldLight = Color(red: 0.953, green: 0.788, blue: 0.541) // #F3C98A
    static let laGoldDeep  = Color(red: 0.800, green: 0.600, blue: 0.400) // #CC9966

    // Text (dark theme)
    static let laText    = Color(red: 0.906, green: 0.863, blue: 0.788) // #E7DCC9  off-white
    static let laMuted   = Color(red: 0.612, green: 0.561, blue: 0.494) // #9C8F7E  muted beige

    // Backgrounds (dark brown)
    static let laBackground = Color(red: 0.153, green: 0.102, blue: 0.067) // #271A11
    static let laSurface    = Color(red: 0.204, green: 0.137, blue: 0.098) // #342319
    static let laWarmBrown  = Color(red: 0.282, green: 0.176, blue: 0.106) // #482D1B

    // Divider
    static let laDivider = Color(red: 0.906, green: 0.863, blue: 0.788).opacity(0.10)
}
