# KalpX Watch — Build & Release Guide

**READ THIS BEFORE SUBMITTING ANY BUILD that should include the Wear OS watch app or phone↔watch sync.**

The watch app and its sync are **hand-written native code** that standard Expo/EAS cloud builds will silently drop. If you skip this guide, the shipped app will have **no watch app and no working sync**, and you won't get an error — it just won't work on real devices.

---

## 1. What the watch feature consists of

| Piece | Path | Purpose |
|-------|------|---------|
| Wear OS app (whole Gradle module) | `apps/mobile/android/wear/` | The watch UI (14 screens), built as `:wear` |
| Phone → watch sender (native module) | `apps/mobile/android/app/src/main/java/com/kalpx/app/KalpxWatchConnectivityModule.kt` | Pushes data via Wearable **DataClient** |
| Phone ← watch receiver | `apps/mobile/android/app/.../KalpxWearListenerService.kt` | Receives messages from the watch |
| Watch receiver (real sync) | `apps/mobile/android/wear/.../sync/WearDataListenerService.kt` | `onDataChanged` → writes to watch storage |
| Watch state store | `apps/mobile/android/wear/.../sync/WearConnectivityManager.kt` | Holds `mantras` + `pathData`, drives the UI |
| JS bridge | `apps/mobile/src/native/watchConnectivity.ts` | Calls `pushPathDataViaContext` / `pushMantrasViaContext` |

### Data contract (phone and watch agree only on this)
- Data Layer paths: `/kalpx/path_data`, `/kalpx/mantras` (persistent via DataClient), `/kalpx/message` (live).
- Watch storage: SharedPreferences file `kalpx_wear_sync`, keys `kalpx_watch_path_data` + `kalpx_watch_mantras`.
- The phone reduces its full state to this payload; the watch renders it its own way. Different UIs are fine — only the payload matters.

**The sync code is verified correct end-to-end.** It works IF the native modules are actually in the shipped binary AND the devices are paired (real Bluetooth pairing on hardware).

---

## 2. BLOCKER A — EAS cloud build strips the native code

**Symptom:** A cloud EAS build (`eas build`) runs `expo prebuild`, which **regenerates `android/` from scratch** and drops the `:wear` module + `KalpxWatchConnectivityModule`. Proven from shipped APK bytecode — the watch app and sender were absent. No build error is shown.

**Fix — build the release LOCALLY (do not use cloud EAS prebuild for the shipping build):**
```bash
cd apps/mobile/android
# AAB for Play Store:
./gradlew :app:bundleRelease
# or APK:
./gradlew :app:assembleRelease
```
This uses the committed `android/` directory as-is, keeping all native code. Upload the AAB to Play Console manually.

> If cloud EAS is a hard requirement, the only alternative is writing **Expo config plugins** that re-inject the entire `:wear` Gradle module + the native module + manifest entries on every prebuild. This is a large amount of work (a full Compose Gradle module expressed as a plugin) and is not currently set up.

Note: building locally needs node on PATH — see `project-android-studio-node-path` / launch Android Studio or run gradle from a shell that has node. NDK `source.properties` at `~/Library/Android/sdk/ndk/27.1.12297006/` must exist (a disk cleanup has removed it before).

---

## 3. BLOCKER B — The watch app is NOT bundled into the phone build

**As of this writing there is NO `wearApp project(':wear')` in `apps/mobile/android/app/build.gradle`.** The `:wear` module builds a separate `wear-debug.apk` that has only ever been installed **manually via adb** during testing. Nothing ships it to users' watches. The watch manifest also has `com.google.android.wearable.standalone = false`.

**You must pick a distribution model and wire it up before release:**

- **Standalone (recommended, modern):** set the watch app `standalone = true`, give it its own `versionCode`, and publish the watch APK to the Play Store **Wear OS track** under the same app. Phone & watch install independently. This is the Google-supported path.
- **Embedded (legacy):** add `wearApp project(':wear')` to `app/build.gradle` so the watch APK is packaged inside the phone APK. Deprecated by Google — likely rejected for new Play submissions. Only viable for sideloaded/internal builds.

Until one of these is done, **the watch app cannot reach real users at all**, independent of the sync code being correct.

---

## 4. REMOVE / GUARD the dev-only emulator relay before release

Wear pairing does **not** work between emulators (the new Google Pixel Watch companion app won't enter "Pair with emulator" mode — see `project-wear-emulator-pairing-deadend`). To test sync on emulators, a dev relay was added. **These must NOT ship in a production build:**

1. **Watch receiver** — `apps/mobile/android/wear/.../sync/RelaySyncReceiver.kt` and its `<receiver android:name=".sync.RelaySyncReceiver" android:exported="true">` entry in `apps/mobile/android/wear/src/main/AndroidManifest.xml`. It's an exported broadcast injection point.
2. **Phone JS taps** — the two `console.log('[WATCH_RELAY_PATH]'/'[WATCH_RELAY_MANTRAS]', ...)` lines in `apps/mobile/src/native/watchConnectivity.ts`. They dump the payload to device logs.
3. **Host script** — `scripts/watch-relay.sh` (dev tool only; harmless to keep in repo, never runs in prod).

**Before a release build:** either delete #1 and #2, or guard them to debug builds (`BuildConfig.DEBUG` on the receiver registration / `if (__DEV__)` around the console.logs). Re-add for emulator testing afterward.

---

## 5. Release checklist (do in order)

1. [ ] Remove/guard the dev relay artifacts (section 4).
2. [ ] Decide & wire distribution model — standalone watch app, or `wearApp` embed (section 3).
3. [ ] Confirm NDK `source.properties` exists and node is on PATH for the local build (section 2).
4. [ ] Build the release **locally**: `cd apps/mobile/android && ./gradlew :app:bundleRelease` (and `:wear:assembleRelease` if standalone).
5. [ ] **Verify the artifact actually contains the native code** — unzip the AAB/APK and confirm `KalpxWatchConnectivityModule` (phone) and the wear app are present. (A correct-but-absent module is the whole failure mode here.)
6. [ ] On a **real** paired phone + Wear OS watch: log in on phone → confirm the watch receives data (Inner Path / mantras / stats update). Emulators cannot verify this — pairing is unavailable there.
7. [ ] Upload to Play Console (phone AAB; watch APK to the Wear track if standalone).

---

## 6. Emulator testing (no real watch needed)

Use the dev relay — it carries the **exact same payload** the real Data Layer would, so it faithfully exercises the watch UI:
```bash
./scripts/watch-relay.sh <phone-serial> <watch-serial>   # e.g. emulator-5556 emulator-5554
```
Leave it running; change something on the phone → the watch updates in ~1s. See `project-wear-emulator-pairing-deadend` for the full mechanism and the static data-mirror fallback.
