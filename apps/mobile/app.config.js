module.exports = {
  expo: {
    name: "kalpx",
    slug: "kalpx",
    version: "1.1.52",
    orientation: "portrait",
    icon: "./assets/new_logo.png",
    scheme: "kalpx",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    updates: {
      enabled: false,
    },
    ios: {
      icon: "./assets/new_logo.png",
      supportsTablet: true,
      bundleIdentifier: "com.kalpx.app",
      usesAppleSignIn: true,
      appleTeamId: "9G5NZ5LBRU",
      associatedDomains: ["applinks:kalpx.com", "applinks:dev.kalpx.com"],
      googleServicesFile:
        process.env.GOOGLE_SERVICES_PLIST || "../../GoogleService-Info.plist",
      buildNumber: "57",
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
        NSFaceIDUsageDescription:
          "KalpX uses Face ID to keep your practice private and unlock the app.",
        NSSupportsLiveActivities: true,
        NSSupportsLiveActivitiesFrequentUpdates: true,
      },
    },
    android: {
      versionCode: 64,
      package: "com.kalpx.app",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            { scheme: "https", host: "kalpx.com", pathPrefix: "/p" },
            { scheme: "https", host: "kalpx.com", pathPrefix: "/join" },
            { scheme: "https", host: "kalpx.com", pathPrefix: "/sessions" },
            { scheme: "https", host: "kalpx.com", pathPrefix: "/programs" },
            { scheme: "https", host: "kalpx.com", pathPrefix: "/guide/invite" },
            { scheme: "https", host: "dev.kalpx.com", pathPrefix: "/guide/invite" },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      blockedPermissions: [
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO",
        "android.permission.READ_MEDIA_AUDIO",
        "android.permission.READ_MEDIA_VISUAL_USER_SELECTED",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/new_logo.png",
        backgroundColor: "#ffffff",
      },

      edgeToEdgeEnabled: true,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "./plugins/withAbiSplits",
      "./plugins/withModularHeaders",
      "expo-font",
      "@react-native-community/datetimepicker",
      "@react-native-firebase/app",
      "@react-native-firebase/messaging",
      [
        "expo-splash-screen",
        {
          image: "./assets/KalpXlogo.png",
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
      ["expo-local-authentication"],
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
