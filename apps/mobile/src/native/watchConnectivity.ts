import { NativeEventEmitter, NativeModules, Platform, TurboModuleRegistry } from 'react-native';

// New Architecture (RN 0.79 bridgeless): TurboModuleRegistry is the correct
// way to access TurboModules. NativeModules is kept as fallback for debug/bridge mode.
const KalpxWatchConnectivityModule: any =
  TurboModuleRegistry.get<any>('KalpxWatchConnectivityModule') ??
  NativeModules.KalpxWatchConnectivityModule;
// Supported on both iOS (WatchConnectivity) and Android (Wearable Data Layer)
const supported = !!KalpxWatchConnectivityModule;
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
    // DEV relay tap: emit the exact payload so a host script can mirror it to a watch
    // emulator (Wear pairing is unavailable on emulators). No behavioural change.
    if (__DEV__) { try { console.log('[WATCH_RELAY_MANTRAS]', JSON.stringify(mantras)); } catch {} }
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
    // DEV relay tap: emit the exact payload so a host script can mirror it to a watch
    // emulator (Wear pairing is unavailable on emulators). No behavioural change.
    if (__DEV__) { try { console.log('[WATCH_RELAY_PATH]', JSON.stringify(pathData)); } catch {} }
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

  // Writes today's japa count + inner path summary to app group for Watch face complications.
  // iPhone calls this on homeData load so the Watch widget shows accurate today count.
  writeTodayStatsToAppGroup(stats: { todayJapaCount: number; innerPathToday?: object | null }): Promise<void> {
    if (!supported) return Promise.resolve();
    return KalpxWatchConnectivityModule.writeTodayStatsToAppGroup(stats)
      .then(() => console.log('[WatchConnectivity] writeTodayStatsToAppGroup SUCCESS'))
      .catch((e: any) => console.error('[WatchConnectivity] writeTodayStatsToAppGroup FAILED:', e));
  },
};
