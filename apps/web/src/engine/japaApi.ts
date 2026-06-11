/**
 * Japa Counting Engine — API layer (web)
 * Mirrors apps/mobile/src/engine/japaApi.ts — all functions are null-safe.
 */

import { api } from '../lib/api';
import type {
  JapaCompleteRequest,
  JapaCompleteResponse,
  JapaStartRequest,
  JapaStartResponse,
  JapaStatsResponse,
  JapaSyncRequest,
  JapaSyncResponse,
} from '@kalpx/types';

const BASE = 'mitra/japa';

export async function japaStartSession(
  payload: JapaStartRequest,
): Promise<JapaStartResponse | null> {
  try {
    const resp = await api.post<JapaStartResponse>(`${BASE}/sessions/start/`, payload);
    if (!resp.data || typeof resp.data.session_id !== 'number') return null;
    return resp.data;
  } catch {
    return null;
  }
}

export async function japaSyncSession(
  sessionId: number,
  payload: JapaSyncRequest,
): Promise<JapaSyncResponse | null> {
  if (typeof sessionId !== 'number' || !Number.isFinite(sessionId)) return null;
  try {
    const resp = await api.post<JapaSyncResponse>(`${BASE}/sessions/${sessionId}/sync/`, payload);
    return resp.data;
  } catch (err: any) {
    if (err?.response?.status === 409) return err.response.data as JapaSyncResponse;
    return null;
  }
}

export async function japaCompleteSession(
  sessionId: number,
  payload: JapaCompleteRequest,
): Promise<JapaCompleteResponse | null> {
  try {
    const resp = await api.post<JapaCompleteResponse>(`${BASE}/sessions/${sessionId}/complete/`, payload);
    return resp.data;
  } catch {
    return null;
  }
}

export async function japaGetStats(
  mantraRef?: string,
  sourceSurface?: string,
): Promise<JapaStatsResponse | null> {
  try {
    const params: Record<string, string> = {};
    if (mantraRef) params.mantra_ref = mantraRef;
    if (sourceSurface) params.source_surface = sourceSurface;
    const resp = await api.get<JapaStatsResponse>(`${BASE}/stats/`, {
      params: Object.keys(params).length ? params : undefined,
    });
    return resp.data;
  } catch {
    return null;
  }
}
