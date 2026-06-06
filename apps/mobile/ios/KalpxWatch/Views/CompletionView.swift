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

            Text("You returned \(count) times.")
                .font(.system(size: 12, weight: .medium))
                .multilineTextAlignment(.center)

            Text("Let this practice be offered.")
                .font(.system(size: 11))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)

            Spacer()

            HStack(spacing: 6) {
                Button("Done", action: onDone)
                    .buttonStyle(.bordered)

                Button("More", action: onContinue)
                    .buttonStyle(.borderedProminent)
            }
            .font(.system(size: 13))
        }
        .padding()
    }
}
