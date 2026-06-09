package com.kalpx.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.kalpx.wear.engine.WearJapaEngine
import com.kalpx.wear.theme.KalpXWearTheme
import com.kalpx.wear.ui.HomeListScreen
import com.kalpx.wear.ui.QuickChantScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(KalpXWearTheme.background)
            ) {
                RootScreen()
            }
        }
    }
}

@Composable
fun RootScreen() {
    if (WearJapaEngine.isActive) {
        QuickChantScreen()
    } else {
        HomeListScreen()
    }
}
