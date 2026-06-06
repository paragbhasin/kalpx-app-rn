import { getQuickResetOpening } from './mitraApi';
import { watchConnectivity } from '../native/watchConnectivity';
import store from '../store';

function getRhythmTimeBand(): 'morning' | 'afternoon' | 'night' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 20) return 'afternoon';
  return 'night';
}

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

// Pushes structured path data so the Watch home list renders the correct sections.
// Called on login + homeData load, same as pushMantrasToWatch.
export async function pushPathDataToWatch(): Promise<void> {
  try {
    const homeData = store.getState().door?.homeData;

    // ── Inner Path ─────────────────────────────────────────────────────────────
    const ips = homeData?.inner_path_summary;
    const hasActivePath = ips?.has_active_path === true;
    let innerPath = null;

    if (hasActivePath) {
      let mantra = null;
      try {
        const opening = await getQuickResetOpening();
        if (opening?.mantra) {
          mantra = {
            ref:        opening.mantra.item_id,
            name:       opening.mantra.title,
            devanagari: opening.mantra.devanagari ?? '',
          };
        }
      } catch {}

      innerPath = {
        hasActivePath: true,
        dayNumber:  ips.day_number  ?? 1,
        totalDays:  ips.total_days  ?? 14,
        mantra,
        practice: null, // practice content requires inner-path-day API — handled in Phase 5
      };
    }

    // ── Rhythm ─────────────────────────────────────────────────────────────────
    const cr = homeData?.companion_rhythm;
    const hasRhythm = cr?.has_rhythm === true;
    let rhythm = null;

    if (hasRhythm) {
      const currentSlot = getRhythmTimeBand();
      const slot = cr[currentSlot];
      const slotDone = cr[`${currentSlot}_done`] ?? false;

      const items: any[] = slot?.items ?? [];
      const mantraItem   = items.find((i) => i.item_type === 'mantra');
      const sankalpItem  = items.find((i) => i.item_type === 'sankalp');
      const practiceItem = items.find((i) => i.item_type === 'practice');

      rhythm = {
        hasRhythm: true,
        currentSlot,
        slotDone,
        mantra: mantraItem ? {
          ref:        mantraItem.item_id,
          name:       mantraItem.title_snapshot,
          devanagari: mantraItem.devanagari ?? '',
        } : null,
        sankalp: sankalpItem ? {
          title: sankalpItem.title_snapshot,
          line:  sankalpItem.description_snapshot ?? '',
        } : null,
        practice: practiceItem ? {
          title:       practiceItem.title_snapshot,
          description: practiceItem.description_snapshot ?? '',
        } : null,
      };
    }

    // ── Check-In ───────────────────────────────────────────────────────────────
    const acw = homeData?.active_checkin_window;
    const checkin = {
      windowActive: acw?.active === true,
      pranaLabel:   acw?.prana_label ?? null,
    };

    const pathData = { innerPath, rhythm, checkin };

    // Push via app group (persistent) + applicationContext (simulator-reliable) + live message
    watchConnectivity.writePathDataToAppGroup(pathData);
    watchConnectivity.pushPathDataViaContext(pathData);
    watchConnectivity.sendToWatch({ type: 'path_data', payload: pathData });

    // Write today's japa count + inner path for Watch face complications
    const todayJapaCount: number = (homeData as any)?.japa_stats?.today_count ?? 0;
    const innerPathToday = hasActivePath && innerPath ? {
      day:         ips.day_number  ?? 1,
      totalDays:   ips.total_days  ?? 14,
      mantraRef:   innerPath.mantra?.ref   ?? null,
      mantraName:  innerPath.mantra?.name  ?? null,
      devanagari:  innerPath.mantra?.devanagari ?? null,
    } : null;
    watchConnectivity.writeTodayStatsToAppGroup({ todayJapaCount, innerPathToday });

    console.log('[WatchPath] pushed path data to Watch');
  } catch (err) {
    console.warn('[WatchPath] push failed:', err);
  }
}
