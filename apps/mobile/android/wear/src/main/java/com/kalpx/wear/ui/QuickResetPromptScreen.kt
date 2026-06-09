package com.kalpx.wear.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Text
import com.kalpx.wear.models.CuratedMantra
import com.kalpx.wear.models.WatchQuickResetMantra
import com.kalpx.wear.theme.KalpXWearTheme
import com.kalpx.wear.theme.WearPrimaryButton
import com.kalpx.wear.theme.WearSecondaryButton

@Composable
fun QuickResetPromptScreen(
    mantra: WatchQuickResetMantra,
    feeling: String,
    onNavigateBack: () -> Unit
) {
    var showGoalPicker by remember { mutableStateOf(false) }
    val curatedMantra = remember(mantra) {
        CuratedMantra(mantra.itemId, mantra.itemId, mantra.title, mantra.devanagari, null, mantra.audioUrl)
    }

    if (showGoalPicker) {
        GoalPickerScreen(mantra = curatedMantra) {
            showGoalPicker = false
            onNavigateBack()
        }
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KalpXWearTheme.background)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            feeling,
            fontSize = 11.sp,
            color = KalpXWearTheme.textTertiary
        )
        Spacer(Modifier.height(6.dp))
        Text(
            mantra.devanagari,
            fontSize = 20.sp,
            fontWeight = FontWeight.Medium,
            color = KalpXWearTheme.textPrimary,
            textAlign = TextAlign.Center
        )
        Spacer(Modifier.height(4.dp))
        Text(
            mantra.title,
            fontSize = 12.sp,
            color = KalpXWearTheme.textSecondary,
            textAlign = TextAlign.Center
        )
        Spacer(Modifier.height(10.dp))
        WearPrimaryButton("Begin") { showGoalPicker = true }
        Spacer(Modifier.height(4.dp))
        WearSecondaryButton("Later") { onNavigateBack() }
    }
}
