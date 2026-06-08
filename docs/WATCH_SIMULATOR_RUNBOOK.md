# Apple Watch Simulator — Runbook

> Written for Claude to execute directly on any machine.
> All build commands run from `apps/mobile/ios/`.
> **Xcode.app never needs to open.** Everything is terminal-only.
> The only GUI that opens is `Simulator.app` (standalone — not Xcode) to see the screens.

---

## Step 0 — Discover Simulators on This Machine

Run this first every session. Sets UDID variables used in all subsequent steps.

```bash
# List available iPhones and Watches
xcrun simctl list devices available | grep -E "(iPhone|Watch)" | grep -v unavailable
```

Pick one iPhone and one Apple Watch from the output. Then set variables:

```bash
IPHONE_UDID=$(xcrun simctl list devices available | grep "iPhone" | grep -v unavailable | grep -oE '[A-F0-9-]{36}' | head -1)
WATCH_UDID=$(xcrun simctl list devices available | grep "Apple Watch" | grep -v unavailable | grep -oE '[A-F0-9-]{36}' | head -1)

echo "iPhone: $IPHONE_UDID"
echo "Watch:  $WATCH_UDID"
```

> If the machine has multiple iPhones or Watches and you want a specific one, replace `head -1` with `grep "iPhone 16 Pro"` or similar to target the right model.

---

## Step 1 — Check What Is Already Booted

```bash
xcrun simctl list devices | grep -E "(iPhone|Watch)" | grep Booted
xcrun simctl list pairs
```

If both simulators show `Booted` and the pair shows `(active, connected)` → skip to Step 3.

---

## Step 2 — Boot Simulators (if not already booted)

```bash
xcrun simctl boot $IPHONE_UDID
xcrun simctl boot $WATCH_UDID
```

Open Simulator.app to see the screens (this is NOT Xcode):

```bash
open -a Simulator
```

---

## Step 3 — Pair iPhone + Watch (if no active pair)

Check first:

```bash
xcrun simctl list pairs
```

If it shows `(active, connected)` → skip this step.

If no pair exists, create one:

```bash
xcrun simctl pair $WATCH_UDID $IPHONE_UDID
```

If a pair exists but shows `(disconnected)`, unpair and re-pair:

```bash
# Get the pair ID from the list pairs output, then:
PAIR_ID=$(xcrun simctl list pairs | grep -oE '[A-F0-9-]{36}' | head -1)
xcrun simctl unpair $PAIR_ID
xcrun simctl pair $WATCH_UDID $IPHONE_UDID
```

Verify:

```bash
xcrun simctl list pairs
# Should show (active, connected)
```

---

## Step 4 — Build the Watch App

From `apps/mobile/ios/`:

```bash
xcodebuild \
  -workspace kalpx.xcworkspace \
  -scheme KalpxWatch \
  -configuration Debug \
  -destination "id=$WATCH_UDID" \
  -derivedDataPath /tmp/kalpx-watch-build \
  build 2>&1 | grep -E "(error:|BUILD SUCCEEDED|BUILD FAILED)"
```

---

## Step 5 — Install + Launch Watch App

```bash
APP_PATH=$(find /tmp/kalpx-watch-build/Build/Products/Debug-watchsimulator -name "KalpxWatch.app" | head -1) \
  && xcrun simctl install $WATCH_UDID "$APP_PATH" \
  && xcrun simctl launch $WATCH_UDID com.kalpx.app.watchkitapp \
  && echo "Watch app launched"
```

---

## Step 6 — Build + Install iPhone App (when iOS native files change)

Only needed when Swift/Obj-C files on the iPhone side change. Watch-only changes don't need this.

```bash
xcodebuild \
  -workspace kalpx.xcworkspace \
  -scheme kalpx \
  -configuration Debug \
  -destination "id=$IPHONE_UDID" \
  -derivedDataPath /tmp/kalpx-iphone-build \
  build 2>&1 | grep -E "(error:|BUILD SUCCEEDED|BUILD FAILED)"
```

