package com.kalpx.wear.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.unit.dp
import com.kalpx.wear.theme.KalpXWearTheme

@Composable
fun BeadRingView(beadInRound: Int, totalBeads: Int = 27) {
    val gold = KalpXWearTheme.gold
    val goldDim = KalpXWearTheme.gold.copy(alpha = 0.55f)
    val empty = KalpXWearTheme.textTertiary.copy(alpha = 0.25f)

    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .height(8.dp)
    ) {
        val beadPx = 4.dp.toPx()
        val gapPx = 2.dp.toPx()
        val totalWidth = totalBeads * beadPx + (totalBeads - 1) * gapPx
        val startX = (size.width - totalWidth) / 2f
        val cy = size.height / 2f
        val pos = beadInRound % totalBeads

        for (i in 0 until totalBeads) {
            val cx = startX + i * (beadPx + gapPx) + beadPx / 2f
            val color = when {
                i < pos  -> gold
                i == pos -> goldDim
                else     -> empty
            }
            drawCircle(color = color, radius = beadPx / 2f, center = Offset(cx, cy))
        }
    }
}
