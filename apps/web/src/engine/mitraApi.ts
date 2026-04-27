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
 * Falls back to mitra/today/ ONLY on 404 (feature flag off).
 * The today/ response is NOT v3Ingest-compatible; caller must handle _isLegacyFallback.
 */
export async function getDashboardView(): Promise<any> {
  try {
    const res = await api.get('mitra/v3/journey/daily-view/');
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      console.warn('[mitraApi] v3/journey/daily-view/ returned 404 — falling back to mitra/today/. v3Ingest will produce empty keys; dashboard may be degraded.');
      const res = await api.get('mitra/today/');
      // Tag so callers can show a safe fallback state rather than trying v3Ingest
      return { ...(res.data ?? {}), _isLegacyFallback: true };
    }
    throw err;
  }
}

export async function getJourneyStatus(): Promise<any> {
  try {
    const res = await api.get('mitra/journey/status/');
    return res.data;
  } catch {
    return null;
  }
}

// ─── Telemetry — camelCase to match mobile wire format ────────────────────────

function getTz(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
}

/**
 * POST /api/mitra/track-event/ — Backend accepts camelCase (matching mobile).
 * Normalises snake_case keys from call sites for backwards compatibility.
 */
export async function trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
  try {
    const p = properties ?? {};
    await api.post('mitra/track-event/', {
      eventName,
      journeyId: p.journeyId ?? p.journey_id ?? null,
      dayNumber: p.dayNumber ?? p.day_number ?? 1,
      locale: 'en',
      tz: getTz(),
      meta: p.meta ?? {},
    });
  } catch {
    // swallow — telemetry must never break product flow
  }
}

/**
 * POST /api/mitra/track-completion/ — Backend accepts camelCase (matching mobile).
 * Normalises snake_case keys from call sites for backwards compatibility.
 */
export async function trackCompletion(payload: Record<string, any>): Promise<void> {
  const p = payload;
  await api.post('mitra/track-completion/', {
    itemType: p.itemType ?? p.item_type,
    itemId: p.itemId ?? p.item_id,
    source: p.source ?? null,
    journeyId: p.journeyId ?? p.journey_id ?? null,
    dayNumber: p.dayNumber ?? p.day_number ?? 1,
    tz: getTz(),
    meta: p.meta ?? {},
  });
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

// ─── WhyThis Principles ───────────────────────────────────────────────────────

/**
 * GET /api/mitra/principles/{id}/ — Principle detail for WhyThis L2 overlay.
 * Returns null on 404 (principle removed); caller hides "Go deeper" button.
 */
export async function getPrinciple(id: string | number): Promise<any> {
  try {
    const res = await api.get(`mitra/principles/${encodeURIComponent(String(id))}/`);
    if (import.meta.env.DEV) {
      console.log(`[mitraApi] principles/${id}/ shape:`, JSON.stringify(res.data)?.slice(0, 200));
    }
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    console.warn('[mitraApi] getPrinciple failed:', err?.message);
    return null;
  }
}

/**
 * GET /api/mitra/principles/{id}/sources/ — Source attribution for WhyThis L3.
 * Returns null on 404; caller hides source attribution section.
 */
export async function getPrincipleSource(id: string | number): Promise<any> {
  try {
    const res = await api.get(`mitra/principles/${encodeURIComponent(String(id))}/sources/`);
    if (import.meta.env.DEV) {
      console.log(`[mitraApi] principles/${id}/sources/ shape:`, JSON.stringify(res.data)?.slice(0, 200));
    }
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    console.warn('[mitraApi] getPrincipleSource failed:', err?.message);
    return null;
  }
}

// ─── Checkpoints ──────────────────────────────────────────────────────────────

/**
 * GET /api/mitra/v3/journey/day-7-view/ — Day 7 checkpoint view envelope.
 * Returns null on 404 (not yet day 7); caller shows "not ready" card.
 */
export async function mitraJourneyDay7View(): Promise<any> {
  try {
    const res = await api.get('mitra/v3/journey/day-7-view/');
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

/**
 * GET /api/mitra/v3/journey/day-14-view/ — Day 14 checkpoint view envelope.
 * Returns null on 404 (not yet day 14); caller shows "not ready" card.
 */
export async function mitraJourneyDay14View(): Promise<any> {
  try {
    const res = await api.get('mitra/v3/journey/day-14-view/');
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

/**
 * POST /api/mitra/v3/journey/day-7-decision/ — Submit Day 7 decision.
 * decisions: 'continue' | 'lighten' | 'reset'
 * Idempotency-Key header prevents double submission on retry.
 */
export async function mitraJourneyDay7Decision(
  payload: { decision: string; [key: string]: any },
  idempotencyKey: string,
): Promise<any> {
  const res = await api.post('mitra/v3/journey/day-7-decision/', payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return res.data;
}

/**
 * POST /api/mitra/v3/journey/day-14-decision/ — Submit Day 14 decision.
 * decisions: 'continue_same' | 'deepen' | 'change_focus'
 */
export async function mitraJourneyDay14Decision(
  payload: { decision: string; [key: string]: any },
  idempotencyKey: string,
): Promise<any> {
  const res = await api.post('mitra/v3/journey/day-14-decision/', payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return res.data;
}
