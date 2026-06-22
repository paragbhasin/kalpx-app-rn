import { api } from '../lib/api';

export interface ProgramDaySummary {
  day_number: number;
  theme: string;
}

export interface ProgramCampaignPublic {
  code: string;
  slug: string;
  name: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  duration_days: number;
  hero_copy: string | null;
  program_promise: string | null;
  status: 'active' | 'paused' | 'archived' | 'completed' | 'draft';
  start_date: string | null;
  community_name: string;
  leader_name: string;
  support_contact_label: string;
  support_contact_url: string;
  joined_count: number;
  days: ProgramDaySummary[];
}

export async function fetchProgramByCode(code: string): Promise<ProgramCampaignPublic> {
  const res = await api.get<ProgramCampaignPublic>(`/programs/${code}/`);
  return res.data;
}

export async function fetchProgramBySlug(slug: string): Promise<ProgramCampaignPublic> {
  const res = await api.get<ProgramCampaignPublic>(`/programs/by-slug/${slug}/`);
  return res.data;
}
