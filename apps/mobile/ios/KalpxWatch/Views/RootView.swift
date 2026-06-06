import SwiftUI

struct RootView: View {
    @EnvironmentObject var engine: WatchJapaEngine

    var body: some View {
        if engine.isActive {
            QuickChantView()
        } else {
            NavigationStack {
                WatchHomeListView()
            }
        }
    }
}
