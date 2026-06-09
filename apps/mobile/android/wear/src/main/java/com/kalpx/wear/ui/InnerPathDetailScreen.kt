package com.kalpx.wear.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.material.Text
import com.kalpx.wear.models.CuratedMantra
import com.kalpx.wear.models.WatchInnerPathData
import com.kalpx.wear.models.WatchTriadItem
import com.kalpx.wear.sync.WearConnectivityManager
import com.kalpx.wear.theme.KalpXWearTheme
import com.kalpx.wear.theme.RitualChip

@Composable
fun InnerPathDetailScreen(
    innerPath: WatchInnerPathData,
    onMantraSelected: (CuratedMantra) -> Unit,
    onPracticeSelected: (WatchTriadItem) -> Unit,
    onSankalpSelected: (WatchTriadItem) -> Unit
) {
    ScalingLazyColumn(
        modifier = Modifier.background(KalpXWearTheme.background)
    ) {
        innerPath.triad.forEach { item ->
            item {
                TriadItemRow(
                    item = item,
                    onMantraSelected = onMantraSelected,
                    onPracticeSelected = onPracticeSelected,
                    onSankalpSelected = onSankalpSelected
                )
            }
        }
    }
}

@Composable
private fun TriadItemRow(
    item: WatchTriadItem,
    onMantraSelected: (CuratedMantra) -> Unit,
    onPracticeSelected: (WatchTriadItem) -> Unit,
    onSankalpSelected: (WatchTriadItem) -> Unit
) {
    val icon = when (item.slot) {
        "mantra"   -> "ॐ"
        "practice" -> "◎"
        else       -> "◈"
    }
    RitualChip(
        onClick = {
            when (item.slot) {
                "mantra" -> {
                    val curated = WearConnectivityManager.mantras?.find { it.ref == item.itemId }
                        ?: CuratedMantra(item.itemId, item.itemId, item.title, item.subtitle, null, item.audioUrl)
                    onMantraSelected(curated)
                }
                "practice" -> onPracticeSelected(item)
                else       -> onSankalpSelected(item)
            }
        },
        icon = icon,
        title = item.title,
        subtitle = item.subtitle.takeIf { it.isNotEmpty() }
    )
}
