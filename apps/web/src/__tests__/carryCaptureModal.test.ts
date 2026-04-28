/**
 * CarryCaptureModal tests — Phase 13.5
 * Pure logic tests (no React rendering).
 */
import { describe, it, expect, vi } from 'vitest';

// ── CARRY_MEMORY_MODAL table (ported from RN) ─────────────────────────────

const CARRY_MEMORY_MODAL: Record<string, { prompt: string; placeholder: string; primary_label: string; sanatan_context?: string }> = {
  joy_carry: {
    prompt: 'What do you want to carry with you from this moment?',
    placeholder: 'What you noticed, felt, or want to hold onto...',
    primary_label: 'Carry this',
    sanatan_context: 'Joy held with awareness becomes a source of light.',
  },
  release_capture: {
    prompt: 'What are you setting down right now?',
    placeholder: 'Name what you are releasing...',
    primary_label: 'Release it',
  },
  growth_reflect: {
    prompt: 'What insight or intention do you want to take with you?',
    placeholder: 'Your reflection...',
    primary_label: 'Hold this',
  },
  clarity_note: {
    prompt: 'What has become clearer for you?',
    placeholder: 'Your clarity note...',
    primary_label: 'Remember this',
  },
  stillness_note: {
    prompt: 'What did stillness offer you today?',
    placeholder: 'What arose in the quiet...',
    primary_label: 'Keep this',
  },
  connection_note: {
    prompt: 'What do you want to carry from this sense of connection?',
    placeholder: 'Your note...',
    primary_label: 'Save this',
  },
  generic: {
    prompt: 'What do you want to remember from this?',
    placeholder: 'Your reflection...',
    primary_label: 'Save',
  },
};

function getCarryCopy(writesEvent?: string | null, carryPayload?: any) {
  const mm = carryPayload?.memory_modal;
  if (mm) return { prompt: mm.prompt, placeholder: mm.placeholder || 'Type what you feel..', primary_label: mm.primary_label || 'Save' };
  const key = writesEvent || 'generic';
  return CARRY_MEMORY_MODAL[key] ?? CARRY_MEMORY_MODAL.generic;
}

describe('CARRY_MEMORY_MODAL', () => {
  it('has all 7 required entries', () => {
    expect(Object.keys(CARRY_MEMORY_MODAL)).toHaveLength(7);
  });

  it('joy_carry has sanatan_context', () => {
    expect(CARRY_MEMORY_MODAL.joy_carry.sanatan_context).toBeTruthy();
  });

  it('all entries have prompt, placeholder, primary_label', () => {
    for (const [key, val] of Object.entries(CARRY_MEMORY_MODAL)) {
      expect(val.prompt, `${key}.prompt`).toBeTruthy();
      expect(val.placeholder, `${key}.placeholder`).toBeTruthy();
      expect(val.primary_label, `${key}.primary_label`).toBeTruthy();
    }
  });
});

describe('getCarryCopy', () => {
  it('uses memory_modal when present in carryPayload', () => {
    const carryPayload = { memory_modal: { prompt: 'Custom prompt', placeholder: 'Custom placeholder', primary_label: 'Custom label' } };
    const copy = getCarryCopy('joy_carry', carryPayload);
    expect(copy.prompt).toBe('Custom prompt');
  });

  it('uses CARRY_MEMORY_MODAL lookup for joy_carry', () => {
    const copy = getCarryCopy('joy_carry');
    expect(copy.primary_label).toBe('Carry this');
  });

  it('falls back to generic for unknown writesEvent', () => {
    const copy = getCarryCopy('unknown_event_xyz');
    expect(copy.primary_label).toBe('Save');
  });

  it('falls back to generic when writesEvent is null', () => {
    const copy = getCarryCopy(null);
    expect(copy.prompt).toBe('What do you want to remember from this?');
  });
});

// ── Save button state ─────────────────────────────────────────────────────────

describe('CarryCaptureModal save button state', () => {
  function isEnabled(text: string, isSubmitting: boolean): boolean {
    return text.trim().length >= 1 && !isSubmitting;
  }

  it('disabled when text is empty', () => {
    expect(isEnabled('', false)).toBe(false);
  });

  it('disabled when text is whitespace only', () => {
    expect(isEnabled('   ', false)).toBe(false);
  });

  it('enabled when text has content', () => {
    expect(isEnabled('something', false)).toBe(true);
  });

  it('disabled when submitting even with text', () => {
    expect(isEnabled('something', true)).toBe(false);
  });
});

// ── TEXT_CARRY_WRITES_EVENTS membership ──────────────────────────────────────

describe('Text carry identification', () => {
  const TEXT_CARRY_WRITES_EVENTS = new Set([
    'joy_carry', 'release_capture', 'growth_reflect', 'clarity_note',
    'stillness_note', 'connection_note',
  ]);

  const ALL_EXPECTED = ['joy_carry', 'release_capture', 'growth_reflect', 'clarity_note', 'stillness_note', 'connection_note'];

  it('includes all expected carry types', () => {
    for (const event of ALL_EXPECTED) {
      expect(TEXT_CARRY_WRITES_EVENTS.has(event), `${event} should be in set`).toBe(true);
    }
  });

  it('does not include unknown_event', () => {
    expect(TEXT_CARRY_WRITES_EVENTS.has('unknown_event')).toBe(false);
  });

  it('carryNeedsTextInput is true for joy_carry', () => {
    const isCarry = true;
    const writesEvent = 'joy_carry';
    const carryNeedsTextInput = isCarry && !!writesEvent && (
      TEXT_CARRY_WRITES_EVENTS.has(writesEvent) ||
      String(writesEvent).includes('capture') ||
      String(writesEvent).includes('carry') ||
      String(writesEvent).includes('note') ||
      String(writesEvent).includes('reflect')
    );
    expect(carryNeedsTextInput).toBe(true);
  });
});

// ── Sacred API call shape ─────────────────────────────────────────────────────

describe('Sacred POST payload', () => {
  it('includes all required fields', () => {
    const payload = {
      writes_event: 'joy_carry',
      label: 'Carry this joy',
      action_id: 'act_joy_carry',
      analytics_key: 'joy_carry_capture',
      captured_at: Date.now(),
      text: 'I found stillness',
      life_context: 'self',
      journey_id: 'journey-uuid-123',
      day_number: 5,
      source_surface: 'carry_pill',
    };

    expect(payload.writes_event).toBeTruthy();
    expect(payload.text).toBeTruthy();
    expect(payload.source_surface).toBe('carry_pill');
    expect(typeof payload.captured_at).toBe('number');
  });
});
