import { api } from '../lib/api';

// ── Guide shape shared by multiple interfaces ─────────────────────────────────

export interface GuideInfo {
  display_name: string;
  photo_url: string | null;
  guide_type: string;
}

export interface GuideInfoFull extends GuideInfo {
  bio: string | null;
  topics: string[];
}

// ── Programs ──────────────────────────────────────────────────────────────────

export interface TLPProgram {
  code: string;
  slug: string;
  name: string;
  description: string | null;
  program_promise: string | null;
  program_type: string;
  category: string;
  language: string;
  featured_order: number | null;
  leader_name: string;
  leader_type: string;
  community_name: string;
  duration_days: number;
  start_date: string | null;
  join_url: string;
  guide: GuideInfo | null;
  joined_count: number;
}

export interface TLPProgramDetail {
  code: string;
  slug: string;
  name: string;
  program_promise: string | null;
  duration_days: number;
  category: string;
  program_type: string;
  language: string;
  guide: GuideInfoFull | null;
  support_contact_url: string | null;
  day_themes: string[];
}

export interface ProgramTestimonial {
  display_name: string;
  rating: number;
  testimonial_text: string;
  source_day: number | null;
}

// ── Live sessions ─────────────────────────────────────────────────────────────

export interface TLPLiveSession {
  code: string;
  slug: string;
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
  is_user_registered: boolean;
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

// ── Registrations ─────────────────────────────────────────────────────────────

export interface LiveSessionRegistration {
  ok: boolean;
  already_registered: boolean;
  session_code: string;
  title: string;
  scheduled_at: string;
  reminder_preference: 'all' | 'day_of' | 'none';
  external_join_url: string | null;
  external_platform: string;
}

export interface MyRegistration {
  session_code: string;
  title: string;
  scheduled_at: string;
  timezone: string;
  status: string;
  join_clicked: boolean;
  external_join_url: string | null;
  external_platform: string;
}

// ── Reflection ────────────────────────────────────────────────────────────────

export type FollowupAction = 'inner_path' | 'daily_rhythm' | 'quick_chant' | 'none';

export interface ReflectionResult {
  ok: boolean;
  redirect_deep_link: string | null;
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function fetchPrograms(
  filters?: { category?: string; language?: string },
): Promise<{ programs: TLPProgram[]; count: number }> {
  const params = new URLSearchParams();
  if (filters?.category && filters.category !== 'all') {
    params.set('category', filters.category);
  }
  if (filters?.language && filters.language !== 'all') {
    params.set('language', filters.language);
  }
  const query = params.toString();
  const res = await api.get<{ programs: TLPProgram[]; count: number }>(
    query ? `/programs/?${query}` : '/programs/',
  );
  return res.data;
}

export async function fetchProgramDetail(code: string): Promise<TLPProgramDetail> {
  const res = await api.get<TLPProgramDetail>(`/programs/${code}/`);
  return res.data;
}

export async function fetchProgramTestimonials(code: string): Promise<ProgramTestimonial[]> {
  const res = await api.get<ProgramTestimonial[]>(`/programs/${code}/testimonials/`);
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

export async function fetchMyRegistrations(): Promise<MyRegistration[]> {
  const res = await api.get<MyRegistration[]>('/live-sessions/my-registrations/');
  return res.data;
}

export async function submitReflection(
  code: string,
  followupAction: FollowupAction,
): Promise<ReflectionResult> {
  const res = await api.post<ReflectionResult>(`/live-sessions/${code}/reflect/`, {
    followup_action: followupAction,
  });
  return res.data;
}
