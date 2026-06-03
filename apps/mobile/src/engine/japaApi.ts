/**
 * Japa Counting Engine — API layer (Phase 1)
 *
 * All functions are idempotent and never throw — they return null on error.
 * Authentication is handled automatically by the axios interceptor.
 *
 * Endpoints:
 *   POST /api/mitra/japa/sessions/start/
 *   GET  /api/mitra/japa/sessions/active/
 *   POST /api/mitra/japa/sessions/{id}/sync/
 *   POST /api/mitra/japa/sessions/{id}/complete/
 *   GET  /api/mitra/japa/stats/
 */

import api from '../Networks/axios';
import type {
  JapaActiveSessionResponse,
  JapaCompleteRequest,
  JapaCompleteResponse,
  JapaStartRequest,
  JapaStartResponse,
  JapaStatsResponse,
  JapaSyncRequest,
  JapaSyncResponse,
} from '@kalpx/types';

const BASE = 'mitra/japa';

/** POST /api/mitra/japa/sessions/start/ — idempotent via local_session_id. */
export async function japaStartSession(
  payload: JapaStartRequest,
): Promise<JapaStartResponse | null> {
  try {
    const resp = await api.post<JapaStartResponse>(`${BASE}/sessions/start/`, payload);
    // Runtime guard: if the response doesn't have a numeric session_id the
    // backend returned something unexpected (HTML, redirect, wrong shape).
    // Return null so the engine doesn't set serverSessionId to undefined.
    if (!resp.data || typeof resp.data.session_id !== 'number') {
      console.warn('[JapaApi] startSession: unexpected response shape', resp.data);
      return null;
    }
    return resp.data;
  } catch (err: any) {
    console.warn('[JapaApi] startSession failed:', err?.message);
    return null;
  }
}

/** GET /api/mitra/japa/sessions/active/ — recover active session. 204 → null. */
export async function japaGetActiveSession(): Promise<JapaActiveSessionResponse | null> {
  try {
    const resp = await api.get<JapaActiveSessionResponse>(`${BASE}/sessions/active/`);
    if (resp.status === 204) return null;
    return resp.data;
  } catch (err: any) {
    if (err?.response?.status === 204) return null;
    console.warn('[JapaApi] getActiveSession failed:', err?.message);
    return null;
  }
}

/** POST /api/mitra/japa/sessions/{id}/sync/ — idempotent via idempotency_key. */
export async function japaSyncSession(
  sessionId: number,
  payload: JapaSyncRequest,
): Promise<JapaSyncResponse | null> {
  // Hard guard: if sessionId isn't a real number, never send the request.
  if (typeof sessionId !== 'number' || !Number.isFinite(sessionId)) {
    console.warn('[JapaApi] japaSyncSession called with invalid sessionId:', sessionId);
    return null;
  }
  try {
    const resp = await api.post<JapaSyncResponse>(
      `${BASE}/sessions/${sessionId}/sync/`,
      payload,
    );
    return resp.data;
  } catch (err: any) {
    // 409 = duplicate idempotency key — already accepted, treat as success
    if (err?.response?.status === 409) return err.response.data as JapaSyncResponse;
    console.warn('[JapaApi] syncSession failed:', err?.message);
    return null;
  }
}

/** POST /api/mitra/japa/sessions/{id}/complete/ */
export async function japaCompleteSession(
  sessionId: number,
  payload: JapaCompleteRequest,
): Promise<JapaCompleteResponse | null> {
  try {
    const resp = await api.post<JapaCompleteResponse>(
      `${BASE}/sessions/${sessionId}/complete/`,
      payload,
    );
    return resp.data;
  } catch (err: any) {
    console.warn('[JapaApi] completeSession failed:', err?.message);
    return null;
  }
}

/** GET /api/mitra/japa/stats/?mantra_ref= */
export async function japaGetStats(mantraRef?: string, sourceSurface?: string): Promise<JapaStatsResponse | null> {
  try {
    const params: Record<string, string> = {};
    if (mantraRef) params.mantra_ref = mantraRef;
    if (sourceSurface) params.source_surface = sourceSurface;
    const resp = await api.get<JapaStatsResponse>(`${BASE}/stats/`, { params: Object.keys(params).length ? params : undefined });
    return resp.data;
  } catch (err: any) {
    console.warn('[JapaApi] getStats failed:', err?.message);
    return null;
  }
}
