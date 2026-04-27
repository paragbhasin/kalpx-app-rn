/**
 * v3Ingest — verbatim copy from apps/mobile/src/engine/v3Ingest.ts.
 * Maps namespaced v3 envelopes to flat screenData keys.
 * No RN imports — safe to share verbatim.
 */

export type V3FlatIngest = Record<string, any>;

interface V3TriadItem {
  slot: string;
  item_id?: string;
  title?: string;
  subtitle?: string;
  completed_today?: boolean;
  how_to_live?: string | string[];
  meaning?: string;
  essence?: string;
  [key: string]: any;
}

function triadBySlot(triad: V3TriadItem[] | undefined, slot: string) {
  return (triad || []).find((t) => t.slot === slot);
}

export function ingestDailyView(env: any | null): V3FlatIngest {
  if (!env) return {};
  const id = env.identity || ({} as any);
  const greet = env.greeting || ({} as any);
  const arc = env.arc_state || ({} as any);
  const cont = env.continuity || ({} as any);
  const today = env.today || ({} as any);
  const insights = env.insights || ({} as any);

  const mantra = triadBySlot(today.triad, 'mantra');
  const sankalp = triadBySlot(today.triad, 'sankalp');
  const practice = triadBySlot(today.triad, 'practice');

  const brief = today.morning_briefing || ({} as any);

  return {
    identity: id,
    greeting: greet,
    arc_state: arc,
    continuity: cont,
    today: today,
    insights: insights,

    journey_id: id.journey_id ?? null,
    day_number: id.day_number ?? 0,
    total_days: id.total_days ?? 0,
    path_cycle_number: id.path_cycle_number ?? 1,
    checkpoint_due: arc.checkpoint_due ?? null,
    arc_complete: !!arc.arc_complete,
    additional_items: today.additional_items ?? [],
    completed_today: [
      ...(mantra?.completed_today ? ['mantra'] : []),
      ...(sankalp?.completed_today ? ['sankalp'] : []),
      ...(practice?.completed_today ? ['practice'] : []),
    ],
    why_this_l1_items: cont.why_this_l1_items ?? [],
    why_this: cont.why_this ?? null,
    post_conflict: env.continuity?.post_conflict ?? false,
    post_conflict_pending: env.continuity?.post_conflict_pending ?? null,
    journey_path: arc.journey_path ?? '',
    sankalp_how_to_live: Array.isArray(sankalp?.how_to_live)
      ? sankalp.how_to_live
      : sankalp?.how_to_live
        ? [sankalp.how_to_live]
        : [],
    briefing_available: brief.audio_status === 'ready',
    briefing_audio_url: brief.audio_url ?? null,
    briefing_summary: brief.summary ?? '',
    briefing_id: brief.briefing_id ?? '',
    briefing_audio_status: brief.audio_status ?? 'generating',

    user_name: greet.user_name ?? null,
    greeting_headline: greet.headline ?? '',
    greeting_context: greet.supporting_line ?? '',
    voice_placeholder: greet.voice_placeholder ?? '',
    journey_path_label: arc.journey_path_label ?? '',
    focus_phrase: today.focus_phrase ?? '',
    day_type: env.today?.day_type ?? null,

    card_mantra_title: mantra?.title || _humanizeId(mantra?.item_id) || '',
    card_mantra_description: mantra?.subtitle ?? '',
    card_sankalpa_title: sankalp?.title || _humanizeId(sankalp?.item_id) || '',
    card_sankalpa_description: sankalp?.subtitle ?? '',
    card_ritual_title: practice?.title || _humanizeId(practice?.item_id) || '',
    card_ritual_description: practice?.subtitle ?? '',

    master_mantra: mantra
      ? {
          ...mantra,
          id: mantra.item_id,
          item_id: mantra.item_id,
          item_type: 'mantra',
          type: 'mantra',
          wisdom: (mantra as any).meaning || (mantra as any).essence || '',
        }
      : null,
    master_sankalp: sankalp
      ? { ...sankalp, id: sankalp.item_id, item_id: sankalp.item_id, item_type: 'sankalp', type: 'sankalp' }
      : null,
    master_practice: practice
      ? { ...practice, id: practice.item_id, item_id: practice.item_id, item_type: 'practice', type: 'practice' }
      : null,

    guidance_mode: (env as any).guidance_mode ?? null,
    v3_status: env.status,
    v3_fallback_reason: env.fallback_reason,
  };
}

