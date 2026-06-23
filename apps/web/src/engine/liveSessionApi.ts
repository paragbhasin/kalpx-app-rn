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
  associated_program_slug: string | null;
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

export async function fetchProgramDetail(slug: string): Promise<TLPProgramDetail> {
  const res = await api.get<TLPProgramDetail>(`/programs/by-slug/${slug}/`);
  return res.data;
}

export async function fetchProgramTestimonials(slug: string): Promise<ProgramTestimonial[]> {
  const res = await api.get<ProgramTestimonial[]>(`/programs/by-slug/${slug}/testimonials/`);
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

// ── Phase 2: Guide self-service API ──────────────────────────────────────────

export interface GuidePublicProfile {
  slug: string;
  display_name: string;
  bio: string | null;
  photo_url: string | null;
  guide_type: string;
  topics: string[];
  traditions: string[];
  languages: string[];
  city: string;
  country: string;
  programs: Array<{ code: string; slug: string; name: string; duration_days: number | null }>;
  upcoming_sessions: Array<{ code: string; title: string; session_type: string; scheduled_at: string; status: string }>;
}

export interface GuideMyProfile {
  slug: string;
  display_name: string;
  bio: string;
  photo_url: string | null;
  guide_type: string;
  topics: string[];
  traditions: string[];
  languages: string[];
  city: string;
  country: string;
  verification_status: string;
  is_public: boolean;
  contact_email: string;
  contact_phone: string;
  created_at: string;
}

export interface GuideProgram {
  code: string;
  slug: string;
  title: string;
  status: string;
  is_public: boolean;
  joined_count: number;
  testimonials_count: number;
  created_at: string;
}

export interface GuideSession {
  code: string;
  title: string;
  session_type: string;
  scheduled_at: string;
  status: string;
  is_public: boolean;
  registered_count: number;
  join_clicked_count: number;
  reflection_count: number;
}

export interface GuideDashboard {
  summary: {
    programs_count: number;
    total_joined: number;
    sessions_count: number;
    total_registered: number;
    testimonials_count: number;
  };
  programs: GuideProgram[];
  upcoming_sessions: GuideSession[];
}

export interface GuideSubmissionResult {
  submission_id: number;
  status: string;
  estimated_review_days: number;
  message: string;
}

export interface GuideInviteLink {
  code: string;
  slug: string;
  title: string;
  invite_link: string;
  qr_url: string | null;
}

export interface GuideTestimonial {
  display_name: string;
  testimonial_text: string;
  source_day: number;
  rating: number | null;
  date: string;
}

export async function fetchGuidePublicProfile(slug: string): Promise<GuidePublicProfile> {
  const res = await api.get<GuidePublicProfile>(`/guides/${slug}/`);
  return res.data;
}

export async function fetchGuideMyProfile(): Promise<GuideMyProfile> {
  const res = await api.get<GuideMyProfile>('/guide/my-profile/');
  return res.data;
}

export async function patchGuideMyProfile(
  data: Partial<Pick<GuideMyProfile, 'display_name' | 'bio' | 'photo_url' | 'topics' | 'traditions' | 'languages' | 'city' | 'country'>>,
): Promise<{ status: string; message: string }> {
  const res = await api.patch<{ status: string; message: string }>('/guide/my-profile/', data);
  return res.data;
}

export async function fetchGuideDashboard(): Promise<GuideDashboard> {
  const res = await api.get<GuideDashboard>('/guide/dashboard/');
  return res.data;
}

export async function fetchGuideMyPrograms(): Promise<{ programs: GuideProgram[]; count: number }> {
  const res = await api.get<{ programs: GuideProgram[]; count: number }>('/guide/my-programs/');
  return res.data;
}

export async function fetchGuideMySession(): Promise<{ sessions: GuideSession[]; count: number }> {
  const res = await api.get<{ sessions: GuideSession[]; count: number }>('/guide/my-sessions/');
  return res.data;
}

export async function submitProgramDraft(data: {
  title: string;
  category: string;
  duration_days: number | string;
  description: string;
  language: string;
  target_audience?: string;
  daily_structure?: string;
  start_type?: string;
  desired_start_date?: string;
  support_needs?: string;
  notes_to_kalpx?: string;
}): Promise<GuideSubmissionResult> {
  const res = await api.post<GuideSubmissionResult>('/guide/programs/draft/', data);
  return res.data;
}

export async function submitSessionDraft(data: {
  title: string;
  session_type: string;
  description: string;
  external_join_url: string;
  external_platform: string;
  scheduled_at: string;
  timezone: string;
  duration_minutes?: number;
  recurrence?: string;
  language?: string;
  notes_to_kalpx?: string;
}): Promise<GuideSubmissionResult> {
  const res = await api.post<GuideSubmissionResult>('/guide/sessions/draft/', data);
  return res.data;
}

export async function fetchGuideInviteLink(code: string): Promise<GuideInviteLink> {
  const res = await api.get<GuideInviteLink>(`/guide/programs/${code}/invite-link/`);
  return res.data;
}

export async function fetchGuideTestimonials(
  code: string,
): Promise<{ testimonials: GuideTestimonial[]; count: number }> {
  const res = await api.get<{ testimonials: GuideTestimonial[]; count: number }>(
    `/guide/programs/${code}/testimonials/`,
  );
  return res.data;
}

export async function submitRerunRequest(
  code: string,
  data?: { requested_start_date?: string; change_notes?: string },
): Promise<{ submission_id: number; status: string; message: string }> {
  const res = await api.post<{ submission_id: number; status: string; message: string }>(
    `/guide/programs/${code}/rerun-request/`,
    data ?? {},
  );
  return res.data;
}
