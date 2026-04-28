/**
 * Classes / Booking / Payment shared types.
 * Field names match actual backend wire format (snake_case) from GET public/classes/.
 */

// ── Class listing ─────────────────────────────────────────────────────────────

export interface ClassPricingAmount {
  web?: number | null;
  app?: number | null;
}

export interface ClassPricingTier {
  amount?: ClassPricingAmount;
}

export interface ClassTrial {
  enabled: boolean;
  amount?: number | null;
  session_length_min?: number | null;
}

export interface ClassPricing {
  type?: 'per_person' | 'per_group' | string;
  currency?: string;
  per_person?: ClassPricingTier;
  per_group?: ClassPricingTier;
  trial?: ClassTrial;
}

export interface ClassTutor {
  id: number;
  name?: string;
  timezone?: string;
  bio?: string;
  avatar_url?: string;
  [key: string]: unknown;
}

export interface ClassCoverMedia {
  key?: string;
  url?: string;
  [key: string]: unknown;
}

export interface ClassListing {
  id: number;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  subject?: string;
  language?: string;
  skill_level?: string;
  schedule_type?: string;
  type?: string;
  duration_minutes?: number;
  tutor?: ClassTutor;
  pricing?: ClassPricing;
  cover_media?: ClassCoverMedia;
  creator_id?: number;
  status?: string;
  [key: string]: unknown;
}

export interface ClassListingPage {
  count: number;
  next: string | null;
  results: ClassListing[];
}

// ── Slots ─────────────────────────────────────────────────────────────────────

export interface ClassSlot {
  start_utc: string;
  start_user?: string;
  start_date?: string;
}

export interface ClassDaySlots {
  date: string;
  slots: ClassSlot[];
}

export interface ClassSlotsResponse {
  slots: ClassSlot[];
}

// ── Class detail (with available_slots) ──────────────────────────────────────

export interface ClassDetail extends ClassListing {
  long_description?: string;
  learning_outcomes?: string[];
  requirements?: string[];
  available_slots?: ClassDaySlots[];
  tutor_bio?: string;
}

// ── Booking ───────────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'requested'
  | 'confirmed'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'pending';

export interface BookingCreateRequest {
  offering_id: number;
  scheduled_at: string;
  user_timezone: string;
  tutor_timezone: string;
  note?: string;
  trial_selected?: boolean;
}

export interface BookingCreateData {
  booking_id: number;
  start_utc: string;
  status: BookingStatus;
}

export interface BookingCreateResponse {
  user?: Record<string, unknown>;
  data?: BookingCreateData;
  booking_id?: number;
}

export interface BookingListItem {
  id: number;
  booking_id?: number;
  status: BookingStatus;
  offering?: ClassListing;
  start_utc?: string;
  scheduled_at?: string;
  user_timezone?: string;
  note?: string;
  trial_selected?: boolean;
}

export interface BookingListPage {
  count: number;
  next: string | null;
  results: BookingListItem[];
}

// ── Payment ───────────────────────────────────────────────────────────────────

export interface PaymentIntentRequest {
  booking_id: number;
}

export interface PaymentIntentResponse {
  client_secret: string;
}