export function ingestDay7View(env: any | null): V3FlatIngest {
  if (!env) return {};
  const id = env.identity || ({} as any);
  const refl = env.reflection || ({} as any);
  const cyc = (env as any).cycle_reflection || ({} as any);
  const actions = env.actions || ({} as any);
  const tg = refl.trend_graph || ({} as any);

  return {
    day_number: id.day_number ?? 0,
    total_days: id.total_days ?? 0,
    path_cycle_number: id.path_cycle_number ?? 1,
    journey_id: id.journey_id ?? null,
    checkpoint_day7_state: cyc.day7_state || 'steady',
    checkpoint_engagement_level: cyc.engagement_level || 'engaged',
    checkpoint_intervention_eligible: cyc.intervention_eligible ?? false,
    checkpoint_strongest_type: cyc.strongest_type || '',
    checkpoint_mitra_reflection: cyc.mitra_reflection || '',
    checkpoint_completion_rates: cyc.completion_rates || {},
    checkpoint_decision_framing: refl.decision_framing || '',
    checkpoint_trend_graph: {
      labels: tg.labels || [],
      engaged: tg.engaged || [],
      fully_completed: tg.fully_completed || [],
    },
    checkpoint_day_7: {
      headline: refl.headline || refl.engagement_trajectory || '',
      intro_headline: refl.headline || refl.engagement_trajectory || '',
      body: refl.body || refl.journey_narrative || '',
      intro_body: refl.body || refl.framing || '',
      framing: refl.framing ?? '',
      journey_narrative: refl.journey_narrative ?? '',
      body_narrative: refl.journey_narrative || refl.engagement_trajectory || '',
      eyebrow: refl.engagement_trajectory || 'Checkpoint',
      surface_label: refl.surface_label || 'CONTINUITY MIRROR',
      intro_cta_label: 'Continue',
      what_grew_label: 'WHAT GREW',
      what_to_carry_label: 'WHAT TO CARRY',
      input_placeholder: 'Type your reflection here...',
      next_week_label: 'NEXT WEEK',
      cta_continue_label: refl.cta_continue || 'Continue My Path',
      cta_lighten_label: refl.cta_lighten || 'Lighten',
      cta_start_fresh_label: refl.cta_reset || 'Start Fresh',
    },
    journey_day_statuses: (tg.fully_completed || []).map((v: number) => (v ? 'completed' : 'pending')),
    day_7_decisions_available: actions.decisions_available ?? ['continue'],
    day_7_primary_decision: actions.primary_decision ?? 'continue',
    checkpoint_framing: refl.framing ?? '',
    journey_narrative: refl.journey_narrative ?? '',
    what_grew_section: env.insights?.resilience_narrative?.summary_line ?? null,
    v3_status: env.status,
  };
}

