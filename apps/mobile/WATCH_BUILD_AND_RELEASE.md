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

## 3. BLOCKER B — How the watch app reaches users (separate Wear-track upload)

The phone (`com.kalpx.app`) and watch (`com.kalpx.app.wear`) have **different package names**, so the legacy "embed inside the phone APK" model (`wearApp project(':wear')`) does **not** apply — that requires the same package and is deprecated anyway.

**Correct path: build the watch APK separately and upload it to the Play Console Wear OS track** of the same app listing. Phone and watch are two artifacts:
- Phone: `./gradlew :app:bundleRelease` → upload AAB to the phone track.
- Watch: `./gradlew :wear:assembleRelease` → sign it → upload the APK to the **Wear OS track**.

Notes:
- The watch app keeps `standalone = false` (it genuinely needs the phone for data — it shows "Open KalpX on phone" with no data). That's fine; a non-standalone wear app is still distributed via its own Wear-track APK.
- The `:wear` module has **no release signing config** yet — `:wear:assembleRelease` currently produces `wear-release-unsigned.apk`. It must be signed with the release key (same Play App Signing setup as the phone) before upload.
- Give the `:wear` module a real `versionCode`/`versionName` bump per release (currently `versionCode 1`).

Until the watch APK is signed and uploaded to the Wear track, **the watch app cannot reach real users**, independent of the sync code being correct.

---

## 4. Dev-only emulator relay — ALREADY GUARDED ✅ (verified)

Wear pairing does not work between emulators (see `project-wear-emulator-pairing-deadend`), so a dev relay carries the payload for emulator testing. It is now **guarded to debug builds only** — verified absent from the release APK (manifest AND dex):

1. **Watch receiver** — `RelaySyncReceiver.kt` lives in `apps/mobile/android/wear/src/**debug**/java/...` and is registered only in `apps/mobile/android/wear/src/debug/AndroidManifest.xml`. Release builds contain neither the class nor the receiver.
2. **Phone JS taps** — the two `console.log('[WATCH_RELAY_*]')` lines in `apps/mobile/src/native/watchConnectivity.ts` are wrapped in `if (__DEV__) { ... }`, so they're stripped from release JS bundles.
3. **Host script** — `scripts/watch-relay.sh` (dev tool; never runs in prod).

No action needed here for release. To re-test on emulators, build/install the **debug** wear APK and run the relay script (section 6).

Verification command (re-run anytime):
```bash
cd apps/mobile/android && ./gradlew :wear:assembleRelease
aapt2 dump xmltree --file AndroidManifest.xml wear/build/outputs/apk/release/wear-release-unsigned.apk | grep -i RelaySync   # expect: nothing
```

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
