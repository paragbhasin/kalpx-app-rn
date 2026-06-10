package com.kalpx.wear.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Text
import com.kalpx.wear.sync.WearConnectivityManager
import com.kalpx.wear.theme.KalpXWearTheme
import com.kalpx.wear.theme.WearPrimaryButton
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun SankalpScreen(title: String, line: String, source: String, onDone: () -> Unit) {
    var marked by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KalpXWearTheme.background)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(title, fontSize = 14.sp, fontWeight = FontWeight.SemiBold,
            color = KalpXWearTheme.textPrimary)
        Spacer(Modifier.height(6.dp))
        Text(line, fontSize = 13.sp, color = KalpXWearTheme.textSecondary)
        Spacer(Modifier.height(10.dp))

        if (marked) {
            Row {
                Text("◈ ", fontSize = 13.sp, color = KalpXWearTheme.gold)
                Text("Held", fontSize = 13.sp, fontWeight = FontWeight.Medium,
                    color = KalpXWearTheme.textPrimary)
            }
        } else {
            WearPrimaryButton("I held this") {
                WearConnectivityManager.sendToPhone(
                    "/kalpx/watch_message",
                    mapOf("type" to "sankalp_held", "source" to source)
                )
                marked = true
                kotlinx.coroutines.MainScope().launch {
                    kotlinx.coroutines.delay(1200)
                    onDone()
                }
            }
        }
    }
}
