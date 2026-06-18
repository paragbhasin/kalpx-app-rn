package com.kalpx.wear.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.input.rotary.onRotaryScrollEvent
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Text
import com.kalpx.wear.engine.WearJapaEngine
import com.kalpx.wear.models.WatchMantraStats
import com.kalpx.wear.sync.WearConnectivityManager
import com.kalpx.wear.theme.KalpXWearTheme
import kotlinx.coroutines.launch

@Composable
fun QuickChantScreen() {
    val engine = WearJapaEngine
    val connectivity = WearConnectivityManager
    var showCompletion by remember { mutableStateOf(false) }

    LaunchedEffect(engine.isGoalReached) {
        if (engine.isGoalReached) showCompletion = true
    }

    if (showCompletion) {
        CompletionScreen(
            count = engine.sessionCount,
            onContinue = { showCompletion = false },
            onDone = { engine.completeSession(); showCompletion = false }
        )
        return
    }

    val currentMantra = connectivity.mantras?.firstOrNull { it.ref == engine.currentMantraRef }
    val scrollState = rememberScrollState()
    val focusRequester = remember { FocusRequester() }
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(Unit) { focusRequester.requestFocus() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KalpXWearTheme.background)
            // Top inset so the ॐ header clears the round bezel
            .padding(top = 22.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // ── Compact header: X | ॐ + count | ✓ ──────────────────────────────
        CompactChantHeader(
            sessionCount = engine.sessionCount,
            malaRoundsCompleted = engine.malaRoundsCompleted,
            onIncrement = { engine.increment() },
            onDiscard = { engine.discardSession() },
            onComplete = { showCompletion = true }
        )

        // Gap between the count and the bead ring
        Spacer(Modifier.height(10.dp))

        // ── Bead ring ────────────────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp)
                .height(26.dp)
                .clickable { engine.increment() }
        ) {
            BeadRingView(beadInRound = engine.beadInRound)
        }

        Spacer(Modifier.height(2.dp))

        // ── Scrollable: mantra name + devanagari + divider + stats ───────────
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .onRotaryScrollEvent { event ->
                    coroutineScope.launch {
                        scrollState.scrollTo(
                            (scrollState.value + event.verticalScrollPixels)
                                .toInt().coerceIn(0, scrollState.maxValue)
                        )
                    }
                    true
                }
                .focusRequester(focusRequester)
                .focusable()
                .verticalScroll(scrollState)
                .clickable { engine.increment() }
                .padding(horizontal = 14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            currentMantra?.let { mantra ->
                Spacer(Modifier.height(5.dp))
                Text(
                    text = mantra.name,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = KalpXWearTheme.gold,
                    textAlign = TextAlign.Center,
                    maxLines = 2
                )
                if (mantra.devanagari.isNotEmpty()) {
                    Spacer(Modifier.height(3.dp))
                    Text(
                        text = mantra.devanagari,
                        fontSize = 10.sp,
                        color = KalpXWearTheme.textTertiary,
                        textAlign = TextAlign.Center,
                        maxLines = 2
                    )
                }
                Spacer(Modifier.height(6.dp))
            }

            // Divider
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(0.5.dp)
                    .background(KalpXWearTheme.textTertiary.copy(alpha = 0.25f))
            )

            // Stats: Weekly | Yearly | Lifetime
            ChantStatsRow(
                sessionCount = engine.sessionCount,
                stats = connectivity.pathData?.mantraStats?.get(engine.currentMantraRef)
            )
            Spacer(Modifier.height(4.dp))
        }

        // ── Audio player (optional) ──────────────────────────────────────────
        val audioUrl = engine.currentAudioUrl
        if (!audioUrl.isNullOrEmpty()) {
            MantraAudioPlayerView(audioUrl = audioUrl)
            Spacer(Modifier.height(4.dp))
        }
    }
}

// ── Compact header ─────────────────────────────────────────────────────────────

@Composable
private fun CompactChantHeader(
    sessionCount: Int,
    malaRoundsCompleted: Int,
    onIncrement: () -> Unit,
    onDiscard: () -> Unit,
    onComplete: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(44.dp)
            .clickable { onIncrement() }
            // Pull ✕/✓ inward so the round bezel doesn't clip them
            .padding(horizontal = 30.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .clickable { onDiscard() },
            contentAlignment = Alignment.Center
        ) {
            Text("✕", fontSize = 18.sp, color = KalpXWearTheme.textSecondary)
        }

        Spacer(Modifier.weight(1f))

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("ॐ", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = KalpXWearTheme.gold)
            Text(
                text = "$sessionCount",
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                color = KalpXWearTheme.textPrimary
            )
            if (malaRoundsCompleted > 0) {
                Text(
                    text = "Round $malaRoundsCompleted",
                    fontSize = 8.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = KalpXWearTheme.gold
                )
            }
        }

        Spacer(Modifier.weight(1f))

        Box(
            modifier = Modifier.size(32.dp),
            contentAlignment = Alignment.Center
        ) {
            if (sessionCount > 0) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clickable { onComplete() },
                    contentAlignment = Alignment.Center
                ) {
                    Text("✓", fontSize = 18.sp, color = KalpXWearTheme.gold)
                }
            }
        }
    }
}

// ── Stats row: Weekly | Yearly | Lifetime ──────────────────────────────────────

@Composable
private fun ChantStatsRow(sessionCount: Int, stats: WatchMantraStats?) {
    val weekly   = (stats?.weekCount     ?: 0) + sessionCount
    val yearly   = (stats?.yearCount     ?: 0) + sessionCount
    val lifetime = (stats?.lifetimeCount ?: 0) + sessionCount

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(36.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        ChantStatCell(label = "Weekly",   count = weekly,   modifier = Modifier.weight(1f))
        Box(
            modifier = Modifier
                .width(0.5.dp)
                .height(18.dp)
                .background(KalpXWearTheme.textTertiary.copy(alpha = 0.30f))
        )
        ChantStatCell(label = "Yearly",   count = yearly,   modifier = Modifier.weight(1f))
        Box(
            modifier = Modifier
                .width(0.5.dp)
                .height(18.dp)
                .background(KalpXWearTheme.textTertiary.copy(alpha = 0.30f))
        )
        ChantStatCell(label = "Lifetime", count = lifetime, modifier = Modifier.weight(1f))
    }
}

@Composable
private fun ChantStatCell(label: String, count: Int, modifier: Modifier = Modifier) {
    Column(modifier = modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = formatCount(count),
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = KalpXWearTheme.textPrimary
        )
        Text(text = label, fontSize = 8.sp, color = KalpXWearTheme.textTertiary)
    }
}

private fun formatCount(n: Int): String = when {
    n >= 1_000_000 -> "%.1fM".format(n / 1_000_000.0)
    n >= 1_000     -> "%.1fK".format(n / 1_000.0)
    else           -> "$n"
}
