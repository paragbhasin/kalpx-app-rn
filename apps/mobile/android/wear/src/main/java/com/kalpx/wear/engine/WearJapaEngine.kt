package com.kalpx.wear.engine

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.kalpx.wear.models.CuratedMantra

object WearJapaEngine {
    private lateinit var prefs: SharedPreferences
    private lateinit var vibrator: Vibrator

    var sessionCount by mutableStateOf(0)
        private set
    var beadInRound by mutableStateOf(0)
        private set
    var malaRoundsCompleted by mutableStateOf(0)
        private set
    var isActive by mutableStateOf(false)
        private set
    var isGoalReached by mutableStateOf(false)
        private set
    var canUndo by mutableStateOf(false)
        private set
    var currentMantraRef by mutableStateOf("")
        private set
    var currentAudioUrl by mutableStateOf<String?>(null)
        private set

    private var goalType = "unlimited"
    private var goalValue: Int? = null

    // The mantra of the active session — used directly by the chant screen so it works
    // even for mantras not present in the curated picker list (e.g. Inner Path triad).
    var currentMantra by mutableStateOf(CuratedMantra.default)
        private set

    fun init(context: Context) {
        prefs = context.getSharedPreferences("kalpx_japa", Context.MODE_PRIVATE)
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
        loadPersistedSession()
    }

    fun startSession(mantra: CuratedMantra, type: String, value: Int?) {
        currentMantra = mantra
        currentMantraRef = mantra.ref
        currentAudioUrl = mantra.audioUrl
        goalType = type
        goalValue = value
        sessionCount = 0
        beadInRound = 0
        malaRoundsCompleted = 0
        isGoalReached = false
        canUndo = false
        isActive = true
        persist()
    }

    fun increment() {
        if (isGoalReached) return
        sessionCount++
        val pos = sessionCount % 27
        beadInRound = pos
        if (pos == 0 && sessionCount > 0) {
            malaRoundsCompleted = sessionCount / 27
            hapticDouble()
        } else {
            hapticSingle()
        }
        canUndo = true
        checkGoal()
        persist()
    }

    fun undo() {
        if (!canUndo || sessionCount <= 0) return
        sessionCount--
        beadInRound = sessionCount % 27
        malaRoundsCompleted = if (sessionCount > 0) sessionCount / 27 else 0
        isGoalReached = false
        canUndo = false
        persist()
    }

    fun completeSession() {
        isActive = false
        sessionCount = 0
        beadInRound = 0
        malaRoundsCompleted = 0
        isGoalReached = false
        canUndo = false
        currentMantraRef = ""
        currentAudioUrl = null
        clearPersisted()
    }

    fun discardSession() {
        isActive = false
        sessionCount = 0
        beadInRound = 0
        malaRoundsCompleted = 0
        isGoalReached = false
        canUndo = false
        clearPersisted()
    }

    private fun checkGoal() {
        if (goalType == "count") {
            val target = goalValue ?: return
            if (sessionCount >= target) isGoalReached = true
        }
    }

    private fun hapticSingle() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(28, VibrationEffect.DEFAULT_AMPLITUDE))
        }
    }

    private fun hapticDouble() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createWaveform(
                longArrayOf(0, 38, 55, 38),
                intArrayOf(0, VibrationEffect.DEFAULT_AMPLITUDE, 0, VibrationEffect.DEFAULT_AMPLITUDE),
                -1
            ))
        }
    }

    private fun persist() {
        prefs.edit()
            .putBoolean("isActive", true)
            .putInt("sessionCount", sessionCount)
            .putInt("beadInRound", beadInRound)
            .putInt("malaRoundsCompleted", malaRoundsCompleted)
            .putString("goalType", goalType)
            .putInt("goalValue", goalValue ?: -1)
            .putString("currentMantraRef", currentMantraRef)
            .putString("currentAudioUrl", currentAudioUrl)
            .apply()
    }

    private fun loadPersistedSession() {
        if (!prefs.getBoolean("isActive", false)) return
        sessionCount = prefs.getInt("sessionCount", 0)
        beadInRound = prefs.getInt("beadInRound", 0)
        malaRoundsCompleted = prefs.getInt("malaRoundsCompleted", 0)
        goalType = prefs.getString("goalType", "unlimited") ?: "unlimited"
        val gv = prefs.getInt("goalValue", -1)
        goalValue = if (gv == -1) null else gv
        currentMantraRef = prefs.getString("currentMantraRef", "") ?: ""
        currentAudioUrl = prefs.getString("currentAudioUrl", null)
        isActive = true
        canUndo = false
    }

    private fun clearPersisted() {
        prefs.edit().clear().apply()
    }
}
