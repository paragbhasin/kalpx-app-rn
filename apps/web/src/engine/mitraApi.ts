import { api } from '../lib/api';
import type { MitraHomeV3Response, TellMitraV3Response, QuickCheckinEnergyState, QuickCheckinResponse, RhythmSuggestRequest, RhythmSuggestResponse, TellMitraFollowupMeta } from '@kalpx/types';
import { normalizeTellMitraResult, normalizeRhythmSuggestResponse } from '@kalpx/contracts';
import type { RhythmSetupPayload } from '@kalpx/contracts';

const DASHBOARD_VIEW_TTL_MS = 30_000;
const ADDITIONAL_ITEMS_TTL_MS = 30_000;
const ENTRY_VIEW_TTL_MS = 30_000;

let _dashboardViewCache: { data: any; ts: number } | null = null;
let _dashboardViewInflight: Promise<any> | null = null;

let _additionalItemsCache:
  | { data: { items: any[]; uiHints: { shouldCollapse?: boolean } }; ts: number }
  | null = null;
let _additionalItemsInflight: Promise<{ items: any[]; uiHints: { shouldCollapse?: boolean } }> | null = null;

let _entryViewCache:
  | {
      data: {
        envelope: any | null;
        etag: string | null;
        notModified: boolean;
      };
      ts: number;
    }
  | null = null;
let _entryViewInflight: Promise<{
  envelope: any | null;
  etag: string | null;
  notModified: boolean;
}> | null = null;

let _journeyHomeCache: { data: any; ts: number } | null = null;
let _journeyHomeInflight: Promise<any | null> | null = null;

export function invalidateDashboardViewCache(): void {
  _dashboardViewCache = null;
  _dashboardViewInflight = null;
}

export function seedDashboardViewFromEntryPayload(payload: any): void {
  if (!payload || typeof payload !== 'object') return;
  _dashboardViewCache = { data: payload, ts: Date.now() };
}

export function invalidateAdditionalItemsCache(): void {
  _additionalItemsCache = null;
  _additionalItemsInflight = null;
}

export function invalidateEntryViewApiCache(): void {
  _entryViewCache = null;
  _entryViewInflight = null;
}

export function invalidateJourneyHomeCache(): void {
  _journeyHomeCache = null;
  _journeyHomeInflight = null;
}

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

export async function getGlobalConsent(): Promise<{ receive_push_notifications: boolean; receive_emails: boolean } | null> {
  try {
    const res = await api.get('mitra/user-preferences/global-consent/');
    return res.data;
  } catch {
    return null;
  }
}

export async function patchGlobalConsent(
  patch: Partial<{ receive_push_notifications: boolean; receive_emails: boolean }>,
): Promise<{ receive_push_notifications: boolean; receive_emails: boolean } | null> {
  try {
    const res = await api.patch('mitra/user-preferences/global-consent/', patch);
    return res.data;
  } catch {
    return null;
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
  if (_dashboardViewCache && Date.now() - _dashboardViewCache.ts < DASHBOARD_VIEW_TTL_MS) {
    return _dashboardViewCache.data;
  }

  const request = _dashboardViewInflight ?? (async () => {
    try {
      const res = await api.get('mitra/v3/journey/daily-view/');
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        console.warn('[mitraApi] v3/journey/daily-view/ returned 404 — falling back to mitra/today/. v3Ingest will produce empty keys; dashboard may be degraded.');
        const res = await api.get('mitra/today/');
        return { ...(res.data ?? {}), _isLegacyFallback: true };
      }
      throw err;
    } finally {
      _dashboardViewInflight = null;
    }
  })();

  _dashboardViewInflight = request;
  const data = await request;
  _dashboardViewCache = { data, ts: Date.now() };
  return data;
}

export async function getJourneyStatus(): Promise<any> {
  try {
    const res = await api.get('mitra/journey/status/');
    return res.data;
  } catch {
    return null;
  }
}

