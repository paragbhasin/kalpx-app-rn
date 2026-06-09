package com.kalpx.app

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.wearable.CapabilityClient
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import org.json.JSONArray
import org.json.JSONObject

/**
 * KalpxWatchConnectivityModule — Android mirror of KalpxWatchConnectivityModule.swift
 *
 * Registered as "KalpxWatchConnectivityModule" (same name as iOS) so watchMantraSync.ts
 * works unchanged on Android. Wraps the Wearable Data Layer API.
 *
 * Data paths:
 *   /kalpx/path_data  — persistent WatchPathData (DataClient)
 *   /kalpx/mantras    — persistent mantra list (DataClient)
 *   /kalpx/message    — live messages (MessageClient)
 *   /kalpx/request    — requests from watch (received via KalpxWearListenerService)
 */
class KalpxWatchConnectivityModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private val mainHandler = Handler(Looper.getMainLooper())

    override fun getName(): String = "KalpxWatchConnectivityModule"

    // ── setup ─────────────────────────────────────────────────────────────────
    // On Android there is no WCSession to activate — no-op kept for API parity.
    @ReactMethod
    fun setup(promise: Promise) {
        promise.resolve(null)
    }

    // ── isWatchReachable ──────────────────────────────────────────────────────
    @ReactMethod
    fun isWatchReachable(promise: Promise) {
        Wearable.getNodeClient(reactContext).connectedNodes
            .addOnSuccessListener { nodes -> promise.resolve(nodes.isNotEmpty()) }
            .addOnFailureListener { promise.resolve(false) }
    }

    // ── sendToWatch ───────────────────────────────────────────────────────────
    // Live fire-and-forget message to all connected Wear OS nodes.
    @ReactMethod
    fun sendToWatch(message: ReadableMap, promise: Promise) {
        val json = try { readableMapToJson(message).toString() } catch (e: Exception) {
            promise.reject("ENCODE_ERROR", e); return
        }
        Wearable.getNodeClient(reactContext).connectedNodes
            .addOnSuccessListener { nodes ->
                nodes.forEach { node ->
                    Wearable.getMessageClient(reactContext)
                        .sendMessage(node.id, "/kalpx/message", json.toByteArray())
                }
                promise.resolve(null)
            }
            .addOnFailureListener { promise.resolve(null) } // non-critical, don't reject
    }

    // ── pushMantrasViaContext ──────────────────────────────────────────────────
    // Equivalent to iOS updateApplicationContext — use DataClient for persistence.
    @ReactMethod
    fun pushMantrasViaContext(mantras: ReadableArray, promise: Promise) {
        putDataItem("/kalpx/mantras", readableArrayToJson(mantras).toString(), promise)
    }

    // ── writeMantrasToAppGroup ────────────────────────────────────────────────
    // No app group on Android — alias of pushMantrasViaContext.
    @ReactMethod
    fun writeMantrasToAppGroup(mantras: ReadableArray, promise: Promise) {
        pushMantrasViaContext(mantras, promise)
    }

    // ── pushPathDataViaContext ────────────────────────────────────────────────
    @ReactMethod
    fun pushPathDataViaContext(pathData: ReadableMap, promise: Promise) {
        putDataItem("/kalpx/path_data", readableMapToJson(pathData).toString(), promise)
    }

    // ── writePathDataToAppGroup ───────────────────────────────────────────────
    // No app group on Android — alias of pushPathDataViaContext.
    @ReactMethod
    fun writePathDataToAppGroup(pathData: ReadableMap, promise: Promise) {
        pushPathDataViaContext(pathData, promise)
    }

    // ── writeTodayStatsToAppGroup ─────────────────────────────────────────────
    // Sends today stats for Wear OS tile/complication updates.
    @ReactMethod
    fun writeTodayStatsToAppGroup(stats: ReadableMap, promise: Promise) {
        putDataItem("/kalpx/today_stats", readableMapToJson(stats).toString(), promise)
    }

    // ── Internal: emit event to RN ────────────────────────────────────────────

    fun emitWatchMessage(json: String) {
        mainHandler.post {
            runCatching {
                val parsed = JSONObject(json)
                val map = Arguments.createMap().apply {
                    parsed.keys().forEach { key ->
                        putString(key, parsed.optString(key))
                    }
                }
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("watchMessage", map)
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun putDataItem(path: String, json: String, promise: Promise) {
        val request = PutDataMapRequest.create(path).apply {
            dataMap.putString("json", json)
            dataMap.putLong("ts", System.currentTimeMillis())
        }.asPutDataRequest().setUrgent()
        Wearable.getDataClient(reactContext).putDataItem(request)
            .addOnSuccessListener { promise.resolve(null) }
            .addOnFailureListener { e -> promise.reject("DATA_ERROR", e) }
    }

    private fun readableMapToJson(map: ReadableMap): JSONObject {
        val json = JSONObject()
        val iter = map.keySetIterator()
        while (iter.hasNextKey()) {
            val key = iter.nextKey()
            when (map.getType(key)) {
                ReadableType.Null    -> {} // skip nulls — same as stripNulls() on iOS
                ReadableType.Boolean -> json.put(key, map.getBoolean(key))
                ReadableType.Number  -> json.put(key, map.getDouble(key))
                ReadableType.String  -> json.put(key, map.getString(key))
                ReadableType.Map     -> json.put(key, readableMapToJson(map.getMap(key)!!))
                ReadableType.Array   -> json.put(key, readableArrayToJson(map.getArray(key)!!))
            }
        }
        return json
    }

    private fun readableArrayToJson(arr: ReadableArray): JSONArray {
        val json = JSONArray()
        for (i in 0 until arr.size()) {
            when (arr.getType(i)) {
                ReadableType.Null    -> {} // skip
                ReadableType.Boolean -> json.put(arr.getBoolean(i))
                ReadableType.Number  -> json.put(arr.getDouble(i))
                ReadableType.String  -> json.put(arr.getString(i))
                ReadableType.Map     -> json.put(readableMapToJson(arr.getMap(i)!!))
                ReadableType.Array   -> json.put(readableArrayToJson(arr.getArray(i)!!))
            }
        }
        return json
    }

    // Required for RN event emitter — must override (not abstract but needed for bridge)
    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}
}
