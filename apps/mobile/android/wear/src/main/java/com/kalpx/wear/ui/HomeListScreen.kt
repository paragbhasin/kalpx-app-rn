package com.kalpx.wear.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.material.Text
import com.kalpx.wear.engine.WearJapaEngine
import com.kalpx.wear.models.CuratedMantra
import com.kalpx.wear.models.WatchRhythmItem
import com.kalpx.wear.models.WatchTriadItem
import com.kalpx.wear.sync.WearConnectivityManager
import com.kalpx.wear.theme.EmptyStateView
import com.kalpx.wear.theme.KalpXWearTheme
import com.kalpx.wear.theme.RitualChip

enum class HomeDestination {
    RHYTHM_DETAIL, INNER_PATH_DETAIL, MANTRA_PICKER, CHECK_IN
}

@Composable
fun HomeListScreen() {
    val pathData = WearConnectivityManager.pathData
    val mantras = WearConnectivityManager.mantras

    var destination by remember { mutableStateOf<HomeDestination?>(null) }
    var selectedMantra by remember { mutableStateOf<CuratedMantra?>(null) }
    var selectedGoalMantra by remember { mutableStateOf<CuratedMantra?>(null) }
    var selectedTriadItem by remember { mutableStateOf<WatchTriadItem?>(null) }
    var selectedRhythmItem by remember { mutableStateOf<WatchRhythmItem?>(null) }

    // Swipe-from-left-edge / hardware back goes back ONE level (deepest first),
    // instead of exiting the app. Disabled at home so back exits as expected.
    val inDetail = selectedGoalMantra != null || selectedTriadItem != null ||
        selectedRhythmItem != null || destination != null
    BackHandler(enabled = inDetail) {
        when {
            selectedGoalMantra != null -> selectedGoalMantra = null
            selectedTriadItem != null -> selectedTriadItem = null
            selectedRhythmItem != null -> selectedRhythmItem = null
            else -> destination = null
        }
    }

    when {
        selectedGoalMantra != null -> {
            GoalPickerScreen(mantra = selectedGoalMantra!!) {
                selectedGoalMantra = null
                destination = null
            }
        }
        selectedTriadItem != null -> {
            val item = selectedTriadItem!!
            when (item.slot) {
                "practice" -> PracticeScreen(item.title, item.subtitle, "inner_path") {
                    selectedTriadItem = null
                }
                else -> SankalpScreen(item.title, item.howToLive ?: item.subtitle, "inner_path") {
                    selectedTriadItem = null
                }
            }
        }
        selectedRhythmItem != null -> {
            val item = selectedRhythmItem!!
            when (item.itemType) {
                "practice" -> PracticeScreen(item.title, item.description, "rhythm") {
                    selectedRhythmItem = null
                }
                else -> SankalpScreen(item.title, item.description, "rhythm") {
                    selectedRhythmItem = null
                }
            }
        }
        destination == HomeDestination.MANTRA_PICKER -> {
            MantraPickerScreen { destination = null }
        }
        destination == HomeDestination.CHECK_IN -> {
            CheckInScreen { destination = null }
        }
        destination == HomeDestination.RHYTHM_DETAIL -> {
            pathData?.rhythm?.let { rhythm ->
                RhythmDetailScreen(
                    rhythm = rhythm,
                    onMantraSelected = { WearJapaEngine.startSession(it, "unlimited", null) },
                    onPracticeSelected = { selectedRhythmItem = it },
                    onSankalpSelected = { selectedRhythmItem = it }
                )
            }
        }
        destination == HomeDestination.INNER_PATH_DETAIL -> {
            pathData?.innerPath?.let { ip ->
                InnerPathDetailScreen(
                    innerPath = ip,
                    onMantraSelected = { WearJapaEngine.startSession(it, "unlimited", null) },
                    onPracticeSelected = { selectedTriadItem = it },
                    onSankalpSelected = { selectedTriadItem = it }
                )
            }
        }
        pathData == null && mantras == null -> {
            EmptyStateView()
        }
        else -> {
            ScalingLazyColumn(
                modifier = Modifier.background(KalpXWearTheme.background)
            ) {
                item {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)
                    ) {
                        Text("ॐ", fontSize = 22.sp, fontWeight = FontWeight.Medium, color = KalpXWearTheme.gold)
                        Text("KalpX", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = KalpXWearTheme.textPrimary)
                        Text("Stay centered", fontSize = 11.sp, color = KalpXWearTheme.textTertiary)
                    }
                }

                pathData?.rhythm?.let { rh ->
                    if (rh.hasRhythm) {
                        item {
                            RitualChip(
                                onClick = { destination = HomeDestination.RHYTHM_DETAIL },
                                icon = "◈",
                                title = "My Rhythm"
                            )
                        }
                    }
                }

                pathData?.innerPath?.let { ip ->
                    if (ip.hasActivePath) {
                        item {
                            RitualChip(
                                onClick = { destination = HomeDestination.INNER_PATH_DETAIL },
                                icon = "◉",
                                title = "Inner Path",
                                subtitle = "Day ${ip.dayNumber} of ${ip.totalDays}"
                            )
                        }
                    }
                }

                item {
                    RitualChip(
                        onClick = { destination = HomeDestination.MANTRA_PICKER },
                        icon = "ॐ",
                        title = "Quick Chant"
                    )
                }

                item {
                    RitualChip(
                        onClick = { destination = HomeDestination.CHECK_IN },
                        icon = "◇",
                        title = "Check-In"
                    )
                }
            }
        }
    }
}
