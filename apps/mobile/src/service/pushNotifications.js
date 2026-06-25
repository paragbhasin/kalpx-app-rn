import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from '../Networks/axios';
import { handleMitraDeepLink } from '../utils/deeplink';
import { markNotificationsRead } from '../screens/Notifications/actions';
import { mitraTrackEvent } from '../engine/mitraApi';
import store from '../store';
import { logEvent } from '../utils/initAnalytics';

/**
 * Fire a best-effort receipt to the backend notification receipt endpoint.
 * Uses the app's authenticated axios instance so auth/refresh is handled
 * automatically. Never throws — receipt failures are non-critical.
 *
 * @param {string} category  - notification category (e.g. "morning_presence")
 * @param {string} threadId  - collapse_key / thread_id from notification data
 * @param {string} state     - "shown" | "tapped" | "dismissed" | "action_tapped"
 * @param {string} [deviceTime] - ISO timestamp (only for "shown")
 */
async function callNotificationReceipt(category, threadId, state, deviceTime) {
  if (!category) return; // backend requires category; skip if absent
  try {
    const body = { category, thread_id: threadId || '', state };
    if (deviceTime) body.device_time = deviceTime;
    await api.post('mitra/notifications/receipt/', body);
  } catch {
    // best-effort — never propagate
  }
}

/**
 * Check if permission is already granted and return FCM token if so.
 * Does NOT trigger a native permission dialog — safe to call on boot.
 */
export async function checkExistingPermission() {
  try {
    const authStatus = await messaging().hasPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) return null;
    return await messaging().getToken();
  } catch (error) {
    console.log('Check Existing Permission Error:', error);
    return null;
  }
}

// Ask for permission + get FCM token
export async function requestPushPermission(surface = 'default') {
  try {
    logEvent('notification_permission_prompted', { surface });
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log("Push permission not granted");
      logEvent('notification_permission_denied', { surface });
      return null;
    }
    logEvent('notification_permission_granted', { surface });

    // Get FCM token
    const fcmToken = await messaging().getToken();
    console.log("📲 FCM Token:", fcmToken);

    // Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }
if (Platform.OS === 'ios') {
    const apnsToken = await messaging().getAPNSToken();

    console.log('🔥 APNs Token:', apnsToken);

    if (!apnsToken) {
      console.log('⚠️ APNs token is null — APNs is not enabled or permissions not granted.');
    }
  }
    return fcmToken;
  } catch (error) {
    console.log("Push Permission Error:", error);
    return null;
  }
}

// Foreground Notifications
export function foregroundNotificationListener() {
  return messaging().onMessage(async (remoteMessage) => {

    console.log("📩 Foreground Notification Received:", remoteMessage);

    // Show Alert Popup
    // Alert.alert(
    //   remoteMessage.notification?.title || "New Notification",
    //   remoteMessage.notification?.body || "You have a new message"
    // );

    // Optional: also show system-style in-app banner
    Notifications.scheduleNotificationAsync({
      content: {
        title: remoteMessage.notification?.title || "New Notification",
        body: remoteMessage.notification?.body || "",
        data: remoteMessage.data,
      },
      trigger: null,
    });

    // Gate 1: best-effort receipt for foreground "shown" state
    const data = remoteMessage.data || {};
    void callNotificationReceipt(
      data.category || null,
      data.thread_id || null,
      'shown',
      new Date().toISOString(),
    );
  });
}

function _handleTappedNotification(remoteMessage, source) {
  if (!remoteMessage) return;
  console.log(`📌 App opened from ${source}:`, remoteMessage.messageId);

  const data = remoteMessage.data || {};
  const deepLink = data.deep_link || data.url || null;
  const notificationId = data.notification_id ? Number(data.notification_id) : null;
  const category = data.category || null;
  const threadId = data.thread_id || null;

  if (deepLink) {
    handleMitraDeepLink(deepLink);
  }

  if (notificationId) {
    store.dispatch(markNotificationsRead([notificationId]));
  }

  // Gate 1: best-effort receipt for tapped state
  void callNotificationReceipt(category, threadId, 'tapped');

  mitraTrackEvent('notification_tapped', {
    meta: {
      source,
      notification_id: notificationId,
      category,
      deep_link: deepLink,
    },
  });
}

// When user taps notification
export function notificationOpenListener() {
  // Quit state — app opened from killed state via notification tap
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      _handleTappedNotification(remoteMessage, 'quit');
    });

  // Background state — app foregrounded via notification tap
  return messaging().onNotificationOpenedApp((remoteMessage) => {
    _handleTappedNotification(remoteMessage, 'background');
  });
}


