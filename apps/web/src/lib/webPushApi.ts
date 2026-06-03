import { api } from './api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

export function isWebPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function getVapidPublicKey(): Promise<string> {
  const res = await api.get<{ vapid_public_key: string }>(
    '/notifications/web-push/vapid-public-key/'
  );
  return res.data.vapid_public_key;
}

export async function subscribeWebPush(): Promise<{ subscription_id: number; created: boolean }> {
  const vapidKey = await getVapidPublicKey();

  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(`permission_${permission}`);
  }

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });

  const s = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };

  const ua = navigator.userAgent;
  const browser = ua.includes('Edg/') ? 'edge'
    : ua.includes('Firefox') ? 'firefox'
    : ua.includes('Chrome') ? 'chrome'
    : ua.includes('Safari') ? 'safari'
    : 'unknown';
  const platform = /Android/.test(ua) ? 'android'
    : /iPhone|iPad|iPod/.test(ua) ? 'ios'
    : /Mac/.test(ua) ? 'macos'
    : /Windows/.test(ua) ? 'windows'
    : 'unknown';

  const res = await api.post<{ subscription_id: number; created: boolean }>(
    '/notifications/web-push/subscribe/',
    {
      endpoint: s.endpoint,
      keys: { p256dh: s.keys.p256dh, auth: s.keys.auth },
      browser,
      platform,
      permission_state: 'granted',
      device_label: `${browser}/${platform}`,
    }
  );
  return res.data;
}

export async function unsubscribeWebPush(): Promise<void> {
  const reg = await navigator.serviceWorker.getRegistration('/');
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  await api.post('/notifications/web-push/unsubscribe/', { endpoint });
}

export async function getWebPushStatus(): Promise<{
  total_active: number;
  web_push_enabled: boolean;
}> {
  const res = await api.get<{ total_active: number; web_push_enabled: boolean }>(
    '/notifications/web-push/status/'
  );
  return res.data;
}
