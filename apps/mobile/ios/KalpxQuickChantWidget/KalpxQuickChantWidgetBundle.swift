import SwiftUI
import WidgetKit

@main
struct KalpxQuickChantWidgetBundle: WidgetBundle {
    var body: some Widget {
        KalpxQuickChantLiveActivity()
        KalpxSankalpLiveActivity()
    }
}
