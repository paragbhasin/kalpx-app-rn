package com.kalpx.wear.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.material.Text
import com.kalpx.wear.sync.WearConnectivityManager
import com.kalpx.wear.theme.KalpXWearTheme
import com.kalpx.wear.theme.RitualChip

private val FEELINGS = listOf(
    "Agitated" to "agitated",
    "Drained"  to "drained",
    "Steady"   to "balanced",
    "Open"     to "energized"
)

@Composable
fun CheckInScreen(onNavigateBack: () -> Unit) {
    var selected by remember { mutableStateOf<String?>(null) }
    var showQuickReset by remember { mutableStateOf(false) }
    val qr = WearConnectivityManager.pathData?.quickReset

    when {
        selected != null && showQuickReset && qr != null -> {
            QuickResetPromptScreen(
                mantra = qr,
                feeling = selected!!,
                onNavigateBack = onNavigateBack
            )
        }
        selected != null -> {
            NotedView(feeling = selected!!)
        }
        else -> {
            FeelingsList { label, pranaType ->
                selected = label
                WearConnectivityManager.sendToPhone(
                    "/kalpx/watch_message",
                    mapOf("type" to "checkin_recorded", "state" to label, "pranaType" to pranaType)
                )
                if (pranaType == "agitated" || pranaType == "drained") {
                    showQuickReset = true
                }
            }
        }
    }
}

@Composable
private fun FeelingsList(onSelect: (String, String) -> Unit) {
    ScalingLazyColumn(
        modifier = Modifier.background(KalpXWearTheme.background)
    ) {
        item {
            Text(
                "How are you?",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = KalpXWearTheme.textSecondary
            )
        }
        items(FEELINGS) { (label, pranaType) ->
            RitualChip(
                onClick = { onSelect(label, pranaType) },
                icon = "◇",
                title = label
            )
        }
    }
}

@Composable
private fun NotedView(feeling: String) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KalpXWearTheme.background),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("✓", fontSize = 28.sp, color = KalpXWearTheme.gold)
        Spacer(Modifier.height(4.dp))
        Text(feeling, fontSize = 14.sp, fontWeight = FontWeight.Medium,
            color = KalpXWearTheme.textPrimary)
        Text("Noted", fontSize = 11.sp, color = KalpXWearTheme.textTertiary)
    }
}
