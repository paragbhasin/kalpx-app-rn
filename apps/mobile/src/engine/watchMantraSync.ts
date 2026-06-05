import { getQuickResetOpening } from './mitraApi';
import { watchConnectivity } from '../native/watchConnectivity';
import store from '../store';

export async function pushMantrasToWatch(): Promise<void> {
  try {
    const homeData = store.getState().door?.homeData;
    const mantras: { ref: string; name: string; devanagari: string; label?: string }[] = [];

    // Inner Path mantra — user's current default from quick reset
    const opening = await getQuickResetOpening();
    if (opening?.mantra) {
      mantras.push({
        ref:        opening.mantra.item_id,
        name:       opening.mantra.title,
        devanagari: opening.mantra.devanagari,
        label:      'inner_path',
      });
    }

    // Daily Rhythm mantras — morning / afternoon / night
    const rhythm = homeData?.companion_rhythm;
    if (rhythm) {
      const slots = [
        { slot: rhythm.morning,   label: 'Morning' },
        { slot: rhythm.afternoon, label: 'Afternoon' },
        { slot: rhythm.night,     label: 'Night' },
      ];
      for (const { slot, label } of slots) {
        const mantraItems = (slot?.items ?? []).filter(
          (item: any) => item.item_type === 'mantra'
        );
        for (const item of mantraItems) {
          if (!mantras.find((m) => m.ref === item.item_id)) {
            mantras.push({
              ref:        item.item_id,
              name:       item.title_snapshot,
              devanagari: '',
              label,
            });
          }
        }
      }
    }

    if (mantras.length > 0) {
      watchConnectivity.pushMantrasViaContext(mantras);
      watchConnectivity.writeMantrasToAppGroup(mantras);
      watchConnectivity.sendToWatch({ type: 'mantra_list', mantras });
      console.log('[WatchMantra] pushed', mantras.length, 'mantras to Watch');
    }
  } catch (err) {
    console.warn('[WatchMantra] push failed:', err);
  }
}
