/**
 * classApi — Classes / Booking / Payment endpoints.
 * All endpoints confirmed from mobile audit.
 * Endpoints: GET public/classes/, GET public/classes/{slug}/,
 *            GET public/slots/, POST public/bookings/create/,
 *            POST payments/create_intent/, GET public/bookings/
 */

import { api } from '../lib/api';
import type {
  ClassListingPage,
  ClassDetail,
  ClassSlotsResponse,
  BookingCreateRequest,
  BookingCreateResponse,
  BookingListPage,
  PaymentIntentRequest,
  PaymentIntentResponse,
} from '@kalpx/types';

export async function getClasses(params?: {
  page?: number;
  category?: string;
  language?: string;
  search?: string;
}): Promise<ClassListingPage | null> {
  try {
    const res = await api.get('public/classes/', { params });
    return res.data as ClassListingPage;
  } catch (err: any) {
    console.warn('[classApi] getClasses failed:', err?.message);
    return null;
  }
}

export async function getClassDetail(slug: string): Promise<ClassDetail | null> {
  try {
    const res = await api.get(`public/classes/${encodeURIComponent(slug)}/`);
    return res.data as ClassDetail;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    console.warn('[classApi] getClassDetail failed:', err?.message);
    return null;
  }
}

export async function getClassSlots(params: {
  offering_id: number;
  timezone: string;
  start_date?: string;
}): Promise<ClassSlotsResponse | null> {
  try {
    const res = await api.get('public/slots/', { params });
    return res.data as ClassSlotsResponse;
  } catch (err: any) {
    console.warn('[classApi] getClassSlots failed:', err?.message);
    return null;
  }
}

export async function createBooking(
  payload: BookingCreateRequest,
): Promise<BookingCreateResponse | null> {
  const res = await api.post('public/bookings/create/', payload);
  return res.data as BookingCreateResponse;
}

export async function createPaymentIntent(
  payload: PaymentIntentRequest,
): Promise<PaymentIntentResponse | null> {
  try {
    const res = await api.post('payments/create_intent/', payload);
    return res.data as PaymentIntentResponse;
  } catch (err: any) {
    console.warn('[classApi] createPaymentIntent failed:', err?.message);
    return null;
  }
}

export async function getMyBookings(params?: {
  status?: string;
  page?: number;
}): Promise<BookingListPage | null> {
  try {
    const res = await api.get('public/bookings/', { params });
    return res.data as BookingListPage;
  } catch (err: any) {
    console.warn('[classApi] getMyBookings failed:', err?.message);
    return null;
  }
}
