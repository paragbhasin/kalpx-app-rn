---
description: Build and deploy Android and iOS apps using EAS or manual local builds
---

# Kalpx App Deployment Guide

## Prerequisites
- Node.js 18+
- Xcode 15+ (for iOS)
- Android Studio with SDK (for Android)
- EAS CLI: `npm install -g eas-cli`
- Logged into EAS: `eas login`

---

## 🤖 ANDROID BUILDS

### Option 1: EAS Build (Recommended)

```bash
# Preview APK (for testing)
eas build --platform android --profile preview

# Production AAB (for Play Store)
eas build --platform android --profile production
```

### Option 2: Local Build

```bash
# Set Android SDK path
export ANDROID_HOME=$HOME/Library/Android/sdk

# Navigate to android folder
cd android

# Clean previous build
./gradlew clean

# Build release APK
./gradlew assembleRelease

# OR build release AAB for Play Store
./gradlew bundleRelease
```

**Output locations:**
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🍎 iOS BUILDS

### Option 1: EAS Build (Recommended)

```bash
# Preview IPA (for device testing)
eas build --platform ios --profile preview

# Production (for App Store)
eas build --platform ios --profile production
```

### Option 2: Local Build via Xcode

```bash
# Install pods
cd ios && pod install && cd ..

# Open in Xcode
open ios/kalpx.xcworkspace
```

**In Xcode:**
1. Select **Product → Scheme → kalpx**
2. Select **Any iOS Device (arm64)** as destination
3. **Product → Archive**
4. Once complete, click **Distribute App**
5. Select **App Store Connect** or **Ad Hoc**

---

## 🚀 SUBMITTING TO STORES

### Android (Google Play)

**Via EAS:**
```bash
eas submit --platform android --profile production
```

**Manual:**
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app → **Release → Production**
3. Upload the `.aab` file

### iOS (App Store)

**Via EAS:**
```bash
eas submit --platform ios --profile production
```

**Manual via Transporter:**
1. Download [Transporter](https://apps.apple.com/app/transporter/id1450874784) from Mac App Store
2. Sign in with Apple ID
3. Drag `.ipa` file into Transporter
4. Click **Deliver**

---

## 📋 Quick Commands Reference

| Task | Command |
|------|---------|
| EAS Android Preview | `eas build -p android --profile preview` |
| EAS Android Production | `eas build -p android --profile production` |
| EAS iOS Preview | `eas build -p ios --profile preview` |
| EAS iOS Production | `eas build -p ios --profile production` |
| Local Android APK | `cd android && ./gradlew assembleRelease` |
| Local Android AAB | `cd android && ./gradlew bundleRelease` |
| Local iOS Archive | Open Xcode → Product → Archive |
| Submit Android | `eas submit -p android` |
| Submit iOS | `eas submit -p ios` |

---

## ⚠️ Before Building

1. **Update version** in `app.config.js`:
   - `version`: Display version (e.g., "1.1.21")
   - `android.versionCode`: Increment for each Play Store upload
   - `ios.buildNumber`: Increment for each App Store upload

2. **For local Android builds**, ensure `local.properties` has:
   ```
   sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
   ```

3. **For iOS builds**, ensure you have valid provisioning profiles configured in Xcode.
