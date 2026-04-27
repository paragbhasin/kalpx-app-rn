/**
 * Phase 12 guardrail — classApi response-shape contract.
 * Verifies that classApi functions call the correct endpoints and handle
 * actual wire shapes from GET public/classes/, POST public/bookings/create/,
 * POST payments/create_intent/.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { getClasses, getClassDetail, createBooking, createPaymentIntent, getMyBookings } from '../engine/classApi';
import { api } from '../lib/api';

const mockListing = {
  id: 1,
  slug: 'yoga-fundamentals',
  title: 'Yoga Fundamentals',
  category: 'yoga',
  pricing: {
    type: 'per_person',
    currency: 'INR',
    per_person: { amount: { web: 500, app: 450 } },
    trial: { enabled: true, amount: 200, session_length_min: 30 },
  },
  tutor: { id: 10, name: 'Priya Singh', timezone: 'Asia/Kolkata' },
};

beforeEach(() => { vi.clearAllMocks(); });

describe('getClasses', () => {
  it('returns listing page on success', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: { count: 1, next: null, results: [mockListing] },
    });
    const result = await getClasses();
    expect(result?.count).toBe(1);
    expect(result?.results[0].slug).toBe('yoga-fundamentals');
    expect((api.get as any).mock.calls[0][0]).toBe('public/classes/');
  });

  it('returns null on error', async () => {
    (api.get as any).mockRejectedValueOnce(new Error('network'));
    const result = await getClasses();
    expect(result).toBeNull();
  });

  it('passes query params', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { count: 0, next: null, results: [] } });
    await getClasses({ category: 'yoga', page: 2 });
    expect((api.get as any).mock.calls[0][1]).toEqual({ params: { category: 'yoga', page: 2 } });
  });
});

describe('getClassDetail', () => {
  it('returns detail on success', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { ...mockListing, long_description: 'Full detail' } });
    const result = await getClassDetail('yoga-fundamentals');
    expect(result?.long_description).toBe('Full detail');
    expect((api.get as any).mock.calls[0][0]).toBe('public/classes/yoga-fundamentals/');
  });

  it('returns null on 404', async () => {
    (api.get as any).mockRejectedValueOnce({ response: { status: 404 } });
    const result = await getClassDetail('missing-class');
    expect(result).toBeNull();
  });
});

describe('createBooking', () => {
  it('sends correct wire payload and returns booking response', async () => {
    const bookingPayload = {
      offering_id: 1,
      scheduled_at: '2026-05-01T10:00:00Z',
      user_timezone: 'Asia/Kolkata',
      tutor_timezone: 'Asia/Kolkata',
    };
    (api.post as any).mockResolvedValueOnce({
      data: { data: { booking_id: 42, start_utc: '2026-05-01T10:00:00Z', status: 'confirmed' } },
    });
    const result = await createBooking(bookingPayload);
    expect((api.post as any).mock.calls[0][0]).toBe('public/bookings/create/');
    expect((api.post as any).mock.calls[0][1]).toMatchObject({ offering_id: 1, scheduled_at: '2026-05-01T10:00:00Z' });
    expect(result?.data?.booking_id).toBe(42);
  });
});

describe('createPaymentIntent', () => {
  it('sends booking_id and returns client_secret', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { client_secret: 'pi_test_secret_123' } });
    const result = await createPaymentIntent({ booking_id: 42 });
    expect((api.post as any).mock.calls[0][0]).toBe('payments/create_intent/');
    expect((api.post as any).mock.calls[0][1]).toEqual({ booking_id: 42 });
    expect(result?.client_secret).toBe('pi_test_secret_123');
  });

  it('returns null on error', async () => {
    (api.post as any).mockRejectedValueOnce(new Error('network'));
    const result = await createPaymentIntent({ booking_id: 42 });
    expect(result).toBeNull();
  });
});

describe('getMyBookings', () => {
  it('returns booking list page on success', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: {
        count: 1,
        next: null,
        results: [{ id: 1, status: 'confirmed', offering: mockListing }],
      },
    });
    const result = await getMyBookings();
    expect(result?.results[0].status).toBe('confirmed');
    expect((api.get as any).mock.calls[0][0]).toBe('public/bookings/');
  });
});
