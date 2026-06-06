# Apple Watch Simulator — Setup & Run Runbook

How to pair, build, and run the KalpX Watch app on simulator. All commands run from `apps/mobile/ios/`.

---

## 1. Check Available Simulators

```bash
xcrun simctl list devices | grep -E "(iPhone|Watch)" | grep -v unavailable
```

You need one iPhone and one Apple Watch. Note their UDIDs.

**Current pairing in use:**
- iPhone 16 Pro → `93383AB2-3B50-41E2-9785-733A7FAF006C`
- Apple Watch Series 11 (46mm) → `6875317B-F6B8-40F1-AB03-2CCEDB071A99`

---

## 2. Boot Both Simulators

```bash
# Boot iPhone
xcrun simctl boot 93383AB2-3B50-41E2-9785-733A7FAF006C

# Boot Watch
xcrun simctl boot 6875317B-F6B8-40F1-AB03-2CCEDB071A99
```

Then open Simulator.app so the screens are visible:

```bash
open -a Simulator
```

---

## 3. Pair iPhone + Watch (if not already paired)

Check existing pairs first:

```bash
xcrun simctl list pairs
```

If they're already paired and connected (active, connected) — skip this step.

To create a new pair:

```bash
xcrun simctl pair <WATCH_UDID> <IPHONE_UDID>
```

Example:

```bash
xcrun simctl pair 6875317B-F6B8-40F1-AB03-2CCEDB071A99 93383AB2-3B50-41E2-9785-733A7FAF006C
```

---

## 4. Build the Watch App

From `apps/mobile/ios/`:

```bash
xcodebuild \
  -workspace kalpx.xcworkspace \
  -scheme KalpxWatch \
  -configuration Debug \
  -destination "id=6875317B-F6B8-40F1-AB03-2CCEDB071A99" \
  -derivedDataPath /tmp/kalpx-watch-build \
  build
```

Build output goes to `/tmp/kalpx-watch-build/Build/Products/Debug-watchsimulator/KalpxWatch.app`.

To see only errors / success line:

```bash
xcodebuild ... build 2>&1 | grep -E "(error:|BUILD SUCCEEDED|BUILD FAILED)"
```

---

## 5. Install on Watch Simulator

```bash
APP_PATH=$(find /tmp/kalpx-watch-build/Build/Products/Debug-watchsimulator -name "KalpxWatch.app" | head -1)
xcrun simctl install 6875317B-F6B8-40F1-AB03-2CCEDB071A99 "$APP_PATH"
```

---

## 6. Launch the Watch App

```bash
xcrun simctl launch 6875317B-F6B8-40F1-AB03-2CCEDB071A99 com.kalpx.app.watchkitapp
```

---

## 7. Build + Install + Launch (one-liner)

```bash
APP_PATH=$(find /tmp/kalpx-watch-build/Build/Products/Debug-watchsimulator -name "KalpxWatch.app" | head -1) \
  && xcrun simctl install 6875317B-F6B8-40F1-AB03-2CCEDB071A99 "$APP_PATH" \
  && xcrun simctl launch 6875317B-F6B8-40F1-AB03-2CCEDB071A99 com.kalpx.app.watchkitapp
```

---

## 8. View Watch Logs (for debugging)

```bash
xcrun simctl spawn 6875317B-F6B8-40F1-AB03-2CCEDB071A99 log stream \
  --predicate 'subsystem contains "kalpx"' \
  --level debug
```

Or broader (all app logs):

```bash
xcrun simctl spawn 6875317B-F6B8-40F1-AB03-2CCEDB071A99 log stream --level debug \
  | grep -i kalpx
```

---

## 9. Build the iPhone App (when native changes are made)

From `apps/mobile/ios/`:

```bash
xcodebuild \
  -workspace kalpx.xcworkspace \
  -scheme kalpx \
  -configuration Debug \
  -destination "id=93383AB2-3B50-41E2-9785-733A7FAF006C" \
  -derivedDataPath /tmp/kalpx-iphone-build \
  build
```

Install iPhone app:

```bash
APP_PATH=$(find /tmp/kalpx-iphone-build/Build/Products/Debug-iphonesimulator -name "kalpx.app" | head -1)
xcrun simctl install 93383AB2-3B50-41E2-9785-733A7FAF006C "$APP_PATH"
xcrun simctl launch 93383AB2-3B50-41E2-9785-733A7FAF006C com.kalpx.app
```

---

## Known Simulator Limitations

| Feature | Simulator | Real Device |
|---|---|---|
| WCSession `sendMessage` | Works when both apps open | Works always |
| WCSession `applicationContext` | Works | Works |
| App Group shared container | **NOT shared** (separate containers) | Shared |
| Watch complications | Won't update | Works |

**Critical:** iPhone Simulator and Watch Simulator have **separate app group containers**. Data written by iPhone to the app group is NOT readable by the Watch on simulator. Only WCSession channels work on simulator. On real device everything works.

This means: stats, path data, mantra data only flow Watch ↔ iPhone via WCSession on simulator. The Watch must have a live WCSession connection to receive data.

---

## Troubleshooting

**Watch shows "Open KalpX on iPhone to begin" / no data**
→ WCSession not delivering data. Open iPhone app first, let homeData load, then open Watch app.

**Build fails: "Build input file cannot be found: .../QuickResetPromptView.swift"**
→ File path wrong in pbxproj. Run the pbxproj path-fix Ruby script.

**SourceKit errors in editor (Cannot find type 'WatchJapaEngine' in scope)**
→ These are IDE cross-reference errors, NOT real build errors. `xcodebuild` still succeeds. Ignore them.

**Watch app crashes on launch**
→ Check for `NSNull` in any WCSession payload. Always call `stripNulls()` before `sendMessage` / `updateApplicationContext`. `NSNull` causes `WCErrorCodePayloadUnsupportedTypes`.
