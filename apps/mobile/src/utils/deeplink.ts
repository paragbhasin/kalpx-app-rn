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
import AsyncStorage from "@react-native-async-storage/async-storage";

import store from "../store";
import { screenActions, loadScreenWithData } from "../store/screenSlice";
import { navigate, navigateInHomeStack, navigationRef } from "../Shared/Routes/NavigationService";
import { postProgramActivity } from "../engine/programApi";
import { setSkipMitraStart, setForceFourDoorHome } from "./postLoginGuard";

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
    const runner = resolveLADestination(parsed);
    try {
      if (runner) {
        navigateInHomeStack(runner.name, runner.params);
        console.log(`[deeplink] → ${runner.name} (rhythm LA → exact runner)`);
      } else {
        navigate("RhythmHome", VALID_RHYTHM_SLOTS.has(slot) ? { slot } : undefined);
        console.log(`[deeplink] → RhythmHome (slot=${slot})`);
      }
    } catch (err) {
      console.warn("[deeplink] navigate RhythmHome failed:", err);
    }
    return true;
  }

  // ── inner_path/{checkpoint} deeplink ────────────────────────────────────
  if (parsed.containerId === "inner_path") {
    const runner = resolveLADestination(parsed);
    if (runner) {
      try {
        navigateInHomeStack(runner.name, runner.params);
        console.log(`[deeplink] → ${runner.name} (inner_path LA → exact runner)`);
      } catch (err) {
        console.warn("[deeplink] navigate inner_path runner failed:", err);
      }
      return true;
    }
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
 * Handle TLP live-session and program deep links.
 *
 * kalpx://live-session/{code}               → LiveSessionDetail
 * kalpx://live-session/{code}/join          → LiveSessionJoin (fetches session first)
 * kalpx://live-session/{code}/reflect       → LiveSessionReflect
 * https://kalpx.com/sessions/{code}        → LiveSessionDetail (Universal Link)
 * https://kalpx.com/programs/{slug}        → ProgramDetailPreview (Universal Link)
 *
 * Returns true if handled, false otherwise.
 */
export function handleTLPDeepLink(url: string): boolean {
  if (!url) return false;

  // kalpx://live-session/{code}/reflect
  if (url.startsWith("kalpx://live-session/")) {
    const bare = url.split("?")[0];
    const path = bare.replace("kalpx://live-session/", "");
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 0) return false;
    const code = parts[0];
    const sub = parts[1];

    if (sub === "reflect") {
      try {
        navigate("LiveSessionReflect" as any, { sessionCode: code });
      } catch (err) {
        console.warn("[deeplink] LiveSessionReflect navigate failed:", err);
      }
      console.log(`[deeplink] → LiveSessionReflect (code=${code})`);
      return true;
    }

    if (sub === "join") {
      // Navigate to LiveSessionJoin. We navigate to LiveSessionDetail first
      // if we don't have session params; detail screen can forward to join.
      try {
        navigate("LiveSessionDetail" as any, { code });
      } catch (err) {
        console.warn("[deeplink] LiveSessionDetail (for join) navigate failed:", err);
      }
      console.log(`[deeplink] → LiveSessionDetail (pre-join, code=${code})`);
      return true;
    }

    // kalpx://live-session/{code} → LiveSessionDetail
    try {
      navigate("LiveSessionDetail" as any, { code });
    } catch (err) {
      console.warn("[deeplink] LiveSessionDetail navigate failed:", err);
    }
    console.log(`[deeplink] → LiveSessionDetail (code=${code})`);
    return true;
  }

  // https://kalpx.com/sessions/{code} Universal Link
  if (url.startsWith("https://kalpx.com/sessions/")) {
    const bare = url.split("?")[0];
    const code = bare.replace("https://kalpx.com/sessions/", "").split("/")[0].trim();
    if (!code) return false;
    try {
      navigate("LiveSessionDetail" as any, { code });
    } catch (err) {
      console.warn("[deeplink] LiveSessionDetail (UL) navigate failed:", err);
    }
    console.log(`[deeplink] → LiveSessionDetail (UL, code=${code})`);
    return true;
  }

  // https://kalpx.com/programs/{slug} Universal Link → ProgramDetailPreview
  if (url.startsWith("https://kalpx.com/programs/")) {
    const bare = url.split("?")[0];
    const slug = bare.replace("https://kalpx.com/programs/", "").split("/")[0].trim();
    if (!slug) return false;
    try {
      // slug is treated as code for program detail preview
      navigate("ProgramDetailPreview" as any, { code: slug });
    } catch (err) {
      console.warn("[deeplink] ProgramDetailPreview (UL) navigate failed:", err);
    }
    console.log(`[deeplink] → ProgramDetailPreview (UL, slug=${slug})`);
    return true;
  }

  return false;
}

