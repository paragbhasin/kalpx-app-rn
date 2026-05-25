/**
 * P0 Lane Contract — onboarding turn_3_life_context lane-aware states.
 *
 * Verifies that:
 * - turn_3_life_context_support and turn_3_life_context_growth exist
 * - Each state has the correct chip IDs (no cross-lane contamination)
 * - Heading copy is lane-appropriate
 * - Original turn_3_life_context remains for backward compat
 *
 * Run: pnpm --filter @kalpx/contracts test
 */

import { describe, it, expect } from 'vitest';
import { WelcomeOnboardingContainer } from '../allContainers';

const states = WelcomeOnboardingContainer.states as Record<string, any>;

function getChipIds(stateName: string): string[] {
  const state = states[stateName];
  expect(state, `State '${stateName}' must exist`).toBeTruthy();
  const block = state.blocks.find((b: any) => b.type === 'onboarding_conversation_turn');
  expect(block, `${stateName} must have onboarding_conversation_turn block`).toBeTruthy();
  return block.reply_chips.map((c: any) => c.id);
}

const REQUIRED_SUPPORT_IDS = [
  'work_feels_heavy',
  'things_feel_difficult_at_home',
  'something_feels_off_inside',
  'my_health_feels_off',
  'money_is_stressing_me',
  'my_path_feels_unclear',
  'exams_feel_overwhelming',
  'daily_life_feels_hard',
];

const REQUIRED_GROWTH_IDS = [
  'work_feels_better',
  'things_feel_better_at_home',
  'inner_clarity',
  'inner_steadiness',
  'gratitude',
  'transition_growth',
  'studies_exams',
];

const GROWTH_ONLY_IDS = [
  'inner_clarity', 'inner_steadiness', 'gratitude', 'transition_growth',
  'work_feels_better', 'things_feel_better_at_home',
];

const SUPPORT_ONLY_IDS = [
  'work_feels_heavy', 'things_feel_difficult_at_home', 'something_feels_off_inside',
  'my_health_feels_off', 'money_is_stressing_me', 'my_path_feels_unclear',
  'exams_feel_overwhelming', 'daily_life_feels_hard',
];

describe('P0 lane-aware onboarding states', () => {
  it('turn_3_life_context exists for backward compat', () => {
    expect(states['turn_3_life_context']).toBeTruthy();
  });

  it('turn_3_life_context_support exists', () => {
    expect(states['turn_3_life_context_support']).toBeTruthy();
  });

  it('turn_3_life_context_growth exists', () => {
    expect(states['turn_3_life_context_growth']).toBeTruthy();
  });

  describe('support state chip IDs', () => {
    it.each(REQUIRED_SUPPORT_IDS)('has chip: %s', (chipId) => {
      expect(getChipIds('turn_3_life_context_support')).toContain(chipId);
    });

    it.each(GROWTH_ONLY_IDS)('does NOT contain growth-only chip: %s', (chipId) => {
      expect(getChipIds('turn_3_life_context_support')).not.toContain(chipId);
    });
  });

  describe('growth state chip IDs', () => {
    it.each(REQUIRED_GROWTH_IDS)('has chip: %s', (chipId) => {
      expect(getChipIds('turn_3_life_context_growth')).toContain(chipId);
    });

    it.each(SUPPORT_ONLY_IDS)('does NOT contain support-only chip: %s', (chipId) => {
      expect(getChipIds('turn_3_life_context_growth')).not.toContain(chipId);
    });
  });

  it('support heading is support-oriented', () => {
    const block = states['turn_3_life_context_support'].blocks.find(
      (b: any) => b.type === 'headline',
    );
    expect(block.content).toBe('What part of life feels heaviest right now?');
  });

  it('growth heading is growth-oriented', () => {
    const block = states['turn_3_life_context_growth'].blocks.find(
      (b: any) => b.type === 'headline',
    );
    expect(block.content).toBe('What do you want to strengthen?');
  });

  it('support state has exactly 8 chips', () => {
    expect(getChipIds('turn_3_life_context_support')).toHaveLength(8);
  });

  it('growth state has exactly 7 chips', () => {
    expect(getChipIds('turn_3_life_context_growth')).toHaveLength(7);
  });
});
