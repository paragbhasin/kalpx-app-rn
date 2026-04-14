/**
 * Mitra API Functions — React Native Port
 *
 * Ported from Vue actionExecutor.js (lines 68-459).
 * All functions are async and return data or null on error.
 * The RN axios client (../Networks/axios) handles JWT/guest UUID headers
 * via interceptors, so no manual auth headers are needed.
 */

import api from '../Networks/axios';

// ---------------------------------------------------------------------------
// Offline fallbacks — used when backend is unreachable (dev 502, airplane
// mode, flag-off). Minimal stub data so screens never render "—" / blanks.
// Full dynamicContentEngine port (Vue parity) is a future task; these are
// the smallest-possible shapes that satisfy the readers across the 30 blocks.
// ---------------------------------------------------------------------------

function generateCompanionResponse(input: any): any {
  const focus = input?.focus || 'clarity';
  return {
    companion: {
      recommended_posture: 'protecting your space and doing less, better',
      mantra: {
        core: {
          id: 'fallback_mantra',
          title: 'Om Namah Shivaya',
          devanagari: 'ॐ नमः शिवाय',
          audio_url: null,
        },
        one_line: 'A soft reminder of what you are steadying into',
        ui: { card_subtitle: 'A soft reminder of what you are steadying into' },
      },
      sankalp: {
        core: {
          id: 'fallback_sankalp',
          line: 'I protect what matters and let the rest pass.',
        },
        one_line: 'One line to carry through the small decisions today',
      },
      practice: {
        core: {
          id: 'fallback_practice',
          title: 'Nine slow breaths, eyes soft',
          duration_min: 6,
        },
        one_line: 'A practice to settle the body before the day opens',
      },
      focus,
      day_number: input?.day_number || 1,
    },
    briefing: null,
    continuity: null,
    _offline_fallback: true,
  };
}

function generateHelpMeChooseResponse(input: any): any {
  const text = (input?.text || '').toLowerCase();
  // Simple keyword → focus mapping (mirrors web fallback pattern)
  const focus = /work|career|deadline/.test(text) ? 'clarity'
    : /relation|partner|family|sarah|mother|father/.test(text) ? 'connection'
    : /anger|stress|upset|tight|tense/.test(text) ? 'regulation'
    : /quiet|rest|sleep|tired/.test(text) ? 'stillness'
    : 'grounding';
  return { focus, sub_focus: null, label: focus, _offline_fallback: true };
}

function generatePranaAcknowledgement(pranaType: string, _focus: string, _locale: string): any {
  const insights: Record<string, string> = {
    steady: 'Steady is enough. Stay here.',
    heavy: "It's heavy. That's honest. Be kind with yourself today.",
    activated: 'Something is rising. Notice it. Let it settle before you act.',
  };
  return {
    insight: insights[pranaType] || 'I heard you.',
    _offline_fallback: true,
  };
}

function generateTriggerMantraSuggestions(_feeling: string, _locale: string): any {
  return {
    mantras: [
      { id: 'trig_om', title: 'Om', devanagari: 'ॐ', one_line: 'The simplest sound. Start here.' },
      { id: 'trig_so_hum', title: 'So Hum', devanagari: 'सो हम्', one_line: 'I am that. With the breath.' },
    ],
    _offline_fallback: true,
  };
}

function generateCheckpointData(screenState: any): any {
  const day = screenState?.day_number || 7;
  return {
    day_number: day,
    headline: day >= 14 ? 'Two weeks. Something settled.' : "You've been at this a week.",
    summary: 'The practice is the practice. Keep going if it is serving; shift if it is not.',
    options: [
      { id: 'continue_same', label: 'Continue the same path' },
      { id: 'deepen', label: 'Deepen this path' },
      { id: 'change_focus', label: 'Shift to a new focus' },
    ],
    _offline_fallback: true,
  };
}

function generateResetPlan(_obstacle: string): any {
  return {
    plan: {
      headline: 'Start small.',
      steps: ['One slow breath.', 'One honest sentence.', 'One clean action.'],
    },
    _offline_fallback: true,
  };
}

