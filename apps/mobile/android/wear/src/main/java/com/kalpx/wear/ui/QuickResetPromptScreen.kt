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
import com.kalpx.wear.engine.WearJapaEngine
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
    val curatedMantra = remember(mantra) {
        CuratedMantra(mantra.itemId, mantra.itemId, mantra.title, mantra.devanagari, null, mantra.audioUrl)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KalpXWearTheme.background)
            .verticalScroll(rememberScrollState())
            // Round-safe padding so text + buttons clear the bezel
            .padding(horizontal = 24.dp, vertical = 30.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            "Return slowly",
            fontSize = 11.sp,
            color = KalpXWearTheme.textTertiary
        )
        Spacer(Modifier.height(6.dp))
        Text(
            mantra.devanagari,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium,
            color = KalpXWearTheme.textPrimary,
            textAlign = TextAlign.Center,
            lineHeight = 18.sp
        )
        Spacer(Modifier.height(4.dp))
        Text(
            mantra.title,
            fontSize = 12.sp,
            color = KalpXWearTheme.textSecondary,
            textAlign = TextAlign.Center
        )
        Spacer(Modifier.height(10.dp))
        // Begin → start chanting directly (unlimited), skipping the goal picker
        WearPrimaryButton("Begin", onClick = {
            WearJapaEngine.startSession(curatedMantra, "unlimited", null)
            onNavigateBack()
        })
        Spacer(Modifier.height(4.dp))
        WearSecondaryButton("Later", onClick = { onNavigateBack() })
    }
}
