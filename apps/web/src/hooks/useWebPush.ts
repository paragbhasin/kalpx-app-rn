import { useState, useEffect, useCallback } from 'react';
import {
  isWebPushSupported,
  subscribeWebPush,
  unsubscribeWebPush,
  getWebPushStatus,
} from '../lib/webPushApi';

type WebPushState =
  | 'unsupported'
  | 'checking'
  | 'not_subscribed'
  | 'subscribing'
  | 'subscribed'
  | 'denied'
  | 'error';

export function useWebPush() {
  const [state, setState] = useState<WebPushState>('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isWebPushSupported()) {
      setState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }

    // Check if already subscribed in this browser
    navigator.serviceWorker.getRegistration('/').then((reg) => {
      if (!reg) { setState('not_subscribed'); return; }
      return reg.pushManager.getSubscription().then((sub) => {
        setState(sub ? 'subscribed' : 'not_subscribed');
      });
    }).catch(() => setState('not_subscribed'));
  }, []);

  const subscribe = useCallback(async () => {
    setState('subscribing');
    setError('');
    try {
      await subscribeWebPush();
      setState('subscribed');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === 'permission_denied') {
        setState('denied');
      } else {
        setState('error');
        setError(msg);
      }
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    try {
      await unsubscribeWebPush();
      setState('not_subscribed');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  return { state, error, subscribe, unsubscribe };
}