function generateInfoScreenData(type: string, _data: any): any {
  const defaults: Record<string, any> = {
    mantra: {
      title: 'Om Namah Shivaya',
      devanagari: 'ॐ नमः शिवाय',
      meaning: 'A turning toward the steady self.',
      instruction: 'Chant slowly. Let the meaning settle within.',
    },
    sankalp: {
      line: 'I protect what matters and let the rest pass.',
      instruction: 'Hold the intention in the body, not just the mind.',
    },
    practice: {
      title: 'Nine slow breaths, eyes soft',
      instruction: 'Sit comfortably. Breathe in for four, out for six. Nine rounds.',
    },
  };
  return { ...(defaults[type] || {}), _offline_fallback: true };
}

function generatePathEvolutionScreen(oldFocus: string, newFocus: string): any {
  return {
    headline: `Shifting from ${oldFocus} to ${newFocus}.`,
    subtext: 'The path moves when you move. Trust the turn.',
    _offline_fallback: true,
  };
}

const SUB_FOCUS_METRICS: Record<string, string[]> = {};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTz(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
}

function extractBaselineMetrics(
  subFocus: string | undefined,
  screenState: Record<string, any>,
): Record<string, any> {
  const metrics: Record<string, any> = {};
  if (subFocus && SUB_FOCUS_METRICS[subFocus]) {
    SUB_FOCUS_METRICS[subFocus].forEach((m) => {
      let val = screenState[m];
      if (val === undefined || val === null) {
        const matchingKey = Object.keys(screenState).find(
          (k) => k.toLowerCase() === m.toLowerCase(),
        );
        if (matchingKey) val = screenState[matchingKey];
      }
      if (val !== undefined && val !== null) {
        metrics[m.toLowerCase()] = val;
      }
    });
  }
  return metrics;
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * POST mitra/generate-companion/ — Generate personalized companion (v3).
 *
 * v3 (2026-04-13): `scan_focus` is the canonical intent field. Callers
 * should populate it from FRICTION_TO_SCAN_FOCUS. Legacy `focus` is still
 * sent (aliased server-side via LEGACY_FOCUS_TO_SCAN_FOCUS) so pre-v3
 * backend builds keep functioning, but new integrations target scan_focus.
 *
 * `freeform_text` is optional Turn-2/Turn-3 open input; the backend passes
 * it to the persona_bucket_detector for additive life-stage signal.
 */
export async function mitraGenerateCompanion(inputData: any): Promise<any> {
  try {
    const baselineMetrics = extractBaselineMetrics(
      inputData.sub_focus,
      inputData.baseline_metrics || {},
    );
    const body: Record<string, any> = {
      subFocus: inputData.sub_focus,
      baselineMetrics,
      depth: inputData.depth,
      locale: 'en',
      tz: getTz(),
    };
    if (inputData.scan_focus) body.scan_focus = inputData.scan_focus;
    if (inputData.focus) body.focus = inputData.focus;
    if (inputData.freeform_text) body.freeform_text = inputData.freeform_text;
    const res = await api.post('mitra/generate-companion/', body);
    console.log('[MITRA] API response received', res.data?._backend, 'mapping:', res.data?._mapping);
    return res.data;
  } catch (err: any) {
    console.warn('[MITRA] API failed, falling back to local engine:', err.message);
    const fallback = generateCompanionResponse(inputData);
    if (fallback) return fallback;
    console.error('[MITRA] Local fallback also returned null');
    return null;
  }
}

/** POST mitra/track-event/ — Track a journey event or milestone. */
export async function mitraTrackEvent(eventName: string, inputData: any): Promise<any> {
  try {
    const { journeyId, dayNumber, meta } = inputData;
    const res = await api.post('mitra/track-event/', {
      eventName, journeyId, dayNumber,
      locale: 'en', tz: getTz(), meta: meta || {},
    });
    console.log(`[MITRA] track-event "${eventName}" logged`);
    return res.data;
  } catch (err: any) {
    console.warn(`[MITRA] track-event "${eventName}" failed:`, err.message);
    return null;
  }
}

/** POST mitra/track-completion/ — Track practice/mantra/sankalp completion. */
export async function mitraTrackCompletion(inputData: any): Promise<any> {
  try {
    const { itemType, itemId, source, journeyId, dayNumber, meta } = inputData;
    const res = await api.post('mitra/track-completion/', {
      itemType, itemId, source, journeyId, dayNumber,
      tz: getTz(), meta: meta || {},
    });
    console.log('[MITRA] track-completion API response received', res.data);
    return res.data;
  } catch (err: any) {
    console.warn('[MITRA] track-completion API failed:', err.message);
    return null;
  }
}

/** POST mitra/help-me-choose/ — AI-powered path/focus guidance. */
export async function mitraHelpMeChoose(inputData: any): Promise<any> {
  try {
    const res = await api.post('mitra/help-me-choose/', inputData);
    return res.data;
  } catch (err: any) {
    console.warn('[MITRA] help-me-choose failed, falling back:', err.message);
    return generateHelpMeChooseResponse(inputData);
  }
}

/** POST mitra/prana-acknowledge/ — Prana check-in acknowledgement. */
export async function mitraPranaAcknowledge(inputData: any): Promise<any> {
  try {
    const res = await api.post('mitra/prana-acknowledge/', inputData);
    return res.data;
  } catch (err: any) {
    console.warn('[MITRA] prana-acknowledge failed, falling back:', err.message);
    return generatePranaAcknowledgement(inputData.pranaType, inputData.focus, inputData.locale || 'en');
  }
}

/** POST mitra/trigger-mantras/ — Trigger mantra suggestions. */
export async function mitraTriggerMantras(inputData: any): Promise<any> {
  try {
    const res = await api.post('mitra/trigger-mantras/', inputData);
    return res.data;
  } catch (err: any) {
    console.warn('[MITRA] trigger-mantras failed, falling back:', err.message);
    return generateTriggerMantraSuggestions(inputData.feeling, inputData.locale || 'en');
  }
}

/** GET mitra/journey/checkpoint/{day}/ — Fetch checkpoint data. */
export async function mitraGetCheckpoint(day: number): Promise<any> {
  try {
    const res = await api.get(`mitra/journey/checkpoint/${day}/`, { params: { tz: getTz() } });
    console.log(`[MITRA] checkpoint/${day} data fetched`);
    return res.data;
  } catch (err: any) {
    console.error(`[MITRA] checkpoint/${day} fetch failed:`, err.message);
    return null;
  }
}

/** POST mitra/journey/checkpoint/{day}/submit/ — Submit checkpoint decision. */
export async function mitraSubmitCheckpoint(day: number, payload: any): Promise<any> {
  try {
    const res = await api.post(`mitra/journey/checkpoint/${day}/submit/`, { ...payload, tz: getTz() });
    console.log(`[MITRA] checkpoint/${day} submission complete`);
    return res.data;
  } catch (err: any) {
    console.error(`[MITRA] checkpoint/${day} submission failed:`, err.message);
    return null;
  }
}

/** Orchestrate checkpoint fetch + normalize into screen-ready shape. */
export async function mitraCheckpoint(screenState: any, targetDay: number | null = null): Promise<any> {
  const day = targetDay || screenState.day_number || 7;
  console.log(`[MITRA] Requesting checkpoint data for Day ${day}`);
  const data = await mitraGetCheckpoint(day);

  if (data) {
    const options: any[] = [];
    const rec = data.recommendation;
    const engagementLevel = data.engagement?.engagementLevel || '';

    if (day === 7) {
      if (rec?.action === 'lighten') {
        options.push({ id: 'lighten', label: 'Lighten My Path' });
        (rec?.alternatives || []).forEach((alt: string) => {
          if (alt !== 'reset') return;
          if (!options.find((o: any) => o.id === alt)) {
            options.push({ id: alt, label: 'Start Fresh' });
          }
        });
      } else {
        options.push({ id: 'continue', label: 'Continue' });
      }
    } else if (day === 14) {
      options.push({ id: 'continue_same', label: 'Continue Same Path' });
      if (rec?.deepenSuggestion) {
        options.push({ id: 'deepen', label: `Deepen: ${rec.deepenSuggestion.title}`, description: rec.deepenSuggestion.reason });
      }
      options.push({ id: 'change_focus', label: 'Change My Focus' });
    }

    const engagement = data.engagement || {};
    return {
      headline: data.identityLabel || `Day ${day}`,
      subtext: rec?.mitraMessage || data.pathMilestone?.message || '',
      question: data.reflectionPrompt || 'How has your practice felt?',
      options,
      metrics: data.baseline?.baselineMetrics || {},
      show_feelings: engagementLevel !== 'near_zero',
      originalData: data,
      day,
      type: data.checkpoint?.type || '',
      engagementLevel,
      supportStability: engagement.supportStability || '',
      trendGraph: data.trendGraph || { engaged: [], fullyCompleted: [] },
      strongestArea: data.patternNotice?.strongestArea || data.cycleReflection?.strongestType || '',
      observation: data.patternNotice?.observation || data.cycleReflection?.mitraReflection || '',
      recommendationAction: rec?.action || '',
      deepenSuggestion: rec?.deepenSuggestion || null,
      refinementSignal: data.refinementSignal || null,
      pathDurationDays: data.pathContext?.pathDurationDays || 0,
      pathMilestoneMessage: data.pathMilestone?.message || '',
      growthArea: data.cycleReflection?.growthArea || '',
      consistencyScore: data.cycleReflection?.consistencyScore || 0,
      daysEngaged: engagement.daysEngaged || 0,
      daysFullyCompleted: engagement.daysFullyCompleted || 0,
      totalDays: engagement.totalDays || day,
    };
  }

  return generateCheckpointData(screenState);
}

/** POST mitra/reset-plan/ — Low-engagement recovery guide. */
export async function mitraResetPlan(obstacle: string): Promise<any> {
  try {
    const res = await api.post('mitra/reset-plan/', { obstacle });
    return res.data;
  } catch (err: any) {
    console.warn('[MITRA] reset-plan failed, falling back:', err.message);
    return generateResetPlan(obstacle);
  }
}

/** POST mitra/info-screen/ — Info screen content for items. */
export async function mitraInfoScreen(type: string, data: any): Promise<any> {
  try {
    const res = await api.post('mitra/info-screen/', { type, data });
    return res.data;
  } catch (err: any) {
    console.warn('[MITRA] info-screen failed, falling back:', err.message);
    return generateInfoScreenData(type, data);
  }
}

/** POST mitra/path-evolution/ — Path evolution narrative on focus change. */
export async function mitraPathEvolution(oldFocus: string, newFocus: string): Promise<any> {
  try {
    const res = await api.post('mitra/path-evolution/', { oldFocus, newFocus });
    return res.data;
  } catch (err: any) {
    console.warn('[MITRA] path-evolution failed, falling back:', err.message);
    return generatePathEvolutionScreen(oldFocus, newFocus);
  }
}

/** GET mitra/journey/additional/list/ — Fetch user's additional practices. */
export async function mitraFetchAdditionalItems(): Promise<any> {
  try {
    const res = await api.get('mitra/journey/additional/list/', { params: { tz: getTz() } });
    return res.data;
  } catch (err: any) {
    console.error('[MITRA] fetch additional items failed:', err.message);
    return { items: [], uiHints: {} };
  }
}

/** POST mitra/journey/additional/{id}/complete/ — Mark additional practice as complete. */
export async function mitraCompleteAdditionalItem(itemId: string | number): Promise<any> {
  try {
    const res = await api.post(`mitra/journey/additional/${itemId}/complete/`, { tz: getTz() });
    return res.data;
  } catch (err: any) {
    console.error('[MITRA] complete additional item failed:', err.message);
    throw err;
  }
}

/** DELETE mitra/journey/additional/{id}/ — Remove additional practice. */
export async function mitraRemoveAdditionalItem(itemId: string | number): Promise<any> {
  try {
    const res = await api.delete(`mitra/journey/additional/${itemId}/`);
    return res.data;
  } catch (err: any) {
    console.error('[MITRA] remove additional item failed:', err.message);
    throw err;
  }
}

/** GET mitra/library/search/ — Search for practices in the library. */
export async function mitraLibrarySearch(query: string, itemType?: string): Promise<any> {
  try {
    const res = await api.get('mitra/library/search/', {
      params: { q: query, itemType, limit: 5 },
    });
    return res.data;
  } catch (err: any) {
    console.error('[MITRA] library search failed:', err.message);
    return { results: [] };
  }
}

/** GET mitra/journey/progress/ — Fetch user's journey progress stats. */
export async function mitraFetchProgress(): Promise<any> {
  try {
    const res = await api.get('mitra/journey/progress/', { params: { tz: getTz() } });
    return res.data;
  } catch (err: any) {
    console.error('[MITRA] fetch progress failed:', err.message);
    return null;
  }
}

/** GET mitra/journey/status/ — Journey status; may return welcomeBack flag. */
export async function mitraJourneyStatus(): Promise<any> {
  try {
    const res = await api.get('mitra/journey/status/', { params: { tz: getTz() } });
    return res.data;
  } catch (err: any) {
    console.warn('[MITRA] journey/status failed — offline fallback (no journey):', err.message);
    // Offline fallback — treat as "no active journey" so Home.tsx auto-routes
    // into welcome_onboarding instead of getting stuck on the legacy splash.
    return {
      hasActiveJourney: false,
      journeyId: null,
      welcomeBack: false,
      dayNumber: 0,
      _offline_fallback: true,
    };
  }
}

/** GET mitra/journey/companion/ — Read-only companion data for the current
 *  active journey. Use this when resuming a known journey instead of
 *  generate_companion, which would create a new journey and reset day_number.
 */
export async function mitraJourneyCompanion(): Promise<any> {
  try {
    const res = await api.get('mitra/journey/companion/', { params: { tz: getTz() } });
    return res.data;
  } catch (err: any) {
    console.warn('[MITRA] journey/companion failed:', err.message);
    return null;
  }
}

/**
 * Week 1 — Welcome Onboarding APIs (Mitra v3 Moments 1-7).
 * Spec: route_welcome_onboarding.md §6
 *
 * NOTE 2026-04-13 audit cleanup (F8): postOnboardingTurn and postJourneyCreate
 * were removed — backend has neither endpoint. Per-turn analytics is via
 * track-event (already wrapped). Journey creation happens server-side as a
 * side effect of generate-companion at Turn 5 with day_number: 1.
 */

/** PATCH mitra/companion-state/ — write guidance_mode and other prefs. */
export async function patchCompanionState(patch: Record<string, any>): Promise<any> {
  try {
    const res = await api.patch('mitra/companion-state/', patch);
    return res.data;
  } catch (err: any) {
    console.warn('[MITRA] companion-state PATCH failed:', err.message);
    return null;
  }
}

/**
 * GET mitra/clear-window/ — Moment 43 Clear Window banner data source.
 * Backend B4-v2 shipped 2026-04-13 (commits cfef7cbb + 4fff840f). 5-gate
 * signal-based detection (volatility, upcoming alerts, fresh dissonance,
 * active hours, 7-day cooldown); never synthesizes.
 *
 * Flag MITRA_V3_CLEAR_WINDOW default OFF → 404 (card hides).
 * Response when active:
 *   { active: true, headline, message, until_time, window_minutes,
 *     confidence, signals_used }
 * Response when gated: { active: false } or 404.
 */
export async function getClearWindow(): Promise<any> {
  try {
    const res = await api.get('mitra/clear-window/', { params: { tz: getTz() } });
    // Normalize: treat {active:false} same as null so frontend can just null-check.
    if (res.data && res.data.active === false) return null;
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 502 || !status) return null;
    console.warn('[MITRA] clear-window failed:', err.message);
    return null;
  }
}

