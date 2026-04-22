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
    completed_today: [
      ...(mantra?.completed_today ? ["mantra"] : []),
      ...(sankalp?.completed_today ? ["sankalp"] : []),
      ...(practice?.completed_today ? ["practice"] : []),
    ],
    why_this_l1_items: cont.why_this_l1_items ?? [],
    why_this: cont.why_this ?? null,
    journey_path: arc.journey_path ?? "",
    sankalp_how_to_live: Array.isArray(sankalp?.how_to_live)
      ? sankalp.how_to_live
      : sankalp?.how_to_live
        ? [sankalp.how_to_live]
        : [],
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
    card_mantra_title: mantra?.title || _humanizeId(mantra?.item_id) || "",
    card_mantra_description: mantra?.subtitle ?? "",
    card_sankalpa_title: sankalp?.title || _humanizeId(sankalp?.item_id) || "",
    card_sankalpa_description: sankalp?.subtitle ?? "",
    card_ritual_title: practice?.title || _humanizeId(practice?.item_id) || "",
    card_ritual_description: practice?.subtitle ?? "",

    // master_* flat objects — runner reads these from screenData for rich
    // content (audio, devanagari, meaning, steps, etc.)
    master_mantra: mantra
      ? {
          ...mantra,
          id: mantra.item_id,
          item_id: mantra.item_id,
          item_type: "mantra",
          type: "mantra",
          wisdom: (mantra as any).meaning || (mantra as any).essence || "",
        }
      : null,
    master_sankalp: sankalp
      ? {
          ...sankalp,
          id: sankalp.item_id,
          item_id: sankalp.item_id,
          item_type: "sankalp",
          type: "sankalp",
        }
      : null,
    master_practice: practice
      ? {
          ...practice,
          id: practice.item_id,
          item_id: practice.item_id,
          item_type: "practice",
          type: "practice",
        }
      : null,

    // guidance_mode — read by PostConflictGentlenessCard + any resolver
    // that sends mode to content endpoints. Emitted by BE in daily_view body.
    guidance_mode: (env as any).guidance_mode ?? null,

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
      eyebrow: env.insights?.resilience_narrative?.summary_line || "Two Weeks",
      intro_headline: "Fourteen Days.",
      intro_body:
        reflection.mitra_reflection ||
        "You've reached a significant milestone in your journey.",
      intro_cta_label: "Begin Reflection",
      narrative_template:
        reflection.mitra_reflection || "You've fully held {completed_count} of {total_days} days.",
      summary_line_template: "{completed_count} of {total_days} days.",
      summary_label: "WHAT GREW",
      seal_cycle_label: "SEAL THIS CYCLE",
      seal_cycle_helper: "What do you carry forward from these fourteen days?",
      seal_input_placeholder: "Type your observation here...",
      carry_label: "CARRY FORWARD",
      carry_input_placeholder: "How will you continue?",
      continue_path_cta: "Continue Same Path",
      deepen_practice_cta: "Deepen Practice",
      change_focus_cta: "Change Focus",
      ...env.m25_narrative, // merge any BE-resolved slots
    },
    journey_day_statuses: Array(14)
      .fill("completed")
      .map((s, i) => (i < (ceremony.completed_days ?? 13) ? "completed" : "pending")),
    checkpoint_framing: reflection.reflection_prompt ?? "",
    journey_narrative: reflection.mitra_reflection ?? "",
    what_grew_section: String(env.insights?.resilience_narrative?.summary_line ?? ""),
    day_14_decisions_available: actions.decisions_available ?? [],
    m25_narrative: {
      eyebrow: "Cycle Complete",
      intro_headline: "You've arrived.",
      narrative_template:
        reflection.mitra_reflection ||
        "Fourteen days of dedicated practice. You've held your path through {completed_count} days.",
      summary_line_template: "{completed_count} of {total_days} days completed.",
      ...env.m25_narrative,
    },
    completion_ceremony: ceremony,
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
