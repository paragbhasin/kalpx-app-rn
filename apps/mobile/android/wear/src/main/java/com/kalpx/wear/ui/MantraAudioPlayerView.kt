package com.kalpx.wear.ui

import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Handler
import android.os.Looper
import androidx.compose.runtime.*
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.CompactChip
import androidx.wear.compose.material.Text
import com.kalpx.wear.theme.KalpXWearTheme

@Composable
fun MantraAudioPlayerView(audioUrl: String) {
    var isPlaying by remember { mutableStateOf(false) }
    var player by remember { mutableStateOf<MediaPlayer?>(null) }
    val handler = remember { Handler(Looper.getMainLooper()) }

    DisposableEffect(audioUrl) {
        onDispose {
            player?.release()
            player = null
            isPlaying = false
        }
    }

    fun toggle() {
        if (player == null) {
            val mp = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                )
                runCatching { setDataSource(audioUrl) }
                setOnPreparedListener { start(); handler.post { isPlaying = true } }
                setOnCompletionListener { seekTo(0); start() }
                prepareAsync()
            }
            player = mp
        } else if (isPlaying) {
            player?.pause()
            isPlaying = false
        } else {
            player?.start()
            isPlaying = true
        }
    }

    val accent = if (isPlaying) KalpXWearTheme.gold else KalpXWearTheme.textSecondary
    // Small pill; glyph swaps ▶ → ❚❚ when playing (Pause vector isn't in material-icons-core)
    CompactChip(
        onClick = { toggle() },
        colors = ChipDefaults.chipColors(
            backgroundColor = KalpXWearTheme.surface,
            contentColor = accent
        ),
        label = {
            Text(
                if (isPlaying) "❚❚  Pause" else "▶  Audio",
                fontSize = 10.sp,
                color = accent
            )
        }
    )
}
