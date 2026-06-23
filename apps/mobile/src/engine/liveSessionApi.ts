/**
 * liveSessionApi.ts — Trusted Leader Platform (TLP) mobile API layer.
 *
 * Covers: GET /api/programs/, GET /api/programs/{code}/,
 * GET /api/live-sessions/, GET /api/live-sessions/{code}/,
 * GET /api/live-sessions/my-registrations/,
 * POST /api/live-sessions/{code}/register/,
 * POST /api/live-sessions/{code}/join-click/,
 * POST /api/live-sessions/{code}/reflect/
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
  joined_count?: number;
  category?: string;
  language?: string;
  program_type?: string;
}

export interface TLPGuide {
  display_name: string;
  photo_url: string | null;
  guide_type: string;
  bio: string;
  topics: string[];
}

export interface TLPProgramDetail extends TLPProgram {
  program_promise: string;
  guide: TLPGuide | null;
  support_contact_url: string;
  day_themes: string[];
}

export interface MyRegistration {
  session_code: string;
  title: string;
  scheduled_at: string;
  timezone: string;
  duration_minutes: number;
  status: string;
  external_platform: string;
  external_join_url: string;
  join_clicked: boolean;
  reflection_completed: boolean;
  followup_action: string | null;
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

export async function fetchPrograms(
  filters?: { category?: string; language?: string },
): Promise<{ programs: TLPProgram[]; count: number }> {
  const params: Record<string, string> = {};
  if (filters?.category) params.category = filters.category;
  if (filters?.language) params.language = filters.language;
  const res = await api.get("programs/", { params });
  return res.data;
}

export async function fetchProgramDetail(code: string): Promise<TLPProgramDetail> {
  const res = await api.get(`programs/${code}/`);
  return res.data;
}

export async function fetchMyRegistrations(): Promise<MyRegistration[]> {
  const res = await api.get("live-sessions/my-registrations/");
  return res.data;
}

export async function submitReflection(
  code: string,
  followupAction: "inner_path" | "daily_rhythm" | "quick_chant" | "none",
): Promise<{ ok: boolean; redirect_deep_link: string | null }> {
  const res = await api.post(`live-sessions/${code}/reflect/`, {
    followup_action: followupAction,
  });
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
