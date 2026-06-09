package com.kalpx.app

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * KalpxLiveActivityPackage — registers KalpxLiveActivityModule with React Native.
 *
 * Add to MainApplication.kt:
 *   packages.add(KalpxLiveActivityPackage())
 *
 * Works with both Old Architecture (PackageList/bridge) and New Architecture
 * (interop layer) in RN 0.74+. No codegen spec required.
 */
class KalpxLiveActivityPackage : ReactPackage {

    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> = listOf(KalpxLiveActivityModule(reactContext))

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> = emptyList()
}
