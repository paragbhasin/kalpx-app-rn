package com.kalpx.wear.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material.MaterialTheme

object KalpXWearTheme {
    val background    = Color(0xFF12100C)
    val surface       = Color(0xFF211A14)
    val elevated      = Color(0xFF30261C)
    val textPrimary   = Color(0xFFF4E8D3)
    val textSecondary = Color(0xFFB8AA96)
    val textTertiary  = Color(0xFF827464)
    val gold          = Color(0xFFD1A64A)
    val goldSoft      = Color(0x38D1A64A) // ~0.22 opacity
}

@Composable
fun KalpXWearMaterialTheme(content: @Composable () -> Unit) {
    MaterialTheme(content = content)
}
