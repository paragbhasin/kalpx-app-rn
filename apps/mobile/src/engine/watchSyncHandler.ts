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

    // Watch launched with no mantras — push them now
    case 'request_mantras': {
      console.log('[WatchSync] Watch requested mantras — pushing now');
      const { pushMantrasToWatch } = await import('./watchMantraSync');
      await pushMantrasToWatch();
      break;
    }

    default:
      break;
  }
}
