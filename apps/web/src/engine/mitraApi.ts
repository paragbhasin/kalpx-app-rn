import { api } from '../lib/api';

export async function getUserPreferences(): Promise<any> {
  try {
    const res = await api.get('mitra/user-preferences/');
    return res.data;
  } catch {
    return null;
  }
}

export async function patchUserPreferences(patch: Record<string, any>): Promise<void> {
  try {
    await api.patch('mitra/user-preferences/', patch);
  } catch {
    // swallow
  }
}

export async function getNotificationPreferences(): Promise<any> {
  try {
    const res = await api.get('mitra/user-preferences/notifications/');
    return res.data;
  } catch {
    return null;
  }
}

export async function patchNotificationPreferences(patch: Record<string, any>): Promise<void> {
  try {
    await api.patch('mitra/user-preferences/notifications/', patch);
  } catch {
    // swallow
  }
}

export async function getDailyView(): Promise<any> {
  const res = await api.get('mitra/today/');
  return res.data;
}

/**
 * GET /api/mitra/v3/journey/daily-view/ — V3 daily view envelope used by RN dashboard.
 * Falls back to mitra/today/ for compatibility if v3 endpoint returns 404.
 */
export async function getDashboardView(): Promise<any> {
  try {
    const res = await api.get('mitra/v3/journey/daily-view/');
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const res = await api.get('mitra/today/');
      return res.data;
    }
    throw err;
  }
}

export async function getDay7View(): Promise<any> {
  const res = await api.get('mitra/checkpoint/day-7/');
  return res.data;
}

export async function getDay14View(): Promise<any> {
  const res = await api.get('mitra/checkpoint/day-14/');
  return res.data;
}

export async function getJourneyStatus(): Promise<any> {
  try {
    const res = await api.get('mitra/journey/status/');
    return res.data;
  } catch {
    return null;
  }
}

export async function trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
  try {
    await api.post('mitra/track-event/', { event_name: eventName, ...properties });
  } catch {
    // swallow — telemetry must never break product flow
  }
}

export async function trackCompletion(payload: Record<string, any>): Promise<void> {
  await api.post('mitra/track-completion/', payload);
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

/**
 * GET /api/mitra/onboarding/chips/ — Fetch dynamic stage chips.
 * Used by RN to refine chip lists; web uses static contract chips for Phase 6.
 */
export async function fetchOnboardingChips(params: {
  stage: number;
  lane: string;
  guidance_mode: string;
  stage1_choice?: string;
  stage2_choice?: string;
}): Promise<any> {
  try {
    const res = await api.get('mitra/onboarding/chips/', { params });
    return res.data;
  } catch (err: any) {
    console.warn('[mitraApi] fetchOnboardingChips failed:', err?.message);
    return null;
  }
}

/**
 * POST /api/mitra/onboarding/complete/ — Unified one-shot onboarding endpoint.
 * Returns inference, recognition line, triad labels, and onboarding metadata.
 * Called at turn_6 after all 4 stage choices + guidance_mode are collected.
 */
export async function onboardingComplete(payload: {
  stage0_choice: string;
  stage1_choice: string;
  stage2_choice: string;
  stage3_choice: string;
  guidance_mode: string;
  freeforms?: Record<string, string | null>;
}): Promise<any> {
  try {
    const res = await api.post('mitra/onboarding/complete/', payload);
    return res.data;
  } catch (err: any) {
    console.warn('[mitraApi] onboardingComplete failed:', err?.message);
    return null;
  }
}

/**
 * POST /api/mitra/journey/start-v3/ — v3 triad generation (authenticated).
 * Requires a valid Bearer token. Returns triad + journey metadata.
 * Returns null on 401 (guest) or 404 (feature flag off).
 */
export async function startJourneyV3(payload: {
  inference_state: Record<string, any>;
  guidance_mode: string;
  locale?: string;
  tz?: string;
  stage0_choice?: string;
  stage1_choice?: string;
  stage2_choice?: string;
  stage3_choice?: string;
}): Promise<any> {
  try {
    const res = await api.post('mitra/journey/start-v3/', payload);
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 401) {
      console.log('[mitraApi] start-v3: requires auth — stash inference for post-auth call');
      return null;
    }
    if (status === 404) {
      console.log('[mitraApi] start-v3: feature flag off on server');
      return null;
    }
    console.error('[mitraApi] startJourneyV3 failed:', err?.message);
    return null;
  }
}

/**
 * POST /api/mitra/journey/claim-guest/ — Claim a guest journey after login.
 * Called post-auth when a guest has an active journey UUID.
 */
export async function claimGuestJourney(): Promise<any> {
  try {
    const res = await api.post('mitra/journey/claim-guest/', {});
    return res.data;
  } catch (err: any) {
    console.warn('[mitraApi] claimGuestJourney failed:', err?.message);
    return null;
  }
}

// ─── Support: Trigger / Check-In / Rooms ─────────────────────────────────────

/**
 * GET /api/mitra/rooms/{room_id}/render/ — RoomRenderV1 envelope.
 * Returns null on 404/403 (flag off); caller shows unavailable state.
 */
export async function getRoomRender(
  roomId: string,
  params?: { life_context?: string | null },
): Promise<any> {
  try {
    const url = params?.life_context
      ? `mitra/rooms/${encodeURIComponent(roomId)}/render/?life_context=${encodeURIComponent(params.life_context)}`
      : `mitra/rooms/${encodeURIComponent(roomId)}/render/`;
    const res = await api.get(url);
    const data = res?.data;
    if (!data || typeof data !== 'object' || !Array.isArray(data.actions)) return null;
    return data;
  } catch (err: any) {
    const s = err?.response?.status;
    if (s === 404 || s === 403) return null;
    console.warn('[mitraApi] getRoomRender failed:', err?.message);
    return null;
  }
}

/**
 * POST /api/mitra/rooms/telemetry/ — Context picker telemetry (non-blocking).
 */
export async function postRoomTelemetry(payload: {
  event_type: 'context_picked' | 'context_skipped';
  room_id: string;
  life_context?: string | null;
  ts: number;
}): Promise<void> {
  try {
    await api.post('mitra/rooms/telemetry/', payload);
  } catch {
    // best-effort — swallow
  }
}

/**
 * POST /api/mitra/rooms/{room_id}/sacred/ — Sacred carry write.
 * Returns null on failure (non-blocking).
 */
export async function postRoomSacred(roomId: string, payload: Record<string, any>): Promise<any> {
  try {
    const res = await api.post(`mitra/rooms/${encodeURIComponent(roomId)}/sacred/`, payload);
    return res.data;
  } catch {
    return null;
  }
}

/**
 * POST /api/mitra/trigger-mantras/ — Trigger mantra suggestions.
 * Returns null on failure (caller shows gentle fallback).
 */
export async function postTriggerMantras(payload: {
  feeling?: string;
  locale?: string;
}): Promise<any> {
  try {
    const res = await api.post('mitra/trigger-mantras/', payload);
    return res.data;
  } catch {
    return null;
  }
}

/**
 * POST /api/mitra/prana-acknowledge/ — Prana check-in acknowledgement.
 * Returns null on failure; caller shows fallback ack.
 */
export async function postPranaAcknowledge(payload: {
  pranaType?: string;
  focus?: string;
  locale?: string;
  [key: string]: any;
}): Promise<any> {
  try {
    const res = await api.post('mitra/prana-acknowledge/', payload);
    return res.data;
  } catch {
    return null;
  }
}
