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
 * Gate 3: deeplinks active in all builds. Any kalpx://mitra/*
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

// Direct-route containers: navigate to a named HomeStack screen instead of
// MitraEngine. These screens handle their own data loading; no screenData
// seeding or loadScreenWithData dispatch is needed.
const DIRECT_ROUTE_CONTAINERS: Record<string, string> = {
  quick_reset: "QuickReset",
  tell_mitra: "TellMitra",
  inner_path: "InnerPath",
  rhythm_home: "RhythmHome",
  quick_checkin: "QuickCheckin",
  browse_rooms: "BrowseRooms",
  quick_chant: "QuickReset",
};

// Safe room IDs that may be routed to RoomContainer via deeplink.
// room_release is explicitly blocked — it is a backend release placeholder,
// not a real room. Any room_id not in this list routes to Four Door Home.
const SAFE_ROOM_IDS = new Set([
  "room_stillness",
  "room_clarity",
  "room_growth",
  "room_connection",
  "room_joy",
]);

// Rhythm slot values accepted for rhythm_home deeplinks.
const VALID_RHYTHM_SLOTS = new Set(["morning", "afternoon", "night"]);

// Inner path checkpoint values accepted for inner_path deeplinks.
const VALID_CHECKPOINTS = new Set(["day7", "day14"]);

// Four Door Home screen name — navigated to as a fallback for blocked routes.
const FOUR_DOOR_HOME = "FourDoorHome";

/**
 * Handle a resolved deeplink — seeds screenData, navigates to MitraEngine,
 * and dispatches the screen load. No-ops when the URL doesn't match.
 *
 * Direct-route containers (quick_reset, tell_mitra, inner_path, rhythm_home,
 * quick_checkin, browse_rooms) navigate straight to the registered screen;
 * back from them returns to Four Door Home, not AppDrawer.
 *
 * Special handling:
 *   - containerId "room": stateId is the room_id. Blocked if stateId is
 *     "room_release" or not in SAFE_ROOM_IDS — routes to Four Door Home.
 *   - containerId "rhythm_home": stateId is the slot (morning/afternoon/night).
 *   - containerId "inner_path": stateId is the checkpoint key (day7_checkpoint, etc.).
 */
export function handleMitraDeepLink(url: string | null | undefined): boolean {
  if (!url) return false;
  const parsed = parseMitraDeepLink(url);
  if (!parsed) return false;

  // ── room/{room_id} deeplink ──────────────────────────────────────────────
  if (parsed.containerId === "room") {
    const roomId = parsed.stateId;
    // BLOCK: room_release is a backend placeholder, never a real room.
    // Also block any room_id not in the safe list.
    if (roomId === "room_release" || !SAFE_ROOM_IDS.has(roomId)) {
      console.warn(`[deeplink] room_id "${roomId}" blocked — routing to Four Door Home`);
      try {
        navigate(FOUR_DOOR_HOME);
      } catch (err) {
        console.warn("[deeplink] navigate to FourDoorHome failed:", err);
      }
      return true;
    }
    // Seed room_id into screenData then load the room container.
    store.dispatch(screenActions.setScreenValue({ key: "room_id", value: roomId }));
    Object.entries(parsed.data).forEach(([key, value]) => {
      store.dispatch(screenActions.setScreenValue({ key, value }));
    });
    try {
      navigate("MitraEngine");
    } catch (err) {
      console.warn("[deeplink] navigate failed:", err);
    }
    store.dispatch(
      loadScreenWithData({ containerId: "room", stateId: "render" }) as any,
    );
    console.log(`[deeplink] → room/render (room_id=${roomId})`);
    return true;
  }

  // ── rhythm_home/{slot} deeplink ──────────────────────────────────────────
  if (parsed.containerId === "rhythm_home") {
    const slot = parsed.stateId; // morning | afternoon | night
    try {
      navigate("RhythmHome", VALID_RHYTHM_SLOTS.has(slot) ? { slot } : undefined);
    } catch (err) {
      console.warn("[deeplink] navigate RhythmHome failed:", err);
    }
    console.log(`[deeplink] → RhythmHome (slot=${slot})`);
    return true;
  }

  // ── inner_path/{checkpoint} deeplink ────────────────────────────────────
  if (parsed.containerId === "inner_path") {
    // stateId may be "day7_checkpoint" or "day14_checkpoint"; extract the key.
    const stateId = parsed.stateId;
    const checkpoint = stateId === "day7_checkpoint"
      ? "day7"
      : stateId === "day14_checkpoint"
        ? "day14"
        : VALID_CHECKPOINTS.has(stateId) ? stateId : null;
    try {
      navigate("InnerPath", checkpoint ? { checkpoint } : undefined);
    } catch (err) {
      console.warn("[deeplink] navigate InnerPath failed:", err);
    }
    console.log(`[deeplink] → InnerPath (checkpoint=${checkpoint ?? "none"})`);
    return true;
  }

  const directRoute = DIRECT_ROUTE_CONTAINERS[parsed.containerId];
  if (directRoute) {
    try {
      navigate(directRoute);
    } catch (err) {
      console.warn("[deeplink] direct navigate failed:", err);
    }
    console.log(`[deeplink] → ${directRoute} (direct): ${parsed.containerId}/${parsed.stateId}`);
    return true;
  }

  // Engine-owned screen: seed screenData with any query-string context before
  // the container mounts, then navigate to MitraEngine and dispatch schema load.
  Object.entries(parsed.data).forEach(([key, value]) => {
    store.dispatch(
      screenActions.setScreenValue({
        key,
        value,
      }),
    );
  });

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
