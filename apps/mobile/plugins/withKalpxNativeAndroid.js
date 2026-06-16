/**
 * VALIDATION-ONLY Expo config plugin — injects the Kalpx Android Live Activity
 * native classes into the prebuild-generated project.
 *
 * Purpose: prove on real EAS infrastructure that the prebuild/CNG pipeline is
 * what strips the native integration. If KalpxLiveActivityModule/Package/Service
 * appear in the resulting AAB/APK ONLY when this plugin is active, that is the
 * conclusive proof.
 *
 * Scope: Android, Live Activity only (4 .kt files + 1 drawable). Watch files are
 * intentionally excluded to keep the test minimal.
 *
 * Source of truth: apps/mobile/native-android/  (a tracked, non-ignored copy of
 * the canonical files in apps/mobile/android/, which .easignore excludes from the
 * EAS upload — so the plugin reads from native-android/ instead).
 *
 * Idempotent. Fails LOUDLY during prebuild if an anchor is missing, so a broken
 * plugin can never silently ship a half-built artifact.
 */
const {
  withDangerousMod,
  withMainApplication,
  withAndroidManifest,
  AndroidConfig,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const KOTLIN_SRC = path.join(__dirname, "..", "native-android", "kotlin", "com", "kalpx", "app");
const DRAWABLE_SRC = path.join(__dirname, "..", "native-android", "res", "drawable");

// ── (1) Copy .kt files + drawable into the generated Android project ──────────
const withNativeFiles = (config) =>
  withDangerousMod(config, [
    "android",
    async (config) => {
      const root = config.modRequest.platformProjectRoot; // .../android
      const ktDest = path.join(root, "app/src/main/java/com/kalpx/app");
      const drawableDest = path.join(root, "app/src/main/res/drawable");
      fs.mkdirSync(ktDest, { recursive: true });
      fs.mkdirSync(drawableDest, { recursive: true });

      for (const f of fs.readdirSync(KOTLIN_SRC)) {
        fs.copyFileSync(path.join(KOTLIN_SRC, f), path.join(ktDest, f));
      }
      for (const f of fs.readdirSync(DRAWABLE_SRC)) {
        fs.copyFileSync(path.join(DRAWABLE_SRC, f), path.join(drawableDest, f));
      }
      return config;
    },
  ]);

// ── (2) Register the package in MainApplication.kt → makes it R8-reachable ────
const withRegister = (config) =>
  withMainApplication(config, (config) => {
    let src = config.modResults.contents;
    if (src.includes("KalpxLiveActivityPackage()")) return config; // idempotent

    const anchor = "val packages = PackageList(this).packages";
    if (!src.includes(anchor)) {
      throw new Error(
        "withKalpxNativeAndroid: anchor not found in MainApplication.kt — " +
          "Expo template output changed. Expected: " + anchor
      );
    }
    src = src.replace(
      anchor,
      `${anchor}.toMutableList().apply {\n            add(KalpxLiveActivityPackage())\n          }`
    );
    config.modResults.contents = src;
    return config;
  });

// ── (3) Declare the foreground service + receiver + permissions ───────────────
const PERMS = [
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_DATA_SYNC",
  "android.permission.POST_NOTIFICATIONS",
];

const withManifest = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    // permissions
    manifest.manifest["uses-permission"] = manifest.manifest["uses-permission"] || [];
    for (const name of PERMS) {
      const exists = manifest.manifest["uses-permission"].some(
        (p) => p.$["android:name"] === name
      );
      if (!exists) manifest.manifest["uses-permission"].push({ $: { "android:name": name } });
    }

    // service
    app.service = app.service || [];
    if (!app.service.some((s) => s.$["android:name"] === ".KalpxLiveActivityService")) {
      app.service.push({
        $: {
          "android:name": ".KalpxLiveActivityService",
          "android:foregroundServiceType": "dataSync",
          "android:exported": "false",
        },
      });
    }

    // receiver
    app.receiver = app.receiver || [];
    if (!app.receiver.some((r) => r.$["android:name"] === ".ChantIncrementReceiver")) {
      app.receiver.push({
        $: { "android:name": ".ChantIncrementReceiver", "android:exported": "false" },
        "intent-filter": [
          { action: [{ $: { "android:name": "com.kalpx.app.LA_INCREMENT" } }] },
        ],
      });
    }
    return config;
  });

module.exports = (config) =>
  withManifest(withRegister(withNativeFiles(config)));
