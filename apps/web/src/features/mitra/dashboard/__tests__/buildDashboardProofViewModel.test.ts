import { describe, it, expect } from 'vitest';
import { buildDashboardProofViewModel } from '../buildDashboardProofViewModel';

const FULL_SCREEN_DATA = {
  greeting_headline: 'Good morning, Parag',
  greeting_context: 'Stay with the sound.',
  card_mantra_title: 'So Hum',
  card_mantra_description: 'Breath mantra',
  master_mantra: { item_id: 'so_hum', item_type: 'mantra' },
  card_sankalpa_title: 'I am peace',
  card_sankalpa_description: 'Sankalp subtitle',
  master_sankalp: { item_id: 'peace_sankalp', item_type: 'sankalp' },
  card_ritual_title: 'Morning Yoga',
  card_ritual_description: 'Practice subtitle',
  master_practice: { item_id: 'morning_yoga', item_type: 'practice' },
  completed_today: ['sankalp'],
  support_chips: [
    { id: 'chip_1', label: 'Feeling heavy' },
    { id: 'chip_2', label: 'Need stillness' },
  ],
};

describe('buildDashboardProofViewModel', () => {
  it('builds greeting from screenData', () => {
    const vm = buildDashboardProofViewModel(FULL_SCREEN_DATA);
    expect(vm.greeting.headline).toBe('Good morning, Parag');
    expect(vm.greeting.subtitle).toBe('Stay with the sound.');
  });

  it('falls back to default greeting when keys missing', () => {
    const vm = buildDashboardProofViewModel({});
    expect(vm.greeting.headline).toBe('Welcome back');
    expect(vm.greeting.subtitle).toBe('');
  });

  it('builds all 3 triad cards', () => {
    const vm = buildDashboardProofViewModel(FULL_SCREEN_DATA);
    expect(vm.triadCards).toHaveLength(3);
    expect(vm.triadCards[0].type).toBe('mantra');
    expect(vm.triadCards[1].type).toBe('sankalp');
    expect(vm.triadCards[2].type).toBe('practice');
  });

  it('marks completed cards correctly', () => {
    const vm = buildDashboardProofViewModel(FULL_SCREEN_DATA);
    expect(vm.triadCards[0].completed).toBe(false); // mantra not in completed_today
    expect(vm.triadCards[1].completed).toBe(true);  // sankalp is
    expect(vm.triadCards[2].completed).toBe(false);
  });

  it('triad cards have tapAction pointing to cycle_transitions/offering_reveal', () => {
    const vm = buildDashboardProofViewModel(FULL_SCREEN_DATA);
    vm.triadCards.forEach((card) => {
      expect(card.tapAction.type).toBe('load_screen');
      expect(card.tapAction.container_id).toBe('cycle_transitions');
      expect(card.tapAction.state_id).toBe('offering_reveal');
    });
  });

  it('itemId is populated from master_* objects', () => {
    const vm = buildDashboardProofViewModel(FULL_SCREEN_DATA);
    expect(vm.triadCards[0].itemId).toBe('so_hum');
    expect(vm.triadCards[1].itemId).toBe('peace_sankalp');
    expect(vm.triadCards[2].itemId).toBe('morning_yoga');
  });

  it('handles missing triad gracefully — returns empty array', () => {
    const vm = buildDashboardProofViewModel({ greeting_headline: 'Hi' });
    expect(vm.triadCards).toHaveLength(0);
  });

  it('builds support chips from screenData', () => {
    const vm = buildDashboardProofViewModel(FULL_SCREEN_DATA);
    expect(vm.supportChips).toHaveLength(2);
    expect(vm.supportChips[0].label).toBe('Feeling heavy');
  });

  it('handles missing support chips gracefully — returns empty array', () => {
    const vm = buildDashboardProofViewModel({});
    expect(vm.supportChips).toHaveLength(0);
  });

  it('caps support chips at 4', () => {
    const data = {
      ...FULL_SCREEN_DATA,
      support_chips: Array.from({ length: 8 }, (_, i) => ({ id: `chip_${i}`, label: `Chip ${i}` })),
    };
    const vm = buildDashboardProofViewModel(data);
    expect(vm.supportChips).toHaveLength(4);
  });
});
