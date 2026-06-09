package com.kalpx.app

import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService

/**
 * Receives messages and data events from the KalpX Wear OS app.
 * Forwards watch messages to RN via KalpxWatchConnectivityModule.
 */
class KalpxWearListenerService : WearableListenerService() {

    private fun connectivityModule(): KalpxWatchConnectivityModule? {
        val host = (application as? MainApplication) ?: return null
        return host.reactNativeHost.reactInstanceManager
            .currentReactContext
            ?.getNativeModule(KalpxWatchConnectivityModule::class.java)
    }

    override fun onMessageReceived(messageEvent: MessageEvent) {
        if (messageEvent.path.startsWith("/kalpx/watch_message") ||
            messageEvent.path.startsWith("/kalpx/message")) {
            val json = String(messageEvent.data)
            connectivityModule()?.emitWatchMessage(json)
        }
    }

    override fun onDataChanged(dataEvents: DataEventBuffer) {
        // Phone side doesn't need to handle data changes from Watch for now
    }
}
