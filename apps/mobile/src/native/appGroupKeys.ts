/**
 * App Group key constants shared between iPhone app, Watch app, and widget.
 * App Group ID: group.com.kalpx.app
 *
 * IMPORTANT: These string values must exactly match the Swift constants in
 * KalpxAppGroupKeys.swift. If you change one, change both.
 */
export const AppGroupKeys = {
  // Written by KalpxLiveActivityModule (existing) — read by Watch widget
  pendingChantIncrements: 'kalpx_pending_chant_increments',

  // Written by iPhone app on sankalp load — read by Watch app + Watch widget
  sankalpToday: 'kalpx_sankalp_today',          // JSON: { title, line }
  sankalpUpdatedAt: 'kalpx_sankalp_updated_at', // Unix timestamp (Double)

  // Written by iPhone app on rhythm load — read by Watch app + Watch widget
  rhythmToday: 'kalpx_rhythm_today',            // JSON: RhythmSlot[]

  // Written by Watch app — read by iPhone (crash recovery fallback)
  watchCurrentSession: 'kalpx_watch_current_session',  // JSON: WatchLocalSession
  watchLastSyncedCount: 'kalpx_watch_last_synced',     // Int

  // Written by iPhone — read by Watch (auth token for native sync in Phase 2)
  // NOTE: Do NOT store full auth token here. Store only a short-lived session
  // token or use Keychain with app group access (kSecAttrAccessGroup).
  // Left empty for Phase 1 — Watch sync goes through iPhone RN bridge.
  watchSessionToken: 'kalpx_watch_session_token',
} as const;
