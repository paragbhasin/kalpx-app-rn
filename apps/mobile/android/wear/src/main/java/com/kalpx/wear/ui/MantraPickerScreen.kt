package com.kalpx.wear.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.material.Text
import com.kalpx.wear.engine.WearJapaEngine
import com.kalpx.wear.sync.WearConnectivityManager
import com.kalpx.wear.theme.EmptyStateView
import com.kalpx.wear.theme.GoldLabel
import com.kalpx.wear.theme.KalpXWearTheme
import com.kalpx.wear.theme.RitualChip

@Composable
fun MantraPickerScreen(onSessionStarted: () -> Unit) {
    val mantras = WearConnectivityManager.mantras

    when {
        mantras == null -> {
            EmptyStateView()
        }
        else -> {
            ScalingLazyColumn(
                modifier = Modifier.background(KalpXWearTheme.background)
            ) {
                items(mantras) { mantra ->
                    RitualChip(
                        // Match iOS: tapping a mantra starts chanting directly (unlimited goal)
                        onClick = {
                            WearJapaEngine.startSession(mantra, "unlimited", null)
                            onSessionStarted()
                        },
                        icon = "ॐ",
                        title = mantra.name,
                        subtitle = mantra.devanagari.takeIf { it.isNotEmpty() }
                    )
                    mantra.label?.let { label ->
                        Spacer(Modifier.height(2.dp))
                        GoldLabel(labelDisplay(label))
                        Spacer(Modifier.height(4.dp))
                    }
                }
            }
        }
    }
}

private fun labelDisplay(label: String) = when (label) {
    "inner_path" -> "Inner Path"
    "Morning"    -> "Morning"
    "Afternoon"  -> "Afternoon"
    "Night"      -> "Night"
    else         -> label
}
