import { api } from '../lib/api';

export interface TLPProgram {
  code: string;
  name: string;
  description: string | null;
  leader_name: string;
  leader_type: string;
  community_name: string;
  duration_days: number;
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
  guide_bio: string | null;
  guide_photo_url: string | null;
  external_join_url: string | null;
  description: string | null;
  capacity: number | null;
  support_contact_url: string | null;
  recording_url: string | null;
}

export interface LiveSessionRegistration {
  ok: boolean;
  already_registered: boolean;
  session_code: string;
  scheduled_at: string;
  reminder_preference: 'all' | 'day_of' | 'none';
}

export async function fetchPrograms(): Promise<{ programs: TLPProgram[]; count: number }> {
  const res = await api.get<{ programs: TLPProgram[]; count: number }>('/programs/');
  return res.data;
}

export async function fetchLiveSessions(): Promise<{ sessions: TLPLiveSession[]; count: number }> {
  const res = await api.get<{ sessions: TLPLiveSession[]; count: number }>('/live-sessions/');
  return res.data;
}

export async function fetchLiveSessionDetail(code: string): Promise<TLPLiveSessionDetail> {
  const res = await api.get<TLPLiveSessionDetail>(`/live-sessions/${code}/`);
  return res.data;
}

export async function registerForSession(
  code: string,
  reminderPreference: 'all' | 'day_of' | 'none',
): Promise<LiveSessionRegistration> {
  const res = await api.post<LiveSessionRegistration>(`/live-sessions/${code}/register/`, {
    reminder_preference: reminderPreference,
  });
  return res.data;
}

export async function recordJoinClick(
  code: string,
): Promise<{ ok: boolean; external_join_url: string }> {
  const res = await api.post<{ ok: boolean; external_join_url: string }>(
    `/live-sessions/${code}/join-click/`,
  );
  return res.data;
}
