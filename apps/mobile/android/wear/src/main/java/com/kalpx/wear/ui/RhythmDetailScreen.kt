package com.kalpx.wear.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.material.Text
import com.kalpx.wear.models.CuratedMantra
import com.kalpx.wear.models.WatchRhythmBand
import com.kalpx.wear.models.WatchRhythmData
import com.kalpx.wear.models.WatchRhythmItem
import com.kalpx.wear.sync.WearConnectivityManager
import com.kalpx.wear.theme.GoldDot
import com.kalpx.wear.theme.KalpXWearTheme
import com.kalpx.wear.theme.RitualChip

@Composable
fun RhythmDetailScreen(
    rhythm: WatchRhythmData,
    onMantraSelected: (CuratedMantra) -> Unit,
    onPracticeSelected: (WatchRhythmItem) -> Unit,
    onSankalpSelected: (WatchRhythmItem) -> Unit
) {
    ScalingLazyColumn(
        modifier = Modifier.background(KalpXWearTheme.background)
    ) {
        rhythm.bands.forEach { band ->
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    GoldDot()
                    Spacer(Modifier.width(4.dp))
                    Text(
                        band.band.replaceFirstChar { it.uppercase() },
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = KalpXWearTheme.textTertiary
                    )
                }
            }
            band.items.forEach { item ->
                item {
                    RhythmItemRow(
                        item = item,
                        isDone = band.isDone,
                        onMantraSelected = onMantraSelected,
                        onPracticeSelected = onPracticeSelected,
                        onSankalpSelected = onSankalpSelected
                    )
                }
            }
        }
    }
}

@Composable
private fun RhythmItemRow(
    item: WatchRhythmItem,
    isDone: Boolean,
    onMantraSelected: (CuratedMantra) -> Unit,
    onPracticeSelected: (WatchRhythmItem) -> Unit,
    onSankalpSelected: (WatchRhythmItem) -> Unit
) {
    val icon = if (isDone) "✓" else when (item.itemType) {
        "mantra"   -> "ॐ"
        "practice" -> "◎"
        else       -> "◈"
    }
    RitualChip(
        onClick = {
            when (item.itemType) {
                "mantra" -> {
                    val curated = WearConnectivityManager.mantras?.find { it.ref == item.itemId }
                        ?: CuratedMantra(item.itemId, item.itemId, item.title, "", null, item.audioUrl)
                    onMantraSelected(curated)
                }
                "practice" -> onPracticeSelected(item)
                else       -> onSankalpSelected(item)
            }
        },
        icon = icon,
        title = item.title,
        subtitle = item.description.takeIf { it.isNotEmpty() },
        isDimmed = isDone
    )
}