/**
 * Week 4 — Support Path APIs (Mitra v3 Moments 31, 38 + Phase 1.5 intent).
 * All feature-flagged on backend; 404-tolerant, never throw to UI.
 */

/**
 * POST mitra/voice/notes/ — multipart upload for Moment 31 voice capture.
 *
 * G15 — Phase 6. If a recorded audio URI is passed, the request is sent as
 * multipart/form-data with the audio file; otherwise falls back to JSON
 * metadata-only (matches prior behavior for text fallback or endpoints still
 * behind a flag that only accept metadata).
 *
 * G16 — backend VoiceNote.source_surface now accepts evening_reflection +
 * post_conflict_voice_note natively (migration 0102). No remap needed; the
 * value passes through unchanged.
 */
export async function postVoiceNote(
  audioUri: string | null,
  metadata: {
    source_surface?: string;
    duration_ms?: number;
    mime_type?: string;
  },
): Promise<any> {
  const source_surface = metadata?.source_surface || 'journal_capture';
  const duration_ms = metadata?.duration_ms ?? 0;

  try {
    if (audioUri) {
      const form = new FormData();
      // RN FormData file form — backend uses request.FILES['audio'].
      const mime = metadata?.mime_type || 'audio/m4a';
      // Derive a reasonable filename from mime.
      const ext = mime.includes('mpeg') ? 'mp3' : mime.includes('wav') ? 'wav' : 'm4a';
      // @ts-ignore — RN FormData file tuple shape not in DOM types.
      form.append('audio', {
        uri: audioUri,
        name: `voice_note.${ext}`,
        type: mime,
      });
      form.append('source_surface', source_surface);
      form.append('duration_ms', String(duration_ms));
      const res = await api.post('mitra/voice/notes/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    }
    const res = await api.post('mitra/voice/notes/', {
      source_surface,
      duration_ms,
      has_audio: false,
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 503) {
      console.warn('[MITRA] voice/notes endpoint unavailable (flag off)');
      return null;
    }
    console.warn('[MITRA] postVoiceNote failed:', err?.message);
    return null;
  }
}

export async function getVoiceNoteInterpretation(id: string): Promise<any> {
  if (!id) return null;
  try {
    const res = await api.get(`mitra/voice/notes/${id}/interpretation/`);
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 503) return null;
    console.warn('[MITRA] getVoiceNoteInterpretation failed:', err?.message);
    return null;
  }
}

export async function postInterpretIntent(text: string): Promise<any> {
  if (!text || !text.trim()) return null;
  try {
    const res = await api.post('mitra/interpret-intent/', { text });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 503) return null;
    console.warn('[MITRA] postInterpretIntent failed:', err?.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Week 5 — Reflection + Checkpoints (Mitra v3 Moments 23, 24, 25, 26, 34)
// All feature-flagged; callers tolerate null gracefully.
// ---------------------------------------------------------------------------

export async function getResilienceNarrative(): Promise<any> {
  try {
    const res = await api.get('mitra/resilience-narrative/', { params: { tz: getTz() } });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404) {
      console.log('[MITRA] resilience-narrative: feature flag off (404)');
    } else {
      console.warn('[MITRA] resilience-narrative failed:', err.message);
    }
    return null;
  }
}

export async function postGratitudeLedger(entry: {
  signal_type: string;
  text?: string;
  meta?: Record<string, any>;
}): Promise<any> {
  try {
    const res = await api.post('mitra/gratitude-ledger/', {
      ...entry,
      tz: getTz(),
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404) {
      console.log(`[MITRA] gratitude-ledger (${entry.signal_type}): feature flag off (404)`);
    } else {
      console.warn(`[MITRA] gratitude-ledger (${entry.signal_type}) failed:`, err.message);
    }
    return null;
  }
}

export async function getWeeklyReflectionData(cycleDay?: number): Promise<any> {
  try {
    const res = await api.get('mitra/journey/weekly-reflection/', {
      params: { cycle_day: cycleDay, tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404) {
      try {
        const fallback = await api.get('mitra/journey/status/');
        return fallback?.data || null;
      } catch {
        return null;
      }
    }
    console.warn('[MITRA] weekly-reflection failed:', err.message);
    return null;
  }
}

/** POST mitra/journey/welcome-back/ — Submit welcome-back decision (continue | fresh). */
export async function mitraJourneyWelcomeBack(decision: 'continue' | 'fresh'): Promise<any> {
  try {
    const res = await api.post('mitra/journey/welcome-back/', { decision, tz: getTz() });
    console.log(`[MITRA] welcome-back decision "${decision}" submitted`);
    return res.data;
  } catch (err: any) {
    console.error('[MITRA] welcome-back submission failed:', err.message);
    return null;
  }
}


// ---------------------------------------------------------------------------
// Week 6 — Companion Intelligence APIs (Moments 27, 28, 29, 30, 39)
// ---------------------------------------------------------------------------

export async function getPrepContext(params: Record<string, any> = {}): Promise<any> {
  try {
    const res = await api.get('mitra/prep/', { params: { ...params, tz: getTz() } });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 502 || !status) {
      // Flag-off (404) or backend unreachable (502/timeout) → offline fallback
      // so the sheet renders sample coaching content instead of a blank state.
      return {
        surface: 'Steady before',
        strategy_line: 'Lower your voice slightly. Let them finish before you respond.',
        grounding_action: 'One slow breath before you enter the room.',
        do_frame: 'Speak from steadiness. Keep to one clean point.',
        dont_frame: "Don't enter already arguing in your head.",
        principle_hint: null,
        context_type: params?.context_type || 'work_conversation',
        _offline_fallback: true,
      };
    }
    console.warn('[MITRA] prep/ failed:', err.message);
    return null;
  }
}

/** GET mitra/predictive/alerts/ — Moment 28 friction forecasts.
 *  Audit fix F5 (2026-04-13): URL was 'predictive-alerts' (hyphen), but
 *  backend exposes 'predictive/alerts' (slash). Fixed.
 */
export async function getPredictiveAlerts(): Promise<any> {
  try {
    const res = await api.get('mitra/predictive/alerts/', { params: { tz: getTz() } });
    return res.data;
  } catch (err: any) {
    if (err?.response?.status && err?.response?.status !== 404 && err?.response?.status !== 502) {
      console.warn('[MITRA] predictive/alerts failed:', err.message);
    }
    return null;
  }
}

/** POST mitra/predictive/alerts/<id>/dismiss/ — Moment 28 user-dismiss action. */
export async function dismissPredictiveAlert(alertId: string | number): Promise<any> {
  try {
    const res = await api.post(`mitra/predictive/alerts/${alertId}/dismiss/`);
    return res.data;
  } catch (err: any) {
    console.warn(`[MITRA] predictive/alerts/${alertId}/dismiss failed:`, err.message);
    return null;
  }
}

/** POST mitra/predictive/alerts/<id>/mute-entity/ — mute the entity behind an alert. */
export async function mutePredictiveAlertEntity(alertId: string | number): Promise<any> {
  try {
    const res = await api.post(`mitra/predictive/alerts/${alertId}/mute-entity/`);
    return res.data;
  } catch (err: any) {
    console.warn(`[MITRA] predictive/alerts/${alertId}/mute-entity failed:`, err.message);
    return null;
  }
}

/** GET mitra/briefing/today/ — Moment 8/Dashboard morning briefing.
 *  Audit fix F2 (2026-04-13): added wrapper. Backend has it; spec dashboard §6
 *  step 4 declares it as a separate endpoint (not bundled in generate-companion).
 *  Returns: { audio_url, script, voice_preset, duration_ms } or null when no
 *  briefing today / flag off / 502.
 */
export async function getBriefingToday(): Promise<any> {
  try {
    const res = await api.get('mitra/briefing/today/', { params: { tz: getTz() } });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 502 || !status) {
      // Briefing card hides gracefully when no briefing for today.
      return null;
    }
    console.warn('[MITRA] briefing/today failed:', err.message);
    return null;
  }
}

/** GET mitra/resilience-ledger/?limit=N — Moment 23/26 dashboard data source.
 *  Audit fix F3 (2026-04-13): distinct from getResilienceNarrative (which is the
 *  LLM-generated paragraph). Ledger is the raw entity-linked resilience data.
 *  Spec dashboard §6 step 7 + route_reflection_weekly entity highlights.
 */
export async function getResilienceLedger(params: { limit?: number; entity_id?: string | number } = {}): Promise<any> {
  try {
    const res = await api.get('mitra/resilience-ledger/', {
      params: { ...params, tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 502 || !status) return null;
    console.warn('[MITRA] resilience-ledger failed:', err.message);
    return null;
  }
}

/** GET mitra/recommended-additional/ — Moment 30 post-core recommendation. */
export async function getRecommendedAdditional(): Promise<any> {
  try {
    const res = await api.get('mitra/recommended-additional/', {
      params: { tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    if (err?.response?.status && err?.response?.status !== 404 && err?.response?.status !== 502) {
      console.warn('[MITRA] recommended-additional/ failed:', err.message);
    }
    return null;
  }
}

/** GET mitra/post-conflict-context/ — Moment 39 dissonance-thread context. */
export async function getPostConflictContext(): Promise<any> {
  try {
    const res = await api.get('mitra/post-conflict-context/', {
      params: { tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    if (err?.response?.status && err?.response?.status !== 404 && err?.response?.status !== 502) {
      console.warn('[MITRA] post-conflict-context/ failed:', err.message);
    }
    return null;
  }
}

/** POST mitra/entities/check-duplicate/ — Moment 29 probe from freeform mention text. */
export async function postEntitiesCheckDuplicate(
  entity_context: string,
  entity_type?: string,
): Promise<any> {
  try {
    const payload: Record<string, any> = { entity_context };
    if (entity_type) payload.entity_type = entity_type;
    const res = await api.post('mitra/entities/check-duplicate/', payload);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status !== 404) {
      console.warn('[MITRA] entities/check-duplicate failed:', err.message);
    }
    return null;
  }
}

/** PATCH mitra/entities/<id>/ — Moment 29 confirm / dismiss / snooze / mute.
 *  Backend B5 shipped 2026-04-13: generic PATCH with {status, snooze_until}.
 *  status: 'confirmed' | 'dismissed' | 'snoozed' | 'muted'
 */
export async function patchEntity(
  id: string | number,
  payload: Record<string, any>,
): Promise<any> {
  try {
    const res = await api.patch(`mitra/entities/${id}/`, payload);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status !== 404) {
      console.warn(`[MITRA] entities/${id} PATCH failed:`, err.message);
    }
    return null;
  }
}

/** PATCH mitra/dissonance-threads/<id>/ — Moment 39 post-conflict ack.
 *  Backend B3 shipped 2026-04-13. Body: { status: 'acknowledged' | 'resolved'
 *  | 'stale' | 'softened' }. Sets timestamps server-side.
 */
export async function patchDissonanceThread(
  id: string | number,
  payload: { status: 'acknowledged' | 'resolved' | 'stale' | 'softened' },
): Promise<any> {
  try {
    const res = await api.patch(`mitra/dissonance-threads/${id}/`, payload);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status !== 404) {
      console.warn(`[MITRA] dissonance-threads/${id} PATCH failed:`, err.message);
    }
    return null;
  }
}

/** GET mitra/panchang/today/ — Moment 44 season change banner data source.
 *  Backend B2 shipped 2026-04-13. Returns { date, ritu, ritu_english,
 *  ritu_changed_today, tithi, festival, moon_phase, sunrise, sunset } or null.
 *  Optional ?date= override for testing.
 */
export async function getPanchangToday(date?: string): Promise<any> {
  try {
    const res = await api.get('mitra/panchang/today/', {
      params: date ? { date, tz: getTz() } : { tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 502 || !status) return null;
    console.warn('[MITRA] panchang/today failed:', err.message);
    return null;
  }
}


// ---------------------------------------------------------------------------
// Week 7 — Why-This + grief/loneliness/joy APIs (Moments 36, 37, 45, 46, 47)
// ---------------------------------------------------------------------------

export async function getPrinciple(id: string | number): Promise<any> {
  if (!id) return null;
  try {
    const res = await api.get(`mitra/principles/${id}/`);
    return res.data || null;
  } catch (err: any) {
    console.warn(`[MITRA] principles/${id} failed (tolerated):`, err.message);
    return null;
  }
}

/** GET mitra/principles/{id}/sources/ — Principle source for Why-This L3. */
export async function getPrincipleSource(id: string | number): Promise<any> {
  if (!id) return null;
  try {
    const res = await api.get(`mitra/principles/${id}/sources/`);
    return res.data || null;
  } catch (err: any) {
    console.warn(`[MITRA] principles/${id}/sources failed (tolerated):`, err.message);
    return null;
  }
}

/** GET mitra/support/grief-context/ — Grief room contextual copy/prompt. */
export async function getGriefContext(): Promise<any> {
  try {
    const res = await api.get('mitra/support/grief-context/');
    return res.data || null;
  } catch (err: any) {
    console.warn('[MITRA] grief-context failed (fallback applied):', err.message);
    return {
      opening_line: "I'm here. No rush.",
      presence_hint: 'No timer. No goal. Just a space to sit.',
      principle_hint: null,
      _offline_fallback: true,
    };
  }
}

/** GET mitra/support/loneliness-context/ — Loneliness room context + chant. */
export async function getLonelinessContext(): Promise<any> {
  try {
    const res = await api.get('mitra/support/loneliness-context/');
    return res.data || null;
  } catch (err: any) {
    console.warn('[MITRA] loneliness-context failed (fallback applied):', err.message);
    return {
      opening_line: "Let's chant together for a minute. Not alone.",
      chant: { id: 'fallback_chant', reps: 11, title: 'So Hum', devanagari: 'सो हम्' },
      _offline_fallback: true,
    };
  }
}

/** GET mitra/joy-signal/ — Today's joy signal (Moment 45). null when no signal. */
export async function getJoySignal(): Promise<any> {
  try {
    const res = await api.get('mitra/joy-signal/');
    return res.data || null;
  } catch (err: any) {
    console.warn('[MITRA] joy-signal failed (tolerated):', err.message);
    return null;
  }
}