/**
 * Handle kalpx://guide/invite/{token} and https://kalpx.com/guide/invite/{token}.
 * Routes to GuideInviteAcceptScreen so the guide can set their password.
 * Returns true if handled, false otherwise.
 */
export function handleGuideInviteDeepLink(url: string): boolean {
  if (!url) return false;

  let token: string | null = null;

  if (url.startsWith("kalpx://guide/invite/")) {
    token = url.replace("kalpx://guide/invite/", "").split("?")[0].trim();
  } else if (url.startsWith("https://kalpx.com/guide/invite/")) {
    token = url.replace("https://kalpx.com/guide/invite/", "").split("?")[0].trim();
  } else if (url.startsWith("https://dev.kalpx.com/guide/invite/")) {
    token = url.replace("https://dev.kalpx.com/guide/invite/", "").split("?")[0].trim();
  }

  if (!token) return false;

  try {
    navigate("GuideInviteAccept" as any, { token });
  } catch (err) {
    console.warn("[deeplink] GuideInviteAccept navigate failed:", err);
  }
  console.log(`[deeplink] → GuideInviteAccept (token=${token})`);
  return true;
}

/**
 * Handle kalpx://join/{code} custom-scheme deep links.
 * Stores the code in AsyncStorage and navigates to ProgramInviteClaimScreen.
 * Returns true if handled, false otherwise.
 *
 * Universal Links (https://kalpx.com/join/{code}) are handled at the
 * React Native Router level via intentFilters/associatedDomains — they
 * open the app and arrive here via Linking.getInitialURL().
 */
export function handleProgramJoinDeepLink(url: string): boolean {
  if (!url) return false;

  // Handle custom scheme: kalpx://join/{code}
  if (url.startsWith("kalpx://join/")) {
    const code = url.replace("kalpx://join/", "").split("?")[0].trim().toUpperCase();
    if (!code) return false;
    const sourceMatch = url.match(/[?&]source=([^&]*)/);
    const urlSource = sourceMatch ? decodeURIComponent(sourceMatch[1]) : 'deep_link';
    if (urlSource === 'notification') {
      postProgramActivity('notification_program_tapped').catch(() => {});
    }
    void AsyncStorage.setItem("pending_program_code", code);
    void AsyncStorage.setItem("pending_program_source", urlSource);
    setSkipMitraStart();
    setForceFourDoorHome();
    try {
      navigate("ProgramInviteClaimScreen" as any, { code, source: urlSource });
    } catch (err) {
      console.warn("[deeplink] ProgramInviteClaimScreen navigate failed:", err);
    }
    console.log(`[deeplink] → ProgramInviteClaimScreen (code=${code})`);
    return true;
  }

  // Handle HTTPS Universal Link: https://kalpx.com/join/{code}
  if (url.startsWith("https://kalpx.com/join/")) {
    const code = url.replace("https://kalpx.com/join/", "").split("?")[0].trim().toUpperCase();
    if (!code) return false;
    const sourceMatch = url.match(/[?&]source=([^&]*)/);
    const urlSource = sourceMatch ? decodeURIComponent(sourceMatch[1]) : 'universal_link';
    if (urlSource === 'notification') {
      postProgramActivity('notification_program_tapped').catch(() => {});
    }
    void AsyncStorage.setItem("pending_program_code", code);
    void AsyncStorage.setItem("pending_program_source", urlSource);
    setSkipMitraStart();
    setForceFourDoorHome();
    try {
      navigate("ProgramInviteClaimScreen" as any, { code, source: urlSource });
    } catch (err) {
      console.warn("[deeplink] ProgramInviteClaimScreen (UL) navigate failed:", err);
    }
    console.log(`[deeplink] → ProgramInviteClaimScreen (UL code=${code})`);
    return true;
  }

  return false;
}

