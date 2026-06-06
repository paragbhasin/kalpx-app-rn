# Apple Watch App — Deploy Runbook

All commands run from `apps/mobile/ios/`. No Xcode required — everything via terminal.

**Project constants:**
- Team ID: `9G5NZ5LBRU`
- iPhone bundle: `com.kalpx.app`
- Watch bundle: `com.kalpx.app.watchkitapp`
- Watch widget bundle: `com.kalpx.app.watchkitapp.watchwidget`

---

## 1. Install on Real Device (Development)

This is the fastest path for personal testing on a physical iPhone + Watch pair.

### 1a. Find your device UDIDs

```bash
xcrun devicectl list devices
```

Or via Instruments:
```bash
instruments -s devices 2>/dev/null | grep -E "(iPhone|Watch)"
```

Note the UDID for both your iPhone and Apple Watch.

### 1b. Build for real device

```bash
xcodebuild \
  -workspace kalpx.xcworkspace \
  -scheme kalpx \
  -configuration Debug \
  -destination "id=<IPHONE_UDID>" \
  -allowProvisioningUpdates \
  -derivedDataPath /tmp/kalpx-device-build \
  build
```

This builds both the iPhone app AND the embedded Watch app together. The Watch app is bundled inside the iPhone `.app`.

### 1c. Install on iPhone (Watch app installs automatically via iPhone)

```bash
# Xcode 15+ (preferred)
xcrun devicectl device install app \
  --device <IPHONE_UDID> \
  /tmp/kalpx-device-build/Build/Products/Debug-iphoneos/kalpx.app

# Older Xcode fallback
ios-deploy --bundle /tmp/kalpx-device-build/Build/Products/Debug-iphoneos/kalpx.app \
  --id <IPHONE_UDID> --no-wifi
```

> The Watch app deploys automatically when the iPhone app installs — iOS pushes the WatchKit extension to the paired Watch.

---

## 2. TestFlight Distribution

TestFlight is the standard path for team testing. Steps: Archive → Export IPA → Upload.

### 2a. Archive the app

```bash
xcodebuild archive \
  -workspace kalpx.xcworkspace \
  -scheme kalpx \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath /tmp/kalpx.xcarchive \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM=9G5NZ5LBRU \
  CODE_SIGN_STYLE=Automatic
```

This produces `/tmp/kalpx.xcarchive` containing the signed `.app` + dSYMs.

### 2b. Export IPA for App Store / TestFlight

Create an export options plist:

```bash
cat > /tmp/ExportOptions.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store-connect</string>
    <key>teamID</key>
    <string>9G5NZ5LBRU</string>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
</dict>
</plist>
EOF
```

Then export:

```bash
xcodebuild -exportArchive \
  -archivePath /tmp/kalpx.xcarchive \
  -exportPath /tmp/kalpx-ipa \
  -exportOptionsPlist /tmp/ExportOptions.plist \
  -allowProvisioningUpdates
```

This produces `/tmp/kalpx-ipa/kalpx.ipa`.

### 2c. Upload to App Store Connect (TestFlight)

Using `xcrun altool` (Xcode 14 and below):

```bash
xcrun altool --upload-app \
  --type ios \
  --file /tmp/kalpx-ipa/kalpx.ipa \
  --apiKey <APP_STORE_CONNECT_API_KEY_ID> \
  --apiIssuer <ISSUER_ID>
```

Using `xcrun notarytool` / `xcrun altool` (Xcode 15+):

```bash
xcrun altool --upload-app \
  -f /tmp/kalpx-ipa/kalpx.ipa \
  -t ios \
  --apiKey <API_KEY_ID> \
  --apiIssuer <ISSUER_ID>
```

Or with Apple ID + app-specific password:

```bash
xcrun altool --upload-app \
  -f /tmp/kalpx-ipa/kalpx.ipa \
  -t ios \
  -u nayakpavanikalpx@gmail.com \
  -p "@keychain:AC_PASSWORD"
```

> Store the app-specific password in keychain once:
> `xcrun altool --store-password-in-keychain-item "AC_PASSWORD" -u nayakpavanikalpx@gmail.com -p <app-specific-password>`

