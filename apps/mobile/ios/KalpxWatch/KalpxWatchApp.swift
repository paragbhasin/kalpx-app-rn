import SwiftUI

@main
struct KalpxWatchApp: App {
    @StateObject private var japaEngine   = WatchJapaEngine()
    @StateObject private var connectivity = WatchConnectivityManager.shared

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(japaEngine)
                .environmentObject(connectivity)
        }
    }

    init() {
        WatchConnectivityManager.shared.activate()
    }
}
