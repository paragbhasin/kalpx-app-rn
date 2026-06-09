package com.kalpx.app

import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

/**
 * KalpxLiveActivityModule — Android mirror of KalpxLiveActivityModule.swift
 *
 * Registered as "KalpxLiveActivityModule" to match the iOS RCT_EXTERN_MODULE name
 * and preserve the exact JS API in liveActivity.ts with zero JS changes.
 *
 * Architecture: this module is a thin Intent dispatcher. All state and notification
 * management lives in KalpxLiveActivityService, which runs as a ForegroundService.
 *
 * Works with both Old Architecture (bridge) and New Architecture (interop layer)
 * in RN 0.74+. No codegen spec required — mirrors iOS which uses RCT_EXTERN_MODULE.
 */
class KalpxLiveActivityModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val PREFS_NAME = "kalpx_live_activity_prefs"
        const val KEY_PENDING = "kalpx_pending_chant_increments"
    }

    override fun getName(): String = "KalpxLiveActivityModule"

    // ── startActivity ─────────────────────────────────────────────────────────
    // Mirrors: KalpxLiveActivityModule.swift startActivity(_:devanagari:counts:resolve:reject:)

    @ReactMethod
    fun startActivity(
        mantraName: String,
        devanagari: String,
        counts: ReadableMap,
        promise: Promise
    ) {
        if (!areNotificationsEnabled()) {
            promise.reject("DISABLED", "Notifications are disabled — cannot show Live Activity")
            return
        }
        try {
            val intent = serviceIntent(KalpxLiveActivityService.ACTION_START_CHANT) {
                putExtra("mantraName", mantraName)
                putExtra("devanagari", devanagari)
                putExtra("sessionCount", counts.safeInt("sessionCount"))
                putExtra("weekCount", counts.safeInt("weekCount"))
                putExtra("yearCount", counts.safeInt("yearCount"))
                putExtra("totalCount", counts.safeInt("totalCount"))
                putExtra("elapsedSeconds", counts.safeInt("elapsedSeconds"))
                putExtra("deepLinkURL", counts.safeString("deepLinkURL", "kalpx://mitra/quick_chant/home"))
            }
            ContextCompat.startForegroundService(reactContext, intent)
            promise.resolve("chant_activity")
        } catch (e: Exception) {
            promise.reject("START_FAILED", e.message, e)
        }
    }

    // ── updateActivity ────────────────────────────────────────────────────────
    // Mirrors: KalpxLiveActivityModule.swift updateActivity(_:resolve:reject:)

    @ReactMethod
    fun updateActivity(counts: ReadableMap, promise: Promise) {
        try {
            val intent = serviceIntent(KalpxLiveActivityService.ACTION_UPDATE_CHANT) {
                putExtra("sessionCount", counts.safeInt("sessionCount"))
                putExtra("weekCount", counts.safeInt("weekCount"))
                putExtra("yearCount", counts.safeInt("yearCount"))
                putExtra("totalCount", counts.safeInt("totalCount"))
                putExtra("elapsedSeconds", counts.safeInt("elapsedSeconds"))
            }
            reactContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            // Graceful: update failure is non-critical — notification just shows stale count
            promise.resolve(null)
        }
    }

    // ── endActivity ───────────────────────────────────────────────────────────
    // Mirrors: KalpxLiveActivityModule.swift endActivity(_:reject:)

    @ReactMethod
    fun endActivity(promise: Promise) {
        try {
            reactContext.startService(serviceIntent(KalpxLiveActivityService.ACTION_END))
        } catch (_: Exception) {
            // Service may already be stopped — not an error
        }
        promise.resolve(true)
    }

    // ── completeChantActivity ─────────────────────────────────────────────────
    // Mirrors: KalpxLiveActivityModule.swift completeChantActivity(_:elapsedSeconds:resolve:reject:)

    @ReactMethod
    fun completeChantActivity(finalCount: Int, elapsedSeconds: Int, promise: Promise) {
        try {
            val intent = serviceIntent(KalpxLiveActivityService.ACTION_COMPLETE_CHANT) {
                putExtra("finalCount", finalCount)
                putExtra("elapsedSeconds", elapsedSeconds)
            }
            reactContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(null)
        }
    }

    // ── startSankalpActivity ──────────────────────────────────────────────────
    // Mirrors: KalpxLiveActivityModule.swift startSankalpActivity(_:line:resolve:reject:)

    @ReactMethod
    fun startSankalpActivity(title: String, line: String, promise: Promise) {
        if (!areNotificationsEnabled()) {
            promise.reject("DISABLED", "Notifications are disabled — cannot show Live Activity")
            return
        }
        try {
            val intent = serviceIntent(KalpxLiveActivityService.ACTION_START_SANKALP) {
                putExtra("title", title)
                putExtra("line", line)
            }
            ContextCompat.startForegroundService(reactContext, intent)
            promise.resolve("sankalp_activity")
        } catch (e: Exception) {
            promise.reject("START_FAILED", e.message, e)
        }
    }

    // ── getPendingIncrements ──────────────────────────────────────────────────
    // Mirrors: KalpxLiveActivityModule.swift getPendingIncrements(_:reject:)
    // Called in QuickResetScreen useFocusEffect to replay lock-screen taps.

    @ReactMethod
    fun getPendingIncrements(promise: Promise) {
        val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val pending = prefs.getInt(KEY_PENDING, 0)
        prefs.edit().putInt(KEY_PENDING, 0).apply()
        promise.resolve(pending)
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    // Note: do NOT use apply { action = ... } here — inside a lambda with Intent receiver,
    // unqualified 'action' resolves to Intent.action (the property), not this function's
    // parameter, making it a no-op self-assignment. Set explicitly outside the apply block.
    private fun serviceIntent(intentAction: String, configure: Intent.() -> Unit = {}): Intent {
        val intent = Intent(reactContext, KalpxLiveActivityService::class.java)
        intent.action = intentAction
        return intent.apply(configure)
    }

    private fun areNotificationsEnabled(): Boolean =
        androidx.core.app.NotificationManagerCompat.from(reactContext).areNotificationsEnabled()

    private fun ReadableMap.safeInt(key: String, default: Int = 0): Int =
        if (hasKey(key) && !isNull(key)) getInt(key) else default

    private fun ReadableMap.safeString(key: String, default: String = ""): String =
        if (hasKey(key) && !isNull(key)) getString(key) ?: default else default
}
