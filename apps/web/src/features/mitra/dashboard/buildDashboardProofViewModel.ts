/**
 * buildDashboardProofViewModel — pure function, unit-tested.
 * Transforms ingestDailyView() flat screenData into a minimal render shape
 * for the Phase 5 proof dashboard.
 */

export type TriadCard = {
  id: string;
  type: 'mantra' | 'sankalp' | 'practice';
  title: string;
  subtitle: string;
  itemId: string | null;
  completed: boolean;
  /** Action payload to pass to actionExecutor when card is tapped */
  tapAction: {
    type: 'load_screen';
    container_id: string;
    state_id: string;
  };
};

export type SupportChip = {
  id: string;
  label: string;
  action?: any;
};

export type DashboardProofViewModel = {
  greeting: {
    headline: string;
    subtitle: string;
  };
  triadCards: TriadCard[];
  supportChips: SupportChip[];
};

export function buildDashboardProofViewModel(
  screenData: Record<string, any>,
): DashboardProofViewModel {
  const greeting = {
    headline: screenData.greeting_headline || 'Welcome back',
    subtitle: screenData.greeting_context || screenData.focus_phrase || '',
  };

  const completedToday: string[] = screenData.completed_today ?? [];

  const triadCards: TriadCard[] = [];

  if (screenData.card_mantra_title) {
    const m = screenData.master_mantra || {};
    triadCards.push({
      id: 'mantra',
      type: 'mantra',
      title: screenData.card_mantra_title,
      subtitle: screenData.card_mantra_description || '',
      itemId: m.item_id || null,
      completed: completedToday.includes('mantra'),
      tapAction: {
        type: 'load_screen',
        container_id: 'cycle_transitions',
        state_id: 'offering_reveal',
      },
    });
  }

  if (screenData.card_sankalpa_title) {
    const s = screenData.master_sankalp || {};
    triadCards.push({
      id: 'sankalp',
      type: 'sankalp',
      title: screenData.card_sankalpa_title,
      subtitle: screenData.card_sankalpa_description || '',
      itemId: s.item_id || null,
      completed: completedToday.includes('sankalp'),
      tapAction: {
        type: 'load_screen',
        container_id: 'cycle_transitions',
        state_id: 'offering_reveal',
      },
    });
  }

  if (screenData.card_ritual_title) {
    const p = screenData.master_practice || {};
    triadCards.push({
      id: 'practice',
      type: 'practice',
      title: screenData.card_ritual_title,
      subtitle: screenData.card_ritual_description || '',
      itemId: p.item_id || null,
      completed: completedToday.includes('practice'),
      tapAction: {
        type: 'load_screen',
        container_id: 'cycle_transitions',
        state_id: 'offering_reveal',
      },
    });
  }

  const rawChips: any[] = screenData.support_chips || [];
  const supportChips: SupportChip[] = rawChips.slice(0, 4).map((chip: any) => ({
    id: chip.id || chip.label || String(Math.random()),
    label: chip.label || chip.title || '',
    action: chip.action,
  }));

  return { greeting, triadCards, supportChips };
}