/**
 * Handle kalpx://program/{code}/day/{N|day8-transition|testimonial} URLs.
 * These are generated exclusively by the backend push-notification dispatcher
 * (tasks.py:_program_deep_link) — never used as invite links — so
 * notification_program_tapped is fired unconditionally for any match.
 * Returns true if handled, false otherwise.
 */
export function handleProgramDeepLink(url: string): boolean {
  if (!url || !url.startsWith('kalpx://program/')) return false;

  // Strip query string before splitting path segments
  const bare = url.split('?')[0];
  const path = bare.replace('kalpx://program/', '');
  const parts = path.split('/').filter(Boolean);
  if (parts.length < 2) return false;

  const [code, ...rest] = parts;
  if (!code) return false;
  const route = rest.join('/');

  // This scheme is push-notification-only — fire analytics unconditionally.
  postProgramActivity('notification_program_tapped').catch(() => {});

  if (route === 'day8-transition') {
    try {
      navigate('ProgramDay8TransitionScreen' as any);
    } catch (err) {
      console.warn('[deeplink] navigate ProgramDay8TransitionScreen failed:', err);
    }
    console.log(`[deeplink] → ProgramDay8TransitionScreen (program code=${code})`);
    return true;
  }

  if (route.startsWith('day/')) {
    const dayNumber = parseInt(rest[1], 10);
    if (Number.isNaN(dayNumber) || dayNumber < 1) return false;
    try {
      navigate('ProgramDayScreen' as any, { dayNumber });
    } catch (err) {
      console.warn('[deeplink] navigate ProgramDayScreen failed:', err);
    }
    console.log(`[deeplink] → ProgramDayScreen (code=${code} day=${dayNumber})`);
    return true;
  }

  // Testimonial deep link: no dedicated screen yet — Home is a safe fallback.
  if (route === 'testimonial') {
    try {
      navigate('Home' as any);
    } catch (err) {
      console.warn('[deeplink] navigate Home (testimonial fallback) failed:', err);
    }
    console.log(`[deeplink] → Home (testimonial fallback, code=${code})`);
    return true;
  }

  return false;
}

// Retry navigating a cold-start URL until the navigator is ready (up to ~3s).
// navigate() silently no-ops when navigationRef.isReady() is false, so we
// must poll rather than call it once and hope for the best.
//
// For join deep links, setSkipMitraStart() is called immediately (before the
// navigator is ready) so that Home.tsx's journey check never redirects to
// MitraStart while the claim screen is being prepared.
function handleWhenReady(url: string, attemptsLeft = 15): void {
  if (navigationRef.isReady()) {
    if (!handleGuideInviteDeepLink(url) && !handleProgramJoinDeepLink(url) && !handleProgramDeepLink(url) && !handleTLPDeepLink(url)) {
      handleMitraDeepLink(url);
    }
  } else if (attemptsLeft > 0) {
    setTimeout(() => handleWhenReady(url, attemptsLeft - 1), 200);
  } else {
    console.warn("[deeplink] navigator never became ready for cold-start URL:", url);
  }
}

