/**
 * notificationHandler — Notification receipt helper.
 *
 * Calls POST /api/mitra/notifications/receipt/ to record notification
 * lifecycle events (shown, tapped, dismissed, action_tapped).
 *
 * Best-effort: never throws. Errors are silently swallowed so this can be
 * called from any notification lifecycle callback without risk to product flow.
 *
 * Web push SW/notificationclick wiring is blocked until service worker
 * infrastructure is built. This helper is ready for that integration.
 */
import { api } from '../lib/api';

/**
 * Calls the notification receipt endpoint.
 * Best-effort — never throws.
 * Web SW/notificationclick wiring is a follow-on (no service worker exists yet).
 */
export async function callNotificationReceipt(
  category: string,
  threadId: string,
  state: "shown" | "tapped" | "dismissed" | "action_tapped",
  deviceTime?: string,
): Promise<void> {
  try {
    await api.post("/api/mitra/notifications/receipt/", {
      category,
      thread_id: threadId || "",
      state,
      device_time: deviceTime ?? new Date().toISOString(),
    });
  } catch {
    // best-effort — never throw
  }
}
