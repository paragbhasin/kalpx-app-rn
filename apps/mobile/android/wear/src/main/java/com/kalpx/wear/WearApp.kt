package com.kalpx.wear

import android.app.Application
import com.kalpx.wear.engine.WearJapaEngine
import com.kalpx.wear.sync.WearConnectivityManager

class WearApp : Application() {
    override fun onCreate() {
        super.onCreate()
        WearJapaEngine.init(this)
        WearConnectivityManager.init(this)
    }
}