// Chant containers (quick_chant / quick_reset) → both route to the QuickReset
// screen. Every LA tap navigates to its respective screen; see onUrl below.
const CHANT_CONTAINERS = new Set(['quick_chant', 'quick_reset']);

// Remembers the exact runner the user last entered from Inner Path / Daily
// Rhythm, so tapping that flow's Live Activity returns to the precise chanting
// screen (not the overview). In-memory: survives warm-start while the app is
// alive; on cold-start it's empty and we fall back to the overview screen.
type RunnerRoute = { name: string; params?: any };
const lastRunnerRoutes: Record<string, RunnerRoute> = {};

export function rememberRunnerRoute(containerId: string, name: string, params?: any): void {
  lastRunnerRoutes[containerId] = { name, params };
}

// Resolve where a Live Activity tap should land. Inner Path / Daily Rhythm taps
// (?source=la) return to the exact runner the user last entered. Navigation to
// these deeply-nested runner screens uses navigateInHomeStack (explicit nested
// target) since a flat navigate(name) can't resolve them from the container ref.
function resolveLADestination(parsed: ParsedMitraDeepLink): RunnerRoute | null {
  const isLATap = parsed.data?.source === 'la';
  if (parsed.containerId === 'rhythm_home' && isLATap && lastRunnerRoutes['rhythm_home']) {
    return lastRunnerRoutes['rhythm_home'];
  }
  if (parsed.containerId === 'inner_path' && isLATap && lastRunnerRoutes['inner_path']) {
    return lastRunnerRoutes['inner_path'];
  }
  return null;
}

/**
 * Install the Linking listeners. Returns a cleanup function. Call once
 * at app boot.
 */
export function attachDeepLinkListeners(): () => void {
  // Warm-start handler: app was in background when the URL fired (DI / LA tap,
  // notification, etc.). Every LA tap navigates to its respective screen —
  // quick_chant/quick_reset → QuickReset, rhythm_home → RhythmHome,
  // inner_path → InnerPath. We only skip the redundant push when the user is
  // ALREADY on that exact destination screen.
  const onUrl = (event: { url: string } | string | null | undefined) => {
    const url = typeof event === "string" ? event : event?.url;
    if (!url) return;
    const parsed = parseMitraDeepLink(url);

    // Skip only when already on the exact destination screen (avoids a no-op push).
    // For inner_path / rhythm LA taps the destination is the remembered runner.
    if (parsed) {
      const currentRoute = navigationRef.getCurrentRoute?.();
      const runner = resolveLADestination(parsed);
      const dest = runner
        ? runner.name
        : CHANT_CONTAINERS.has(parsed.containerId) ? 'QuickReset'
        : parsed.containerId === 'rhythm_home' ? 'RhythmHome'
        : parsed.containerId === 'inner_path' ? 'InnerPath'
        : null;
      if (dest && currentRoute?.name === dest) {
        console.log(`[deeplink] LA warm-start — already on ${dest}, skipping nav`);
        return;
      }
    }

    if (!handleGuideInviteDeepLink(url) && !handleProgramJoinDeepLink(url) && !handleProgramDeepLink(url) && !handleTLPDeepLink(url)) {
      handleMitraDeepLink(url);
    }
  };

  // Cold-start: app was killed and re-launched via the URL. Always navigate —
  // there is no active runner to preserve. handleWhenReady retries until the
  // navigator is ready so the first render doesn't race the navigate() call.
  //
  // For join links: set the Mitra skip flag immediately so Home.tsx doesn't
  // redirect to MitraStart while we wait for the navigator to become ready.
  Linking.getInitialURL()
    .then((url) => {
      if (!url) return;
      if (url.startsWith("kalpx://join/") || url.startsWith("https://kalpx.com/join/")) {
        setSkipMitraStart();
        setForceFourDoorHome();
      }
      handleWhenReady(url);
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
