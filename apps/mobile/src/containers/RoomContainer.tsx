/**
 * RoomContainer — Phase 5 Stage 2 entry surface for v3.1 canonical rooms.
 *
 * Two states (2026-04-20 2-step UX update):
 *   - `context_picker` — mounts <LifeContextPickerSheet />. User picks a
 *     life_context slug (or skips), then advances to `render`.
 *   - `render` — reads `room_id` + optional `life_context` from screenData,
 *     fetches GET /api/mitra/rooms/{room_id}/render/?life_context=<slug>
 *     and mounts <RoomRenderer />.
 *
 * Identity-XOR is handled at the axios interceptor layer
 * (src/Networks/axios.js) — JWT for authed users, X-Guest-UUID header for
 * guests. Nothing to do here.
 *
 * Failure modes (§I-1 + §10):
 *   - Missing room_id          → log + render exit-only fallback envelope
 *   - Non-2xx or network error → telemetry `room_render_fetch_failed` +
 *                                render exit-only fallback envelope.
 *
 * Guarded by EXPO_PUBLIC_MITRA_V3_ROOMS at the inner RoomRenderer. The
 * feature flag is never flipped globally from this container — per-room
 * flag keys (EXPO_PUBLIC_MITRA_ROOM_<UPPER>) are evaluated in the enter_room
 * handler (actionExecutor.ts) before the container is even mounted.
 */

import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import api from "../Networks/axios";
import LifeContextPickerSheet, {
  type LifeContext,
} from "../blocks/room/LifeContextPickerSheet";
import WhyThisL2Sheet from "../blocks/WhyThisL2Sheet";
import RoomRenderer from "../blocks/room/RoomRenderer";
import RoomReflectionSheet from "../blocks/room/RoomReflectionSheet";
import type {
  RoomId,
  RoomRenderV1,
  TellMitraRoomEntryContext,
} from "@kalpx/types";
import { normalizeRoomWhyThisState, getRoomRenderParamsFromEntryContext } from "@kalpx/contracts";
import { executeAction } from "../engine/actionExecutor";
import { mitraTrackEvent, trackRoomTelemetry } from "../engine/mitraApi";
import {
  markIntentionalLeave,
  isIntentionalLeave,
  hasRoomExitedFired,
  markRoomExitedFired,
  resetRoomSession,
} from "../engine/roomSession";
import {
  ensureRoomAmbientAudioPlaying,
  stopRoomAmbientAudio,
} from "../engine/roomAmbientAudio";
import { useScreenStore } from "../engine/useScreenBridge";
import { useToast } from "../context/ToastContext";
import store from "../store";
import { screenActions } from "../store/screenSlice";

interface Props {
  schema?: any;
}

/**
 * Exit-only fallback envelope synthesized locally when the BE fetch fails.
 * This is a safety-only fallback; content is minimal and structural so the
 * user can always leave the room. Sovereignty exemption: safety surface.
 */
function buildExitOnlyFallback(roomId: RoomId): RoomRenderV1 {
  return {
    schema_version: "room.render.v1",
    room_id: roomId,
    opening_line: "",
    second_beat_line: null,
    ready_hint: "",
    section_prompt: "",
    dashboard_chip_label: null,
    principle_banner: null,
    opening_experience: {
      palette: "clarity_silver",
      visual_anchor: { kind: "discernment_line", motion: "still", asset_ref: null },
      ambient_audio: {
        asset_ref: null,
        autoplay_policy: "never",
        start_volume: 0,
        fade_in_ms: 0,
        sound_affordance_visible: false,
      },
      silence_tolerance_ms: 0,
      pacing_ms: {
        opening_line_in: 0,
        breath_pause: 0,
        second_beat_in: 0,
        ready_hint_in: 0,
        pills_reveal_stagger: 0,
      },
      post_runner_reflection_pool_id: null,
    },
    actions: [
      {
        action_id: `${roomId}_exit_fallback`,
        label: "Return",
        action_type: "exit",
        action_family: "exit",
        runner_payload: null,
        teaching_payload: null,
        inquiry_payload: null,
        step_payload: null,
        carry_payload: null,
        exit_payload: { returns_to: "dashboard" },
        room_tags: [],
        function_tags: ["exit"],
        spiritual_mode: "stillness",
        intensity: "very_light",
        energy_direction: ["stabilizing"],
        tradition: [],
        provenance: {
          selection_surface: "support_room",
          source_class: "room_pool",
          selection_pool_id: "fallback",
          selection_pool_version: "0.0.0",
          selection_reason: "room_render_fetch_failed",
          anchor_override: null,
        },
        return_behavior: "to_dashboard",
        visible_if: {},
        testID: `room_action_exit_${roomId}`,
        analytics_key: `${roomId}.exit.fallback`,
        persistence: {
          writes_event: null,
          persists_across_sessions: false,
        },
      },
    ],
    provenance: {
      pool_id: "fallback",
      pool_version: "0.0.0",
      selection_service_version: "fe-fallback",
      render_id: `fallback_${Date.now()}`,
      active_rotation_window_days: 0,
      visit_number: 0,
      render_phase: "fallback",
      life_context_applied: false,
      life_context_skipped: false,
    },
    fallbacks: {
      hide_if_empty: ["second_beat_line", "principle_banner", "dashboard_chip_label"],
    },
    life_context: null,
    visit_state: null,
  };
}

