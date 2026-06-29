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
  guide: { display_name: string; guide_type: string; photo_url: string } | null;
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
  is_user_registered: boolean;
}

export interface TLPLiveSessionDetail extends TLPLiveSession {
  guide_bio: string;
  guide_photo_url: string;
  external_join_url: string;
  description: string;
  capacity: number | null;
  support_contact_url: string;
  recording_url: string;
  is_user_registered: boolean;
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

// ── Guide dashboard types ─────────────────────────────────────────────────────

export interface GuideProgram {
  code: string;
  slug: string;
  title: string;
  status: string;
  is_public: boolean;
  join_url: string;
  template_id: number | null;
  joined_count: number;
  testimonials_count: number;
}

export interface GuideSession {
  code: string;
  title: string;
  session_type: string;
  scheduled_at: string;
  status: string;
  registered_count: number;
  reflection_count: number;
}

export interface GuideDashboardTemplate {
  id: number;
  title: string;
  duration_days: number;
  review_status: string;
  submitted_at: string | null;
}

export interface GuideDashboard {
  summary: {
    programs_count: number;
    total_joined: number;
    sessions_count: number;
    testimonials_count: number;
  };
  programs: GuideProgram[];
  my_templates: GuideDashboardTemplate[];
  upcoming_sessions: GuideSession[];
}

export async function fetchGuideDashboard(): Promise<GuideDashboard> {
  const res = await api.get("guide/dashboard/");
  return res.data;
}

export async function fetchGuideMyProfile(): Promise<{ is_guide: boolean }> {
  const res = await api.get("guide/my-profile/");
  return res.data;
}

export interface GuideInviteInfo {
  email: string;
  expires_at: string;
}

export async function fetchGuideInviteInfo(token: string): Promise<GuideInviteInfo> {
  const res = await api.get(`guide/invite/${token}/`);
  return res.data;
}

export async function acceptGuideInvite(
  token: string,
  password: string,
): Promise<{ access_token: string; refresh_token: string; user: { id: number; email: string } }> {
  const res = await api.post(`guide/invite/${token}/`, { password });
  return res.data;
}

// ── Phase 2: Guide self-service API ──────────────────────────────────────────

export interface GuideSubmissionResult {
  submission_id: number;
  status: string;
  estimated_review_days: number;
  message: string;
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
  const res = await api.post("guide/programs/draft/", data);
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
  const res = await api.post("guide/sessions/draft/", data);
  return res.data;
}

// ── Guide Template Builder ─────────────────────────────────────────────────────

export interface OfficialTemplate {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  duration_days: number;
  language: string;
  audience_tags: string[];
  program_promise: string;
  day_themes: string[];
}

export interface LibraryCard {
  item_id: string;
  title?: string;
  text?: string;           // wisdom uses `text` not `title`
  devanagari?: string;
  iast?: string;
  meaning?: string;
  essence?: string;
  insight?: string;
  line?: string;
  how_to_live?: string;
  benefits?: string;
  steps?: string[];
  explanation?: string[];
  source_title?: string;
  deity?: string;
  category_label?: string;
  duration?: string;
  mood?: string;
  tags?: string[];
}

export interface TemplateDay {
  day_number: number;
  theme: string;
  mantra_ref: string;
  sankalp_ref: string;
  practice_ref: string;
  wisdom_ref: string;
  custom_mantra_title: string;
  custom_mantra_body: string;
  custom_sankalp_title: string;
  custom_sankalp_body: string;
  custom_practice_title: string;
  custom_practice_body: string;
  custom_wisdom_title: string;
  custom_wisdom_body: string;
  day_join_url: string;
  day_session_time: string;
  day_session_timezone: string;
  reflection_prompt: string;
  mantra_count: number | null;
  practice_duration_minutes: number | null;
  mantra_reminder_time: string | null;
  sankalp_reminder_time: string | null;
  practice_reminder_time: string | null;
  // Resolved library cards from backend (present in detail view)
  mantra_card?: LibraryCard | null;
  sankalp_card?: LibraryCard | null;
  practice_card?: LibraryCard | null;
  wisdom_card?: LibraryCard | null;
}

export interface GuideTemplate {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  duration_days: number;
  language: string;
  template_type: string;
  review_status: string;
  is_editable_by_guide: boolean;
  locked_at: string | null;
  audience_tags: string[];
  program_promise: string;
  clone_source_slug: string | null;
  days?: TemplateDay[];
}

export type LibrarySlot = "mantra" | "sankalp" | "practice" | "wisdom";

export interface LibraryDetailField {
  label: string;
  value: string | string[];
}

export interface LibraryPickerItem {
  item_id: string;
  title: string;
  subtitle: string;
  meta: string;
  details: LibraryDetailField[];
}

export async function fetchOfficialTemplates(): Promise<{ templates: OfficialTemplate[]; count: number }> {
  const res = await api.get("guide/official-templates/");
  return res.data;
}

export async function cloneOfficialTemplate(slug: string): Promise<GuideTemplate> {
  const res = await api.post(`guide/official-templates/${slug}/clone/`);
  return res.data;
}

export async function createBlankTemplate(data: { title: string; duration_days: number }): Promise<GuideTemplate> {
  const res = await api.post("guide/my-templates/", data);
  return res.data;
}

export async function fetchMyTemplate(id: number): Promise<GuideTemplate> {
  const res = await api.get(`guide/my-templates/${id}/`);
  return res.data;
}

export async function updateTemplateDay(templateId: number, dayNumber: number, data: Partial<TemplateDay>): Promise<TemplateDay> {
  const res = await api.patch(`guide/my-templates/${templateId}/days/${dayNumber}/`, data);
  return res.data;
}

export async function submitTemplateForReview(templateId: number): Promise<void> {
  await api.post(`guide/my-templates/${templateId}/submit/`);
}

function hasVal(v: string | string[]): boolean {
  return Array.isArray(v) ? v.length > 0 : !!v;
}

export async function fetchLibraryItems(slot: LibrarySlot, search?: string): Promise<LibraryPickerItem[]> {
  const path =
    slot === "mantra" ? "guide/library/mantras/" :
    slot === "sankalp" ? "guide/library/sankalps/" :
    slot === "wisdom" ? "guide/library/wisdoms/" :
    "guide/library/practices/";
  const res = await api.get(path, search ? { params: { search } } : undefined);
  const items = res.data.items ?? [];
  return items.map((i: any): LibraryPickerItem => {
    if (slot === "mantra") {
      const details: LibraryDetailField[] = [
        { label: "Meaning", value: i.meaning },
        { label: "Essence", value: i.essence },
        { label: "Devanagari", value: i.devanagari },
        { label: "IAST", value: i.iast },
      ].filter((d) => hasVal(d.value));
      return {
        item_id: i.item_id,
        title: i.title,
        subtitle: i.devanagari || i.meaning || "",
        meta: [i.deity, i.category_label].filter(Boolean).join(" · "),
        details,
      };
    }
    if (slot === "sankalp") {
      const details: LibraryDetailField[] = [
        { label: "Essence / Insight", value: i.insight },
        { label: "How to Live", value: i.how_to_live },
        { label: "Benefits", value: i.benefits },
      ].filter((d) => hasVal(d.value));
      return {
        item_id: i.item_id,
        title: i.title,
        subtitle: i.line || i.insight || "",
        meta: i.category_label || "",
        details,
      };
    }
    if (slot === "wisdom") {
      const details: LibraryDetailField[] = [
        { label: "Explanation", value: i.explanation ?? [] },
        { label: "Source", value: i.source_title },
      ].filter((d) => hasVal(d.value));
      return {
        item_id: i.item_id,
        title: i.text || i.title,
        subtitle: (i.explanation ?? [])[0] || "",
        meta: [i.mood, ...(i.tags ?? []).slice(0, 2)].filter(Boolean).join(" · "),
        details,
      };
    }
    // practice
    const details: LibraryDetailField[] = [
      { label: "Steps", value: i.steps ?? [] },
      { label: "Essence", value: i.essence },
      { label: "Benefits", value: i.benefits },
    ].filter((d) => hasVal(d.value));
    return {
      item_id: i.item_id,
      title: i.title,
      subtitle: i.summary || "",
      meta: [i.category_label, i.duration].filter(Boolean).join(" · "),
      details,
    };
  });
}
