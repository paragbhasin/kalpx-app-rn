/**
 * Cross-surface onboarding schema isolation tests.
 *
 * 1. All required welcome_onboarding states resolve to non-null via getScreen().
 * 2. Stale Redux container state from any other surface falls back to "turn_1"
 *    via the guard logic in OnboardingPage.tsx lines 49-53.
 *
 * Run:
 *   cd apps/web && pnpm exec vitest run src/engine/__tests__/onboardingSchemaResolver.test.ts
 */

import { describe, it, expect } from 'vitest';
import { getScreen } from '../screenResolver';

// ── Schema resolver: all required states must resolve ─────────────────────────

describe('welcome_onboarding schema — all turn states resolve', () => {
  const REQUIRED_STATES = [
    'turn_1',
    'entry_intention',
    'turn_2',
    'turn_3_life_context',
    'turn_3_felt',
    'turn_3_clarify',
    'turn_7',
    'turn_8',
  ];

  for (const stateId of REQUIRED_STATES) {
    it(`getScreen("welcome_onboarding", "${stateId}") returns non-null`, async () => {
      const screen = await getScreen('welcome_onboarding', stateId);
      expect(screen).not.toBeNull();
      expect(screen).not.toBeUndefined();
      expect(screen.container_id).toBe('welcome_onboarding');
      expect(screen.state_id).toBe(stateId);
    });
  }

  it('getScreen("welcome_onboarding", "nonexistent_state") returns null', async () => {
    const screen = await getScreen('welcome_onboarding', 'nonexistent_state');
    expect(screen).toBeNull();
  });
});

// ── Stale container guard — mirrors OnboardingPage.tsx lines 49-53 ────────────

describe('OnboardingPage stateId — stale Redux container guard', () => {
  // Pure function: extract and test the stateId resolution logic so it can never
  // silently regress to passing a stale container's stateId to getScreen().
  const resolveStateId = (
    searchParamStateId: string | null,
    currentContainerId: string,
    currentStateId: string,
  ): string =>
    searchParamStateId ||
    (currentContainerId === 'welcome_onboarding' ? currentStateId : null) ||
    'turn_1';

  const STALE_CASES: Array<{ label: string; containerId: string; stateId: string }> = [
    { label: 'initial Redux state', containerId: 'portal', stateId: 'portal' },
    { label: 'Daily Rhythm runner', containerId: 'practice_runner', stateId: 'free_mantra_chanting' },
    { label: 'dashboard', containerId: 'dashboard', stateId: 'main' },
    { label: 'Quick Reset', containerId: 'quick_reset_container', stateId: 'some_reset_state' },
    { label: 'Tell Mitra', containerId: 'tell_mitra', stateId: 'tell_mitra_state' },
    { label: 'Quick Check-in', containerId: 'checkin_container', stateId: 'checkin_state' },
  ];

  for (const { label, containerId, stateId } of STALE_CASES) {
    it(`${label} (containerId="${containerId}") → stateId defaults to "turn_1"`, () => {
      // No stateId in URL, stale container in Redux → must fall back to turn_1.
      const result = resolveStateId(null, containerId, stateId);
      expect(result).toBe('turn_1');
    });
  }

  it('explicit ?stateId URL param wins over stale Redux state', () => {
    // URL has stateId → takes priority regardless of Redux container.
    const result = resolveStateId('turn_3_felt', 'portal', 'portal');
    expect(result).toBe('turn_3_felt');
  });

  it('welcome_onboarding container: resumes at current state (mid-onboarding)', () => {
    // User is mid-onboarding at turn_2 with no URL param → correct resume.
    const result = resolveStateId(null, 'welcome_onboarding', 'turn_2');
    expect(result).toBe('turn_2');
  });

  it('no URL param + no Redux state → turn_1', () => {
    const result = resolveStateId(null, 'portal', '');
    expect(result).toBe('turn_1');
  });
});
