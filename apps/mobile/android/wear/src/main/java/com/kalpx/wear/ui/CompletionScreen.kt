package com.kalpx.wear.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Text
import com.kalpx.wear.theme.KalpXWearTheme
import com.kalpx.wear.theme.WearPrimaryButton
import com.kalpx.wear.theme.WearSecondaryButton

@Composable
fun CompletionScreen(
    count: Int,
    onContinue: () -> Unit,
    onDone: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KalpXWearTheme.background)
            .padding(horizontal = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("✦", fontSize = 22.sp, color = KalpXWearTheme.gold)
        Spacer(Modifier.height(4.dp))
        Text(
            "You returned $count times.",
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            color = KalpXWearTheme.textPrimary,
            textAlign = TextAlign.Center
        )
        Spacer(Modifier.height(2.dp))
        Text(
            "Let this practice be offered.",
            fontSize = 11.sp,
            color = KalpXWearTheme.textSecondary,
            textAlign = TextAlign.Center
        )
        Spacer(Modifier.height(10.dp))
        WearPrimaryButton("Chant more", onContinue)
        Spacer(Modifier.height(4.dp))
        WearSecondaryButton("Complete", onDone)
    }
}