let roomContainerLiveCount = 0;
let pendingRoomAmbientStopTimer: ReturnType<typeof setTimeout> | null = null;

const RoomContainer: React.FC<Props> = () => {
  const isFocused = useIsFocused();
  const screenData = useScreenStore(
    (s: any) => s.screen?.screenData ?? s.screenData ?? {},
  );
  const currentStateId = useScreenStore(
    (s: any) => s.screen?.currentStateId ?? s.currentStateId ?? "render",
  );
  const currentContainerId = useScreenStore(
    (s: any) => s.screen?.currentContainerId ?? s.currentContainerId ?? "",
  );
  const updateBackground = useScreenStore((s: any) => s.updateBackground);
  const roomId: RoomId | undefined = (screenData as any)?.room_id;
  const lifeContext: LifeContext | null =
    ((screenData as any)?.life_context as LifeContext | null) || null;
  const allowedContexts: LifeContext[] | null =
    ((screenData as any)?.life_context_allowed as LifeContext[] | null) || null;
  const roomEntryContext: TellMitraRoomEntryContext | null =
    ((screenData as any)?.room_entry_context as TellMitraRoomEntryContext | null) ?? null;

  // Passive exit telemetry — ref so cleanup closure always has current roomId.
  const roomIdRef = useRef<string>("");
  useEffect(() => {
    roomIdRef.current = roomId || "";
  }, [roomId]);

  // Passive exit effect — fires room_exited when the container unmounts
  // without an intentional leave (back gesture, OS navigation, etc.).
  // Empty deps = mount/unmount only. roomIdRef is a ref so the cleanup
  // closure always reads the latest value without needing it in deps.
  useEffect(() => {
    resetRoomSession();
    return () => {
      if (!isIntentionalLeave() && !hasRoomExitedFired() && roomIdRef.current) {
        markRoomExitedFired();
        void trackRoomTelemetry({ event_type: 'room_exited', room_id: roomIdRef.current, surface: 'room' });
      }
      resetRoomSession();
    };
  }, []); // empty deps — mount/unmount only

  // Handle quick remounts (context_picker -> render) without cutting audio.
  // We stop only when no RoomContainer instance survives the short grace window.
  useEffect(() => {
    roomContainerLiveCount += 1;
    if (pendingRoomAmbientStopTimer) {
      clearTimeout(pendingRoomAmbientStopTimer);
      pendingRoomAmbientStopTimer = null;
    }
    return () => {
      roomContainerLiveCount = Math.max(0, roomContainerLiveCount - 1);
      pendingRoomAmbientStopTimer = setTimeout(() => {
        if (roomContainerLiveCount === 0) {
          stopRoomAmbientAudio();
        }
      }, 180);
    };
  }, []);

  // 1. Handle Background Image (Focus-linked)
  useFocusEffect(
    React.useCallback(() => {
      updateBackground(require("../../assets/rooms_bg.webp"));
      return () => updateBackground(null);
    }, [updateBackground]),
  );

  // Ambient audio belongs only to the focused room screen. If the user
  // leaves via tab navigation, home button, app switch, etc, stop it
  // immediately even if this container stays mounted in navigation state.
  useFocusEffect(
    React.useCallback(() => {
      if (currentContainerId !== "room") {
        stopRoomAmbientAudio();
      }
      return () => {
        stopRoomAmbientAudio();
      };
    }, [currentContainerId]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active") {
        stopRoomAmbientAudio();
      }
    });
    return () => sub.remove();
  }, []);

  // 2. Audio ownership:
  // Keep room ambient alive only while app container is `room`.
  // In-room state changes (context_picker <-> render) should not restart audio.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      if (!isFocused || currentContainerId !== "room") {
        await stopRoomAmbientAudio();
        return;
      }
      try {
        await ensureRoomAmbientAudioPlaying();
      } catch (err) {
        if (__DEV__) {
          console.debug("[RoomContainer] ensure play failed:", err);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [currentContainerId, isFocused]);

  const { loadScreen, goBack } = useScreenStore();

  // ── Wisdom overlay branch ──────────────────────────────────────────
  // open_why_this_l2 routes to room/why_this_l2 when currentContainerId is
  // "room". goBack() from WhyThisL2Sheet returns to room/render.
  if (currentStateId === "why_this_l2") {
    return <WhyThisL2Sheet />;
  }

  // ── Context picker branch ──────────────────────────────────────────
  if (currentStateId === "context_picker") {
    const setScreenValue = (value: any, key: string) => {
      const { screenActions } = require("../store/screenSlice");
      const { store } = require("../store");
      store.dispatch(screenActions.setScreenValue({ key, value }));
    };

    const navToRender = () => {
      loadScreen({ container_id: "room", state_id: "render" } as any);
    };

    const navToDashboard = () => {
      // Clear room_id so re-entering is clean.
      setScreenValue(null, "room_id");
      setScreenValue(null, "life_context");
      setScreenValue(false, "context_skipped");
      const dashboardContainer =
        process.env.EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD === "1"
          ? "companion_dashboard_v3"
          : "companion_dashboard";
      loadScreen({
        container_id: dashboardContainer,
        state_id: "day_active",
      } as any);
    };

    const dispatchTelemetry = (
      event_type: "context_picked" | "context_skipped",
      life_context: LifeContext | null,
    ) => {
      executeAction(
        {
          type: "room_telemetry",
          payload: {
            event_type,
            room_id: roomId,
            life_context,
          },
        } as any,
        {
          loadScreen,
          goBack,
          setScreenValue,
          screenState: { ...(screenData as any) },
        } as any,
      ).catch(() => {
        // Non-critical — telemetry failures swallowed in handler.
      });
    };

    const persistLifeContext = (slug: LifeContext) => {
      const { store: _store } = require("../store");
      const _auth =
        _store.getState().login || _store.getState().socialLoginReducer || {};
      const _isAuthed = !!(
        _auth.user?.id || _auth.user?.email || _auth.user?.token
      );
      if (!_isAuthed) return;
      const { setLifeContext: _setLc } = require("../store/companionStateSlice");
      _store.dispatch(_setLc(slug));
      api.patch("mitra/companion-state/", { life_context: slug }).catch(() => {});
    };

    return (
      <LifeContextPickerSheet
        visible={true}
        allowedContexts={allowedContexts ?? undefined}
        defaultValue={lifeContext}
        onPick={(slug) => {
          setScreenValue(slug, "life_context");
          setScreenValue(false, "context_skipped");
          dispatchTelemetry("context_picked", slug);
          persistLifeContext(slug);
          navToRender();
        }}
        onSkip={() => {
          setScreenValue(null, "life_context");
          setScreenValue(true, "context_skipped");
          dispatchTelemetry("context_skipped", null);
          // Do NOT persist on skip — stored preference stays unchanged.
          navToRender();
        }}
        onBack={() => {
          navToDashboard();
        }}
      />
    );
  }

  // ── Render branch ──────────────────────────────────────────────────
  return (
    <RoomRenderBranch
      roomId={roomId}
      lifeContext={lifeContext}
      entryContext={roomEntryContext}
    />
  );
};

