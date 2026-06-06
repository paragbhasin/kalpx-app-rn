import Foundation

// ── Inner Path triad ────────────────────────────────────────────────────────

struct WatchTriadItem: Codable {
    let slot: String       // "mantra" | "sankalp" | "practice"
    let itemId: String
    let title: String
    let subtitle: String
    let howToLive: String? // sankalp only
    let audioUrl: String?  // guided audio, mantra only
}

struct WatchInnerPathData: Codable {
    let hasActivePath: Bool
    let dayNumber: Int
    let totalDays: Int
    let triad: [WatchTriadItem]
}

// ── Rhythm ──────────────────────────────────────────────────────────────────

struct WatchRhythmItem: Codable {
    let itemId: String
    let itemType: String   // "mantra" | "sankalp" | "practice"
    let title: String
    let description: String
    let audioUrl: String?  // guided audio, mantra only
}

struct WatchRhythmBand: Codable {
    let band: String        // "morning" | "afternoon" | "night"
    let isDone: Bool
    let items: [WatchRhythmItem]
}

struct WatchRhythmData: Codable {
    let hasRhythm: Bool
    let bands: [WatchRhythmBand]
}

// ── Check-In ────────────────────────────────────────────────────────────────

struct WatchCheckinData: Codable {
    let windowActive: Bool
    let pranaLabel: String?
}

// ── Per-mantra stats ─────────────────────────────────────────────────────────

struct WatchMantraStats: Codable {
    let todayCount: Int
    let weekCount: Int
    let yearCount: Int
    let lifetimeCount: Int
}

// ── Quick Reset ─────────────────────────────────────────────────────────────

struct WatchQuickResetMantra: Codable {
    let itemId: String
    let title: String
    let devanagari: String
    let audioUrl: String?
}

// ── Root ────────────────────────────────────────────────────────────────────

struct WatchPathData: Codable {
    let innerPath: WatchInnerPathData?
    let rhythm: WatchRhythmData?
    let checkin: WatchCheckinData
    let quickReset: WatchQuickResetMantra?
    let mantraStats: [String: WatchMantraStats]?
}
