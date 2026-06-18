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
import com.kalpx.wear.sync.WearConnectivityManager
import com.kalpx.wear.theme.KalpXWearTheme
import com.kalpx.wear.theme.WearPrimaryButton

@Composable
fun PracticeScreen(title: String, description: String, source: String, onDone: () -> Unit) {
    var marked by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KalpXWearTheme.background)
            .verticalScroll(rememberScrollState())
            // Generous top/bottom padding so content clears the round bezel
            .padding(horizontal = 26.dp, vertical = 34.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            title,
            fontSize = 15.sp,
            fontWeight = FontWeight.SemiBold,
            color = KalpXWearTheme.textPrimary,
            textAlign = TextAlign.Center
        )
        if (description.isNotEmpty()) {
            Spacer(Modifier.height(6.dp))
            Text(
                description,
                fontSize = 12.sp,
                color = KalpXWearTheme.textSecondary,
                textAlign = TextAlign.Center
            )
        }

        Spacer(Modifier.height(16.dp))

        if (marked) {
            // Show confirmation, then route back. LaunchedEffect lives in the
            // marked branch so it isn't cancelled (unlike a scope in the else branch).
            LaunchedEffect(Unit) {
                kotlinx.coroutines.delay(1200)
                onDone()
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("◎ ", fontSize = 14.sp, color = KalpXWearTheme.gold)
                Text(
                    "Done", fontSize = 14.sp, fontWeight = FontWeight.Medium,
                    color = KalpXWearTheme.textPrimary
                )
            }
        } else {
            WearPrimaryButton("I did this", onClick = {
                WearConnectivityManager.sendToPhone(
                    "/kalpx/watch_message",
                    mapOf("type" to "practice_done", "source" to source)
                )
                marked = true
            })
        }
    }
}
