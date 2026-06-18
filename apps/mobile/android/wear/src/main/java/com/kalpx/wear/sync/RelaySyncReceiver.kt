package com.kalpx.wear.sync

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Base64
import java.io.File

/**
 * DEV-ONLY relay receiver.
 *
 * Lets a host script inject the SAME payload the Wearable Data Layer would carry, so
 * phone↔watch sync can be tested on emulators (where Wear pairing is unavailable).
 * It calls the exact same WearConnectivityManager methods the real Data Layer listener
 * uses — so behaviour is identical to production. It adds NO new code path to the real
 * sync; it's purely an extra entry point used only by `adb shell am broadcast`.
 *
 * The real watch payload (~4 KB) is too large for a broadcast string extra, so the host
 * relay writes it to the app's files dir (relay_path.json / relay_mantras.json) and sends
 * a small trigger broadcast; this reads those files fresh and applies them. Small inline
 * base64 extras are still accepted for manual testing.
 *
 *   adb shell am broadcast -a com.kalpx.wear.RELAY_SYNC \
 *     -n com.kalpx.app.wear/com.kalpx.wear.sync.RelaySyncReceiver
 */
class RelaySyncReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // Large payloads written to the app files dir by the host relay
        readFile(context, "relay_path.json")?.let { WearConnectivityManager.updatePathData(it) }
        readFile(context, "relay_mantras.json")?.let { WearConnectivityManager.updateMantras(it) }
        // Small inline payloads (manual testing)
        intent.getStringExtra("mantrasB64")?.let { decode(it)?.let(WearConnectivityManager::updateMantras) }
        intent.getStringExtra("pathDataB64")?.let { decode(it)?.let(WearConnectivityManager::updatePathData) }
    }

    private fun readFile(context: Context, name: String): String? = try {
        val f = File(context.filesDir, name)
        if (f.exists() && f.length() > 0) f.readText(Charsets.UTF_8) else null
    } catch (e: Exception) {
        null
    }

    private fun decode(b64: String): String? = try {
        String(Base64.decode(b64, Base64.DEFAULT), Charsets.UTF_8)
    } catch (e: Exception) {
        null
    }
}
