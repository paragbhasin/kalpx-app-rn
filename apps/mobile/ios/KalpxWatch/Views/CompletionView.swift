import SwiftUI

struct CompletionView: View {
    let count:      Int
    let onDone:     () -> Void
    let onContinue: () -> Void

    var body: some View {
        VStack(spacing: 6) {
            Spacer()

            Text("✦")
                .font(.system(size: 22))
                .foregroundColor(KalpXWatchTheme.gold)

            Text("You returned \(count) times.")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(KalpXWatchTheme.textPrimary)
                .multilineTextAlignment(.center)

            Text("Let this practice be offered.")
                .font(.system(size: 11))
                .foregroundColor(KalpXWatchTheme.textSecondary)
                .multilineTextAlignment(.center)

            Spacer()

            VStack(spacing: 6) {
                WatchPrimaryButton(label: "Chant more", action: onContinue)
                WatchSecondaryButton(label: "Complete",  action: onDone)
            }
            .padding(.horizontal, 2)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(KalpXWatchTheme.background)
    }
}
