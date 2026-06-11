package com.kalpx.app

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class KalpxLiveActivityPackage : TurboReactPackage() {

    override fun getModule(name: String, context: ReactApplicationContext): NativeModule? =
        if (name == KalpxLiveActivityModule.NAME) KalpxLiveActivityModule(context) else null

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
        mapOf(
            KalpxLiveActivityModule.NAME to ReactModuleInfo(
                KalpxLiveActivityModule.NAME,
                KalpxLiveActivityModule.NAME,
                false, false, false, false, false
            )
        )
    }
}
