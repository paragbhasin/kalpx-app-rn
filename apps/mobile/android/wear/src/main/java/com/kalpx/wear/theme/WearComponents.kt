package com.kalpx.wear.theme

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.*

// ─── RitualChip — list row with gold icon, ivory title, tertiary subtitle ─────

@Composable
fun RitualChip(
    onClick: () -> Unit,
    icon: String,
    title: String,
    subtitle: String? = null,
    isDimmed: Boolean = false,
    modifier: Modifier = Modifier
) {
    Chip(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .alpha(if (isDimmed) 0.45f else 1f),
        colors = ChipDefaults.chipColors(
            backgroundColor = KalpXWearTheme.surface,
            contentColor = KalpXWearTheme.textPrimary
        ),
        label = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(icon, fontSize = 11.sp, color = KalpXWearTheme.gold)
                Spacer(Modifier.width(5.dp))
                Column {
                    Text(
                        title, fontSize = 14.sp, fontWeight = FontWeight.Medium,
                        color = KalpXWearTheme.textPrimary, maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    subtitle?.let {
                        Text(
                            it, fontSize = 11.sp, color = KalpXWearTheme.textTertiary,
                            maxLines = 1, overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    )
}

// ─── WearPrimaryButton — gold fill, dark label ─────────────────────────────

@Composable
fun WearPrimaryButton(label: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Chip(
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),
        colors = ChipDefaults.chipColors(
            backgroundColor = KalpXWearTheme.gold,
            contentColor = KalpXWearTheme.background
        ),
        label = {
            Text(
                label, fontSize = 13.sp, fontWeight = FontWeight.SemiBold,
                color = KalpXWearTheme.background
            )
        }
    )
}

// ─── WearSecondaryButton — ghost outline, secondary text ───────────────────

@Composable
fun WearSecondaryButton(label: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    CompactChip(
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),
        colors = ChipDefaults.chipColors(
            backgroundColor = KalpXWearTheme.surface,
            contentColor = KalpXWearTheme.textSecondary
        ),
        label = { Text(label, fontSize = 12.sp, color = KalpXWearTheme.textSecondary) }
    )
}

// ─── EmptyStateView — gold ॐ + tertiary hint ───────────────────────────────

@Composable
fun EmptyStateView() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KalpXWearTheme.background),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("ॐ", fontSize = 32.sp, color = KalpXWearTheme.gold)
        Spacer(Modifier.height(8.dp))
        Text(
            "Open KalpX on phone to continue.",
            fontSize = 12.sp,
            color = KalpXWearTheme.textTertiary,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
        )
    }
}

// ─── GoldLabel — capsule chip for category labels ──────────────────────────

@Composable
fun GoldLabel(text: String) {
    Box(
        modifier = Modifier
            .background(color = KalpXWearTheme.goldSoft, shape = RoundedCornerShape(100))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(text, fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = KalpXWearTheme.gold)
    }
}

// ─── GoldDot — 5dp circle for section headers ──────────────────────────────

@Composable
fun GoldDot() {
    Box(
        modifier = Modifier
            .size(5.dp)
            .background(color = KalpXWearTheme.gold, shape = RoundedCornerShape(100))
    )
}
