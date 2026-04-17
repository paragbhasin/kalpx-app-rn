/**
 * Deep-link handler — Phase C pilot infrastructure.
 *
 * Scheme: kalpx://mitra/<containerId>/<stateId>[?<key>=<value>&...]
 *
 * The ONE handler doubles as the contextual-return entry point:
 *   - Notification taps (evening reflection reminder, grief re-entry, etc.)
 *   - Manual testing via `xcrun simctl openurl booted "..."` / `adb shell am`
 *   - Future: push-notification deeplinks (payload signed + TTL, Phase D)
 *
 * __DEV__ gate: non-dev builds reject deeplinks. In dev, any kalpx://mitra/*
 * URL that names a container+state in the registry navigates directly.
 *
 * Query-string `?` values are merged into `screenData` via setScreenValue
 * before navigation, so callers can seed e.g. `?entered_via=notification`
 * or `?cycle_day=7` to drive variant resolution.
 */

import * as Linking from "expo-linking";

import store from "../store";
import { screenActions, loadScreenWithData } from "../store/screenSlice";
import { navigate } from "../Shared/Routes/NavigationService";

export interface ParsedMitraDeepLink {
  kind: "mitra";
  containerId: string;
  stateId: string;
  data: Record<string, string>;
}

/**
 * Parse ``kalpx://mitra/<container>/<state>?k=v`` → structured form.
 *
 * Returns null for any non-kalpx scheme or malformed URL. Parser is
 * deliberately strict so we can't be tricked into navigating to arbitrary
 * containers via crafted URLs.
 */
export function parseMitraDeepLink(url: string): ParsedMitraDeepLink | null {
  if (!url || typeof url !== "string") return null;
  if (!url.startsWith("kalpx://")) return null;

  try {
    const parsed = Linking.parse(url);
    // expo-linking gives us { scheme, hostname, path, queryParams }
    // For "kalpx://mitra/reflection_evening/reflect?x=1":
    //   hostname = "mitra"
    //   path     = "reflection_evening/reflect"
    //   queryParams = { x: "1" }
    if (parsed.scheme !== "kalpx") return null;
    if (parsed.hostname !== "mitra") return null;
    const path = parsed.path || "";
    const parts = path.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const [containerId, stateId] = parts;
    if (!containerId || !stateId) return null;

    const data: Record<string, string> = {};
    const qp = parsed.queryParams || {};
    Object.keys(qp).forEach((k) => {
      const v = (qp as any)[k];
      if (typeof v === "string") data[k] = v;
      else if (Array.isArray(v) && typeof v[0] === "string") data[k] = v[0];
    });
    return { kind: "mitra", containerId, stateId, data };
  } catch {
    return null;
  }
}

/**
 * Handle a resolved deeplink — seeds screenData, navigates to MitraEngine,
 * and dispatches the screen load. No-ops when the URL doesn't match.
 */
export function handleMitraDeepLink(url: string | null | undefined): boolean {
  if (!url) return false;
  if (!__DEV__) {
    // Phase C pilot: dev-only. Phase D adds signed/TTL payload + prod routing.
    console.warn("[deeplink] non-dev build; ignoring", url);
    return false;
  }
  const parsed = parseMitraDeepLink(url);
  if (!parsed) return false;

  // Seed screenData with any query-string context before the container
  // mounts, so block-level on-mount effects see the data.
  Object.entries(parsed.data).forEach(([key, value]) => {
    store.dispatch(
      screenActions.setScreenValue({
        key,
        value,
      }),
    );
  });

  // MitraEngine is the generic server-driven screen host. Navigate THEN
  // dispatch load — the thunk resolves the schema from
  // allContainers.js via screenResolver when the API is offline.
  try {
    navigate("MitraEngine");
  } catch (err) {
    console.warn("[deeplink] navigate failed:", err);
  }
  store.dispatch(
    loadScreenWithData({
      containerId: parsed.containerId,
      stateId: parsed.stateId,
    }) as any,
  );
  console.log(
    `[deeplink] → MitraEngine: ${parsed.containerId}/${parsed.stateId}`,
    parsed.data,
  );
  return true;
}

/**
 * Install the Linking listeners. Returns a cleanup function. Call once
 * at app boot.
 */
export function attachDeepLinkListeners(): () => void {
  const onUrl = (event: { url: string } | string | null | undefined) => {
    const url = typeof event === "string" ? event : event?.url;
    handleMitraDeepLink(url);
  };

  // Cold-start: app opened via deeplink while not yet running.
  Linking.getInitialURL()
    .then((url) => {
      if (url) onUrl(url);
    })
    .catch((err) => console.warn("[deeplink] getInitialURL failed:", err));

  // Warm-start: app already running; user tapped another deeplink.
  const sub = Linking.addEventListener("url", onUrl);
  return () => {
    try {
      sub?.remove?.();
    } catch {
      /* noop */
    }
  };
}
