/**
 * liveSessionApi.ts — Trusted Leader Platform (TLP) mobile API layer.
 *
 * Covers: GET /api/programs/, GET /api/live-sessions/,
 * GET /api/live-sessions/{code}/, POST /api/live-sessions/{code}/register/,
 * POST /api/live-sessions/{code}/join-click/
 */

import api from "../Networks/axios";

export interface TLPProgram {
  code: string;
  name: string;
  description: string;
  leader_name: string;
  community_name: string;
  duration_days: number | null;
  start_date: string | null;
  join_url: string;
}

export interface TLPLiveSession {
  code: string;
  title: string;
  guide_name: string;
  session_type: string;
  scheduled_at: string;
  timezone: string;
  duration_minutes: number;
  language: string;
  external_platform: string;
  recurrence_type: string;
  registration_enabled: boolean;
  status: string;
  associated_program_code: string | null;
}

export interface TLPLiveSessionDetail extends TLPLiveSession {
  guide_bio: string;
  guide_photo_url: string;
  external_join_url: string;
  description: string;
  capacity: number | null;
  support_contact_url: string;
  recording_url: string;
}

export interface RegisterForSessionResult {
  ok: boolean;
  already_registered: boolean;
  session_code: string;
  scheduled_at: string;
  reminder_preference: string;
}

export interface JoinClickResult {
  ok: boolean;
  external_join_url: string;
}

export async function fetchPrograms(): Promise<{ programs: TLPProgram[]; count: number }> {
  const res = await api.get("programs/");
  return res.data;
}

export async function fetchLiveSessions(): Promise<{ sessions: TLPLiveSession[]; count: number }> {
  const res = await api.get("live-sessions/");
  return res.data;
}

export async function fetchLiveSessionDetail(code: string): Promise<TLPLiveSessionDetail> {
  const res = await api.get(`live-sessions/${code}/`);
  return res.data;
}

export async function registerForSession(
  code: string,
  reminderPreference: "all" | "day_of" | "none",
): Promise<RegisterForSessionResult> {
  const res = await api.post(`live-sessions/${code}/register/`, {
    reminder_preference: reminderPreference,
  });
  return res.data;
}

export async function recordJoinClick(code: string): Promise<JoinClickResult> {
  const res = await api.post(`live-sessions/${code}/join-click/`);
  return res.data;
}
