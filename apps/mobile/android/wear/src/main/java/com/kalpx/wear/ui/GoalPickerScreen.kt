package com.kalpx.wear.ui

import androidx.compose.foundation.background
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.material.Text
import com.kalpx.wear.engine.WearJapaEngine
import com.kalpx.wear.models.CuratedMantra
import com.kalpx.wear.theme.KalpXWearTheme
import com.kalpx.wear.theme.RitualChip

private val GOALS = listOf(
    Triple("Short return",    "count",      27),
    Triple("Deeper practice", "count",      54),
    Triple("Full mala",       "count",     108),
    Triple("Open practice",   "unlimited", null as Int?)
)

@Composable
fun GoalPickerScreen(mantra: CuratedMantra, onSelected: () -> Unit) {
    ScalingLazyColumn(
        modifier = Modifier.background(KalpXWearTheme.background)
    ) {
        item {
            Text(mantra.name, fontSize = androidx.compose.ui.unit.TextUnit.Unspecified,
                color = KalpXWearTheme.textSecondary)
        }
        items(GOALS) { (label, type, value) ->
            RitualChip(
                onClick = {
                    WearJapaEngine.startSession(mantra, type, value)
                    onSelected()
                },
                icon = "◈",
                title = label
            )
        }
    }
}
