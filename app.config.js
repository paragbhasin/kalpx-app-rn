// Root-level app.config.js for EAS builds.
// EAS archives from the git root — all paths are relative to the repo root.
// For local dev, use apps/mobile/app.config.js (via `cd apps/mobile && expo run:*`).
module.exports = {
  expo: {
    name: "KalpX",
    slug: "kalpx",
    version: "1.1.35",
    orientation: "portrait",
    icon: "./apps/mobile/assets/new_logo.png",
    scheme: "kalpx",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    updates: {
      enabled: false,
    },
    ios: {
      icon: "./apps/mobile/assets/new_logo.png",
      supportsTablet: true,
      bundleIdentifier: "com.kalpx.app",
      usesAppleSignIn: true,
      appleTeamId: "9G5NZ5LBRU",
      googleServicesFile:
        process.env.GOOGLE_SERVICES_PLIST ||
        "./apps/mobile/GoogleService-Info.plist",
      buildNumber: "42",
      entitlements: {
        "aps-environment": "production",
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          "KalpX uses the camera only when you choose to capture or upload photos or videos.",
        NSPhotoLibraryUsageDescription:
          "KalpX needs access to your photo library so you can upload images you choose.",
        NSPhotoLibraryAddUsageDescription:
          "KalpX may save images to your photo library when you choose to download or share content.",
        NSMicrophoneUsageDescription:
          "KalpX uses the microphone for audio or video related features.",
        NSLocationWhenInUseUsageDescription:
          "KalpX uses location to personalize classes and content.",
      },
    },
    android: {
      versionCode: 43,
      package: "com.kalpx.app",
      adaptiveIcon: {
        foregroundImage: "./apps/mobile/assets/new_logo.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ||
        "./apps/mobile/google-services.json",
    },
    web: {
      bundler: "metro",
      favicon: "./apps/mobile/assets/images/favicon.png",
    },
    plugins: [
      "./apps/mobile/plugins/withAndroidAutolinkingFix",
      "./apps/mobile/plugins/withAbiSplits",
      "./apps/mobile/plugins/withModularHeaders",
      "expo-font",
      "@react-native-firebase/app",
      "@react-native-firebase/messaging",
      [
        "expo-splash-screen",
        {
          image: "./apps/mobile/assets/KalpXlogo.png",
          imageWidth: 150,
          resizeMode: "contain",
          backgroundColor: "#F6F0DD",
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],
      [
        "@stripe/stripe-react-native",
        {
          merchantIdentifier: "",
          enableGooglePay: true,
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme:
            "com.googleusercontent.apps.473187060791-96pucdifumqrnn7lb5l6bboqladmarat",
        },
      ],
      ["expo-apple-authentication"],
      "@react-native-community/datetimepicker",
      [
        "expo-image-picker",
        {
          photosPermission: "Allow KalpX to access your photos",
          cameraPermission: "Allow KalpX to access your camera",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "7461904f-1bca-4590-bc3b-c839d2768e44",
      },
    },
    scripts: {
      postinstall: "patch-package",
    },
  },
};
