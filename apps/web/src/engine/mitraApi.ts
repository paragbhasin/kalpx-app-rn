/**
 * Mitra API stubs — Phase 3 scaffold.
 * Full implementations wired during Phase 4 (auth/API) and Phase 4B (vertical-slice).
 */

import { api } from '../lib/api';

export async function getUserPreferences(): Promise<any> {
  try {
    const res = await api.get('mitra/user-preferences/');
    return res.data;
  } catch {
    return null;
  }
}

export async function patchUserPreferences(patch: Record<string, any>): Promise<void> {
  try {
    await api.patch('mitra/user-preferences/', patch);
  } catch {
    // swallow
  }
}

export async function getNotificationPreferences(): Promise<any> {
  try {
    const res = await api.get('mitra/user-preferences/notifications/');
    return res.data;
  } catch {
    return null;
  }
}

export async function patchNotificationPreferences(patch: Record<string, any>): Promise<void> {
  try {
    await api.patch('mitra/user-preferences/notifications/', patch);
  } catch {
    // swallow
  }
}

export async function getDailyView(): Promise<any> {
  const res = await api.get('mitra/today/');
  return res.data;
}

export async function getDay7View(): Promise<any> {
  const res = await api.get('mitra/checkpoint/day-7/');
  return res.data;
}

export async function getDay14View(): Promise<any> {
  const res = await api.get('mitra/checkpoint/day-14/');
  return res.data;
}

export async function getJourneyStatus(): Promise<any> {
  try {
    const res = await api.get('mitra/journey/status/');
    return res.data;
  } catch {
    return null;
  }
}

export async function trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
  try {
    await api.post('mitra/track-event/', { event_name: eventName, ...properties });
  } catch {
    // swallow — telemetry must never break product flow
  }
}

export async function trackCompletion(payload: Record<string, any>): Promise<void> {
  await api.post('mitra/track-completion/', payload);
}
