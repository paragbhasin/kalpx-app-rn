package com.kalpx.wear.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Undo
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Icon
import androidx.wear.compose.material.IconButton
import androidx.wear.compose.material.IconButtonDefaults
import androidx.wear.compose.material.Text
import com.kalpx.wear.engine.WearJapaEngine
import com.kalpx.wear.sync.WearConnectivityManager
import com.kalpx.wear.theme.KalpXWearTheme

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

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KalpXWearTheme.background),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Upper area — full tap target
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .clickable { engine.increment() }
                .semantics { contentDescription = "Count one bead. ${engine.sessionCount} counted" },
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Spacer(Modifier.height(4.dp))

            Text(
                text = "${engine.sessionCount}",
                fontSize = 52.sp,
                fontWeight = FontWeight.Bold,
                color = KalpXWearTheme.textPrimary,
                textAlign = TextAlign.Center
            )

            if (engine.malaRoundsCompleted > 0) {
                Spacer(Modifier.height(2.dp))
                Text(
                    "Round ${engine.malaRoundsCompleted}",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = KalpXWearTheme.gold
                )
            }

            Spacer(Modifier.height(4.dp))
            BeadRingView(beadInRound = engine.beadInRound)
            Spacer(Modifier.height(4.dp))

            // Stats row
            val base = connectivity.pathData?.mantraStats?.get(engine.currentMantraRef)
            if (engine.sessionCount > 0 || base != null) {
                StatsRow(
                    sessionCount = engine.sessionCount,
                    todayBase = base?.todayCount ?: 0,
                    weekBase = base?.weekCount ?: 0,
                    yearBase = base?.yearCount ?: 0,
                    lifetimeBase = base?.lifetimeCount ?: 0
                )
                Spacer(Modifier.height(2.dp))
            }

            // tap hint
            if (engine.sessionCount == 0) {
                Text(
                    "tap to chant",
                    fontSize = 10.sp,
                    color = KalpXWearTheme.textTertiary
                )
            }

            Spacer(Modifier.height(4.dp))
        }

        // Audio player
        val audioUrl = engine.currentAudioUrl
        if (!audioUrl.isNullOrEmpty()) {
            MantraAudioPlayerView(audioUrl = audioUrl)
            Spacer(Modifier.height(2.dp))
        }

        // Icon controls
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(36.dp)
                .padding(horizontal = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { engine.discardSession() },
                colors = IconButtonDefaults.iconButtonColors(
                    contentColor = KalpXWearTheme.textTertiary
                )
            ) {
                Icon(Icons.Filled.Close, contentDescription = "Discard session",
                    tint = KalpXWearTheme.textTertiary)
            }

            if (engine.sessionCount > 0) {
                Row {
                    IconButton(
                        onClick = { engine.undo() },
                        enabled = engine.canUndo,
                        colors = IconButtonDefaults.iconButtonColors(
                            contentColor = KalpXWearTheme.textTertiary,
                            disabledContentColor = KalpXWearTheme.textTertiary.copy(alpha = 0.3f)
                        )
                    ) {
                        Icon(Icons.Filled.Undo, contentDescription = "Undo",
                            tint = if (engine.canUndo) KalpXWearTheme.textTertiary
                            else KalpXWearTheme.textTertiary.copy(alpha = 0.3f))
                    }
                    IconButton(
                        onClick = { showCompletion = true },
                        colors = IconButtonDefaults.iconButtonColors(
                            contentColor = KalpXWearTheme.gold
                        )
                    ) {
                        Icon(Icons.Filled.Check, contentDescription = "Complete session",
                            tint = KalpXWearTheme.gold)
                    }
                }
            }
        }
        Spacer(Modifier.height(4.dp))
    }
}

@Composable
private fun StatsRow(
    sessionCount: Int,
    todayBase: Int, weekBase: Int, yearBase: Int, lifetimeBase: Int
) {
    val today    = todayBase    + sessionCount
    val week     = weekBase     + sessionCount
    val year     = yearBase     + sessionCount
    val lifetime = lifetimeBase + sessionCount

    Row(modifier = Modifier.fillMaxWidth()) {
        StatCell("Today", today, Modifier.weight(1f))
        if (week > today)    StatCell("Week",  week,  Modifier.weight(1f))
        if (year > week)     StatCell("Year",  year,  Modifier.weight(1f))
        if (lifetime > year) StatCell("Life",  lifetime, Modifier.weight(1f))
    }
}

@Composable
private fun StatCell(label: String, count: Int, modifier: Modifier = Modifier) {
    Column(modifier = modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            formatCount(count),
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = KalpXWearTheme.textPrimary
        )
        Text(label, fontSize = 9.sp, color = KalpXWearTheme.textSecondary)
    }
}

private fun formatCount(n: Int): String = when {
    n >= 1_000_000 -> "%.1fM".format(n / 1_000_000.0)
    n >= 1_000     -> "%.1fK".format(n / 1_000.0)
    else           -> "$n"
}
