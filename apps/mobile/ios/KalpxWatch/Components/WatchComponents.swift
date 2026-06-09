import SwiftUI

// MARK: - RitualRow
// Replaces WatchListRow across all list screens.

struct RitualRow: View {
    let icon: String
    let title: String
    var subtitle: String? = nil
    var isDimmed: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 5) {
                Text(icon)
                    .font(.system(size: 11))
                    .foregroundColor(KalpXWatchTheme.gold)
                Text(title)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(KalpXWatchTheme.textPrimary)
            }
            if let sub = subtitle {
                Text(sub)
                    .font(.system(size: 11))
                    .foregroundColor(KalpXWatchTheme.textTertiary)
                    .lineLimit(1)
            }
        }
        .opacity(isDimmed ? 0.45 : 1)
    }
}

// MARK: - WatchPrimaryButton
// Gold fill, dark label. Use for the main CTA on any screen.

struct WatchPrimaryButton: View {
    let label: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(KalpXWatchTheme.background)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 6)
                .background(KalpXWatchTheme.gold)
                .cornerRadius(8)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - WatchSecondaryButton
// Ghost outline. Use for dismiss / later / skip equivalents.

struct WatchSecondaryButton: View {
    let label: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(KalpXWatchTheme.textSecondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 5)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(KalpXWatchTheme.textTertiary.opacity(0.5), lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - EmptyStateView
// Shown when user is not logged in or no data has been pushed from iPhone.

struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 8) {
            Text("ॐ")
                .font(.system(size: 32))
                .foregroundColor(KalpXWatchTheme.gold)
            Text("Open KalpX on iPhone to continue.")
                .font(.system(size: 12))
                .foregroundColor(KalpXWatchTheme.textTertiary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(KalpXWatchTheme.background)
    }
}

// MARK: - StateChip
// Capsule label. Gold variant for spiritual labels (inner_path, rhythm).
// Neutral variant for informational labels (Day X of Y).

enum StateChipVariant { case gold, neutral }

struct StateChip: View {
    let label: String
    var variant: StateChipVariant = .gold

    var body: some View {
        Text(label)
            .font(.system(size: 9, weight: .semibold))
            .foregroundColor(variant == .gold ? KalpXWatchTheme.gold : KalpXWatchTheme.textTertiary)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(
                Capsule()
                    .fill(variant == .gold
                          ? KalpXWatchTheme.goldSoft
                          : KalpXWatchTheme.textTertiary.opacity(0.12))
            )
    }
}

// MARK: - GoldDot
// 5pt gold circle used in rhythm section headers.

struct GoldDot: View {
    var body: some View {
        Circle()
            .fill(KalpXWatchTheme.gold)
            .frame(width: 5, height: 5)
    }
}
