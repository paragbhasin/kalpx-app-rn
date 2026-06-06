// Shared between: kalpx (iPhone), KalpxWatch, KalpxWatchWidgetExtension, KalpxQuickChantWidget
// Must match AppGroupKeys in src/native/appGroupKeys.ts exactly.
// Add this file to ALL four targets in Xcode.

enum KalpxAppGroupKeys {
    static let groupID                = "group.com.kalpx.app"
    static let pendingChantIncrements = "kalpx_pending_chant_increments"
    static let sankalpToday           = "kalpx_sankalp_today"
    static let sankalpUpdatedAt       = "kalpx_sankalp_updated_at"
    static let rhythmToday            = "kalpx_rhythm_today"
    static let watchCurrentSession    = "kalpx_watch_current_session"
    static let watchLastSyncedCount   = "kalpx_watch_last_synced"
    static let watchPathData          = "kalpx_watch_path_data"
    static let todayJapaCount         = "kalpx_today_japa_count"
    static let innerPathToday         = "kalpx_inner_path_today"
    static let complicationPrivacy    = "kalpx_complication_privacy"
}
