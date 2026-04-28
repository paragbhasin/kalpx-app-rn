// Platform adapters injected into every controller.
// Controllers must NOT import react-native, react-router, DOM APIs,
// AsyncStorage, localStorage, expo-*, or Stripe SDKs directly.
// All platform behavior must come through these adapters.

export type { StorageAdapter, RouterAdapter } from '@kalpx/api-client';

export interface AudioAdapter {
  play(url: string): void;
  stop(): void;
  onEnd(cb: () => void): void;
}

export interface HapticsAdapter {
  impact(): void;
}

export const noopHaptics: HapticsAdapter = { impact: () => {} };