export function ingestDay14View(env: any | null): V3FlatIngest {
  if (!env) return {};
  const id = env.identity || ({} as any);
  const reflection = env.cycle_reflection || ({} as any);
  const arc = env.day14_arc || ({} as any);
  const ceremony = env.completion_ceremony || ({} as any);
  const actions = env.actions || ({} as any);
  const tg = (env as any).trend_graph || ({} as any);
  const ds = (env as any).deepen_suggestion || null;
  const dc = (env as any).decision_copy || ({} as any);
  const classif = arc.classification || ({} as any);

  return {
    day_number: id.day_number ?? 14,
    total_days: id.total_days ?? 14,
    path_cycle_number: id.path_cycle_number ?? 1,
    journey_id: id.journey_id ?? null,
    checkpoint_trend_graph: {
      labels: tg.labels || [],
      engaged: tg.engaged || [],
      fully_completed: tg.fully_completed || [],
    },
    checkpoint_strongest_type: reflection.strongest_type || '',
    checkpoint_mitra_reflection: reflection.mitra_reflection || '',
    checkpoint_completion_rates: reflection.completion_rates || {},
    checkpoint_classification_label: classif.label || '',
    checkpoint_classification_headline: classif.headline || '',
    checkpoint_classification_body: classif.body || '',
    checkpoint_primary_recommendation: arc.primary_recommendation || 'continue_same',
    checkpoint_decision_layout: arc.decision_layout || 'continue_first',
    checkpoint_deepen_suggestion: ds,
    checkpoint_decision_copy: dc,
    checkpoint_day_14: {
      eyebrow: env.insights?.resilience_narrative?.summary_line || 'DAY 14',
      intro_headline: (env.m25_narrative as any)?.intro_headline || 'Two weeks. Something settled.',
      intro_body: (env.m25_narrative as any)?.intro_body || 'Can I show you what has changed?',
      intro_cta_label: (env.m25_narrative as any)?.intro_cta_label || 'Reflect on My Journey',
      surface_label: (env.m25_narrative as any)?.surface_label || 'EVOLUTION PIVOT',
      day_picker_title: (env.m25_narrative as any)?.day_picker_title || 'Your 14-Day Journey',
      day_picker_subtitle: (env.m25_narrative as any)?.day_picker_subtitle || 'Tap a day to see your progress',
      day_picker_progress_tagline: (env.m25_narrative as any)?.day_picker_progress_tagline || 'Every return deepens the path.',
      graph_cta: (env.m25_narrative as any)?.graph_cta || 'Continue to Choices',
      narrative_strongest: reflection.mitra_reflection || '',
      narrative_template:
        (env.m25_narrative as any)?.narrative_template ||
        'You have fully held {completed_count} of {total_days} days.',
      summary_line_template: (env.m25_narrative as any)?.summary_line_template || '{completed_count} of {total_days} days held.',
      summary_label: 'WHAT GREW',
      seal_cycle_label: (env.m25_narrative as any)?.seal_cycle_label || 'SEAL THIS CYCLE',
      seal_cycle_helper: (env.m25_narrative as any)?.seal_cycle_helper || '',
      seal_input_placeholder: (env.m25_narrative as any)?.seal_input_placeholder || 'What deserves to be remembered?',
      carry_label: (env.m25_narrative as any)?.carry_label || 'CARRY FORWARD',
      carry_input_placeholder: (env.m25_narrative as any)?.carry_input_placeholder || '',
      continue_path_cta: dc.continue_same_cta || (env.m25_narrative as any)?.continue_path_cta || 'Continue Same Path',
      deepen_practice_cta: dc.deepen_cta || (env.m25_narrative as any)?.deepen_practice_cta || 'Deepen Practice',
      change_focus_cta: dc.change_focus_cta || (env.m25_narrative as any)?.change_focus_cta || 'Change Focus',
      restart_cta: dc.restart_cta || 'Start a New 14-Day Rhythm',
      ceremony_continue_headline: (env.m25_narrative as any)?.ceremony_continue_headline || 'A new cycle begins.',
      ceremony_deepen_headline: (env.m25_narrative as any)?.ceremony_deepen_headline || 'A deeper commitment begins.',
      ceremony_change_focus_headline: (env.m25_narrative as any)?.ceremony_change_focus_headline || 'Your cycle is complete.',
    },
    journey_day_statuses: Array(14)
      .fill('completed')
      .map((_s: any, i: number) => (i < (ceremony.completed_days ?? 13) ? 'completed' : 'pending')),
    checkpoint_framing: reflection.reflection_prompt ?? '',
    journey_narrative: reflection.mitra_reflection ?? '',
    what_grew_section: String(env.insights?.resilience_narrative?.summary_line ?? ''),
    day_14_decisions_available: actions.decisions_available ?? [],
    m25_narrative: {
      eyebrow: 'Cycle Complete',
      intro_headline: (env.m25_narrative as any)?.intro_headline || "You've arrived.",
      narrative_template:
        reflection.mitra_reflection ||
        'Fourteen days of dedicated practice. You have held your path through {completed_count} days.',
      summary_line_template: '{completed_count} of {total_days} days completed.',
      ...env.m25_narrative,
    },
    completion_ceremony: ceremony,
    v3_status: env.status,
  };
}

function _humanizeId(id: string | null | undefined): string {
  if (!id) return '';
  const parts = id.split('.');
  const term = parts[parts.length - 1];
  return term.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
