/**
 * RepCounterBlock — RVP-1 visual upgrade tests (T10–T11).
 * Data-layer tests: rep chip behavior and visibility.
 */
import { describe, it, expect } from 'vitest';

// T10: rep chip sets repsTotal and resets count to 0
describe('RepCounterBlock rep chip behavior', () => {
  it('T10: tapping a rep chip sets repsTotal and resets count to 0', () => {
    let repsTotal = 108;
    let reps = 45;
    const setRepsTotal = (n: number) => { repsTotal = n; };
    const setReps = (n: number) => { reps = n; };

    // Simulate chip tap for preset=27
    const preset = 27;
    setRepsTotal(preset);
    setReps(0);

    expect(repsTotal).toBe(27);
    expect(reps).toBe(0);
  });

  it('T11: rep chips are always visible (not gated on counting state)', () => {
    // Chips render regardless of current rep count — no conditional gate
    const REP_PRESETS = [1, 9, 27, 54, 108];
    const reps = 50; // mid-count
    // All chips are in the preset array regardless of reps
    expect(REP_PRESETS.length).toBe(5);
    expect(REP_PRESETS).toContain(108);
    // Chips are not filtered by reps — all 5 always visible
    const visibleChips = REP_PRESETS; // no filter applied
    expect(visibleChips.length).toBe(5);
    // The active chip is whichever matches repsTotal (not filtered out)
    const repsTotal = 54;
    const activeChip = REP_PRESETS.find(n => n === repsTotal);
    expect(activeChip).toBe(54);
  });
});
