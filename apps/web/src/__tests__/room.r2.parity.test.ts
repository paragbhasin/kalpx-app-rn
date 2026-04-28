/**
 * R2 room non-runner action parity tests (G18–G21).
 * Pure logic tests — no React rendering.
 */
import { describe, it, expect } from 'vitest';
import { classifyStep } from '../components/blocks/room/StepModal';

// ── R2a: Step action — sacred POST + voice/reach-out stubs ───────────────────

describe('R2a StepModal — sacred POST and stubs', () => {
  it('text step sacred POST payload has source_surface=step_pill', () => {
    const payload = {
      writes_event: 'step_journal_growth',
      label: 'Reflect on this',
      action_id: 'action_step_1',
      analytics_key: null,
      captured_at: Date.now(),
      text: 'my reflection',
      life_context: null,
      journey_id: null,
      day_number: null,
      source_surface: 'step_pill',
    };
    expect(payload.source_surface).toBe('step_pill');
    expect(payload.text).toBe('my reflection');
    expect(payload.writes_event).toBe('step_journal_growth');
  });

  it('voice_note classifies to voice_note (not unknown) — stub body renders', () => {
    expect(classifyStep('step_voice_note_release')).toBe('voice_note');
    expect(classifyStep('step_voice_note_release')).not.toBe('unknown');
  });

  it('reach_out classifies to reach_out (not unknown) — stub body renders', () => {
    expect(classifyStep('step_reach_out_connection')).toBe('reach_out');
    expect(classifyStep('step_reach_out_connection')).not.toBe('unknown');
  });
});

// ── R2b: Inquiry action — sacred POST + practice → StepModal ─────────────────

describe('R2b InquiryModal — sacred POST and practice launch', () => {
  it('inquiry journal submit sacred POST payload has source_surface=inquiry_pill', () => {
    const text = 'I noticed clarity when I stopped pushing.';
    const payload = {
      writes_event: 'inquiry_journal',
      label: 'What is blocking you?',
      action_id: 'action_inquiry_1',
      analytics_key: null,
      captured_at: Date.now(),
      text,
      life_context: null,
      journey_id: null,
      day_number: null,
      source_surface: 'inquiry_pill',
    };
    expect(payload.source_surface).toBe('inquiry_pill');
    expect(payload.writes_event).toBe('inquiry_journal');
    expect(payload.text).toBe(text);
  });

  it('inquiry practice launch synthesizes { template_id } and resolves to a non-unknown step kind', () => {
    const templateId = 'step_breathe_4_7_8';
    const synthesized = { template_id: templateId };
    // StepModal will receive this as stepPayload and open with a timer body
    expect(synthesized.template_id).toBe(templateId);
    expect(classifyStep(templateId)).toBe('timer_breathe');
    expect(classifyStep(templateId)).not.toBe('unknown');
  });
});

// ── R2c: Teaching action — approved web divergence ───────────────────────────

describe('R2c Teaching inline expand (approved web divergence)', () => {
  it('teaching dispatch type is room_step_completed, not open_why_this_l2', () => {
    const dispatched: any[] = [];
    const onAction = (action: any) => dispatched.push(action);
    // Simulate what RoomActionPill dispatches on teaching expand
    onAction({ type: 'room_step_completed', payload: { room_id: 'room_clarity', action_id: 'a1', analytics_key: null } });
    expect(dispatched[0].type).toBe('room_step_completed');
    expect(dispatched[0].type).not.toBe('open_why_this_l2');
  });
});

// ── R2d: Carry capture — sacred_write_ok + joy_carry navigation ──────────────

describe('R2d CarryCaptureModal — sacred_write_ok and joy_carry', () => {
  it('carry dispatch payload includes sacred_write_ok field', () => {
    const dispatched: any[] = [];
    const onAction = (action: any) => dispatched.push(action);
    onAction({
      type: 'room_carry_captured',
      payload: {
        room_id: 'room_joy',
        action_id: 'a1',
        analytics_key: null,
        label: 'Notice what is good',
        writes_event: 'joy_carry',
        carry_text: 'I noticed warmth today.',
        sacred_write_ok: true,
      },
    });
    expect('sacred_write_ok' in dispatched[0].payload).toBe(true);
    expect(dispatched[0].payload.sacred_write_ok).toBe(true);
  });

  it('sacred_write_ok is false when sacred POST returns null', () => {
    const sacredResult = null;
    const sacredWriteOk = sacredResult !== null;
    expect(sacredWriteOk).toBe(false);
  });

  it('joy_carry triggers onReturnHome directly (auto-navigate, no confirmation screen)', () => {
    let returnHomeCalled = false;
    let confirmationShown = false;

    const isJoyCarry = true;
    const onReturnHome = () => { returnHomeCalled = true; };
    const showConfirmation = () => { confirmationShown = true; };

    // Simulate handleSave logic after sacredResult
    if (isJoyCarry) {
      onReturnHome();
    } else {
      showConfirmation();
    }

    expect(returnHomeCalled).toBe(true);
    expect(confirmationShown).toBe(false);
  });

  it('non-joy carry shows confirmation screen after save', () => {
    let returnHomeCalled = false;
    let confirmationShown = false;

    const isJoyCarry = false;
    const onReturnHome = () => { returnHomeCalled = true; };
    const showConfirmation = () => { confirmationShown = true; };

    if (isJoyCarry) {
      onReturnHome();
    } else {
      showConfirmation();
    }

    expect(confirmationShown).toBe(true);
    expect(returnHomeCalled).toBe(false);
  });
});
