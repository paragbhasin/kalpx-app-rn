/**
 * programApi.ts — Practice Distribution OS mobile API layer.
 *
 * All calls go through the shared axios instance so auth headers
 * and timeout config are inherited automatically.
 */

import api from "../Networks/axios";

export interface ProgramDayItem {
  item_id: string;
  item_type: "mantra" | "sankalp" | "practice";
  title: string;
  line?: string;       // sankalp: the actual vow text; use this on cards
  devanagari?: string;
  iast?: string;
  description?: string;
}

export type DayStatus = "locked" | "today" | "completed" | "missed" | "completed_later";

export interface ProgramDayStatus {
  day_number: number;
  status: DayStatus;
  unlock_date: string;
}

export interface ActiveProgramSummary {
  name: string;
  status: "active" | "completed";
  current_day: number;
  next_day_available: boolean;
  next_day_locked?: boolean;
  days_remaining: number;
  total_days?: number;
  day_statuses?: ProgramDayStatus[];
  show_day8_transition?: boolean;
}

export interface WisdomCard {
  item_id: string | null;
  text: string;
  explanation: string[];
  source_title: string | null;
}

export interface ProgramDayContent {
  day_number: number;
  theme: string;
  reflection_prompt: string | null;
  completion_message: string | null;
  mantra: ProgramDayItem | null;
  practice: ProgramDayItem | null;
  sankalp: ProgramDayItem | null;
  is_completed: boolean;
  wisdom_card: WisdomCard | null;
  day_join_url: string | null;
  day_session_time: string | null;
  day_session_timezone: string | null;
}

export interface ProgramClaimConflict {
  conflict: true;
  current_program: { name: string; current_day: number; code: string };
}

export interface ProgramClaimSuccess {
  participant_id: string;
  program_name: string;
}

export async function fetchActiveProgram(): Promise<ActiveProgramSummary | null> {
  const res = await api.get("programs/my-active/");
  return res.data ?? null;
}

export async function fetchProgramDay(dayNumber: number): Promise<ProgramDayContent> {
  const res = await api.get(`programs/my-active/day/${dayNumber}/`);
  console.log('[ProgramDay] API response:', JSON.stringify(res.data, null, 2));
  console.log('[ProgramDay] wisdom_card:', JSON.stringify(res.data.wisdom_card));
  console.log('[ProgramDay] day_join_url:', res.data.day_join_url);
  console.log('[ProgramDay] day_session_time:', res.data.day_session_time);
  return res.data;
}

export async function completeProgramDay(dayNumber: number): Promise<any> {
  const res = await api.post(`programs/my-active/day/${dayNumber}/complete/`);
  return res.data;
}

export async function claimProgram(
  code: string,
  switchFromCode?: string,
): Promise<ProgramClaimConflict | ProgramClaimSuccess> {
  const body: any = {};
  if (switchFromCode) body.switch_from_campaign_code = switchFromCode;
  const res = await api.post(`programs/${code}/claim/`, body);
  return res.data;
}

export async function postDay8Transition(
  selectedPath: "inner_path" | "daily_rhythm" | "quick_chant" | "share" | "none",
): Promise<{ redirect_deep_link: string | null }> {
  const res = await api.post("programs/my-active/day8-transition/", {
    selected_path: selectedPath,
  });
  return res.data;
}

export async function submitProgramTestimonial(
  text: string,
): Promise<any> {
  const res = await api.post("programs/my-active/testimonial/", {
    text,
    consent_to_share: false,
  });
  return res.data;
}

export async function submitProgramMicroFeedback(
  campaignCode: string,
  response: string,
): Promise<any> {
  const res = await api.post("programs/my-active/feedback/", {
    campaign_code: campaignCode,
    response,
  });
  return res.data;
}

export async function recordProgramShare(): Promise<any> {
  const res = await api.post("programs/my-active/share/");
  return res.data;
}

export interface ProgramReminders {
  mantra_reminder_enabled: boolean;
  mantra_reminder_time: string | null;
  sankalp_reminder_enabled: boolean;
  sankalp_reminder_time: string | null;
  practice_reminder_enabled: boolean;
  practice_reminder_time: string | null;
}

export type ProgramRemindersPatch = Partial<ProgramReminders>;

export async function apiGetProgramReminders(): Promise<ProgramReminders> {
  const res = await api.get('programs/my-active/reminders/');
  return res.data;
}

export async function apiPatchProgramReminders(patch: ProgramRemindersPatch): Promise<ProgramReminders> {
  const res = await api.patch('programs/my-active/reminders/', patch);
  return res.data;
}

export async function postProgramActivity(
  eventName: string,
  props?: { day_number?: number; notification_type?: string; platform?: string; source?: string },
): Promise<void> {
  await api.post("programs/my-active/activity/", { event_name: eventName, ...props });
}
