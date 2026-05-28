import messaging from '@react-native-firebase/messaging';
import { Linking, Platform } from 'react-native';

export type NotifPermissionStatus = 'undetermined' | 'granted' | 'denied' | 'provisional';

function mapAuthStatus(status: number): NotifPermissionStatus {
  switch (status) {
    case messaging.AuthorizationStatus.AUTHORIZED:
      return 'granted';
    case messaging.AuthorizationStatus.PROVISIONAL:
      return 'provisional';
    case messaging.AuthorizationStatus.DENIED:
      return 'denied';
    default:
      return 'undetermined';
  }
}

/** Check current permission state without prompting the user. */
export async function checkNotificationPermission(): Promise<NotifPermissionStatus> {
  try {
    const status = await messaging().hasPermission();
    return mapAuthStatus(status);
  } catch {
    return 'undetermined';
  }
}

/** Open device notification settings. For denied state — iOS/Android. */
export function openNotificationSettings(): void {
  if (Platform.OS === 'android') {
    Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
      { key: 'android.provider.extra.APP_PACKAGE', value: 'com.kalpx.app' },
    ]).catch(() => Linking.openSettings());
  } else {
    Linking.openSettings();
  }
}
