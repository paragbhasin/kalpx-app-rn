export type JourneyStatus = {
  journey_id?: number | string;
  active_journey?: boolean;
  has_active_journey?: boolean;
  status?: string;
  journey?: {
    status?: string;
    [key: string]: unknown;
  };
  day_number?: number;
  total_days?: number;
  [key: string]: unknown;
};

export function normalizeJourneyStatus(data: JourneyStatus | null | undefined): boolean {
  if (!data) return false;
  return Boolean(
    data.active_journey ||
      data.has_active_journey ||
      data.journey?.status === 'active' ||
      data.status === 'active' ||
      (data.journey_id != null && data.status !== 'ended'),
  );
}
