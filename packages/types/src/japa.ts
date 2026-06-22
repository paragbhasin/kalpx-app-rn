// Japa Counting Engine — shared types for Digital Mala / Quick Chant.

export type JapaSourceSurface =
  | 'quick_reset'
  | 'quick_chant'
  | 'daily_rhythm'
  | 'inner_path'
  | 'digital_mala'
  | 'watch'
  | 'live_activity'
  | 'program';

export type JapaGoalType = 'time' | 'count' | 'unlimited';

export type JapaSessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';

// ---------------------------------------------------------------------------
// API request / response shapes
// ---------------------------------------------------------------------------

export interface JapaStartRequest {
  local_session_id: string;
  mantra_ref: string;
  source_surface: JapaSourceSurface;
  goal_type: JapaGoalType;
  goal_value: number | null;
  today_local_date: string;          // YYYY-MM-DD in device TZ
  timezone: string;
  device_id?: string;
  app_version?: string;
}

export interface JapaStartResponse {
  session_id: number;
  local_session_id: string;
  status: JapaSessionStatus;
  synced_count: number;
}

export interface JapaSyncRequest {
  delta_count: number;
  cumulative_count: number;
  idempotency_key: string;
  client_created_at: string;         // ISO-8601
  today_local_date: string;
  timezone: string;
  source_surface?: JapaSourceSurface;
  device_id?: string;
  app_version?: string;
}

export interface JapaStatsRow {
  mantra_ref: string;
  today_count: number;
  week_count: number;
  month_count: number;
  year_count: number;
  lifetime_count: number;
  last_practiced_at: string | null;
  completed_malas: number;
}

export interface JapaSyncResponse {
  accepted: boolean;
  session_id: number;
  synced_count: number;
  stats: JapaStatsRow | null;
}

export interface JapaCompleteRequest {
  final_count: number;
  duration_ms?: number;
  completed_at?: string;
  final_idempotency_key?: string;
  today_local_date?: string;
  timezone?: string;
}

export interface JapaCompleteResponse {
  session_id: number;
  status: JapaSessionStatus;
  session_count: number;
  stats: JapaStatsRow | null;
}

export interface JapaStatsResponse {
  stats: JapaStatsRow[];
  total_lifetime_all_mantras: number;
  last_practiced_mantra_ref: string | null;
}

export interface JapaActiveSessionResponse {
  session_id: number;
  local_session_id: string;
  mantra_ref: string;
  source_surface: JapaSourceSurface;
  status: JapaSessionStatus;
  synced_count: number;
  started_at: string;
  goal_type: JapaGoalType;
  goal_value: number | null;
}

// ---------------------------------------------------------------------------
// Local engine state (AsyncStorage schema)
// ---------------------------------------------------------------------------

export interface JapaLocalSession {
  localSessionId: string;
  serverSessionId: number | null;
  mantraRef: string;
  sourceSurface: JapaSourceSurface;
  goalType: JapaGoalType;
  goalValue: number | null;
  sessionCount: number;
  lastSyncedCount: number;
  sessionStartedAt: number;         // unix ms
  todayLocalDate: string;
  timezone: string;
}

export interface JapaLocalStats {
  mantraRef: string;
  todayCount: number;
  weekCount: number;
  yearCount: number;
  lifetimeCount: number;
  lastUpdated: number;              // unix ms
  todayLocalDate?: string;          // 'YYYY-MM-DD' — used to detect day rollover on re-launch
}

// Queued sync batch waiting to be sent when connectivity returns.
// sessionId is null when the Watch creates a batch before the phone has relayed
// a server session ID — the batch is held locally until sessionId is known.
export interface JapaPendingBatch {
  sessionId: number | null;
  localSessionId: string;
  deltaCount: number;
  cumulativeCount: number;
  idempotencyKey: string;
  clientCreatedAt: string;
  todayLocalDate: string;
  timezone: string;
  sourceSurface: JapaSourceSurface;
  retryCount: number;
}
