# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:

# KalpX Live Activity — foreground service, RN bridge module, broadcast receiver.
# These are accessed by class name via RN reflection (NativeModules) and Android
# manifest declarations. R8 would rename/remove them in release without these rules.
-keep class com.kalpx.app.KalpxLiveActivityModule { *; }
-keep class com.kalpx.app.KalpxLiveActivityPackage { *; }
-keep class com.kalpx.app.KalpxLiveActivityService { *; }
-keep class com.kalpx.app.ChantIncrementReceiver { *; }

# KalpX Watch Connectivity — same pattern as Live Activity.
-keep class com.kalpx.app.KalpxWatchConnectivityModule { *; }
-keep class com.kalpx.app.KalpxWatchConnectivityPackage { *; }
-keep class com.kalpx.app.KalpxWearListenerService { *; }
