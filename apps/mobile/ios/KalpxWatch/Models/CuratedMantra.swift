import Foundation

struct CuratedMantra: Identifiable, Codable, Hashable {
    let id: String
    let ref: String
    let name: String
    let devanagari: String
    var label: String?     // "inner_path", "Morning", "Afternoon", "Night", or nil
    var audioUrl: String?  // guided audio stream URL, optional

    // Used only as the pre-selected default in MantraPickerView's @State.
    // The actual list shown always comes from app group storage (pushed from iPhone after login).
    static let `default` = CuratedMantra(
        id: "default", ref: "om-namah-shivaya",
        name: "Om Namah Shivaya", devanagari: "ॐ नमः शिवाय"
    )
}
