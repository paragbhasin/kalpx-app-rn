package com.kalpx.wear.sync

import android.content.Context
import android.content.SharedPreferences
import android.os.Handler
import android.os.Looper
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.google.android.gms.wearable.Wearable
import com.kalpx.wear.models.CuratedMantra
import com.kalpx.wear.models.WatchPathData
import com.kalpx.wear.models.parseMantraList
import com.kalpx.wear.models.parsePathData
import org.json.JSONObject

private const val PREFS = "kalpx_wear_sync"
private const val KEY_MANTRAS = "kalpx_watch_mantras"
private const val KEY_PATH_DATA = "kalpx_watch_path_data"

object WearConnectivityManager {
    private lateinit var prefs: SharedPreferences
    private lateinit var ctx: Context
    private val mainHandler = Handler(Looper.getMainLooper())

    var mantras by mutableStateOf<List<CuratedMantra>?>(null)
        private set
    var pathData by mutableStateOf<WatchPathData?>(null)
        private set

    fun init(context: Context) {
        ctx = context.applicationContext
        prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        loadPersistedData()
    }

    fun updateMantras(json: String) {
        val parsed = parseMantraList(json)
        if (parsed.isEmpty()) return
        prefs.edit().putString(KEY_MANTRAS, json).apply()
        mainHandler.post { mantras = parsed }
    }

    fun updatePathData(json: String) {
        val parsed = parsePathData(json) ?: return
        prefs.edit().putString(KEY_PATH_DATA, json).apply()
        mainHandler.post { pathData = parsed }
    }

    fun sendToPhone(path: String, data: Map<String, Any>) {
        val bytes = JSONObject(data).toString().toByteArray()
        Wearable.getNodeClient(ctx).connectedNodes.addOnSuccessListener { nodes ->
            nodes.forEach { node ->
                Wearable.getMessageClient(ctx).sendMessage(node.id, path, bytes)
            }
        }
    }

    fun requestDataFromPhone() {
        sendToPhone("/kalpx/request", mapOf("type" to "request_path_data"))
        sendToPhone("/kalpx/request", mapOf("type" to "request_mantras"))
    }

    private fun loadPersistedData() {
        prefs.getString(KEY_MANTRAS, null)?.let { mantras = parseMantraList(it) }
        prefs.getString(KEY_PATH_DATA, null)?.let { pathData = parsePathData(it) }
    }
}
