import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * TurboModule spec for KalpxWatchConnectivityModule (Swift).
 * Required because newArchEnabled: true — legacy NativeModules are deprecated.
 *
 * Implemented in: ios/kalpx/KalpxWatchConnectivityModule.swift
 */
export interface Spec extends TurboModule {
  // Activate WCSession — call once at app startup.
  setup(): void;

  // Send a message to the paired Watch app.
  // Uses sendMessage if reachable, transferUserInfo as fallback.
  sendToWatch(message: Object): Promise<void>;

  // Whether the Watch app is currently reachable (foreground + Bluetooth active).
  isWatchReachable(): Promise<boolean>;

  // Required by RCTEventEmitter for New Architecture event support.
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('KalpxWatchConnectivity');
