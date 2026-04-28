/**
 * Phase 12 — useClassBookingController unit tests.
 * All API calls are injected via ClassApiAdapter — no network, no platform deps.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClassBookingController } from '@kalpx/feature-flows';
import type { ClassApiAdapter } from '@kalpx/feature-flows';

const mockListing = {
  id: 1,
  slug: 'yoga-class',
  title: 'Yoga Class',
  pricing: { currency: 'INR', per_person: { amount: { app: 500 } } },
  tutor: { id: 10, name: 'Priya', timezone: 'Asia/Kolkata' },
};

const mockSlots = [
  { start_utc: '2026-05-01T10:00:00Z' },
  { start_utc: '2026-05-02T10:00:00Z' },
];

function makeApi(overrides?: Partial<ClassApiAdapter>): ClassApiAdapter {
  return {
    getClasses: vi.fn().mockResolvedValue({ count: 1, results: [mockListing] }),
    getClassDetail: vi.fn().mockResolvedValue({ ...mockListing, long_description: 'Full' }),
    getClassSlots: vi.fn().mockResolvedValue({ slots: mockSlots }),
    createBooking: vi.fn().mockResolvedValue({
      data: { booking_id: 42, start_utc: '2026-05-01T10:00:00Z', status: 'confirmed' },
    }),
    createPaymentIntent: vi.fn().mockResolvedValue({ client_secret: 'pi_test_secret' }),
    ...overrides,
  };
}

describe('useClassBookingController', () => {
  describe('loadClasses', () => {
    it('populates classes on success', async () => {
      const api = makeApi();
      const { result } = renderHook(() => useClassBookingController({ api }));
      await act(async () => { await result.current.loadClasses(); });
      expect(result.current.classes).toHaveLength(1);
      expect(result.current.classes[0].slug).toBe('yoga-class');
      expect(result.current.listLoading).toBe(false);
    });

    it('sets listError on failure', async () => {
      const api = makeApi({ getClasses: vi.fn().mockRejectedValue(new Error('net')) });
      const { result } = renderHook(() => useClassBookingController({ api }));
      await act(async () => { await result.current.loadClasses(); });
      expect(result.current.listError).not.toBeNull();
    });
  });

  describe('loadClassDetail', () => {
    it('sets classDetail on success', async () => {
      const api = makeApi();
      const { result } = renderHook(() => useClassBookingController({ api }));
      await act(async () => { await result.current.loadClassDetail('yoga-class'); });
      expect(result.current.classDetail?.long_description).toBe('Full');
    });

    it('sets detailError when class not found', async () => {
      const api = makeApi({ getClassDetail: vi.fn().mockResolvedValue(null) });
      const { result } = renderHook(() => useClassBookingController({ api }));
      await act(async () => { await result.current.loadClassDetail('missing'); });
      expect(result.current.detailError).toBe('Class not found.');
    });
  });

  describe('loadSlots', () => {
    it('populates slots on success', async () => {
      const api = makeApi();
      const { result } = renderHook(() => useClassBookingController({ api }));
      await act(async () => { await result.current.loadSlots(1); });
      expect(result.current.slots).toHaveLength(2);
    });

    it('passes user timezone to API', async () => {
      const api = makeApi();
      const getTz = () => 'America/New_York';
      const { result } = renderHook(() => useClassBookingController({ api, getUserTimezone: getTz }));
      await act(async () => { await result.current.loadSlots(1); });
      expect((api.getClassSlots as any).mock.calls[0][0].timezone).toBe('America/New_York');
    });
  });

  describe('selectSlot', () => {
    it('updates selectedSlot', async () => {
      const api = makeApi();
      const { result } = renderHook(() => useClassBookingController({ api }));
      act(() => { result.current.selectSlot(mockSlots[0]); });
      expect(result.current.selectedSlot?.start_utc).toBe('2026-05-01T10:00:00Z');
    });
  });

  describe('submitBooking', () => {
    it('returns booking result on success', async () => {
      const api = makeApi();
      const { result } = renderHook(() => useClassBookingController({ api }));
      let bookingResult: any;
      await act(async () => {
        bookingResult = await result.current.submitBooking({
          offering_id: 1,
          scheduled_at: '2026-05-01T10:00:00Z',
          user_timezone: 'Asia/Kolkata',
          tutor_timezone: 'Asia/Kolkata',
        });
      });
      expect(bookingResult?.data?.booking_id).toBe(42);
      expect(result.current.bookingResult?.data?.booking_id).toBe(42);
    });

    it('sets bookingError on null response', async () => {
      const api = makeApi({ createBooking: vi.fn().mockResolvedValue(null) });
      const { result } = renderHook(() => useClassBookingController({ api }));
      await act(async () => {
        await result.current.submitBooking({
          offering_id: 1,
          scheduled_at: '2026-05-01T10:00:00Z',
          user_timezone: 'Asia/Kolkata',
          tutor_timezone: 'Asia/Kolkata',
        });
      });
      expect(result.current.bookingError).not.toBeNull();
    });
  });

  describe('initiatePayment', () => {
    it('returns client_secret on success', async () => {
      const api = makeApi();
      const { result } = renderHook(() => useClassBookingController({ api }));
      let secret: any;
      await act(async () => { secret = await result.current.initiatePayment(42); });
      expect(secret).toBe('pi_test_secret');
      expect(result.current.clientSecret).toBe('pi_test_secret');
    });

    it('sets paymentError when client_secret is missing', async () => {
      const api = makeApi({ createPaymentIntent: vi.fn().mockResolvedValue({}) });
      const { result } = renderHook(() => useClassBookingController({ api }));
      await act(async () => { await result.current.initiatePayment(42); });
      expect(result.current.paymentError).not.toBeNull();
    });
  });

  describe('reset', () => {
    it('clears booking, payment, and slot state', async () => {
      const api = makeApi();
      const { result } = renderHook(() => useClassBookingController({ api }));
      await act(async () => {
        await result.current.loadSlots(1);
        result.current.selectSlot(mockSlots[0]);
        await result.current.submitBooking({
          offering_id: 1, scheduled_at: '2026-05-01T10:00:00Z',
          user_timezone: 'UTC', tutor_timezone: 'UTC',
        });
        await result.current.initiatePayment(42);
        result.current.reset();
      });
      expect(result.current.selectedSlot).toBeNull();
      expect(result.current.bookingResult).toBeNull();
      expect(result.current.clientSecret).toBeNull();
    });
  });
});
