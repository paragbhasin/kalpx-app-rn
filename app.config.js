const fs = require("fs");
const path = require("path");

const IS_EAS_BUILD = !!process.env.EAS_BUILD_ID;

if (IS_EAS_BUILD) {
  const rootDir = __dirname;
  const androidAppDir = path.join(rootDir, "android/app");

  // --- ANDROID HANDLER ---
  const androidSecret = process.env.GOOGLE_SERVICES_JSON;
  if (androidSecret) {
    // Ensure android/app directory exists
    if (!fs.existsSync(androidAppDir)) {
      fs.mkdirSync(androidAppDir, { recursive: true });
    }

    const targetPath = path.join(androidAppDir, "google-services.json");
    const rootTargetPath = path.join(rootDir, "google-services.json");

    if (fs.existsSync(androidSecret)) {
      // It is a path! Copy the actual file
      fs.copyFileSync(androidSecret, targetPath);
      fs.copyFileSync(androidSecret, rootTargetPath);
      console.log(
        "✅ Successfully copied google-services.json secret to native and root",
      );
    } else {
      // Fallback: Raw string
      const content = androidSecret.includes("project_info")
        ? androidSecret
        : Buffer.from(androidSecret, "base64");
      fs.writeFileSync(targetPath, content);
      fs.writeFileSync(rootTargetPath, content);
      console.log(
        "📝 Successfully wrote google-services.json from string to native and root",
      );
    }
  }

  // --- IOS HANDLER ---
  const iosSecret = process.env.GOOGLE_SERVICE_INFO_PLIST;
  if (iosSecret) {
    const targetPath = path.join(rootDir, "GoogleService-Info.plist");
    const nativeIosDir = path.join(rootDir, "ios");

    let content;
    if (fs.existsSync(iosSecret)) {
      content = fs.readFileSync(iosSecret);
    } else {
      content = iosSecret.includes("<?xml")
        ? iosSecret
        : Buffer.from(iosSecret, "base64");
    }

    fs.writeFileSync(targetPath, content);

    // Also copy to ios/ directory if it exists (Bare workflow hint)
    if (fs.existsSync(nativeIosDir)) {
      // Find the app folder inside ios/ (usually has the same name as the project or 'app')
      // For simplicity, we just put it in the root of ios/ or the project root.
      // Expo config uses the one in project root.
    }

    console.log("✅ Successfully handled GoogleService-Info.plist");
  }
}

module.exports = {
  expo: {
    name: "kalpx",
    slug: "kalpx",
    version: "1.1.30",
    orientation: "portrait",
    icon: "./assets/AppIconImg.png",
    scheme: "kalpx",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    updates: {
      enabled: false,
    },
    ios: {
      icon: "./assets/AppIconImg.png",
      supportsTablet: true,
      bundleIdentifier: "com.kalpx.app",
      usesAppleSignIn: true,
      appleTeamId: "9G5NZ5LBRU",
      googleServicesFile: "./GoogleService-Info.plist",
      buildNumber: "1",
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
      versionCode: 37,
      package: "com.kalpx.app",
      adaptiveIcon: {
        foregroundImage: "./assets/AppIconImg.png",
        backgroundColor: "#ffffff",
      },

      edgeToEdgeEnabled: true,
      googleServicesFile: "./google-services.json",
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "@react-native-firebase/app",
      "@react-native-firebase/messaging",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      // Removed ./plugins/withModularHeaders as static frameworks are now enabled below
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