After upload, the build appears in App Store Connect → TestFlight within ~10 min.

---

## 3. Watch App — How It Deploys

The Watch app is **NOT uploaded separately** to App Store Connect. It is embedded inside the iPhone `.ipa`:

```
kalpx.ipa
└── kalpx.app
    └── Watch/
        └── KalpxWatch.app          ← Watch app
            └── PlugIns/
                └── KalpxWatchWidgetExtension.appex  ← Watch complications
```

When the user installs the iPhone app from TestFlight / App Store, iOS automatically pushes the Watch app to their paired Apple Watch. No separate Watch submission needed.

---

## 4. App Store Release

Same as TestFlight — same archive, same IPA — just change the export method and promote the build in App Store Connect.

For a direct App Store upload (skipping TestFlight):

```bash
cat > /tmp/ExportOptions-AppStore.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store-connect</string>
    <key>teamID</key>
    <string>9G5NZ5LBRU</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
EOF
```

Then archive + export + upload as above.

---

## 5. One-Shot Deploy Script (Device Testing)

Save as `scripts/deploy-watch-device.sh` and run from `apps/mobile/ios/`:

```bash
#!/bin/bash
set -e

IPHONE_UDID="${1:?Usage: $0 <IPHONE_UDID>}"
BUILD_DIR=/tmp/kalpx-device-build

echo "→ Building for device $IPHONE_UDID..."
xcodebuild \
  -workspace kalpx.xcworkspace \
  -scheme kalpx \
  -configuration Debug \
  -destination "id=$IPHONE_UDID" \
  -allowProvisioningUpdates \
  -derivedDataPath "$BUILD_DIR" \
  build 2>&1 | grep -E "(error:|BUILD SUCCEEDED|BUILD FAILED)"

APP_PATH=$(find "$BUILD_DIR/Build/Products/Debug-iphoneos" -name "kalpx.app" | head -1)
echo "→ Installing $APP_PATH..."
xcrun devicectl device install app --device "$IPHONE_UDID" "$APP_PATH"

echo "✓ Installed. Watch app will sync to paired Watch automatically."
```

Usage:
```bash
bash scripts/deploy-watch-device.sh <IPHONE_UDID>
```

---

## 6. One-Shot Archive + Upload Script (TestFlight)

```bash
#!/bin/bash
set -e

echo "→ Archiving..."
xcodebuild archive \
  -workspace kalpx.xcworkspace \
  -scheme kalpx \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath /tmp/kalpx.xcarchive \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM=9G5NZ5LBRU

echo "→ Exporting IPA..."
xcodebuild -exportArchive \
  -archivePath /tmp/kalpx.xcarchive \
  -exportPath /tmp/kalpx-ipa \
  -exportOptionsPlist /tmp/ExportOptions.plist \
  -allowProvisioningUpdates

echo "→ Uploading to TestFlight..."
xcrun altool --upload-app \
  -f /tmp/kalpx-ipa/kalpx.ipa \
  -t ios \
  -u nayakpavanikalpx@gmail.com \
  -p "@keychain:AC_PASSWORD"

echo "✓ Upload complete. Check App Store Connect in ~10 min."
```

---

## 7. Troubleshooting

**"No signing certificate found"**
```bash
# List available identities
security find-identity -v -p codesigning
# Make sure the Apple Development cert for team 9G5NZ5LBRU is present
```

**"Provisioning profile doesn't include the Watch bundle ID"**
→ Run `xcodebuild ... -allowProvisioningUpdates` — Xcode auto-creates/updates profiles for all targets including Watch + Watch widget.

**"Watch app not appearing on Watch after install"**
→ Open the Watch app on iPhone → My Watch tab → scroll down to find KalpX → toggle "Show App on Apple Watch".

**"WCSession not connecting on real device"**
→ Both iPhone and Watch must have the app open at least once. Check iPhone app has Bluetooth + WiFi on. Watch must be unlocked.

**Build fails on Watch widget target**
→ Check `[CP-User] [RNFB] Core Configuration` build phase has `alwaysOutOfDate = 1` and cleared `inputPaths` (already done in this project — see pbxproj).
