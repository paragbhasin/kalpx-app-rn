package com.kalpx.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.ServiceInfo
import android.graphics.Color
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat

/**
 * KalpxLiveActivityService — Android equivalent of ActivityKit (iOS).
 *
 * iOS mapping:
 *   Activity<KalpxChantAttributes>.request(...)   → ACTION_START_CHANT  → startForeground()
 *   activity.update(newState)                      → ACTION_UPDATE_CHANT → notify()
 *   completeChantActivity(...)                     → ACTION_COMPLETE_CHANT
 *   activity.end(.immediate)                       → ACTION_END          → stopForeground() + stopSelf()
 *   Activity<KalpxSankalpAttributes>.request(...)  → ACTION_START_SANKALP → startForeground()
 *   IncrementChantIntent.perform()                 → ACTION_INCREMENT
 *
 * State machine:
 *   IDLE  ──START_CHANT──►  CHANTING ──COMPLETE──► COMPLETING ──END──► IDLE
 *         ──START_SANKALP─► SANKALP  ──────────────────────────END──► IDLE
 *   CHANTING ──END──────────────────────────────────────────────────► IDLE
 *
 * One notification ID is used for both activity types. startForeground() with the
 * same ID updates in-place, matching iOS's "Quick Chant takes Dynamic Island priority"
 * by simply replacing whatever was showing.
 *
 * Battery: no WakeLock, no polling timer. All updates are reactive to Intents sent
 * from JS tap events (same as iOS — ActivityKit updates are also tap-driven).
 */
class KalpxLiveActivityService : Service() {

    companion object {
        const val ACTION_START_CHANT    = "com.kalpx.app.LA_START_CHANT"
        const val ACTION_UPDATE_CHANT   = "com.kalpx.app.LA_UPDATE_CHANT"
        const val ACTION_COMPLETE_CHANT = "com.kalpx.app.LA_COMPLETE_CHANT"
        const val ACTION_END            = "com.kalpx.app.LA_END"
        const val ACTION_START_SANKALP  = "com.kalpx.app.LA_START_SANKALP"
        const val ACTION_INCREMENT      = "com.kalpx.app.LA_INCREMENT"

        const val NOTIFICATION_ID = 1001

        // Called from MainApplication.onCreate() so channels exist before the service
        // is ever started — avoids areNotificationsEnabled() returning false on first run.
        fun ensureChannels(context: android.content.Context) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
            val mgr = context.getSystemService(NotificationManager::class.java) ?: return
            mgr.deleteNotificationChannel("kalpx_live_chant")
            mgr.deleteNotificationChannel("kalpx_live_sankalp")
            mgr.deleteNotificationChannel("kalpx_live_chant_v2")
            mgr.deleteNotificationChannel("kalpx_live_sankalp_v2")
            if (mgr.getNotificationChannel(CHANNEL_CHANT) == null) {
                mgr.createNotificationChannel(NotificationChannel(
                    CHANNEL_CHANT, "Chanting Session", NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Shows your active mantra chanting session"
                    lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                    setShowBadge(false); enableLights(false); enableVibration(false)
                })
            }
            if (mgr.getNotificationChannel(CHANNEL_SANKALP) == null) {
                mgr.createNotificationChannel(NotificationChannel(
                    CHANNEL_SANKALP, "Sankalp", NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Shows your active Sankalp commitment"
                    lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                    setShowBadge(false); enableLights(false); enableVibration(false)
                })
            }
        }
        // v3: removed setSound(null,null) — setting null sound causes Android/MIUI to classify
        // the channel as "Silent" in the UI, which shows only a dot on the lock screen.
        // IMPORTANCE_DEFAULT without explicit null sound = "Default" channel = full lock screen card.
        // setOnlyAlertOnce(true) on the notification ensures only the first appearance makes sound.
        const val CHANNEL_CHANT   = "kalpx_live_chant_v3"
        const val CHANNEL_SANKALP = "kalpx_live_sankalp_v3"

        const val PREFS_NAME  = "kalpx_live_activity_prefs"
        const val KEY_PENDING = "kalpx_pending_chant_increments"

