import Foundation

struct WatchMantraItem: Codable {
    let ref: String
    let name: String
    let devanagari: String
}

struct WatchSankalpItem: Codable {
    let title: String
    let line: String
}

struct WatchPracticeItem: Codable {
    let title: String
    let description: String
}

struct WatchInnerPathData: Codable {
    let hasActivePath: Bool
    let dayNumber: Int
    let totalDays: Int
    let mantra: WatchMantraItem?
    let practice: WatchPracticeItem?
    // sankalp: Watch reads kalpx_sankalp_today from app group directly
}

struct WatchRhythmData: Codable {
    let hasRhythm: Bool
    let currentSlot: String   // "morning" | "afternoon" | "night"
    let slotDone: Bool
    let mantra: WatchMantraItem?
    let sankalp: WatchSankalpItem?
    let practice: WatchPracticeItem?
}

struct WatchCheckinData: Codable {
    let windowActive: Bool
    let pranaLabel: String?
}

struct WatchPathData: Codable {
    let innerPath: WatchInnerPathData?
    let rhythm: WatchRhythmData?
    let checkin: WatchCheckinData
}
