// V3 API envelope types — extracted from apps/mobile/src/engine/mitraApi.ts.
// These are pure type definitions with no platform dependencies.

export type V3Status = 'ok' | 'degraded' | 'fallback';

export interface V3Provenance {
  contract: string;
  generated_at: string;
  cache_ttl_sec: number;
}

export interface V3Envelope {
  envelope_version: string;
  status: V3Status;
  fallback_reason: string | null;
  view: string;
  provenance: V3Provenance;
}

export interface V3Identity {
  journey_id: number | null;
  day_number: number;
  total_days: number;
  path_cycle_number: number;
}

export interface V3Greeting {
  headline: string;
  supporting_line: string;
  user_name: string;
  voice_placeholder: string;
}

export interface V3ArcState {
  phase: string;
  checkpoint_due: 'day_7' | 'day_14' | null;
  arc_complete: boolean;
  journey_path: string;
  journey_path_label: string;
}

export interface V3WhyThis {
  level1: string;
  level2: string;
  level3: string;
}

export interface V3Continuity {
  tier: 'none' | 'short' | 'medium' | 'long' | 'very_long';
  gap_days: number;
  headline: string;
  body: string;
  earned_context: Record<string, unknown>;
  fresh_restart_suggested: boolean;
  why_this: V3WhyThis | null;
  why_this_l1_items: { id: string; label: string }[];
  post_conflict?: boolean;
  post_conflict_pending?: boolean | null;
}

export interface V3TriadItem {
  slot: 'mantra' | 'sankalp' | 'practice';
  item_id: string;
  title: string;
  subtitle: string;
  completed_today: boolean;
  how_to_live?: string;
}

export interface V3MorningBriefing {
  audio_status: 'generating' | 'ready' | 'failed';
  audio_url: string | null;
  summary: string;
  briefing_id: string;
}

export interface V3QuickSupportLabels {
  triggered_label: string;
  checkin_label: string;
  joy_label: string;
  growth_label: string;
  more_label: string;
}

export interface V3CycleMetrics {
  days_engaged: number;
  days_fully_completed: number;
  trigger_sessions: number;
  daily_rhythm: { day: number; state: 'done' | 'missed' | 'pending' }[];
  summary_label: string;
  days_engaged_label: string;
  days_complete_label: string;
  trigger_sessions_label: string;
  rhythm_header_label: string;
}

export interface V3Today {
  triad: V3TriadItem[];
  additional_items: unknown[];
  morning_briefing: V3MorningBriefing;
  focus_phrase: string;
  quick_support_labels: V3QuickSupportLabels;
  cycle_metrics: V3CycleMetrics | null;
  day_type?: string | null;
}

export interface V3Insights {
  resilience_narrative: unknown | null;
  path_milestone: unknown | null;
  entity_card: unknown | null;
  refinement_signal: unknown | null;
}

export interface V3EntryViewEnvelope extends V3Envelope {
  view: 'entry_view';
  greeting: V3Greeting;
  journey_state: {
    has_active_journey: boolean;
    day_number: number;
    total_days: number;
    path_cycle_number: number;
    checkpoint_due: 'day_7' | 'day_14' | null;
    arc_complete: boolean;
  };
  continuity: V3Continuity;
  target: {
    view_key:
      | 'daily_view'
      | 'day_7_view'
      | 'day_14_view'
      | 'welcome_back_surface'
      | 'onboarding_start'
      | 'crisis_view'
      | 'grief_room'
      | 'loneliness_room';
    payload: Record<string, unknown>;
  };
}

export interface V3DailyViewEnvelope extends V3Envelope {
  view: 'daily_view';
  identity: V3Identity;
  greeting: V3Greeting;
  arc_state: V3ArcState;
  continuity: V3Continuity;
  today: V3Today;
  insights: V3Insights;
}

export interface V3Day7ViewEnvelope extends V3Envelope {
  view: 'day_7_view';
  surface_type: 'day_7_reflection';
  identity: V3Identity;
  reflection: {
    headline: string;
    body: string;
    engagement_trajectory: string;
    trend_graph: {
      labels: string[];
      engaged: number[];
      fully_completed: number[];
    };
    framing: string;
    journey_narrative: string;
  };
  insights: V3Insights;
  continuity: V3Continuity | null;
  actions: { primary: string; decisions_available: string[] };
}

export interface V3Day14ViewEnvelope extends V3Envelope {
  view: 'day_14_view';
  surface_type: 'day_14_completion';
  identity: V3Identity;
  cycle_reflection: {
    mitra_reflection: string;
    reflection_prompt: string;
    strongest_type: string;
    growth_area: string;
    completion_rates: Record<string, number>;
  };
  day14_arc: {
    classification: { label: string; completion_rate: number } | null;
    what_grew: { days_completed: number; days_total: number } | null;
    refinement_signal: unknown | null;
  };
  completion_ceremony: {
    completed_days: number;
    total_days: number;
    strongest_practice: string;
    growth_highlight: string;
    sovereignty_line: string;
  };
  m25_narrative: Record<string, unknown>;
  insights: V3Insights;
  actions: { primary: string; decisions_available: string[] };
}

export interface V3DecisionEnvelope extends V3Envelope {
  decision_applied: string | null;
  next_view: {
    view_key: string;
    payload: Record<string, unknown>;
  };
  prior_journey_id?: number;
  new_journey_id?: number;
  path_cycle_number?: number;
  journey_id?: number;
}

export interface V3GetResult<E extends V3Envelope> {
  envelope: E | null;
  etag: string | null;
  notModified: boolean;
}
