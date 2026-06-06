import Expo
import FirebaseCore
import React
import ReactAppDependencyProvider
import UserNotifications

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
// @generated begin @react-native-firebase/app-didFinishLaunchingWithOptions - expo prebuild (DO NOT MODIFY) sync-10e8520570672fd76b2403b7e1e27f5198a6349a
FirebaseApp.configure()
// @generated end @react-native-firebase/app-didFinishLaunchingWithOptions
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

    registerWatchNotificationCategories()
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Register UNNotificationCategory entries with Watch-compatible actions.
  // These propagate to Apple Watch automatically — watchOS shows action buttons
  // in notification UI without any Watch-side code.
  private func registerWatchNotificationCategories() {
    let innerPathCategory = UNNotificationCategory(
      identifier: "INNER_PATH_REMINDER",
      actions: [
        UNNotificationAction(identifier: "BEGIN_MANTRA",  title: "Begin Mantra", options: [.foreground]),
        UNNotificationAction(identifier: "HOLD_SANKALP",  title: "Hold Sankalp", options: []),
        UNNotificationAction(identifier: "LATER",         title: "Later",        options: [.destructive]),
      ],
      intentIdentifiers: [], options: .customDismissAction
    )

    let rhythmCategory = UNNotificationCategory(
      identifier: "RHYTHM_REMINDER",
      actions: [
        UNNotificationAction(identifier: "BEGIN",     title: "Begin",     options: [.foreground]),
        UNNotificationAction(identifier: "MARK_DONE", title: "Mark Done", options: []),
        UNNotificationAction(identifier: "LATER",     title: "Later",     options: [.destructive]),
      ],
      intentIdentifiers: [], options: .customDismissAction
    )

    let quickChantCategory = UNNotificationCategory(
      identifier: "QUICK_CHANT_REMINDER",
      actions: [
        UNNotificationAction(identifier: "START_1MIN", title: "1 Min",     options: [.foreground]),
        UNNotificationAction(identifier: "START_108",  title: "108 Beads", options: [.foreground]),
        UNNotificationAction(identifier: "LATER",      title: "Later",     options: [.destructive]),
      ],
      intentIdentifiers: [], options: .customDismissAction
    )

    let checkinCategory = UNNotificationCategory(
      identifier: "CHECKIN_NUDGE",
      actions: [
        UNNotificationAction(identifier: "STEADY",      title: "Steady",      options: []),
        UNNotificationAction(identifier: "RESTLESS",    title: "Restless",    options: []),
        UNNotificationAction(identifier: "LOW_ENERGY",  title: "Low Energy",  options: []),
        UNNotificationAction(identifier: "OPEN_MITRA",  title: "Open Mitra",  options: [.foreground]),
      ],
      intentIdentifiers: [], options: .customDismissAction
    )

    UNUserNotificationCenter.current().setNotificationCategories([
      innerPathCategory, rhythmCategory, quickChantCategory, checkinCategory,
    ])
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
