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
