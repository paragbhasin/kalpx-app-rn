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

import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import api from "../Networks/axios";
import LifeContextPickerSheet, {
  type LifeContext,
} from "../blocks/room/LifeContextPickerSheet";
import RoomRenderer from "../blocks/room/RoomRenderer";
import type {
  RoomId,
  RoomRenderV1,
} from "../blocks/room/types";
import { executeAction } from "../engine/actionExecutor";
import { mitraTrackEvent } from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";

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
    },
    fallbacks: {
      hide_if_empty: ["second_beat_line", "principle_banner", "dashboard_chip_label"],
    },
    life_context: null,
    visit_state: null,
  };
}

const RoomContainer: React.FC<Props> = () => {
  const screenData = useScreenStore(
    (s: any) => s.screen?.screenData ?? s.screenData ?? {},
  );
  const currentStateId = useScreenStore(
    (s: any) => s.screen?.currentStateId ?? s.currentStateId ?? "render",
  );
  const loadScreen = useScreenStore((s: any) => s.loadScreen);
  const goBack = useScreenStore((s: any) => s.goBack);

  const roomId: RoomId | undefined = (screenData as any)?.room_id;
  const lifeContext: LifeContext | null =
    ((screenData as any)?.life_context as LifeContext | null) || null;

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

    return (
      <LifeContextPickerSheet
        visible={true}
        onPick={(slug) => {
          setScreenValue(slug, "life_context");
          setScreenValue(false, "context_skipped");
          dispatchTelemetry("context_picked", slug);
          navToRender();
        }}
        onSkip={() => {
          setScreenValue(null, "life_context");
          setScreenValue(true, "context_skipped");
          dispatchTelemetry("context_skipped", null);
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
    />
  );
};

interface RenderBranchProps {
  roomId: RoomId | undefined;
  lifeContext: LifeContext | null;
}

const RoomRenderBranch: React.FC<RenderBranchProps> = ({
  roomId,
  lifeContext,
}) => {
  const [envelope, setEnvelope] = useState<RoomRenderV1 | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      console.warn("[RoomContainer] missing room_id in screenData");
      setEnvelope(buildExitOnlyFallback("room_clarity"));
      setLoading(false);
      return;
    }
    // Fetch key includes life_context so switching context re-fetches.
    const fetchKey = `${roomId}::${lifeContext || ""}`;
    if (fetchedRef.current === fetchKey) return;
    fetchedRef.current = fetchKey;

    let active = true;
    setLoading(true);
    (async () => {
      try {
        // Append life_context as a query param when present; omit when
        // the user skipped (null). BE is expected to default gracefully.
        const url = lifeContext
          ? `mitra/rooms/${roomId}/render/?life_context=${encodeURIComponent(
              lifeContext,
            )}`
          : `mitra/rooms/${roomId}/render/`;
        const res = await api.get(url);
        if (!active) return;
        const data = res?.data;
        if (!data || typeof data !== "object" || !Array.isArray(data.actions)) {
          throw new Error("envelope_malformed");
        }
        setEnvelope(data as RoomRenderV1);
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

  return <RoomRenderer envelope={envelope} />;
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});

export default RoomContainer;