interface RenderBranchProps {
  roomId: RoomId | undefined;
  lifeContext: LifeContext | null;
  entryContext: TellMitraRoomEntryContext | null;
}

const RoomRenderBranch: React.FC<RenderBranchProps> = ({
  roomId,
  lifeContext,
  entryContext,
}) => {
  const [envelope, setEnvelope] = useState<RoomRenderV1 | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchedRef = useRef<string | null>(null);
  const hasFiredEntry = useRef(false);
  const { showToast } = useToast();
  const { loadScreen, goBack } = useScreenStore();

  const showReflection = useScreenStore(
    (s: any) => !!(s.screen?.screenData?.show_room_reflection ?? s.screenData?.show_room_reflection),
  );
  const renderPayload = useScreenStore(
    (s: any) => s.screen?.screenData?.room_render_payload ?? s.screenData?.room_render_payload ?? null,
  );

  // Gate 6D — room_entered telemetry. useRef guard prevents double-fire on
  // re-renders. Fires once per RoomRenderBranch mount when roomId is known.
  // Best-effort: try/catch is inside trackRoomTelemetry.
  useEffect(() => {
    if (!hasFiredEntry.current && roomId) {
      hasFiredEntry.current = true;
      trackRoomTelemetry({ event_type: 'room_entered', room_id: String(roomId), surface: 'room' });
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) {
      console.warn("[RoomContainer] missing room_id in screenData");
      setEnvelope(buildExitOnlyFallback("room_clarity"));
      setLoading(false);
      return;
    }
    // Fetch key includes life_context + intent_type so switching context re-fetches.
    const fetchKey = `${roomId}::${lifeContext || ""}::${entryContext?.situation?.intent_type || ""}`;
    if (fetchedRef.current === fetchKey) return;
    fetchedRef.current = fetchKey;

    let active = true;
    setLoading(true);
    (async () => {
      try {
        // Build query params: life_context + entry context params (with mismatch guard).
        const ecParams = getRoomRenderParamsFromEntryContext(entryContext, roomId as string);
        const qp = new URLSearchParams();
        if (lifeContext)                       qp.set('life_context',        lifeContext);
        if (ecParams.intent_type)              qp.set('intent_type',         ecParams.intent_type);
        if (ecParams.source_surface)           qp.set('source_surface',      ecParams.source_surface);
        if (ecParams.tell_mitra_event_id != null)
          qp.set('tell_mitra_event_id', String(ecParams.tell_mitra_event_id));
        const qs = qp.toString();
        const url = `mitra/rooms/${roomId}/render/${qs ? `?${qs}` : ''}`;
        const res = await api.get(url);
        if (!active) return;
        const data = res?.data;
        if (!data || typeof data !== "object" || !Array.isArray(data.actions)) {
          throw new Error("envelope_malformed");
        }
        setEnvelope(data as RoomRenderV1);
        store.dispatch(screenActions.setScreenValue({ key: 'room_render_payload', value: data }));
        store.dispatch(
          screenActions.setScreenValue({
            key: 'room_why_this_state',
            value: normalizeRoomWhyThisState(data as RoomRenderV1),
          }),
        );
        // FIX-4: surface life_context selection outcome when user chose a context
        if (lifeContext && data.provenance) {
          if (data.provenance.life_context_skipped) {
            showToast("Showing general guidance.", 3000, "info");
          } else if (data.provenance.life_context_applied) {
            showToast("Personalized for your context.", 2500, "info");
          }
        }
      } catch (err: any) {
        if (__DEV__) {
          console.warn(
            "[RoomContainer] room render fetch failed:",
            roomId,
            err?.response?.status || err?.message,
          );
        }
        mitraTrackEvent("room_render_fetch_failed", {
          journeyId: null,
          dayNumber: null,
          meta: {
            room_id: roomId,
            life_context: lifeContext,
            status: err?.response?.status ?? null,
            reason: err?.message || "unknown",
          },
        });
        if (active) setEnvelope(buildExitOnlyFallback(roomId));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [roomId, lifeContext]);

  if (loading || !envelope) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color="#b8922a" />
      </View>
    );
  }

  function closeReflection() {
    store.dispatch(screenActions.setScreenValue({ key: "show_room_reflection", value: false }));
  }

  function navigateTellMitra() {
    closeReflection();
    const { buildActionCtx } = require("../blocks/room/actions/actionContextHelper");
    void executeAction(
      { type: "tell_mitra_navigate" } as any,
      buildActionCtx({ loadScreen, goBack }),
    );
  }

  function returnHome() {
    markIntentionalLeave();
    closeReflection();
    void stopRoomAmbientAudio();
    const dashContainer =
      process.env.EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD === "1"
        ? "companion_dashboard_v3"
        : "companion_dashboard";
    loadScreen({ container_id: dashContainer, state_id: "day_active" } as any);
  }

  const envelopeOrPayload: RoomRenderV1 | null = envelope ?? (renderPayload as RoomRenderV1 | null);
  const effectiveRoomId = String(roomId || "");
  const renderId = (envelopeOrPayload as any)?.provenance?.render_id ?? null;
  const tellMitraEventId = (envelopeOrPayload as any)?.room_context?.entry_context?.tell_mitra_event_id ?? null;

  return (
    <>
      <ScrollView
        style={styles.scrollRoot}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RoomRenderer envelope={envelope} />
      </ScrollView>
      {showReflection && effectiveRoomId ? (
        <RoomReflectionSheet
          roomId={effectiveRoomId}
          renderId={renderId}
          tellMitraEventId={tellMitraEventId}
          onClose={closeReflection}
          onNavigateTellMitra={navigateTellMitra}
          onReturnHome={returnHome}
        />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  scrollRoot: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RoomContainer;
