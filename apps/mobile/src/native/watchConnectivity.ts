import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

// Matches the exact pattern of liveActivity.ts — uses NativeModules, not TurboModuleRegistry.
// The native module is registered as a legacy module via RCT_EXTERN_MODULE.
const { KalpxWatchConnectivityModule } = NativeModules;
const supported = Platform.OS === 'ios' && !!KalpxWatchConnectivityModule;
console.log('[WatchConnectivity] module found:', !!KalpxWatchConnectivityModule, 'supported:', supported);
if (KalpxWatchConnectivityModule) {
  console.log('[WatchConnectivity] methods:', Object.keys(KalpxWatchConnectivityModule));
}

let _emitter: NativeEventEmitter | null = null;
function emitter(): NativeEventEmitter {
  if (!_emitter && KalpxWatchConnectivityModule) {
    _emitter = new NativeEventEmitter(KalpxWatchConnectivityModule);
  }
  return _emitter!;
}

export type WatchMessageHandler = (message: Record<string, unknown>) => void;

export const watchConnectivity = {
  setup(): void {
    if (!supported) return;
    KalpxWatchConnectivityModule.setup();
  },

  sendToWatch(message: object): Promise<void> {
    if (!supported) return Promise.resolve();
    return KalpxWatchConnectivityModule.sendToWatch(message).catch((err: unknown) => {
      console.warn('[WatchConnectivity] sendToWatch failed:', err);
    });
  },

  isWatchReachable(): Promise<boolean> {
    if (!supported) return Promise.resolve(false);
    return KalpxWatchConnectivityModule.isWatchReachable().catch(() => false);
  },

  onWatchMessage(handler: WatchMessageHandler) {
    if (!supported) return { remove: () => {} };
    return emitter().addListener('watchMessage', handler);
  },

  onReachabilityChanged(handler: (reachable: boolean) => void) {
    if (!supported) return { remove: () => {} };
    return emitter().addListener('watchReachabilityChanged', handler);
  },

  // Pushes mantras via WCSession applicationContext — works even without isWatchAppInstalled.
  // Watch reads this on every session activation. Most reliable path for simulator + device.
  pushMantrasViaContext(mantras: object[]): Promise<void> {
    if (!supported) return Promise.resolve();
    return KalpxWatchConnectivityModule.pushMantrasViaContext(mantras)
      .then(() => console.log('[WatchConnectivity] pushMantrasViaContext SUCCESS'))
      .catch((e: any) => console.error('[WatchConnectivity] pushMantrasViaContext FAILED:', e));
  },

  // Writes mantras directly to shared app group — Watch reads this on every launch.
  // Use this instead of sendToWatch for mantra data (more reliable).
  writeMantrasToAppGroup(mantras: object[]): Promise<void> {
    if (!supported) { console.warn('[WatchConnectivity] writeMantrasToAppGroup skipped — not supported'); return Promise.resolve(); }
    console.log('[WatchConnectivity] writeMantrasToAppGroup called with', mantras.length, 'mantras');
    return KalpxWatchConnectivityModule.writeMantrasToAppGroup(mantras)
      .then(() => console.log('[WatchConnectivity] writeMantrasToAppGroup SUCCESS'))
      .catch((e: any) => console.error('[WatchConnectivity] writeMantrasToAppGroup FAILED:', e));
  },

  // Push pathData via WCSession applicationContext — merges with mantras key, survives app restart.
  // Most reliable for simulator; complement to writePathDataToAppGroup.
  pushPathDataViaContext(pathData: object): Promise<void> {
    if (!supported) return Promise.resolve();
    return KalpxWatchConnectivityModule.pushPathDataViaContext(pathData)
      .then(() => console.log('[WatchConnectivity] pushPathDataViaContext SUCCESS'))
      .catch((e: any) => console.error('[WatchConnectivity] pushPathDataViaContext FAILED:', e));
  },

  // Writes structured path data (inner path + rhythm + checkin) to shared app group.
  // Watch reads this on every launch to render the home list.
  writePathDataToAppGroup(pathData: object): Promise<void> {
    if (!supported) return Promise.resolve();
    return KalpxWatchConnectivityModule.writePathDataToAppGroup(pathData)
      .then(() => console.log('[WatchConnectivity] writePathDataToAppGroup SUCCESS'))
      .catch((e: any) => console.error('[WatchConnectivity] writePathDataToAppGroup FAILED:', e));
  },
};
