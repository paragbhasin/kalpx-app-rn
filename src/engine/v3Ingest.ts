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
    // ── v3 namespaced blocks (preferred — migrated blocks read these) ──
    identity: id,
    greeting: greet,
    arc_state: arc,
    continuity: cont,
    today: today,
    insights: insights,

    // ── residual legacy flat keys ────────────────────────────────────
    // Post-Step-9 audit: most blocks now read sd.{identity|greeting|
    // arc_state|continuity|today|insights}.* directly. The flat keys
    // below remain because they're consumed by legacy readers outside
    // the v3 journey migration scope OR serve as double-fallbacks.
    //
    // Eligible for removal when every consumer has migrated:
    //   journey_id / day_number / total_days — read by many non-dashboard
    //   screens (CheckpointDay7/14 reflection, telemetry). Keep until
    //   those screens all migrate.
    //   checkpoint_due / arc_complete — read by cycle_transitions routing
    //   helpers in actionExecutor. Could migrate to sd.arc_state.*.
    //   additional_items — consumed by AdditionalItemsSectionBlock; Step-X
    //   follow-up.
    //   briefing_* — morning briefing block path not migrated in this wave.

    journey_id: id.journey_id ?? null,
    day_number: id.day_number ?? 0,
    total_days: id.total_days ?? 0,
    path_cycle_number: id.path_cycle_number ?? 1,
    checkpoint_due: arc.checkpoint_due ?? null,
    arc_complete: !!arc.arc_complete,
    additional_items: today.additional_items ?? [],
    completed_today: {
      mantra: !!mantra?.completed_today,
      sankalp: !!sankalp?.completed_today,
      practice: !!practice?.completed_today,
    },
    briefing_available: brief.audio_status === "ready",
    briefing_audio_url: brief.audio_url ?? null,
    briefing_summary: brief.summary ?? "",
    briefing_id: brief.briefing_id ?? "",
    briefing_audio_status: brief.audio_status ?? "generating",

    // ── Legacy Root Keys (Step 2 bridge) ──
    user_name: greet.user_name ?? null,
    greeting_headline: greet.headline ?? "",
    greeting_context: greet.supporting_line ?? "",
    voice_placeholder: greet.voice_placeholder ?? "",
    journey_path_label: arc.journey_path_label ?? "",
    focus_phrase: today.focus_phrase ?? "",

    // card_* fallbacks for TriadCardsRow
    card_mantra_title: mantra.title || _humanizeId(mantra.item_id) || "",
    card_mantra_description: mantra.subtitle ?? "",
    card_sankalpa_title: sankalp.title || _humanizeId(sankalp.item_id) || "",
    card_sankalpa_description: sankalp.subtitle ?? "",
    card_ritual_title: practice.title || _humanizeId(practice.item_id) || "",
    card_ritual_description: practice.subtitle ?? "",

    // envelope status (kept permanently — even post-bridge)
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
      headline: refl.headline || refl.engagement_trajectory || "",
      intro_headline: refl.headline || refl.engagement_trajectory || "Deep Breaths.",
      body: refl.body || refl.journey_narrative || "",
      intro_body: refl.body || refl.framing || "",
      framing: refl.framing ?? "",
      journey_narrative: refl.journey_narrative ?? "",
      body_narrative: refl.journey_narrative || refl.engagement_trajectory || "",
      eyebrow: refl.engagement_trajectory || "Checkpoint",
      intro_cta_label: "Continue",
      what_grew_label: "WHAT GREW",
      what_to_carry_label: "WHAT TO CARRY",
      input_placeholder: "Type your reflection here...",
      next_week_label: "NEXT WEEK",
      cta_continue_label: (actions.decisions_available || []).includes("continue")
        ? "Continue My Path"
        : "",
      cta_lighten_label: (actions.decisions_available || []).includes("lighten")
        ? "Lighten"
        : "",
      cta_start_fresh_label: (actions.decisions_available || []).includes("reset")
        ? "Choose New Focus"
        : "",
    },
    journey_day_statuses: (refl.trend_graph?.fully_completed || []).map((v: number) =>
      v ? "completed" : "pending",
    ),
    checkpoint_framing: refl.framing ?? "",
    journey_narrative: refl.journey_narrative ?? "",
    what_grew_section: env.insights?.resilience_narrative?.summary_line ?? null,
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

function _humanizeId(id: string | null | undefined): string {
  if (!id) return "";
  const parts = id.split(".");
  const term = parts[parts.length - 1];
  return term
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
