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
