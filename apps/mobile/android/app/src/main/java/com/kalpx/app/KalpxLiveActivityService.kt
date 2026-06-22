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
        const val ACTION_INCREMENT         = "com.kalpx.app.LA_INCREMENT"
        const val ACTION_START_RESET       = "com.kalpx.app.LA_START_RESET"
        const val ACTION_END_RESET         = "com.kalpx.app.LA_END_RESET"
        const val ACTION_START_RHYTHM      = "com.kalpx.app.LA_START_RHYTHM"
        const val ACTION_UPDATE_RHYTHM     = "com.kalpx.app.LA_UPDATE_RHYTHM"
        const val ACTION_END_RHYTHM        = "com.kalpx.app.LA_END_RHYTHM"
        const val ACTION_START_INNER_PATH  = "com.kalpx.app.LA_START_INNER_PATH"
        const val ACTION_UPDATE_INNER_PATH = "com.kalpx.app.LA_UPDATE_INNER_PATH"
        const val ACTION_END_INNER_PATH    = "com.kalpx.app.LA_END_INNER_PATH"

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
                    CHANNEL_CHANT, "Mantra Practice", NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Your mantra chanting session"
                    lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                    setShowBadge(false); enableLights(false); enableVibration(false)
                })
            }
            if (mgr.getNotificationChannel(CHANNEL_SANKALP) == null) {
                mgr.createNotificationChannel(NotificationChannel(
                    CHANNEL_SANKALP, "Sankalp", NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Your daily sankalp"
                    lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                    setShowBadge(false); enableLights(false); enableVibration(false)
                })
            }
            if (mgr.getNotificationChannel(CHANNEL_PRACTICE) == null) {
                mgr.createNotificationChannel(NotificationChannel(
                    CHANNEL_PRACTICE, "Daily Rhythm", NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Your daily rhythm and inner path"
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
        private const val KEY_SANKALP_DEEP_LINK = "kalpx_la_s_deeplink"
        private const val KEY_IS_COMPLETED   = "kalpx_la_completed"

        private const val TYPE_CHANT      = "chant"
        private const val TYPE_SANKALP    = "sankalp"
        private const val TYPE_RESET      = "reset"
        private const val TYPE_RHYTHM     = "rhythm"
        private const val TYPE_INNER_PATH = "inner_path"
        private const val TYPE_NONE       = "none"

        const val CHANNEL_PRACTICE = "kalpx_live_practice_v1"

        private const val KEY_RESET_MANTRA      = "kalpx_la_reset_mantra"
        private const val KEY_RESET_DEVA        = "kalpx_la_reset_deva"
        private const val KEY_RHYTHM_BAND       = "kalpx_la_rhythm_band"
        private const val KEY_RHYTHM_LABEL      = "kalpx_la_rhythm_label"
        private const val KEY_RHYTHM_ANCHOR     = "kalpx_la_rhythm_anchor"
        private const val KEY_RHYTHM_TYPE       = "kalpx_la_rhythm_type"
        private const val KEY_RHYTHM_DEVA       = "kalpx_la_rhythm_deva"
        private const val KEY_RHYTHM_DONE       = "kalpx_la_rhythm_done"
        private const val KEY_IP_DAY            = "kalpx_la_ip_day"
        private const val KEY_IP_TOTAL          = "kalpx_la_ip_total"
        private const val KEY_IP_MANTRA         = "kalpx_la_ip_mantra"
        private const val KEY_IP_MANTRA_DEVA    = "kalpx_la_ip_mantra_deva"
        private const val KEY_IP_SANKALP        = "kalpx_la_ip_sankalp"
        private const val KEY_IP_PRACTICE       = "kalpx_la_ip_practice"
        private const val KEY_IP_MANTRA_DONE    = "kalpx_la_ip_mantra_done"
        private const val KEY_IP_SANKALP_DONE   = "kalpx_la_ip_sankalp_done"
        private const val KEY_IP_PRACTICE_DONE  = "kalpx_la_ip_practice_done"
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
    // Context-aware deep link so a sankalp LA returns to where it runs
    // (inner path / rhythm / quick chant), not always quick chant.
    private var sankalpDeepLink: String = "kalpx://mitra/quick_chant/home?source=la"

    // Mirrors KalpxResetAttributes.ContentState
    private var resetMantraTitle: String = ""
    private var resetDevanagari: String  = ""

    // Mirrors KalpxRhythmAttributes.ContentState
    private var rhythmBand: String             = ""
    private var rhythmBandLabel: String        = ""
    private var rhythmAnchorTitle: String      = ""
    private var rhythmAnchorType: String       = ""
    private var rhythmAnchorDevanagari: String = ""
    private var rhythmBandDone: Boolean        = false

    // Mirrors KalpxInnerPathAttributes.ContentState
    private var innerPathDayNumber: Int           = 1
    private var innerPathTotalDays: Int           = 21
    private var innerPathMantraTitle: String      = ""
    private var innerPathMantraDevanagari: String = ""
    private var innerPathSankalpTitle: String     = ""
    private var innerPathPracticeTitle: String    = ""
    private var innerPathMantraDone: Boolean      = false
    private var innerPathSankalpDone: Boolean     = false
    private var innerPathPracticeDone: Boolean    = false

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
        // Satisfy the OS 5-second startForeground() requirement as early as possible.
        // MIUI and other aggressive battery optimizers can delay onStartCommand() delivery
        // after startForegroundService() — calling startForeground() here in onCreate()
        // ensures the foreground claim happens before any scheduler delay fires.
        // onStartCommand() then replaces this with the proper notification.
        // For END actions (started via startService, not startForegroundService), the
        // handler calls stopForeground(REMOVE) immediately, so this notification is
        // dismissed before users see it.
        startForegroundCompat(
            if (activeType != TYPE_NONE) when (activeType) {
                TYPE_CHANT      -> buildChantNotification()
                TYPE_SANKALP    -> buildSankalpNotification()
                TYPE_RESET      -> buildResetNotification()
                TYPE_RHYTHM     -> buildRhythmNotification()
                TYPE_INNER_PATH -> buildInnerPathNotification()
                else            -> buildFallbackNotification()
            } else buildFallbackNotification()
        )
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        try {
            when (intent?.action) {
                ACTION_START_CHANT    -> handleStartChant(intent)
                ACTION_UPDATE_CHANT   -> handleUpdateChant(intent)
                ACTION_COMPLETE_CHANT -> handleCompleteChant(intent)
                ACTION_END            -> handleEnd()
                ACTION_START_SANKALP  -> handleStartSankalp(intent)
                ACTION_INCREMENT         -> handleIncrement()
                ACTION_START_RESET       -> handleStartReset(intent)
                ACTION_END_RESET         -> handleEndReset()
                ACTION_START_RHYTHM      -> handleStartRhythm(intent)
                ACTION_UPDATE_RHYTHM     -> handleUpdateRhythm(intent)
                ACTION_END_RHYTHM        -> handleEndRhythm()
                ACTION_START_INNER_PATH  -> handleStartInnerPath(intent)
                ACTION_UPDATE_INNER_PATH -> handleUpdateInnerPath(intent)
                ACTION_END_INNER_PATH    -> handleEndInnerPath()
                null -> {
                    // Null action means either a system restart (shouldn't happen with
                    // START_NOT_STICKY) or a race where the previous session's ACTION_END
                    // hadn't finished when a new startForegroundService() arrived.
                    // startForeground() MUST be called before stopSelf() to satisfy the OS.
                    if (activeType != TYPE_NONE) {
                        rebuildForegroundFromState()
                    } else {
                        startForegroundCompat(buildFallbackNotification())
                        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
                        stopSelf()
                    }
                }
            }
        } catch (e: Exception) {
            // Catch-all: if anything throws before startForeground() is reached, the OS
            // will fire ForegroundServiceDidNotStartInTimeException after 5 seconds.
            // Call startForeground() with a minimal notification, then stop cleanly.
            try {
                startForegroundCompat(buildFallbackNotification())
                ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
            } catch (_: Exception) { }
            stopSelf()
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
        notifyLive(buildChantNotification())
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
        notifyLive(buildChantNotification())
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
        sankalpTitle    = intent.getStringExtra("title") ?: ""
        sankalpLine     = intent.getStringExtra("line") ?: ""
        sankalpDeepLink = intent.getStringExtra("deepLinkURL") ?: "kalpx://mitra/quick_chant/home?source=la"
        activeType      = TYPE_SANKALP

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

        notifyLive(buildChantNotification())
    }

    private fun handleStartReset(intent: Intent) {
        resetMantraTitle = intent.getStringExtra("mantraTitle") ?: ""
        resetDevanagari  = intent.getStringExtra("devanagari") ?: ""
        activeType       = TYPE_RESET
        persistState()
        startForegroundCompat(buildResetNotification())
    }

    private fun handleEndReset() {
        activeType = TYPE_NONE
        prefs.edit().putString(KEY_ACTIVE_TYPE, TYPE_NONE).apply()
        notifManager.cancel(NOTIFICATION_ID)
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun handleStartRhythm(intent: Intent) {
        rhythmBand             = intent.getStringExtra("band") ?: ""
        rhythmBandLabel        = intent.getStringExtra("bandLabel") ?: ""
        rhythmAnchorTitle      = intent.getStringExtra("anchorTitle") ?: ""
        rhythmAnchorType       = intent.getStringExtra("anchorType") ?: ""
        rhythmAnchorDevanagari = intent.getStringExtra("anchorDevanagari") ?: ""
        rhythmBandDone         = false
        activeType             = TYPE_RHYTHM
        persistState()
        startForegroundCompat(buildRhythmNotification())
    }

    private fun handleUpdateRhythm(intent: Intent) {
        if (activeType != TYPE_RHYTHM) return
        rhythmBandDone = intent.getBooleanExtra("bandDone", rhythmBandDone)
        persistState()
        notifyLive(buildRhythmNotification())
    }

    private fun handleEndRhythm() {
        activeType = TYPE_NONE
        prefs.edit().putString(KEY_ACTIVE_TYPE, TYPE_NONE).apply()
        notifManager.cancel(NOTIFICATION_ID)
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun handleStartInnerPath(intent: Intent) {
        innerPathDayNumber        = intent.getIntExtra("dayNumber", 1)
        innerPathTotalDays        = intent.getIntExtra("totalDays", 21)
        innerPathMantraTitle      = intent.getStringExtra("mantraTitle") ?: ""
        innerPathMantraDevanagari = intent.getStringExtra("mantraDevanagari") ?: ""
        innerPathSankalpTitle     = intent.getStringExtra("sankalpTitle") ?: ""
        innerPathPracticeTitle    = intent.getStringExtra("practiceTitle") ?: ""
        innerPathMantraDone       = false
        innerPathSankalpDone      = false
        innerPathPracticeDone     = false
        activeType                = TYPE_INNER_PATH
        persistState()
        startForegroundCompat(buildInnerPathNotification())
    }

    private fun handleUpdateInnerPath(intent: Intent) {
        if (activeType != TYPE_INNER_PATH) return
        innerPathMantraDone   = intent.getBooleanExtra("mantraDone", innerPathMantraDone)
        innerPathSankalpDone  = intent.getBooleanExtra("sankalpDone", innerPathSankalpDone)
        innerPathPracticeDone = intent.getBooleanExtra("practiceDone", innerPathPracticeDone)
        persistState()
        notifyLive(buildInnerPathNotification())
    }

    private fun handleEndInnerPath() {
        activeType = TYPE_NONE
        prefs.edit().putString(KEY_ACTIVE_TYPE, TYPE_NONE).apply()
        notifManager.cancel(NOTIFICATION_ID)
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    // ── Notification builders ─────────────────────────────────────────────────

    private fun buildChantNotification(): Notification {
        val malaProgress = sessionCount % 108   // 108-count mala cycle (mirrors iOS MalaRing)

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
            val statsLine = "Today $sessionCount  ·  Weekly $weekCount  ·  All time $totalCount"
            val bigText = buildString {
                if (devanagari.isNotEmpty()) {
                    append(devanagari)
                    append("\n\n")
                }
                append("Today  $sessionCount    Weekly  $weekCount    All time  $totalCount")
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
                .setStyle(
                    NotificationCompat.BigTextStyle()
                        .setBigContentTitle("ॐ  $mantraName")
                        .bigText(bigText)
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
        val contentPendingIntent = deepLinkPendingIntent(sankalpDeepLink, requestCode = 2)
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

    private fun buildResetNotification(): Notification {
        val title = if (resetMantraTitle.isNotEmpty()) resetMantraTitle else "A moment of reset"
        val bigText = buildString {
            append("Return with this mantra")
            if (resetMantraTitle.isNotEmpty()) {
                append("\n")
                append(resetMantraTitle)
            }
            if (resetDevanagari.isNotEmpty()) {
                append("\n")
                append(resetDevanagari)
            }
        }
        val contentPendingIntent = deepLinkPendingIntent("kalpx://mitra/quick_reset/home?source=la", requestCode = 3)
        return NotificationCompat.Builder(this, CHANNEL_CHANT)
            .setSmallIcon(R.drawable.ic_kalpx_notification)
            .setContentTitle("ॐ  $title")
            .setContentText("A moment of reset")
            .setSubText("Return slowly")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .setBigContentTitle("ॐ  $title")
                    .bigText(bigText)
                    .setSummaryText("A moment of reset")
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

    private fun buildRhythmNotification(): Notification {
        val title = if (rhythmBandLabel.isNotEmpty()) rhythmBandLabel else "Daily Rhythm"
        val contentText = when {
            rhythmBandDone -> "✓ Rhythm held"
            rhythmAnchorTitle.isNotEmpty() -> rhythmAnchorTitle
            else -> "Your daily rhythm is active"
        }
        val bigText = buildString {
            if (rhythmBandDone) {
                append("✓ Rhythm held for ${rhythmBandLabel.lowercase()}")
            } else {
                if (rhythmAnchorType.isNotEmpty()) {
                    append(rhythmAnchorType.uppercase())
                    append("\n")
                }
                if (rhythmAnchorTitle.isNotEmpty()) {
                    append(rhythmAnchorTitle)
                }
                if (rhythmAnchorDevanagari.isNotEmpty()) {
                    append("\n")
                    append(rhythmAnchorDevanagari)
                }
            }
        }
        val contentPendingIntent = deepLinkPendingIntent("kalpx://mitra/rhythm_home/morning?source=la", requestCode = 4)
        return NotificationCompat.Builder(this, CHANNEL_PRACTICE)
            .setSmallIcon(R.drawable.ic_kalpx_notification)
            .setContentTitle("◈  $title")
            .setContentText(contentText)
            .setSubText("Daily Rhythm")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .setBigContentTitle("◈  $title")
                    .bigText(bigText)
                    .setSummaryText("Daily Rhythm")
            )
            .setContentIntent(contentPendingIntent)
            .setOngoing(!rhythmBandDone)
            .setAutoCancel(rhythmBandDone)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .setColor(Color.parseColor("#EAB578"))
            .setColorized(true)
            .build()
    }

    private fun buildInnerPathNotification(): Notification {
        val dayLabel = "Day $innerPathDayNumber · $innerPathTotalDays"
        val allDone = innerPathMantraDone && innerPathSankalpDone && innerPathPracticeDone
        val contentText = when {
            allDone -> "✓ All three held today"
            innerPathMantraTitle.isNotEmpty() -> innerPathMantraTitle
            else -> "Inner Path active"
        }
        val bigText = buildString {
            if (innerPathMantraTitle.isNotEmpty()) {
                append(if (innerPathMantraDone) "✓" else "·")
                append(" MANTRA  ")
                append(innerPathMantraTitle)
                if (innerPathMantraDevanagari.isNotEmpty() && !innerPathMantraDone) {
                    append("\n   ")
                    append(innerPathMantraDevanagari)
                }
            }
            if (innerPathSankalpTitle.isNotEmpty()) {
                append("\n")
                append(if (innerPathSankalpDone) "✓" else "·")
                append(" SANKALP  ")
                append(innerPathSankalpTitle)
            }
            if (innerPathPracticeTitle.isNotEmpty()) {
                append("\n")
                append(if (innerPathPracticeDone) "✓" else "·")
                append(" PRACTICE  ")
                append(innerPathPracticeTitle)
            }
        }
        val contentPendingIntent = deepLinkPendingIntent("kalpx://mitra/inner_path/home?source=la", requestCode = 5)
        return NotificationCompat.Builder(this, CHANNEL_PRACTICE)
            .setSmallIcon(R.drawable.ic_kalpx_notification)
            .setContentTitle("✦  Inner Path  ·  $dayLabel")
            .setContentText(contentText)
            .setSubText("Inner Path")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .setBigContentTitle("✦  Inner Path  ·  $dayLabel")
                    .bigText(bigText)
                    .setSummaryText("Inner Path")
            )
            .setContentIntent(contentPendingIntent)
            .setOngoing(!allDone)
            .setAutoCancel(allDone)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .setColor(Color.parseColor("#EAB578"))
            .setColorized(true)
            .build()
    }

    private fun buildFallbackNotification(): Notification =
        NotificationCompat.Builder(this, CHANNEL_CHANT)
            .setSmallIcon(R.drawable.ic_kalpx_notification)
            .setContentTitle("Kalpx")
            .setOngoing(false)
            .build()

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
            "Mantra Practice",
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = "Your mantra chanting session"
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
            description = "Your daily sankalp"
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            setShowBadge(false)
            enableLights(false)
            enableVibration(false)
        })

        mgr.createNotificationChannel(NotificationChannel(
            CHANNEL_PRACTICE,
            "Daily Rhythm",
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = "Your daily rhythm and inner path"
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
            putString(KEY_SANKALP_DEEP_LINK, sankalpDeepLink)
            putBoolean(KEY_IS_COMPLETED, isCompleted)
            putString(KEY_RESET_MANTRA, resetMantraTitle)
            putString(KEY_RESET_DEVA, resetDevanagari)
            putString(KEY_RHYTHM_BAND, rhythmBand)
            putString(KEY_RHYTHM_LABEL, rhythmBandLabel)
            putString(KEY_RHYTHM_ANCHOR, rhythmAnchorTitle)
            putString(KEY_RHYTHM_TYPE, rhythmAnchorType)
            putString(KEY_RHYTHM_DEVA, rhythmAnchorDevanagari)
            putBoolean(KEY_RHYTHM_DONE, rhythmBandDone)
            putInt(KEY_IP_DAY, innerPathDayNumber)
            putInt(KEY_IP_TOTAL, innerPathTotalDays)
            putString(KEY_IP_MANTRA, innerPathMantraTitle)
            putString(KEY_IP_MANTRA_DEVA, innerPathMantraDevanagari)
            putString(KEY_IP_SANKALP, innerPathSankalpTitle)
            putString(KEY_IP_PRACTICE, innerPathPracticeTitle)
            putBoolean(KEY_IP_MANTRA_DONE, innerPathMantraDone)
            putBoolean(KEY_IP_SANKALP_DONE, innerPathSankalpDone)
            putBoolean(KEY_IP_PRACTICE_DONE, innerPathPracticeDone)
        }
    }

    private fun restoreFromPrefs() {
        activeType                = prefs.getString(KEY_ACTIVE_TYPE, TYPE_NONE) ?: TYPE_NONE
        mantraName                = prefs.getString(KEY_MANTRA_NAME, "") ?: ""
        devanagari                = prefs.getString(KEY_DEVANAGARI, "") ?: ""
        sessionCount              = prefs.getInt(KEY_SESSION, 0)
        weekCount                 = prefs.getInt(KEY_WEEK, 0)
        totalCount                = prefs.getInt(KEY_TOTAL, 0)
        elapsedSeconds            = prefs.getInt(KEY_ELAPSED, 0)
        deepLinkURL               = prefs.getString(KEY_DEEP_LINK, "kalpx://mitra/quick_chant/home") ?: "kalpx://mitra/quick_chant/home"
        sankalpTitle              = prefs.getString(KEY_SANKALP_TITLE, "") ?: ""
        sankalpLine               = prefs.getString(KEY_SANKALP_LINE, "") ?: ""
        sankalpDeepLink           = prefs.getString(KEY_SANKALP_DEEP_LINK, "kalpx://mitra/quick_chant/home?source=la") ?: "kalpx://mitra/quick_chant/home?source=la"
        isCompleted               = prefs.getBoolean(KEY_IS_COMPLETED, false)
        resetMantraTitle          = prefs.getString(KEY_RESET_MANTRA, "") ?: ""
        resetDevanagari           = prefs.getString(KEY_RESET_DEVA, "") ?: ""
        rhythmBand                = prefs.getString(KEY_RHYTHM_BAND, "") ?: ""
        rhythmBandLabel           = prefs.getString(KEY_RHYTHM_LABEL, "") ?: ""
        rhythmAnchorTitle         = prefs.getString(KEY_RHYTHM_ANCHOR, "") ?: ""
        rhythmAnchorType          = prefs.getString(KEY_RHYTHM_TYPE, "") ?: ""
        rhythmAnchorDevanagari    = prefs.getString(KEY_RHYTHM_DEVA, "") ?: ""
        rhythmBandDone            = prefs.getBoolean(KEY_RHYTHM_DONE, false)
        innerPathDayNumber        = prefs.getInt(KEY_IP_DAY, 1)
        innerPathTotalDays        = prefs.getInt(KEY_IP_TOTAL, 21)
        innerPathMantraTitle      = prefs.getString(KEY_IP_MANTRA, "") ?: ""
        innerPathMantraDevanagari = prefs.getString(KEY_IP_MANTRA_DEVA, "") ?: ""
        innerPathSankalpTitle     = prefs.getString(KEY_IP_SANKALP, "") ?: ""
        innerPathPracticeTitle    = prefs.getString(KEY_IP_PRACTICE, "") ?: ""
        innerPathMantraDone       = prefs.getBoolean(KEY_IP_MANTRA_DONE, false)
        innerPathSankalpDone      = prefs.getBoolean(KEY_IP_SANKALP_DONE, false)
        innerPathPracticeDone     = prefs.getBoolean(KEY_IP_PRACTICE_DONE, false)
    }

    private fun rebuildForegroundFromState() {
        when (activeType) {
            TYPE_CHANT      -> startForegroundCompat(buildChantNotification())
            TYPE_SANKALP    -> startForegroundCompat(buildSankalpNotification())
            TYPE_RESET      -> startForegroundCompat(buildResetNotification())
            TYPE_RHYTHM     -> startForegroundCompat(buildRhythmNotification())
            TYPE_INNER_PATH -> startForegroundCompat(buildInnerPathNotification())
            else            -> stopSelf()
        }
    }

    // On API 29+ (Android 10+) startForeground MUST include the service type that
    // matches foregroundServiceType in the manifest. On API 34 (Android 14) omitting
    // it throws InvalidForegroundServiceTypeException and the service fails silently.
    // applyLiveUpdateBehavior() is called here so every startForeground path gets
    // the Android 16 rich lock-screen card automatically.
    private fun startForegroundCompat(notification: Notification) {
        applyLiveUpdateBehavior(notification)
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

    // Wraps notifManager.notify() so update paths also get the API 36 Live Update
    // behavior without each call site having to remember to apply it.
    private fun notifyLive(notification: Notification) {
        applyLiveUpdateBehavior(notification)
        notifManager.notify(NOTIFICATION_ID, notification)
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
