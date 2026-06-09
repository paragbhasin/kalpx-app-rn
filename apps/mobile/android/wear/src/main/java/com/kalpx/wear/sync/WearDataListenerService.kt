package com.kalpx.wear.sync

import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService

class WearDataListenerService : WearableListenerService() {

    override fun onDataChanged(dataEvents: DataEventBuffer) {
        dataEvents.forEach { event ->
            if (event.type == DataEvent.TYPE_CHANGED) {
                val path = event.dataItem.uri.path ?: return@forEach
                val bytes = event.dataItem.data ?: return@forEach
                val json = String(bytes)
                when {
                    path.startsWith("/kalpx/path_data") -> WearConnectivityManager.updatePathData(json)
                    path.startsWith("/kalpx/mantras") -> WearConnectivityManager.updateMantras(json)
                }
            }
        }
    }

    override fun onMessageReceived(messageEvent: MessageEvent) {
        val path = messageEvent.path
        val json = String(messageEvent.data)
        when {
            path.startsWith("/kalpx/path_data") -> WearConnectivityManager.updatePathData(json)
            path.startsWith("/kalpx/mantras") -> WearConnectivityManager.updateMantras(json)
        }
    }
}