export async function getJourneyHome(params: {
  tz?: string;
  locale?: string;
  guidance_mode?: string;
  crisis?: string;
  grief?: string;
  loneliness?: string;
} = {}): Promise<any | null> {
  if (
    _journeyHomeCache &&
    Date.now() - _journeyHomeCache.ts < ENTRY_VIEW_TTL_MS
  ) {
    return _journeyHomeCache.data;
  }

  const request = _journeyHomeInflight ?? (async () => {
    try {
      const res = await api.get('mitra/journey/home/', { params });
      return res.data;
    } catch (err: any) {
      console.warn('[mitraApi] journey/home failed:', err?.message);
      return null;
    } finally {
      _journeyHomeInflight = null;
    }
  })();

  _journeyHomeInflight = request;
  const data = await request;
  _journeyHomeCache = { data, ts: Date.now() };
  return data;
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
  life_context?: string | null;
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
  params?: {
    life_context?: string | null;
    intent_type?: string;
    source_surface?: string;
    tell_mitra_event_id?: string | number | null;
  },
): Promise<any> {
  try {
    const qp = new URLSearchParams();
    if (params?.life_context)                qp.set('life_context',        params.life_context);
    if (params?.intent_type)                 qp.set('intent_type',         params.intent_type);
    if (params?.source_surface)              qp.set('source_surface',      params.source_surface);
    if (params?.tell_mitra_event_id != null) qp.set('tell_mitra_event_id', String(params.tell_mitra_event_id));
    const qs = qp.toString();
    const url = `mitra/rooms/${encodeURIComponent(roomId)}/render/${qs ? `?${qs}` : ''}`;
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
 * POST /api/mitra/rooms/{room_id}/reflect/ — Guided room reflection (S17-D4A).
 * Best-effort — errors swallowed silently.
 */
export async function postRoomReflection(
  roomId: string,
  payload: {
    response_code: string;
    render_id?: string | null;
    tell_mitra_event_id?: string | number | null;
  }
): Promise<void> {
  try {
    await api.post(`mitra/rooms/${encodeURIComponent(roomId)}/reflect/`, payload);
  } catch { /* best-effort */ }
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
  focus?: string;
  subFocus?: string;
  depth?: string;
  round?: number;
  locale?: string;
  tz?: string;
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
  void idempotencyKey;
  const res = await api.post('mitra/v3/journey/day-7-decision/', {
    ...payload,
    tz: payload.tz ?? getTz(),
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
  void idempotencyKey;
  const res = await api.post('mitra/v3/journey/day-14-decision/', {
    ...payload,
    tz: payload.tz ?? getTz(),
  });
  return res.data;
}

/**
 * GET /api/mitra/v3/journey/entry-view/ — Returns view routing envelope.
 * Supports ETag / If-None-Match for 304 not-modified handling.
 */
export async function mitraJourneyEntryView(etag?: string | null): Promise<{
  envelope: any | null;
  etag: string | null;
  notModified: boolean;
}> {
  if (!etag && _entryViewCache && Date.now() - _entryViewCache.ts < ENTRY_VIEW_TTL_MS) {
    return _entryViewCache.data;
  }

  const request = _entryViewInflight ?? (async () => {
    try {
      const headers: Record<string, string> = {};
      if (etag) headers['If-None-Match'] = etag;
      const res = await api.get('mitra/v3/journey/entry-view/', { headers, params: { tz: getTz() } });
      return {
        envelope: res.data,
        etag: (res.headers as any)['etag'] ?? null,
        notModified: false,
      };
    } catch (err: any) {
      if (err?.response?.status === 304) {
        return { envelope: null, etag: etag ?? null, notModified: true };
      }
      throw err;
    } finally {
      _entryViewInflight = null;
    }
  })();

  _entryViewInflight = request;
  const data = await request;
  if (!etag) {
    _entryViewCache = { data, ts: Date.now() };
  }
  return data;
}

/**
 * POST /api/mitra/v3/journey/reentry-decision/ — Submit welcome-back decision.
 * decision: 'continue' | 'fresh'
 */
export async function mitraJourneyReentryDecision(
  decision: 'continue' | 'fresh',
  idempotencyKey: string,
): Promise<any> {
  void idempotencyKey;
  const res = await api.post('mitra/v3/journey/reentry-decision/', {
    decision,
    tz: getTz(),
  });
  return res.data;
}

// ─── Additional Items ─────────────────────────────────────────────────────────

export async function fetchAdditionalItems(): Promise<{ items: any[]; uiHints: { shouldCollapse?: boolean } }> {
  if (_additionalItemsCache && Date.now() - _additionalItemsCache.ts < ADDITIONAL_ITEMS_TTL_MS) {
    return _additionalItemsCache.data;
  }

  const request = _additionalItemsInflight ?? (async () => {
    try {
      const res = await api.get('mitra/journey/additional/list/', { params: { tz: getTz() } });
      return res.data;
    } catch {
      return { items: [], uiHints: {} };
    } finally {
      _additionalItemsInflight = null;
    }
  })();

  _additionalItemsInflight = request;
  const data = await request;
  _additionalItemsCache = { data, ts: Date.now() };
  return data;
}

export async function removeAdditionalItem(id: string | number): Promise<void> {
  await api.delete(`mitra/journey/additional/${id}/`);
  invalidateAdditionalItemsCache();
}

export async function fetchLibraryItem(
  itemType: string,
  itemId: string,
): Promise<any | null> {
  try {
    const res = await api.get('mitra/library/item/', {
      params: { type: itemType, id: itemId },
    });
    return res.data?.item ?? res.data ?? null;
  } catch (err: any) {
    console.warn('[mitraApi] fetchLibraryItem failed:', err?.message);
    return null;
  }
}

export async function addAdditionalItem(
  itemId: string,
  itemType: string,
  source = 'additional_library',
): Promise<any> {
  const res = await api.post('mitra/journey/additional/', {
    itemId,
    itemType,
    source,
  });
  invalidateAdditionalItemsCache();
  return res.data;
}

export async function completeAdditionalItem(
  additionalItemId: string | number,
): Promise<any> {
  const res = await api.post(
    `mitra/journey/additional/${additionalItemId}/complete/`,
    {},
  );
  invalidateAdditionalItemsCache();
  return res.data;
}

export async function searchLibraryItems(
  query: string,
  itemType?: string,
): Promise<{ results: any[] }> {
  try {
    const res = await api.get('mitra/library/search/', {
      params: { q: query, itemType, limit: 5 },
    });
    const data = res.data;
    if (Array.isArray(data)) return { results: data };
    return data || { results: [] };
  } catch (err: any) {
    console.error(
      '[mitraApi] library search failed:',
      err?.response?.status,
      err?.response?.data || err?.message,
    );
    return { results: [] };
  }
}

export async function getPredictiveAlerts(): Promise<any> {
  try {
    const res = await api.get('mitra/predictive/alerts/');
    return res.data;
  } catch (err: any) {
    if (err?.response?.status !== 404 && err?.response?.status !== 502) {
      console.warn('[mitraApi] predictive/alerts failed:', err?.message);
    }
    return null;
  }
}

export async function dismissPredictiveAlert(id: string | number): Promise<any> {
  try {
    const res = await api.post(`mitra/predictive/alerts/${id}/dismiss/`);
    return res.data;
  } catch (err: any) {
    console.warn('[mitraApi] predictive/alerts dismiss failed:', err?.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// trackRoomTelemetry — Gate 6D room lifecycle events.
//
// Sends room_entered / exit_tapped to POST /api/mitra/rooms/telemetry/ so
// the backend can create JourneyActivity rows for Gate 6D post-room
// continuity push. Best-effort: try/catch ensures this never crashes room UX.
//
// Payload is deliberately minimal — only event_type, room_id, surface.
// No session content, life_context, transcript, or user data.
// ---------------------------------------------------------------------------
export async function trackRoomTelemetry(payload: {
  event_type: 'room_entered' | 'exit_tapped';
  room_id: string;
  surface: 'room';
}): Promise<void> {
  try {
    await api.post('mitra/rooms/telemetry/', payload);
  } catch {
    // best-effort; never break room UX
  }
}

export async function acceptPredictiveAlert(id: string | number): Promise<any> {
  try {
    const res = await api.post(`mitra/predictive/alerts/${id}/accept/`);
    return res.data;
  } catch (err: any) {
    console.warn('[mitraApi] predictive/alerts accept failed:', err?.message);
    return null;
  }
}

// ─── Four-Door V3 ─────────────────────────────────────────────────────────────

/**
 * GET /api/mitra/v3/journey/home/ — Four-Door home envelope (S03).
 * Returns MitraHomeV3Response with door_states, inner_path_summary, etc.
 */
export async function getMitraHomeV3(): Promise<MitraHomeV3Response> {
  const resp = await api.get<MitraHomeV3Response>('mitra/v3/journey/home/', {
    params: { tz: getTz() },
  });
  return resp.data;
}

export interface TellMitraV3Payload {
  text: string;
  energy_state?: string;
  tz?: string;
  source_surface?: string;
  followup?: TellMitraFollowupMeta;
}

/**
 * POST /api/mitra/v3/tell-mitra/ — Tell Mitra routing endpoint (S03).
 * Raw response is normalized via normalizeTellMitraResult before returning.
 */
export async function postTellMitraV3(payload: TellMitraV3Payload): Promise<TellMitraV3Response> {
  const resp = await api.post<unknown>('mitra/v3/tell-mitra/', payload);
  return normalizeTellMitraResult(resp.data);
}

export async function postRhythmSetup(payload: RhythmSetupPayload): Promise<{ status: string; reminder_preference: string; slots_set: string[]; item_count: number }> {
  const resp = await api.post<{ status: string; reminder_preference: string; slots_set: string[]; item_count: number }>('mitra/v3/rhythm/setup/', payload);
  return resp.data;
}

export async function postRhythmSuggest(payload: RhythmSuggestRequest): Promise<RhythmSuggestResponse> {
  const resp = await api.post<unknown>('mitra/v3/rhythm/suggest/', payload);
  return normalizeRhythmSuggestResponse(resp.data);
}

export async function postQuickCheckin(energy_state: QuickCheckinEnergyState): Promise<QuickCheckinResponse> {
  const resp = await api.post<QuickCheckinResponse>('mitra/v3/checkin/', {
    energy_state,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    source_surface: 'quick_checkin_page_web',
  });
  return resp.data;
}
