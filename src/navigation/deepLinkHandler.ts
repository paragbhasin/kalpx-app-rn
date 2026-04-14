/**
 * deepLinkHandler — DEV-ONLY direct navigation into any Mitra engine surface.
 *
 * Accepts URL pattern:
 *   kalpx://mitra/<container_id>/<state_id>[?data=<urlenc-json>]
 *
 * Dispatches `screenActions.loadScreen({containerId, stateId})` which the
 * existing engine routes through the normal container/state pipeline — same
 * path as any in-app `loadScreen()` call, so there is no new code path to
 * validate. Optional `?data=<urlenc-json>` hydrates `screen.screenData`
 * before the load so blocks that read from screenState have their seeds.
 *
 * Guardrails:
 *   - ``__DEV__`` guard — no-op in release builds by construction.
 *   - Second guard flag ``MITRA_DEV_DEEP_LINKS`` (AsyncStorage) — set "0"
 *     to disable at runtime even in __DEV__.
 *   - Only dispatches for ``kalpx://mitra/...``; other schemes are ignored.
 *   - Malformed URLs log a console warning and no-op; never throw.
 *
 * Use (from macOS host):
 *   xcrun simctl openurl <UDID> "kalpx://mitra/companion_dashboard/day_active"
 *   xcrun simctl openurl <UDID> "kalpx://mitra/practice_runner/mantra_runner"
 *   xcrun simctl openurl <UDID> "kalpx://mitra/support_grief/room"
 *
 * This is purely a testing / validation shortcut. Prod builds are unaffected.
 */

import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "../store";
import { screenActions } from "../store/screenSlice";

let _registered = false;
let _subscription: { remove: () => void } | null = null;

const DEV_FLAG_KEY = "MITRA_DEV_DEEP_LINKS";
const URL_PATTERN = /^kalpx:\/\/mitra\/([^/?#]+)\/([^/?#]+)/;

async function _runtimeEnabled(): Promise<boolean> {
  if (!__DEV__) return false;
  try {
    const v = await AsyncStorage.getItem(DEV_FLAG_KEY);
    // Default: ON when __DEV__. Set "0" to disable explicitly.
    return v !== "0";
  } catch {
    return true;
  }
}

function _parse(url: string): { container: string; state: string; dataJson?: string } | null {
  const m = url.match(URL_PATTERN);
  if (!m) return null;
  const [, container, stateRaw] = m;
  const qIdx = stateRaw.indexOf("?");
  const state = qIdx >= 0 ? stateRaw.slice(0, qIdx) : stateRaw;
  let dataJson: string | undefined;
  const qIdxFull = url.indexOf("?");
  if (qIdxFull >= 0) {
    const params = new URLSearchParams(url.slice(qIdxFull + 1));
    const raw = params.get("data");
    if (raw) dataJson = decodeURIComponent(raw);
  }
  return { container, state, dataJson };
}

function _handle(url: string | null | undefined) {
  if (!url) return;
  const parsed = _parse(url);
  if (!parsed) {
    if (url.startsWith("kalpx://mitra/")) {
      console.warn("[deepLinkHandler] malformed mitra URL:", url);
    }
    return;
  }
  const { container, state, dataJson } = parsed;
  try {
    if (dataJson) {
      const data = JSON.parse(dataJson);
      if (data && typeof data === "object") {
        store.dispatch(screenActions.updateScreenData(data));
      }
    }
    store.dispatch(
      screenActions.loadScreen({
        containerId: container,
        stateId: state,
      }),
    );
    if (__DEV__) {
      console.log(`[deepLinkHandler] → ${container}/${state}`);
    }
  } catch (err) {
    console.warn("[deepLinkHandler] dispatch failed:", err);
  }
}

export async function initDeepLinkHandler(): Promise<void> {
  if (_registered) return;
  const enabled = await _runtimeEnabled();
  if (!enabled) {
    if (__DEV__) console.log("[deepLinkHandler] disabled (flag or not __DEV__)");
    return;
  }

  // Cold-start URL (if app was launched via a deep link)
  try {
    const initial = await Linking.getInitialURL();
    _handle(initial);
  } catch {
    // ignore
  }

  // Subsequent URLs while app is running
  _subscription = Linking.addEventListener("url", (ev) => _handle(ev?.url));
  _registered = true;
  if (__DEV__) {
    console.log(
      "[deepLinkHandler] registered — kalpx://mitra/<container>/<state>",
    );
  }
}

export function teardownDeepLinkHandler(): void {
  if (_subscription?.remove) _subscription.remove();
  _subscription = null;
  _registered = false;
}

export default initDeepLinkHandler;
