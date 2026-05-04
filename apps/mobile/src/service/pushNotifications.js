import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { handleMitraDeepLink } from '../utils/deeplink';
import { markNotificationsRead } from '../screens/Notifications/actions';
import { mitraTrackEvent } from '../engine/mitraApi';
import store from '../store';

// Ask for permission + get FCM token
export async function requestPushPermission() {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log("Push permission not granted");
      return null;
    }

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
  });
}

function _handleTappedNotification(remoteMessage, source) {
  if (!remoteMessage) return;
  console.log(`📌 App opened from ${source}:`, remoteMessage.messageId);

  const data = remoteMessage.data || {};
  const deepLink = data.deep_link || data.url || null;
  const notificationId = data.notification_id ? Number(data.notification_id) : null;
  const category = data.category || null;

  if (deepLink) {
    handleMitraDeepLink(deepLink);
  }

  if (notificationId) {
    store.dispatch(markNotificationsRead([notificationId]));
  }

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