        // Persisted state keys — used for process recreation recovery
        private const val KEY_ACTIVE_TYPE    = "kalpx_la_type"
        private const val KEY_MANTRA_NAME    = "kalpx_la_mantra"
        private const val KEY_DEVANAGARI     = "kalpx_la_deva"
        private const val KEY_SESSION        = "kalpx_la_session"
        private const val KEY_WEEK           = "kalpx_la_week"
        private const val KEY_TOTAL          = "kalpx_la_total"
        private const val KEY_ELAPSED        = "kalpx_la_elapsed"
        private const val KEY_DEEP_LINK      = "kalpx_la_deeplink"
        private const val KEY_SANKALP_TITLE  = "kalpx_la_s_title"
        private const val KEY_SANKALP_LINE   = "kalpx_la_s_line"
        private const val KEY_IS_COMPLETED   = "kalpx_la_completed"

        private const val TYPE_CHANT   = "chant"
        private const val TYPE_SANKALP = "sankalp"
        private const val TYPE_NONE    = "none"
    }

    // ── In-memory state (mirrors KalpxChantAttributes ContentState on iOS) ────

    private var activeType: String  = TYPE_NONE
    private var mantraName: String  = ""
    private var devanagari: String  = ""
    private var sessionCount: Int   = 0
    private var weekCount: Int      = 0
    private var totalCount: Int     = 0
    private var elapsedSeconds: Int = 0
    private var isCompleted: Boolean = false
    private var deepLinkURL: String = "kalpx://mitra/quick_chant/home"

    // Mirrors KalpxSankalpAttributes
    private var sankalpTitle: String = ""
    private var sankalpLine: String  = ""

    private val notifManager by lazy {
        getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    }

    private val prefs: SharedPreferences by lazy {
        getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
        restoreFromPrefs()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_CHANT    -> handleStartChant(intent)
            ACTION_UPDATE_CHANT   -> handleUpdateChant(intent)
            ACTION_COMPLETE_CHANT -> handleCompleteChant(intent)
            ACTION_END            -> handleEnd()
            ACTION_START_SANKALP  -> handleStartSankalp(intent)
            ACTION_INCREMENT      -> handleIncrement()
            null -> {
                // System restarted the service after kill (shouldn't happen with START_NOT_STICKY,
                // but guard against it for safety).
                if (activeType != TYPE_NONE) {
                    rebuildForegroundFromState()
                } else {
                    stopSelf()
                }
            }
        }
        // NOT_STICKY: don't auto-restart on kill. A chanting session cannot resume
        // without the app, matching iOS behavior where ActivityKit eventually dismisses.
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    // ── Action handlers ───────────────────────────────────────────────────────

    private fun handleStartChant(intent: Intent) {
        mantraName    = intent.getStringExtra("mantraName") ?: ""
        devanagari    = intent.getStringExtra("devanagari") ?: ""
        sessionCount  = intent.getIntExtra("sessionCount", 0)
        weekCount     = intent.getIntExtra("weekCount", 0)
        totalCount    = intent.getIntExtra("totalCount", 0)
        elapsedSeconds = intent.getIntExtra("elapsedSeconds", 0)
        deepLinkURL   = intent.getStringExtra("deepLinkURL") ?: "kalpx://mitra/quick_chant/home"
        isCompleted   = false
        activeType    = TYPE_CHANT

        persistState()
        // startForeground replaces any existing foreground notification (Sankalp) in-place.
        // Mirrors iOS: startActivity ends Sankalp first, Quick Chant takes Dynamic Island priority.
        startForegroundCompat(buildChantNotification())
    }

    private fun handleUpdateChant(intent: Intent) {
        if (activeType != TYPE_CHANT) return
        sessionCount   = intent.getIntExtra("sessionCount", sessionCount)
        weekCount      = intent.getIntExtra("weekCount", weekCount)
        totalCount     = intent.getIntExtra("totalCount", totalCount)
        elapsedSeconds = intent.getIntExtra("elapsedSeconds", elapsedSeconds)
        isCompleted    = false

        persistState()
        notifManager.notify(NOTIFICATION_ID, buildChantNotification())
    }

    private fun handleCompleteChant(intent: Intent) {
        if (activeType != TYPE_CHANT) return
        sessionCount   = intent.getIntExtra("finalCount", sessionCount)
        elapsedSeconds = intent.getIntExtra("elapsedSeconds", elapsedSeconds)
        isCompleted    = true

        persistState()

        // Detach from foreground so the completion notification is dismissible.
        // The service stays alive; JS will call ACTION_END after ~5 seconds.
        // Mirrors iOS: isCompleted=true shows "Practice complete ✓", dismissed on .end(.immediate).
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_DETACH)
        notifManager.notify(NOTIFICATION_ID, buildChantNotification())
    }

    private fun handleEnd() {
        activeType  = TYPE_NONE
        isCompleted = false
        prefs.edit().putString(KEY_ACTIVE_TYPE, TYPE_NONE).apply()

        notifManager.cancel(NOTIFICATION_ID)
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun handleStartSankalp(intent: Intent) {
        sankalpTitle = intent.getStringExtra("title") ?: ""
        sankalpLine  = intent.getStringExtra("line") ?: ""
        activeType   = TYPE_SANKALP

        persistState()
        // startForeground replaces any existing foreground notification in-place.
        startForegroundCompat(buildSankalpNotification())
    }

    private fun handleIncrement() {
        if (activeType != TYPE_CHANT) return
        // Mirrors IncrementChantIntent.perform() on iOS:
        //   state.sessionCount += 1; state.weekCount += 1; state.totalCount += 1
        //   UserDefaults[kPendingKey] += 1
        sessionCount += 1
        weekCount    += 1
        totalCount   += 1

        val pending = prefs.getInt(KEY_PENDING, 0)
        prefs.edit()
            .putInt(KEY_PENDING, pending + 1)
            .also { persistStateInto(it) }
            .apply()

        notifManager.notify(NOTIFICATION_ID, buildChantNotification())
    }

    // ── Notification builders ─────────────────────────────────────────────────

    private fun buildChantNotification(): Notification {
        val malaProgress = sessionCount % 108   // 108-count mala cycle (mirrors iOS MalaRing)
        val elapsed = formatElapsed(elapsedSeconds)

        val contentPendingIntent = deepLinkPendingIntent(deepLinkURL, requestCode = 0)

        return if (isCompleted) {
            // ── Completion state ── mirrors iOS "✦ Practice offered" lock screen view
            NotificationCompat.Builder(this, CHANNEL_CHANT)
                .setSmallIcon(R.drawable.ic_kalpx_notification)
                .setContentTitle("✦ Practice offered")
                .setContentText("$mantraName  ·  $sessionCount chants")
                .setStyle(
                    NotificationCompat.BigTextStyle()
                        .setBigContentTitle("✦ Practice offered")
                        .bigText(buildString {
                            append(mantraName)
                            if (devanagari.isNotEmpty()) {
                                append("\n")
                                append(devanagari)
                            }
                            append("\n$sessionCount chants")
                        })
                )
                .setContentIntent(contentPendingIntent)
                .setOngoing(false)
                .setAutoCancel(true)
                .setOnlyAlertOnce(true)
                .setCategory(NotificationCompat.CATEGORY_STATUS)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setColor(Color.parseColor("#EAB578"))
                .setColorized(true)
                .build()

        } else {
            // ── Active chanting state ── mirrors iOS lock screen: mantra + mala ring + stats
            // compact view (lock screen pill): title + statsLine
            // expanded view (shade): devanagari + stats + elapsed + ॐ Chant button
            val statsLine = "Today $sessionCount  ·  Weekly $weekCount  ·  Lifetime $totalCount"
            val bigText = buildString {
                if (devanagari.isNotEmpty()) {
                    append(devanagari)
                    append("\n\n")
                }
                append("Today  $sessionCount    Weekly  $weekCount    Lifetime  $totalCount")
                append("\n")
                append(elapsed)
                append(" elapsed")
            }

            // Tap-to-chant action — mirrors IncrementChantIntent (enabled on Android, unlike iOS
            // where it is commented out pending AppIntents registration fix).
            val incrementIntent = Intent(this, ChantIncrementReceiver::class.java)
                .apply { action = ACTION_INCREMENT }
            val incrementPendingIntent = PendingIntent.getBroadcast(
                this, 1, incrementIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            val tapAction = NotificationCompat.Action.Builder(
                R.drawable.ic_kalpx_notification,
                "ॐ  Chant",
                incrementPendingIntent
            ).build()

            NotificationCompat.Builder(this, CHANNEL_CHANT)
                .setSmallIcon(R.drawable.ic_kalpx_notification)
                .setContentTitle("ॐ  $mantraName")
                // compact/lock-screen pill shows contentText — use stats not devanagari so it
                // reads as live data ("Today 5 · Weekly 5 · Lifetime 70") rather than truncated script
                .setContentText(statsLine)
                .setSubText(elapsed)
                .setStyle(
                    NotificationCompat.BigTextStyle()
                        .setBigContentTitle("ॐ  $mantraName")
                        .bigText(bigText)
                        .setSummaryText(elapsed)
                )
                // Mala ring progress: 108 beads per cycle, mirrors iOS MalaRing (total = 108)
                .setProgress(108, malaProgress, false)
                .addAction(tapAction)
                .setContentIntent(contentPendingIntent)
                .setOngoing(true)
                .setAutoCancel(false)
                .setOnlyAlertOnce(true)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
                .setColor(Color.parseColor("#EAB578"))
                .setColorized(true)
                .build()
        }
    }

    private fun buildSankalpNotification(): Notification {
        // Mirrors KalpxSankalpLiveActivity.swift lock screen view:
        //   ◈  A sankalp for today   ← subText (label)
        //      {sankalpTitle}         ← title (main, bold)
        //   │  {sankalpLine}          ← bigText intention line
        val contentPendingIntent = deepLinkPendingIntent(deepLinkURL, requestCode = 2)
        val bigText = buildString {
            if (sankalpLine.isNotEmpty()) {
                append("│  ")
                append(sankalpLine)
            }
        }

        return NotificationCompat.Builder(this, CHANNEL_SANKALP)
            .setSmallIcon(R.drawable.ic_kalpx_notification)
            .setContentTitle("◈  $sankalpTitle")
            .setContentText(if (sankalpLine.isNotEmpty()) sankalpLine else "A sankalp for today")
            .setSubText("A sankalp for today")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .setBigContentTitle("◈  $sankalpTitle")
                    .bigText(bigText)
                    .setSummaryText("A sankalp for today")
            )
            .setContentIntent(contentPendingIntent)
            .setOngoing(true)
            .setAutoCancel(false)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .setColor(Color.parseColor("#EAB578"))
            .setColorized(true)
            .build()
    }

    // ── Android 16 Live Updates ───────────────────────────────────────────────
    // Android 16 (API 36) promotes ongoing foreground service notifications to a
    // richer lock-screen card via Notification.setLiveUpdateBehavior(LIVE).
    // We use reflection so this compiles at compileSdk 35 without a version bump.
    // When compileSdk is updated to 36, replace this with a direct API call:
    //   notification.setLiveUpdateBehavior(Notification.LiveUpdateBehavior.LIVE)

    @Suppress("SwallowedException")
    private fun applyLiveUpdateBehavior(notification: Notification) {
        if (Build.VERSION.SDK_INT >= 36) {
            try {
                val method = notification.javaClass.getMethod("setLiveUpdateBehavior", Int::class.java)
                method.invoke(notification, 1 /* LIVE_UPDATE_BEHAVIOR_LIVE */)
            } catch (_: Exception) {
                // API not yet finalized in the running SDK — safe to skip
            }
        }
    }

    // ── Notification channels ─────────────────────────────────────────────────

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val mgr = getSystemService(NotificationManager::class.java)

        // Remove stale v1 + v2 channels.
        mgr.deleteNotificationChannel("kalpx_live_chant")
        mgr.deleteNotificationChannel("kalpx_live_sankalp")
        mgr.deleteNotificationChannel("kalpx_live_chant_v2")
        mgr.deleteNotificationChannel("kalpx_live_sankalp_v2")

        // IMPORTANCE_DEFAULT without setSound(null,null): Android/MIUI classifies this as
        // "Default" in the UI → shows as a full card on the lock screen, not just a dot.
        // setOnlyAlertOnce(true) on the notification means only the very first appearance
        // makes a sound; all subsequent bead-tap updates are completely silent.
        mgr.createNotificationChannel(NotificationChannel(
            CHANNEL_CHANT,
            "Chanting Session",
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = "Shows your active mantra chanting session"
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            setShowBadge(false)
            enableLights(false)
            enableVibration(false)
        })

        mgr.createNotificationChannel(NotificationChannel(
            CHANNEL_SANKALP,
            "Sankalp",
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = "Shows your active Sankalp commitment"
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            setShowBadge(false)
            enableLights(false)
            enableVibration(false)
        })
    }

    // ── State persistence ─────────────────────────────────────────────────────
    // Persists current activity state so the notification can be rebuilt if the
    // process is recreated (e.g., config change, low-memory kill + restore).
    // Note: does NOT persist across a user force-kill (matches iOS behavior).

    private fun persistState() {
        prefs.edit().also { persistStateInto(it) }.apply()
    }

    private fun persistStateInto(editor: SharedPreferences.Editor) {
        editor.apply {
            putString(KEY_ACTIVE_TYPE, activeType)
            putString(KEY_MANTRA_NAME, mantraName)
            putString(KEY_DEVANAGARI, devanagari)
            putInt(KEY_SESSION, sessionCount)
            putInt(KEY_WEEK, weekCount)
            putInt(KEY_TOTAL, totalCount)
            putInt(KEY_ELAPSED, elapsedSeconds)
            putString(KEY_DEEP_LINK, deepLinkURL)
            putString(KEY_SANKALP_TITLE, sankalpTitle)
            putString(KEY_SANKALP_LINE, sankalpLine)
            putBoolean(KEY_IS_COMPLETED, isCompleted)
        }
    }

    private fun restoreFromPrefs() {
        activeType     = prefs.getString(KEY_ACTIVE_TYPE, TYPE_NONE) ?: TYPE_NONE
        mantraName     = prefs.getString(KEY_MANTRA_NAME, "") ?: ""
        devanagari     = prefs.getString(KEY_DEVANAGARI, "") ?: ""
        sessionCount   = prefs.getInt(KEY_SESSION, 0)
        weekCount      = prefs.getInt(KEY_WEEK, 0)
        totalCount     = prefs.getInt(KEY_TOTAL, 0)
        elapsedSeconds = prefs.getInt(KEY_ELAPSED, 0)
        deepLinkURL    = prefs.getString(KEY_DEEP_LINK, "kalpx://mitra/quick_chant/home") ?: "kalpx://mitra/quick_chant/home"
        sankalpTitle   = prefs.getString(KEY_SANKALP_TITLE, "") ?: ""
        sankalpLine    = prefs.getString(KEY_SANKALP_LINE, "") ?: ""
        isCompleted    = prefs.getBoolean(KEY_IS_COMPLETED, false)
    }

    private fun rebuildForegroundFromState() {
        when (activeType) {
            TYPE_CHANT   -> startForegroundCompat(buildChantNotification())
            TYPE_SANKALP -> startForegroundCompat(buildSankalpNotification())
            else         -> stopSelf()
        }
    }

    // On API 29+ (Android 10+) startForeground MUST include the service type that
    // matches foregroundServiceType in the manifest. On API 34 (Android 14) omitting
    // it throws InvalidForegroundServiceTypeException and the service fails silently.
    private fun startForegroundCompat(notification: Notification) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    // Mirrors iOS elapsedString(_:) helper in KalpxQuickChantLiveActivity.swift
    private fun formatElapsed(seconds: Int): String {
        val m = seconds / 60
        val s = seconds % 60
        return if (m > 0) "${m}m ${s}s" else "${s}s"
    }

    private fun deepLinkPendingIntent(url: String, requestCode: Int): PendingIntent {
        val intent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
            data = android.net.Uri.parse(url)
        } ?: Intent()
        return PendingIntent.getActivity(
            this, requestCode, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
}