Install:

```bash
APP_PATH=$(find /tmp/kalpx-iphone-build/Build/Products/Debug-iphonesimulator -name "kalpx.app" | head -1) \
  && xcrun simctl install $IPHONE_UDID "$APP_PATH" \
  && xcrun simctl launch $IPHONE_UDID com.kalpx.app \
  && echo "iPhone app launched"
```

---

## Full Session — One Flow (Watch changes only)

Copy-paste this entire block for a clean start:

```bash
# Set UDIDs
IPHONE_UDID=$(xcrun simctl list devices available | grep "iPhone" | grep -v unavailable | grep -oE '[A-F0-9-]{36}' | head -1)
WATCH_UDID=$(xcrun simctl list devices available | grep "Apple Watch" | grep -v unavailable | grep -oE '[A-F0-9-]{36}' | head -1)
echo "iPhone: $IPHONE_UDID  Watch: $WATCH_UDID"

# Boot (safe to run even if already booted — errors are harmless)
xcrun simctl boot $IPHONE_UDID 2>/dev/null || true
xcrun simctl boot $WATCH_UDID 2>/dev/null || true
open -a Simulator

# Pair if needed
xcrun simctl list pairs | grep -q "active, connected" || xcrun simctl pair $WATCH_UDID $IPHONE_UDID

# Build Watch
xcodebuild \
  -workspace kalpx.xcworkspace \
  -scheme KalpxWatch \
  -configuration Debug \
  -destination "id=$WATCH_UDID" \
  -derivedDataPath /tmp/kalpx-watch-build \
  build 2>&1 | grep -E "(error:|BUILD SUCCEEDED|BUILD FAILED)"

# Install + launch Watch
APP_PATH=$(find /tmp/kalpx-watch-build/Build/Products/Debug-watchsimulator -name "KalpxWatch.app" | head -1) \
  && xcrun simctl install $WATCH_UDID "$APP_PATH" \
  && xcrun simctl launch $WATCH_UDID com.kalpx.app.watchkitapp \
  && echo "Done"
```

---

## View Logs (for debugging)

```bash
# Watch logs
xcrun simctl spawn $WATCH_UDID log stream \
  --level debug 2>/dev/null | grep -i "kalpx\|WatchPath\|WatchMantra\|japa"

# iPhone logs
xcrun simctl spawn $IPHONE_UDID log stream \
  --level debug 2>/dev/null | grep -i "kalpx\|WatchPath\|WatchMantra\|japa"
```

---

## Simulator Limitations (Critical)

| Feature | Simulator behaviour |
|---|---|
| App group shared container | **NOT shared** — iPhone sim writes ≠ Watch sim reads |
| WCSession `sendMessage` | Works when both apps are open |
| WCSession `applicationContext` | Works (delivered on activation) |
| Watch complications | Don't update |
| Watch haptics | Silent (no physical taptic engine) |

Because app groups aren't shared on simulator, **WCSession is the only data channel**. Open the iPhone app first, let it load homeData, then open the Watch app — data flows via `applicationContext`.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `boot` fails with "Unable to boot" | `xcrun simctl shutdown $UDID` then boot again |
| `IPHONE_UDID` / `WATCH_UDID` is empty | No matching simulator found. Run `xcrun simctl list devices available` and check model names match the grep pattern |
| Build fails: "Build input file cannot be found" | New `.swift` file added with wrong path in pbxproj. Fix with the Ruby pbxproj path-fix script |
| SourceKit errors in editor (Cannot find type X) | IDE cross-reference noise — real builds succeed, ignore |
| Watch shows "Open KalpX on iPhone" | Open iPhone app, let homeData load, Watch receives data via WCSession |
| App crash on launch (NSNull / WCSession) | `stripNulls()` missing before WCSession call — check `WatchConnectivityManager.swift` |
| Pair shows disconnected | Run `xcrun simctl unpair $PAIR_ID` then `xcrun simctl pair $WATCH_UDID $IPHONE_UDID` |
