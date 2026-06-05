/**
 * watchSyncHandler.ts
 * Handles all Watch → iPhone → Backend sync messages.
 * Called from Home.tsx watchConnectivity.onWatchMessage listener.
 *
 * Message types handled:
 *   japa_session_start   → start session on backend, return serverSessionId to Watch
 *   japa_sync_batch      → sync delta count to backend
 *   japa_session_complete → complete session on backend
 */

import { watchConnectivity } from '../native/watchConnectivity';
import {
  japaStartSession,
  japaSyncSession,
  japaCompleteSession,
} from './japaApi';
import { mitraPranaAcknowledge } from './mitraApi';
import store from '../store';

export async function handleWatchMessage(msg: Record<string, unknown>): Promise<void> {
  const type = msg.type as string;

  switch (type) {

    // ── Watch started a new session ───────────────────────────────────────────
    case 'japa_session_start': {
      const result = await japaStartSession({
        local_session_id: msg.localSessionId as string,
        mantra_ref:       msg.mantraRef as string,
        source_surface:   'watch',
        goal_type:        (msg.goalType as any) ?? 'unlimited',
        goal_value:       (msg.goalValue as number | null) ?? null,
        today_local_date: msg.todayLocalDate as string,
        timezone:         msg.timezone as string,
      });

      if (result?.session_id) {
        // Send serverSessionId back to Watch so it can attach it to sync batches
        watchConnectivity.sendToWatch({
          type:            'japa_session_started',
          localSessionId:  msg.localSessionId,
          serverSessionId: result.session_id,
        });
        console.log('[WatchSync] session started, serverSessionId:', result.session_id);
      }
      break;
    }

    // ── Watch sent a sync batch ───────────────────────────────────────────────
    case 'japa_sync_batch': {
      const serverSessionId = msg.serverSessionId as number | null;
      if (!serverSessionId) {
        console.warn('[WatchSync] sync batch received without serverSessionId — queuing');
        break;
      }

      await japaSyncSession(serverSessionId, {
        delta_count:      msg.deltaCount as number,
        cumulative_count: msg.cumulativeCount as number,
        idempotency_key:  msg.idempotencyKey as string,
        client_created_at: msg.clientCreatedAt as string,
        today_local_date: msg.todayLocalDate as string,
        timezone:         msg.timezone as string,
        source_surface:   'watch',
      });

      console.log('[WatchSync] sync batch accepted, delta:', msg.deltaCount);
      break;
    }

    // ── Watch completed a session ─────────────────────────────────────────────
    case 'japa_session_complete': {
      const serverSessionId = msg.serverSessionId as number | null;
      if (!serverSessionId) {
        console.warn('[WatchSync] complete received without serverSessionId');
        break;
      }

      await japaCompleteSession(serverSessionId, {
        final_count:  msg.finalCount as number,
        duration_ms:  msg.durationMs as number | undefined,
        completed_at: new Date().toISOString(),
      });

      console.log('[WatchSync] session completed, finalCount:', msg.finalCount);
      break;
    }

    // Watch launched with no mantras / path data — push everything now
    case 'request_mantras':
    case 'request_path_data': {
      console.log('[WatchSync] Watch requested data — pushing now');
      const { pushMantrasToWatch, pushPathDataToWatch } = await import('./watchMantraSync');
      await Promise.all([pushMantrasToWatch(), pushPathDataToWatch()]);
      break;
    }

    // Watch user held their sankalp
    case 'sankalp_held': {
      console.log('[WatchSync] sankalp held from Watch, source:', msg.source);
      // TODO: call the sankalp-held endpoint when it's available
      break;
    }

    // Watch user marked a practice as done
    case 'practice_done': {
      console.log('[WatchSync] practice done from Watch, source:', msg.source);
      // TODO: call the practice-done endpoint when it's available
      break;
    }

    // Watch user recorded a check-in state
    case 'checkin_recorded': {
      const pranaType = msg.pranaType as string;
      if (!pranaType) break;
      try {
        const screenData = store.getState().screen?.screenData ?? {};
        await mitraPranaAcknowledge({
          pranaType,
          focus:      (screenData.scan_focus as string)  || (screenData.active_focus as string) || 'peacecalm',
          subFocus:   (screenData.prana_baseline_selection as string) || '',
          depth:      (screenData.routine_depth as string) || 'standard',
          dayNumber:  (screenData.day_number as number)   || 1,
          journeyId:  (screenData.journey_id as string)   || null,
          round:      2,
          locale:     'en',
          tz:         Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        });
        console.log('[WatchSync] check-in recorded, pranaType:', pranaType);
      } catch (err) {
        console.warn('[WatchSync] checkin_recorded failed:', err);
      }
      break;
    }

    default:
      break;
  }
}
