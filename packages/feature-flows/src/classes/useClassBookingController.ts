/**
 * useClassBookingController — headless controller for Classes + Booking + Payment.
 * NO react-native, react-router, DOM APIs, AsyncStorage, localStorage, expo-*, Stripe SDKs.
 * All API calls are injected via the apiAdapter so tests can mock them.
 */

import { useState, useCallback } from 'react';
import type {
  ClassListing,
  ClassDetail,
  ClassSlot,
  BookingCreateRequest,
  BookingCreateResponse,
  PaymentIntentResponse,
} from '@kalpx/types';

export interface ClassApiAdapter {
  getClasses(params?: Record<string, any>): Promise<{ count: number; results: ClassListing[] } | null>;
  getClassDetail(slug: string): Promise<ClassDetail | null>;
  getClassSlots(params: { offering_id: number; timezone: string; start_date?: string }): Promise<{ slots: ClassSlot[] } | null>;
  createBooking(payload: BookingCreateRequest): Promise<BookingCreateResponse | null>;
  createPaymentIntent(payload: { booking_id: number }): Promise<PaymentIntentResponse | null>;
}

export interface UseClassBookingControllerOptions {
  api: ClassApiAdapter;
  getUserTimezone?: () => string;
}

export interface UseClassBookingControllerResult {
  // Listing
  classes: ClassListing[];
  listLoading: boolean;
  listError: string | null;
  loadClasses: (params?: Record<string, any>) => Promise<void>;

  // Detail
  classDetail: ClassDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  loadClassDetail: (slug: string) => Promise<void>;

  // Slots
  slots: ClassSlot[];
  slotsLoading: boolean;
  loadSlots: (offeringId: number) => Promise<void>;
  selectedSlot: ClassSlot | null;
  selectSlot: (slot: ClassSlot | null) => void;

  // Booking
  bookingLoading: boolean;
  bookingError: string | null;
  bookingResult: BookingCreateResponse | null;
  submitBooking: (payload: BookingCreateRequest) => Promise<BookingCreateResponse | null>;

  // Payment
  paymentLoading: boolean;
  paymentError: string | null;
  clientSecret: string | null;
  initiatePayment: (bookingId: number) => Promise<string | null>;

  // State reset
  reset: () => void;
}

function defaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export function useClassBookingController({
  api,
  getUserTimezone = defaultTimezone,
}: UseClassBookingControllerOptions): UseClassBookingControllerResult {
  const [classes, setClasses] = useState<ClassListing[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ClassSlot | null>(null);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingCreateResponse | null>(null);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const loadClasses = useCallback(async (params?: Record<string, any>) => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await api.getClasses(params);
      setClasses(data?.results ?? []);
    } catch {
      setListError('Could not load classes. Please try again.');
    } finally {
      setListLoading(false);
    }
  }, [api]);

  const loadClassDetail = useCallback(async (slug: string) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const data = await api.getClassDetail(slug);
      if (!data) {
        setDetailError('Class not found.');
      } else {
        setClassDetail(data);
      }
    } catch {
      setDetailError('Could not load class details.');
    } finally {
      setDetailLoading(false);
    }
  }, [api]);

  const loadSlots = useCallback(async (offeringId: number) => {
    setSlotsLoading(true);
    try {
      const tz = getUserTimezone();
      const data = await api.getClassSlots({ offering_id: offeringId, timezone: tz });
      setSlots(data?.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [api, getUserTimezone]);

  const selectSlot = useCallback((slot: ClassSlot | null) => {
    setSelectedSlot(slot);
  }, []);

  const submitBooking = useCallback(async (payload: BookingCreateRequest): Promise<BookingCreateResponse | null> => {
    setBookingLoading(true);
    setBookingError(null);
    try {
      const result = await api.createBooking(payload);
      if (!result) {
        setBookingError('Booking failed. Please try again.');
        return null;
      }
      setBookingResult(result);
      return result;
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Booking failed.';
      setBookingError(msg);
      return null;
    } finally {
      setBookingLoading(false);
    }
  }, [api]);

  const initiatePayment = useCallback(async (bookingId: number): Promise<string | null> => {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const result = await api.createPaymentIntent({ booking_id: bookingId });
      if (!result?.client_secret) {
        setPaymentError('Could not start payment. Please try again.');
        return null;
      }
      setClientSecret(result.client_secret);
      return result.client_secret;
    } catch (err: any) {
      setPaymentError(err?.message ?? 'Payment setup failed.');
      return null;
    } finally {
      setPaymentLoading(false);
    }
  }, [api]);

  const reset = useCallback(() => {
    setClassDetail(null);
    setSlots([]);
    setSelectedSlot(null);
    setBookingResult(null);
    setBookingError(null);
    setClientSecret(null);
    setPaymentError(null);
  }, []);

  return {
    classes,
    listLoading,
    listError,
    loadClasses,
    classDetail,
    detailLoading,
    detailError,
    loadClassDetail,
    slots,
    slotsLoading,
    loadSlots,
    selectedSlot,
    selectSlot,
    bookingLoading,
    bookingError,
    bookingResult,
    submitBooking,
    paymentLoading,
    paymentError,
    clientSecret,
    initiatePayment,
    reset,
  };
}
