package com.kalpx.app

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class KalpxWatchConnectivityPackage : TurboReactPackage() {

    override fun getModule(name: String, context: ReactApplicationContext): NativeModule? =
        if (name == KalpxWatchConnectivityModule.NAME) KalpxWatchConnectivityModule(context) else null

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
        mapOf(
            KalpxWatchConnectivityModule.NAME to ReactModuleInfo(
                KalpxWatchConnectivityModule.NAME,
                KalpxWatchConnectivityModule.NAME,
                false, false, false, false, false
            )
        )
    }
}
