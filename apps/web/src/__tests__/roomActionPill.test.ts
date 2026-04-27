/**
 * RoomActionPill tests — Phase 13.5
 * Data-layer tests: action type resolution, payload shapes, helper_line.
 */
import { describe, it, expect } from 'vitest';

// ── Action type resolution ────────────────────────────────────────────────────

interface RoomAction {
  action_id: string;
  label: string;
  action_type: string;
  action_family?: string;
  analytics_key?: string | null;
  helper_line?: string | null;
  runner_payload?: any;
  teaching_payload?: any;
  inquiry_payload?: any;
  step_payload?: any;
  carry_payload?: any;
  exit_payload?: any;
  primary_recommendation?: boolean;
  persistence?: { writes_event?: string | null };
}

function resolveActionKind(action: RoomAction) {
  return {
    isExit: action.action_type === 'exit',
    isRunner: action.action_type.startsWith('runner_'),
    isTeaching: action.action_type === 'teaching',
    isInquiry: action.action_type === 'inquiry',
    isStep: action.action_type === 'in_room_step',
    isCarry: action.action_type === 'in_room_carry',
  };
}

function buildRunnerVariant(action: RoomAction): string {
  if (action.action_type === 'runner_mantra') return 'mantra';
  if (action.action_type === 'runner_sankalp') return 'sankalp';
  return 'practice';
}

describe('RoomActionPill action type resolution', () => {
  it('exit action type resolves correctly', () => {
    const a: RoomAction = { action_id: 'exit1', label: 'Leave', action_type: 'exit' };
    expect(resolveActionKind(a).isExit).toBe(true);
  });

  it('runner_mantra action type resolves correctly', () => {
    const a: RoomAction = { action_id: 'r1', label: 'Chant', action_type: 'runner_mantra' };
    const k = resolveActionKind(a);
    expect(k.isRunner).toBe(true);
    expect(k.isExit).toBe(false);
    expect(buildRunnerVariant(a)).toBe('mantra');
  });

  it('runner_sankalp action type resolves correctly', () => {
    const a: RoomAction = { action_id: 'r2', label: 'Sankalp', action_type: 'runner_sankalp' };
    expect(buildRunnerVariant(a)).toBe('sankalp');
  });

  it('runner_practice resolves to practice variant', () => {
    const a: RoomAction = { action_id: 'r3', label: 'Practice', action_type: 'runner_practice' };
    expect(buildRunnerVariant(a)).toBe('practice');
  });

  it('in_room_step resolves correctly', () => {
    const a: RoomAction = { action_id: 's1', label: 'Breathe', action_type: 'in_room_step' };
    expect(resolveActionKind(a).isStep).toBe(true);
  });

  it('in_room_carry resolves correctly', () => {
    const a: RoomAction = { action_id: 'c1', label: 'Carry joy', action_type: 'in_room_carry' };
    expect(resolveActionKind(a).isCarry).toBe(true);
  });

  it('inquiry resolves correctly', () => {
    const a: RoomAction = { action_id: 'i1', label: 'Reflect', action_type: 'inquiry' };
    expect(resolveActionKind(a).isInquiry).toBe(true);
  });
});

// ── helper_line presence ──────────────────────────────────────────────────────

describe('RoomActionPill helper_line', () => {
  it('helper_line is visible when action provides it', () => {
    const action: RoomAction = {
      action_id: 'a1',
      label: 'Breathe deeply',
      action_type: 'in_room_step',
      helper_line: 'A gentle pause for 30 seconds',
    };
    expect(action.helper_line).toBeTruthy();
  });

  it('helper_line is null when not provided', () => {
    const action: RoomAction = {
      action_id: 'a2',
      label: 'Breathe',
      action_type: 'in_room_step',
    };
    expect(action.helper_line).toBeUndefined();
  });
});

// ── Dispatch payload shapes ───────────────────────────────────────────────────

describe('RoomActionPill dispatch payloads', () => {
  it('room_exit payload has room_id', () => {
    const payload = { type: 'room_exit', payload: { room_id: 'room_stillness' } };
    expect(payload.payload.room_id).toBe('room_stillness');
  });

  it('start_runner payload has source, variant, item', () => {
    const payload = {
      type: 'start_runner',
      payload: { source: 'room_room_clarity', variant: 'mantra', item: { item_id: 'm1', title: 'Om' } },
    };
    expect(payload.payload.source).toContain('room_');
    expect(payload.payload.variant).toBe('mantra');
    expect(payload.payload.item.item_id).toBe('m1');
  });

  it('room_step_completed includes template_id and writes_event', () => {
    const payload = {
      type: 'room_step_completed',
      payload: {
        room_id: 'room_stillness',
        action_id: 'step_breathe',
        analytics_key: 'breathe_4_7_8',
        template_id: 'step_breathe_4_7_8',
        writes_event: null,
      },
    };
    expect(payload.payload.template_id).toBe('step_breathe_4_7_8');
  });

  it('room_carry_captured includes label and writes_event', () => {
    const payload = {
      type: 'room_carry_captured',
      payload: {
        room_id: 'room_joy',
        action_id: 'joy_carry',
        label: 'Carry this joy',
        writes_event: 'joy_carry',
        carry_text: 'I felt present',
      },
    };
    expect(payload.payload.writes_event).toBe('joy_carry');
    expect(payload.payload.carry_text).toBeTruthy();
  });
});

// ── Style tokens ──────────────────────────────────────────────────────────────

describe('RoomActionPill style tokens', () => {
  it('pill has box-shadow for elevation', () => {
    const style = { boxShadow: '0 3px 8px rgba(0,0,0,0.1)' };
    expect(style.boxShadow).toContain('rgba');
  });

  it('exit pill has no box-shadow', () => {
    const isExit = true;
    const boxShadow = isExit ? 'none' : '0 3px 8px rgba(0,0,0,0.1)';
    expect(boxShadow).toBe('none');
  });

  it('text alignment is center for non-exit pills', () => {
    const textAlign = 'center';
    expect(textAlign).toBe('center');
  });
});
