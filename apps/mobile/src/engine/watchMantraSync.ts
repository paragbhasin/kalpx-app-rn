import { mitraJourneyDailyView, getQuickResetOpening } from './mitraApi';
import { japaGetStats } from './japaApi';
import { watchConnectivity } from '../native/watchConnectivity';
import store from '../store';

export async function pushMantrasToWatch(): Promise<void> {
  try {
    const homeData = store.getState().door?.homeData;
    const mantras: { ref: string; name: string; devanagari: string; label?: string }[] = [];

    // Rhythm mantras — all three bands
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

// Pushes structured path data so the Watch home list renders correctly.
// Inner Path: real triad from daily-view API (mantra + sankalp + practice).
// Rhythm: ALL three bands (morning/afternoon/night), not just current time slot.
export async function pushPathDataToWatch(): Promise<void> {
  try {
    const homeData = store.getState().door?.homeData;

    // ── Inner Path ─────────────────────────────────────────────────────────────
    const ips = homeData?.inner_path_summary;
    const hasActivePath = ips?.has_active_path === true;
    let innerPath = null;

    if (hasActivePath) {
      try {
        const result = await mitraJourneyDailyView();
        const rawTriad: any[] = result?.envelope?.today?.triad ?? [];
        const triad = rawTriad.map((item: any) => {
          // how_to_live can be a string, an array, or absent — normalise to string|null
          const htl = item.how_to_live;
          const howToLive = Array.isArray(htl)
            ? (htl.length > 0 ? htl.join(' ') : null)
            : (htl || null);
          return {
            slot:      item.slot,
            itemId:    item.item_id,
            title:     item.title,
            subtitle:  item.subtitle ?? '',
            howToLive,
            audioUrl:  item.audio_url ?? null,
          };
        });
        innerPath = {
          hasActivePath: true,
          dayNumber: ips.day_number ?? 1,
          totalDays: ips.total_days ?? 14,
          triad,
        };
      } catch {
        // daily-view failed — still show Inner Path card with no triad
        innerPath = {
          hasActivePath: true,
          dayNumber: ips.day_number ?? 1,
          totalDays: ips.total_days ?? 14,
          triad: [],
        };
      }
    }

    // ── Rhythm (all bands) ──────────────────────────────────────────────────────
    const cr = homeData?.companion_rhythm;
    const hasRhythm = cr?.has_rhythm === true;
    let rhythm = null;

    if (hasRhythm) {
      const bands = (['morning', 'afternoon', 'night'] as const)
        .map((band) => ({
          band,
          isDone: (cr as any)[`${band}_done`] ?? false,
          items: ((cr as any)[band]?.items ?? []).map((i: any) => ({
            itemId:      i.item_id,
            itemType:    i.item_type,
            title:       i.title_snapshot,
            description: i.description_snapshot ?? '',
            audioUrl:    i.audio_url ?? null,
          })),
        }))
        .filter((b) => b.items.length > 0);

      rhythm = { hasRhythm: true, bands };
    }

    // ── Check-In ───────────────────────────────────────────────────────────────
    const acw = homeData?.active_checkin_window;
    const checkin = {
      windowActive: acw?.active === true,
      pranaLabel:   acw?.prana_label ?? null,
    };

    // ── Quick Reset mantra ─────────────────────────────────────────────────────
    let quickReset = null;
    try {
      const qrResult = await getQuickResetOpening();
      if (qrResult?.mantra) {
        quickReset = {
          itemId:      qrResult.mantra.item_id,
          title:       qrResult.mantra.title,
          devanagari:  qrResult.mantra.devanagari ?? '',
          audioUrl:    qrResult.mantra.audio_url ?? null,
        };
      }
    } catch { /* non-fatal */ }

    // ── Per-mantra stats (today / week / year / lifetime) ─────────────────────
    const mantraStats: Record<string, {
      todayCount: number; weekCount: number; yearCount: number; lifetimeCount: number;
    }> = {};
    try {
      const statsResult = await japaGetStats();
      if (statsResult?.stats) {
        for (const row of statsResult.stats) {
          mantraStats[row.mantra_ref] = {
            todayCount:    row.today_count,
            weekCount:     row.week_count,
            yearCount:     row.year_count,
            lifetimeCount: row.lifetime_count,
          };
        }
      }
    } catch { /* non-fatal */ }

    const pathData = { innerPath, rhythm, checkin, quickReset, mantraStats };

    console.log('[WatchPath] pushing — hasActivePath:', hasActivePath, 'hasRhythm:', hasRhythm,
      'triadCount:', (innerPath as any)?.triad?.length ?? 0,
      'rhythmBands:', (rhythm as any)?.bands?.length ?? 0);

    watchConnectivity.writePathDataToAppGroup(pathData);
    watchConnectivity.pushPathDataViaContext(pathData);
    watchConnectivity.sendToWatch({ type: 'path_data', payload: pathData });

    // Complication: today japa count
    const todayJapaCount: number = (homeData as any)?.japa_stats?.today_count ?? 0;
    watchConnectivity.writeTodayStatsToAppGroup({ todayJapaCount, innerPathToday: null });

    console.log('[WatchPath] pushed path data to Watch');
  } catch (err) {
    console.warn('[WatchPath] push failed:', err);
  }
}
