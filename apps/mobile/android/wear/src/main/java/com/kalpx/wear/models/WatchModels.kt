package com.kalpx.wear.models

import org.json.JSONArray
import org.json.JSONObject

data class CuratedMantra(
    val id: String,
    val ref: String,
    val name: String,
    val devanagari: String,
    val label: String? = null,
    val audioUrl: String? = null
) {
    companion object {
        val default = CuratedMantra("default", "default", "ॐ नमः शिवाय", "ॐ नमः शिवाय")

        fun fromJson(json: JSONObject) = CuratedMantra(
            id = json.optString("ref").ifEmpty { json.optString("id") },
            ref = json.optString("ref"),
            name = json.optString("name"),
            devanagari = json.optString("devanagari"),
            label = json.optString("label").takeIf { it.isNotEmpty() },
            audioUrl = json.optString("audioUrl").takeIf { it.isNotEmpty() }
        )
    }
}

data class WatchMantraStats(
    val todayCount: Int,
    val weekCount: Int,
    val yearCount: Int,
    val lifetimeCount: Int
)

data class WatchTriadItem(
    val slot: String,
    val itemId: String,
    val title: String,
    val subtitle: String,
    val howToLive: String? = null,
    val audioUrl: String? = null
)

data class WatchInnerPathData(
    val hasActivePath: Boolean,
    val dayNumber: Int,
    val totalDays: Int,
    val triad: List<WatchTriadItem>
)

data class WatchRhythmItem(
    val itemId: String,
    val itemType: String,
    val title: String,
    val description: String,
    val audioUrl: String? = null
)

data class WatchRhythmBand(
    val band: String,
    val isDone: Boolean,
    val items: List<WatchRhythmItem>
)

data class WatchRhythmData(
    val hasRhythm: Boolean,
    val bands: List<WatchRhythmBand>
)

data class WatchCheckinData(
    val windowActive: Boolean,
    val pranaLabel: String
)

data class WatchQuickResetMantra(
    val itemId: String,
    val title: String,
    val devanagari: String,
    val audioUrl: String? = null
)

data class WatchPathData(
    val innerPath: WatchInnerPathData?,
    val rhythm: WatchRhythmData?,
    val checkin: WatchCheckinData,
    val quickReset: WatchQuickResetMantra?,
    val mantraStats: Map<String, WatchMantraStats>?
)

// ─── JSON parsing ─────────────────────────────────────────────────────────────

fun parseMantraList(json: String): List<CuratedMantra> = runCatching {
    val arr = JSONArray(json)
    (0 until arr.length()).map { CuratedMantra.fromJson(arr.getJSONObject(it)) }
}.getOrElse { emptyList() }

fun parsePathData(json: String): WatchPathData? = runCatching {
    val root = JSONObject(json)

    val innerPath = root.optJSONObject("innerPath")?.let { ip ->
        val arr = ip.optJSONArray("triad") ?: JSONArray()
        WatchInnerPathData(
            hasActivePath = ip.optBoolean("hasActivePath"),
            dayNumber = ip.optInt("dayNumber"),
            totalDays = ip.optInt("totalDays"),
            triad = (0 until arr.length()).map { i ->
                val t = arr.getJSONObject(i)
                WatchTriadItem(
                    slot = t.optString("slot"),
                    itemId = t.optString("itemId"),
                    title = t.optString("title"),
                    subtitle = t.optString("subtitle"),
                    howToLive = t.optString("howToLive").takeIf { it.isNotEmpty() },
                    audioUrl = t.optString("audioUrl").takeIf { it.isNotEmpty() }
                )
            }
        )
    }

    val rhythm = root.optJSONObject("rhythm")?.let { rh ->
        val bandsArr = rh.optJSONArray("bands") ?: JSONArray()
        WatchRhythmData(
            hasRhythm = rh.optBoolean("hasRhythm"),
            bands = (0 until bandsArr.length()).map { i ->
                val b = bandsArr.getJSONObject(i)
                val itemsArr = b.optJSONArray("items") ?: JSONArray()
                WatchRhythmBand(
                    band = b.optString("band"),
                    isDone = b.optBoolean("isDone"),
                    items = (0 until itemsArr.length()).map { j ->
                        val item = itemsArr.getJSONObject(j)
                        WatchRhythmItem(
                            itemId = item.optString("itemId"),
                            itemType = item.optString("itemType"),
                            title = item.optString("title"),
                            description = item.optString("description"),
                            audioUrl = item.optString("audioUrl").takeIf { it.isNotEmpty() }
                        )
                    }
                )
            }
        )
    }

    val checkinObj = root.optJSONObject("checkin")
    val checkin = WatchCheckinData(
        windowActive = checkinObj?.optBoolean("windowActive") ?: false,
        pranaLabel = checkinObj?.optString("pranaLabel") ?: ""
    )

    val quickReset = root.optJSONObject("quickReset")?.let { qr ->
        WatchQuickResetMantra(
            itemId = qr.optString("itemId"),
            title = qr.optString("title"),
            devanagari = qr.optString("devanagari"),
            audioUrl = qr.optString("audioUrl").takeIf { it.isNotEmpty() }
        )
    }

    val statsObj = root.optJSONObject("mantraStats")
    val mantraStats = statsObj?.let { stats ->
        buildMap {
            stats.keys().forEach { key ->
                val s = stats.getJSONObject(key)
                put(key, WatchMantraStats(
                    todayCount = s.optInt("todayCount"),
                    weekCount = s.optInt("weekCount"),
                    yearCount = s.optInt("yearCount"),
                    lifetimeCount = s.optInt("lifetimeCount")
                ))
            }
        }
    }

    WatchPathData(innerPath, rhythm, checkin, quickReset, mantraStats)
}.getOrNull()
