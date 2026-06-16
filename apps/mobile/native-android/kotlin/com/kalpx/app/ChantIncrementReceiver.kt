package com.kalpx.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * ChantIncrementReceiver — Android equivalent of IncrementChantIntent (iOS 17+).
 *
 * iOS mapping:
 *   struct IncrementChantIntent: LiveActivityIntent {
 *     func perform() async throws -> some IntentResult {
 *       // increments counts + writes UserDefaults[kPendingKey]++
 *       await activity.update(...)
 *     }
 *   }
 *
 * Triggered by the "ॐ Chant" notification action button.
 * Forwards to KalpxLiveActivityService.ACTION_INCREMENT which:
 *   1. Increments sessionCount / weekCount / totalCount on the live notification
 *   2. Writes kalpx_pending_chant_increments++ to SharedPreferences
 *   3. Updates the notification in-place (user sees count go up on lock screen)
 *
 * JS QuickResetScreen useFocusEffect calls consumePendingIncrements() to replay
 * these taps into japaEngine when the app regains focus — same as iOS.
 *
 * Note: starting a ForegroundService from a BroadcastReceiver triggered by a
 * notification action is explicitly exempt from Android 12 background-start
 * restrictions (ActivityManager.RunningAppProcessInfo.IMPORTANCE_SERVICE).
 */
class ChantIncrementReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != KalpxLiveActivityService.ACTION_INCREMENT) return

        // Forward to the service for state update + notification refresh.
        // Using startService (not startForegroundService) — service is already running.
        // If for any reason the service is not running, startService is a no-op when
        // the service's onStartCommand sees no active activity state.
        context.startService(
            Intent(context, KalpxLiveActivityService::class.java).apply {
                action = KalpxLiveActivityService.ACTION_INCREMENT
            }
        )
    }
}
