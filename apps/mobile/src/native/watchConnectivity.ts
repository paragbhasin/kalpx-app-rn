import { NativeEventEmitter, Platform } from 'react-native';
import NativeKalpxWatchConnectivity from './NativeKalpxWatchConnectivity';

const supported = Platform.OS === 'ios' && !!NativeKalpxWatchConnectivity;

// Lazy emitter — only created if module is available.
let _emitter: NativeEventEmitter | null = null;
function emitter(): NativeEventEmitter {
  if (!_emitter && NativeKalpxWatchConnectivity) {
    _emitter = new NativeEventEmitter(NativeKalpxWatchConnectivity as any);
  }
  return _emitter!;
}

export type WatchMessageHandler = (message: Record<string, unknown>) => void;

export const watchConnectivity = {
  /** Activate WCSession. Call once at app startup (AppDelegate subscriber handles
   *  the critical early activation; this call keeps RN state in sync). */
  setup(): void {
    if (!supported) return;
    NativeKalpxWatchConnectivity.setup();
  },

  /** Send a message to Watch. Safe to call even if Watch is not reachable —
   *  the native module handles sendMessage → transferUserInfo fallback. */
  sendToWatch(message: object): Promise<void> {
    if (!supported) return Promise.resolve();
    return NativeKalpxWatchConnectivity.sendToWatch(message).catch((err: unknown) => {
      console.warn('[WatchConnectivity] sendToWatch failed:', err);
    });
  },

  isWatchReachable(): Promise<boolean> {
    if (!supported) return Promise.resolve(false);
    return NativeKalpxWatchConnectivity.isWatchReachable().catch(() => false);
  },

  /** Subscribe to messages received FROM the Watch.
   *  Returns a subscription with a .remove() method. */
  onWatchMessage(handler: WatchMessageHandler) {
    if (!supported) return { remove: () => {} };
    return emitter().addListener('watchMessage', handler);
  },

  /** Subscribe to Watch reachability changes. */
  onReachabilityChanged(handler: (reachable: boolean) => void) {
    if (!supported) return { remove: () => {} };
    return emitter().addListener('watchReachabilityChanged', handler);
  },
};
