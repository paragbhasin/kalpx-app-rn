import { describe, it, expect } from 'vitest';
import { ingestDailyView, ingestDay7View, ingestDay14View } from '../v3Ingest';

// Minimal valid v3 daily envelope fixture
const DAILY_ENVELOPE_FIXTURE = {
  identity: {
    journey_id: 42,
    day_number: 3,
    total_days: 21,
    path_cycle_number: 1,
  },
  greeting: {
    user_name: 'Parag',
    headline: 'Good morning, Parag',
    supporting_line: 'Stay with the sound.',
  },
  arc_state: {
    checkpoint_due: null,
    arc_complete: false,
    journey_path: 'universal',
    journey_path_label: 'Universal Path',
  },
  continuity: {
    why_this: { text: 'Your mantra is aligned with your current state.' },
    why_this_l1_items: [],
  },
  today: {
    triad: [
      {
        slot: 'mantra',
        item_id: 'so_hum',
        title: 'So Hum',
        subtitle: 'Breath mantra',
        completed_today: false,
        meaning: 'I am that',
      },
      {
        slot: 'sankalp',
        item_id: 'peace_intention',
        title: 'I am at peace',
        subtitle: 'Sankalp',
        completed_today: true,
      },
      {
        slot: 'practice',
        item_id: 'morning_yoga',
        title: 'Morning Yoga',
        subtitle: '15 min',
        completed_today: false,
      },
    ],
    focus_phrase: 'Breathe deeply.',
    day_type: 'day_active',
    morning_briefing: {
      audio_status: 'generating',
      summary: '',
      briefing_id: '',
    },
  },
  insights: {},
};

describe('ingestDailyView', () => {
  it('returns empty object for null input', () => {
    expect(ingestDailyView(null)).toEqual({});
  });

  it('produces at least 40 flat keys from fixture envelope', () => {
    const flat = ingestDailyView(DAILY_ENVELOPE_FIXTURE);
    const count = Object.keys(flat).length;
    expect(count).toBeGreaterThanOrEqual(40);
  });

  it('identity fields populated', () => {
    const flat = ingestDailyView(DAILY_ENVELOPE_FIXTURE);
    expect(flat.journey_id).toBe(42);
    expect(flat.day_number).toBe(3);
    expect(flat.total_days).toBe(21);
  });

  it('greeting fields populated', () => {
    const flat = ingestDailyView(DAILY_ENVELOPE_FIXTURE);
    expect(flat.greeting_headline).toBe('Good morning, Parag');
    expect(flat.greeting_context).toBe('Stay with the sound.');
    expect(flat.user_name).toBe('Parag');
  });

  it('triad card titles extracted correctly', () => {
    const flat = ingestDailyView(DAILY_ENVELOPE_FIXTURE);
    expect(flat.card_mantra_title).toBe('So Hum');
    expect(flat.card_sankalpa_title).toBe('I am at peace');
    expect(flat.card_ritual_title).toBe('Morning Yoga');
  });

  it('completed_today reflects triad completion flags', () => {
    const flat = ingestDailyView(DAILY_ENVELOPE_FIXTURE);
    expect(flat.completed_today).toContain('sankalp');
    expect(flat.completed_today).not.toContain('mantra');
    expect(flat.completed_today).not.toContain('practice');
  });

  it('master_mantra contains item_id and wisdom', () => {
    const flat = ingestDailyView(DAILY_ENVELOPE_FIXTURE);
    expect(flat.master_mantra?.item_id).toBe('so_hum');
    expect(flat.master_mantra?.wisdom).toBe('I am that');
  });

  it('missing optional fields do not crash — returns null/defaults', () => {
    const minimal = { identity: {}, greeting: {}, today: {}, arc_state: {}, continuity: {}, insights: {} };
    const flat = ingestDailyView(minimal);
    expect(flat.journey_id).toBeNull();
    expect(flat.greeting_headline).toBe('');
    expect(flat.completed_today).toEqual([]);
    expect(flat.master_mantra).toBeNull();
  });
});

describe('ingestDay7View', () => {
  it('returns empty object for null input', () => {
    expect(ingestDay7View(null)).toEqual({});
  });
});

describe('ingestDay14View', () => {
  it('returns empty object for null input', () => {
    expect(ingestDay14View(null)).toEqual({});
  });
});
