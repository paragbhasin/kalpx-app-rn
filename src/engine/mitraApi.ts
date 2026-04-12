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
// Stub fallbacks — will be replaced with full dynamicContentEngine port
// ---------------------------------------------------------------------------

function generateCompanionResponse(_input: any): any { return null; }
function generateHelpMeChooseResponse(_input: any): any { return null; }
function generatePranaAcknowledgement(_pranaType: string, _focus: string, _locale: string): any { return null; }
function generateTriggerMantraSuggestions(_feeling: string, _locale: string): any { return null; }
function generateCheckpointData(_screenState: any): any { return null; }
function generateResetPlan(_obstacle: string): any { return null; }
function generateInfoScreenData(_type: string, _data: any): any { return null; }
function generatePathEvolutionScreen(_oldFocus: string, _newFocus: string): any { return null; }

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

/** POST mitra/generate-companion/ — Generate personalized companion (daily practice plan). */
export async function mitraGenerateCompanion(inputData: any): Promise<any> {
  try {
    const baselineMetrics = extractBaselineMetrics(
      inputData.sub_focus,
      inputData.baseline_metrics || {},
    );
    const res = await api.post('mitra/generate-companion/', {
      focus: inputData.focus,
      subFocus: inputData.sub_focus,
      baselineMetrics,
      depth: inputData.depth,
      locale: 'en',
      tz: getTz(),
    });
    console.log('[MITRA] API response received', res.data?._backend);
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
    console.warn('[MITRA] journey/status failed:', err.message);
    return null;
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
 * Web counterpart: kalpx-frontend/src/engine/actionExecutor.js — mitra endpoints
 * Spec: route_welcome_onboarding.md §6
 */

/** POST mitra/onboarding/turn/ — persist per-turn response (analytics + draft state). */
export async function postOnboardingTurn(turnNumber: number, payload: any): Promise<any> {
  try {
    const res = await api.post('mitra/onboarding/turn/', {
      turn_number: turnNumber,
      ...payload,
      tz: getTz(),
    });
    return res.data;
  } catch (err: any) {
    console.warn(`[MITRA] onboarding/turn ${turnNumber} failed:`, err.message);
    return null;
  }
}

/** POST mitra/journey/create/ — create a new journey at onboarding completion. */
export async function postJourneyCreate(payload: any): Promise<any> {
  try {
    const res = await api.post('mitra/journey/create/', { ...payload, tz: getTz() });
    return res.data;
  } catch (err: any) {
    console.error('[MITRA] journey/create failed:', err.message);
    return null;
  }
}

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
 * Week 2 — Day Active Dashboard API.
 * GET mitra/clear-window/ — Today's "clear window" payload for Moment 43.
 * Returns { headline, message, ... } if today is an expansive / clear-window
 * day, or null otherwise. Web parity: route_dashboard_day_active.md §15.
 */
export async function getClearWindow(): Promise<any> {
  try {
    const res = await api.get('mitra/clear-window/', { params: { tz: getTz() } });
    return res.data;
  } catch (err: any) {
    console.warn('[MITRA] clear-window failed:', err.message);
    return null;
  }
}

/**
 * Week 4 — Support Path APIs (Mitra v3 Moments 31, 38 + Phase 1.5 intent).
 * All feature-flagged on backend; 404-tolerant, never throw to UI.
 */

export async function postVoiceNote(audioBlob: any, metadata: any): Promise<any> {
  try {
    const res = await api.post('mitra/voice/notes/', {
      source_surface: metadata?.source_surface,
      duration_ms: metadata?.duration_ms ?? 0,
      has_audio: !!audioBlob,
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
