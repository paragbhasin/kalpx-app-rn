/**
 * v3Ingest — TEMPORARY migration bridge (journey-v3-fe, Step 2).
 *
 * Maps the namespaced v3 daily-view / day-7-view / day-14-view envelopes
 * to the flat screenData keys that existing blocks read today. This is
 * a SHORT-LIVED adapter: each block that migrates to direct namespaced
 * reads (journey-v3-fe Steps 3-4) removes its corresponding key from
 * this file. When every consumer is migrated, this file is deleted.
 *
 * Exit criteria (journey-v3-fe Step 11):
 *   grep -rn 'ingest(DailyView|Day7View|Day14View)' src/ returns 0 hits.
 *
 * DO NOT add new callers. DO NOT use this as a permanent contract.
 */

import type {
  V3DailyViewEnvelope,
  V3Day14ViewEnvelope,
  V3Day7ViewEnvelope,
  V3TriadItem,
} from "./mitraApi";

/** Flat record of legacy screenData keys derived from a v3 envelope. */
export type V3FlatIngest = Record<string, any>;

function triadBySlot(triad: V3TriadItem[] | undefined, slot: string) {
  return (triad || []).find((t) => t.slot === slot);
}

/**
 * Maps daily-view envelope → flat legacy keys.
 * Null-safe on every sub-path.
 */
export function ingestDailyView(env: V3DailyViewEnvelope | null): V3FlatIngest {
  if (!env) return {};
  const id = env.identity || ({} as any);
  const greet = env.greeting || ({} as any);
  const arc = env.arc_state || ({} as any);
  const cont = env.continuity || ({} as any);
  const today = env.today || ({} as any);
  const insights = env.insights || ({} as any);

  const mantra = triadBySlot(today.triad, "mantra");
  const sankalp = triadBySlot(today.triad, "sankalp");
  const practice = triadBySlot(today.triad, "practice");

  const brief = today.morning_briefing || ({} as any);

  return {
    // identity
    journey_id: id.journey_id ?? null,
    day_number: id.day_number ?? 0,
    total_days: id.total_days ?? 0,
    path_cycle_number: id.path_cycle_number ?? 1,

    // greeting
    greeting_context: greet.supporting_line ?? "",
    user_name: greet.user_name ?? "",
    voice_placeholder: greet.voice_placeholder ?? "",

    // arc_state
    checkpoint_due: arc.checkpoint_due ?? null,
    arc_complete: !!arc.arc_complete,
    journey_path: arc.journey_path ?? "",
    journey_path_label: arc.journey_path_label ?? "",

    // continuity — expose the full block AND the legacy-shaped
    // continuity_mirror consumed by the existing ContinuityMirrorCard
    // until that component is migrated (Step 3).
    continuity: cont,
    continuity_mirror:
      cont.tier && cont.tier !== "none"
        ? {
            title: cont.headline ?? "",
            body: cont.body ?? "",
            headline: cont.headline ?? "",
            message: cont.body ?? "",
            days_since_last_session: cont.gap_days ?? 0,
            earned_context: cont.earned_context ?? {},
          }
        : null,
    why_this: cont.why_this ?? null,
    why_this_l1_items: cont.why_this_l1_items ?? [],

    // today — triad flattened into per-slot scalar keys used by blocks
    card_mantra_title: mantra?.title ?? "",
    card_mantra_subtitle: mantra?.subtitle ?? "",
    card_mantra_item_id: mantra?.item_id ?? "",
    card_sankalpa_title: sankalp?.title ?? "",
    card_sankalpa_subtitle: sankalp?.subtitle ?? "",
    card_sankalpa_item_id: sankalp?.item_id ?? "",
    card_ritual_title: practice?.title ?? "",
    card_ritual_subtitle: practice?.subtitle ?? "",
    card_ritual_item_id: practice?.item_id ?? "",
    sankalp_how_to_live: sankalp?.how_to_live ?? "",

    // today — other
    additional_items: today.additional_items ?? [],
    focus_phrase: today.focus_phrase ?? "",
    quick_support_labels: today.quick_support_labels ?? {},
    cycle_metrics: today.cycle_metrics ?? null,
    completed_today: {
      mantra: !!mantra?.completed_today,
      sankalp: !!sankalp?.completed_today,
      practice: !!practice?.completed_today,
    },

    // morning briefing
    briefing_available: brief.audio_status === "ready",
    briefing_audio_url: brief.audio_url ?? null,
    briefing_summary: brief.summary ?? "",
    briefing_id: brief.briefing_id ?? "",
    briefing_audio_status: brief.audio_status ?? "generating",

    // insights
    resilience_narrative: insights.resilience_narrative ?? null,
    path_milestone: insights.path_milestone ?? null,
    entity_card: insights.entity_card ?? null,
    refinement_signal: insights.refinement_signal ?? null,

    // envelope status (surfaced so dashboard can show degraded state)
    v3_status: env.status,
    v3_fallback_reason: env.fallback_reason,
  };
}

/** Maps day-7-view envelope → flat keys used by CheckpointDay7Block. */
export function ingestDay7View(env: V3Day7ViewEnvelope | null): V3FlatIngest {
  if (!env) return {};
  const id = env.identity || ({} as any);
  const refl = env.reflection || ({} as any);
  const actions = env.actions || ({} as any);

  return {
    day_number: id.day_number ?? 0,
    total_days: id.total_days ?? 0,
    path_cycle_number: id.path_cycle_number ?? 1,
    journey_id: id.journey_id ?? null,
    checkpoint_day_7: {
      headline: refl.headline ?? "",
      body: refl.body ?? "",
      framing: refl.framing ?? "",
      journey_narrative: refl.journey_narrative ?? "",
    },
    journey_day_statuses: (refl.trend_graph?.fully_completed || []).map(
      (v: number, i: number) => ({
        day_number: i + 1,
        status: v ? "complete" : "pending",
      }),
    ),
    day_7_decisions_available: actions.decisions_available ?? [],
    checkpoint_framing: refl.framing ?? "",
    journey_narrative: refl.journey_narrative ?? "",
    what_grew_section: null,
    v3_status: env.status,
  };
}

/** Maps day-14-view envelope → flat keys used by CheckpointDay14Block. */
export function ingestDay14View(env: V3Day14ViewEnvelope | null): V3FlatIngest {
  if (!env) return {};
  const id = env.identity || ({} as any);
  const reflection = env.cycle_reflection || ({} as any);
  const arc = env.day14_arc || ({} as any);
  const ceremony = env.completion_ceremony || ({} as any);
  const actions = env.actions || ({} as any);

  return {
    day_number: id.day_number ?? 14,
    total_days: id.total_days ?? 14,
    path_cycle_number: id.path_cycle_number ?? 1,
    journey_id: id.journey_id ?? null,
    checkpoint_day_14: {
      mitra_reflection: reflection.mitra_reflection ?? "",
      reflection_prompt: reflection.reflection_prompt ?? "",
      strongest_type: reflection.strongest_type ?? "",
      growth_area: reflection.growth_area ?? "",
      completion_rates: reflection.completion_rates ?? {},
    },
    day14_classification: arc.classification ?? null,
    what_grew_section: arc.what_grew ?? null,
    refinement_signal: arc.refinement_signal ?? null,
    completion_ceremony: ceremony,
    m25_narrative: env.m25_narrative ?? {},
    day_14_decisions_available: actions.decisions_available ?? [],
    v3_status: env.status,
  };
}
