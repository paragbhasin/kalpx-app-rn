/**
 * RoomPage — canonical room container host.
 * Reads roomId from URL params, dispatches enter_room if needed,
 * handles context_picker state → RoomRenderer with live RoomRenderV1 envelope.
 */
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { LifeContextPickerSheet } from "../../components/blocks/room/LifeContextPickerSheet";
import { RoomRenderer } from "../../components/blocks/room/RoomRenderer";
import { RoomReflectionSheet } from "../../components/blocks/room/RoomReflectionSheet";
import { ROOM_DISPLAY_NAMES } from "../../components/blocks/room/roomConstants";
import { executeAction } from "../../engine/actionExecutor";
import { getRoomRender, trackEvent, trackRoomTelemetry } from "../../engine/mitraApi";
import { normalizeRoomWhyThisState, getRoomRenderParamsFromEntryContext, hasTellMitraRoomEntryContext, ROOM_LABELS } from "@kalpx/contracts";
import type { TellMitraRoomEntryContext } from "@kalpx/types";
import {
  ensureRoomAmbientPlaying,
  stopRoomAmbient,
} from "../../lib/audio/calmMusic";
import { webNavigate } from "../../lib/webRouter";
import type { AppDispatch } from "../../store";
import { updateScreenData, useScreenState } from "../../store/screenSlice";

const ROOMS_WITH_CONTEXT_PICKER = [
  "room_clarity",
  "room_growth",
  "room_release",
  "room_stillness",
];

function buildExitOnlyFallback(roomId: string) {
  return {
    schema_version: "room.render.v1",
    room_id: roomId,
    opening_line: "",
    second_beat_line: null,
    ready_hint: "",
    section_prompt: "",
    dashboard_chip_label: null,
    principle_banner: null,
    opening_experience: {} as any,
    actions: [
      {
        action_id: `${roomId}_exit_fallback`,
        label: "Return to Mitra Home",
        action_type: "exit",
        action_family: "exit",
        exit_payload: { returns_to: "dashboard" },
      },
    ],
  };
}

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const screenState = useScreenState();
  const sd = screenState.screenData;
  const [isDesktop, setIsDesktop] = useState(
    typeof window === "undefined" ? true : window.innerWidth >= 1024,
  );

  const fullRoomId = roomId?.startsWith("room_")
    ? roomId
    : `room_${roomId || ""}`;

  const storedEnvelope =
    sd?.room_render_payload &&
    (sd.room_render_payload as any).room_id === fullRoomId
      ? (sd.room_render_payload as any)
      : null;

  const roomEntryContext = (sd?.room_entry_context as TellMitraRoomEntryContext | null) ?? null;
  const hasTellMitraRoomContext = hasTellMitraRoomEntryContext(roomEntryContext);

  // Derived early so hooks can depend on it (hooks must precede conditional returns).
  const showReflection = !!(sd?.show_room_reflection);

  const [phase, setPhase] = useState<"picker" | "loading" | "render" | "error">(
    storedEnvelope
      ? "render"
      : (ROOMS_WITH_CONTEXT_PICKER.includes(fullRoomId) && !hasTellMitraRoomContext)
        ? "picker"
        : "loading",
  );
  const [envelope, setEnvelope] = useState<any>(storedEnvelope);
  const [lifeContext, setLifeContext] = useState<string | null>(
    (sd?.room_life_context as string | null) || null,
  );

  // Gate 6D — dedupe guard: prevents double-fire of room_entered on re-renders.
  const hasFiredEntry = useRef(false);

  // Passive room_exited telemetry — fires on unmount only when user did NOT
  // explicitly exit (via action, room_exit type, or reflection shown).
  const hasExplicitlyExitedRef = useRef(false);
  const hasRoomExitedFiredRef = useRef(false);
  const fullRoomIdRef = useRef<string>("");

  // Room ambient audio — start on render phase, stop on unmount (mirrors RoomContainer.tsx)
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Room ambient audio — start on render phase, stop on unmount (mirrors RoomContainer.tsx)
  useEffect(() => {
    if (phase !== "render") return;
    ensureRoomAmbientPlaying();
    return () => {
      stopRoomAmbient();
    };
  }, [phase]);

  // Gate 6D — room_entered telemetry. Fires once when the room render phase
  // begins. useRef guard prevents double-fire across re-renders / phase changes.
  // Best-effort: try/catch is inside trackRoomTelemetry.
  useEffect(() => {
    if (phase === "render" && !hasFiredEntry.current && fullRoomId) {
      hasFiredEntry.current = true;
      void trackRoomTelemetry({ event_type: 'room_entered', room_id: fullRoomId, surface: 'room' });
    }
  }, [phase, fullRoomId]);

  // Sync fullRoomId into ref so the unmount cleanup can access the latest value.
  useEffect(() => {
    fullRoomIdRef.current = fullRoomId;
  }, [fullRoomId]);

  // When reflection is shown the user completed the room — mark as explicit exit.
  useEffect(() => {
    if (showReflection) {
      hasExplicitlyExitedRef.current = true;
    }
  }, [showReflection]);

  // Passive room_exited telemetry — fires on unmount only when the user did NOT
  // explicitly exit (navigated away mid-room without completing or tapping exit).
  useEffect(() => {
    return () => {
      if (
        !hasExplicitlyExitedRef.current &&
        !hasRoomExitedFiredRef.current &&
        fullRoomIdRef.current
      ) {
        hasRoomExitedFiredRef.current = true;
        void trackRoomTelemetry({
          event_type: 'room_exited',
          room_id: fullRoomIdRef.current,
          surface: 'room',
        });
      }
    };
  }, []); // empty deps — fires only on unmount

  const actionContext = {
    dispatch,
    screenData: screenState.screenData,
  };

  const fetchRender = async (ctx: string | null, entryCtx?: TellMitraRoomEntryContext | null) => {
    setPhase("loading");
    try {
      // Mismatch guard is applied inside getRoomRenderParamsFromEntryContext
      const ecParams = getRoomRenderParamsFromEntryContext(entryCtx, fullRoomId);
      const hasParams = ctx || Object.keys(ecParams).length > 0;
      const data = await getRoomRender(
        fullRoomId,
        hasParams ? { life_context: ctx ?? undefined, ...ecParams } : undefined,
      );
      if (!data) throw new Error("no_data");
      setEnvelope(data);
      dispatch(
        updateScreenData({
          room_id: fullRoomId,
          room_render_payload: data,
          room_why_this_state: normalizeRoomWhyThisState(data as any),
        }),
      );
      setPhase("render");
    } catch {
      void trackEvent("room_render_fetch_failed", { room_id: fullRoomId });
      setEnvelope(buildExitOnlyFallback(fullRoomId));
      setPhase("render");
    }
  };

  useEffect(() => {
    // If we already have the live room render in store, restore it directly.
    if (storedEnvelope) {
      setEnvelope(storedEnvelope);
      setPhase("render");
    } else if (!ROOMS_WITH_CONTEXT_PICKER.includes(fullRoomId) || hasTellMitraRoomContext) {
      // Bypass picker for rooms without picker support, or when Tell Mitra context is present
      void fetchRender(lifeContext, roomEntryContext);
    }
    // Stamp room_id into store
    dispatch(updateScreenData({ room_id: fullRoomId }));
  }, [fullRoomId, storedEnvelope, hasTellMitraRoomContext]);

  const roomName = ROOM_LABELS[fullRoomId as keyof typeof ROOM_LABELS] ?? ROOM_DISPLAY_NAMES[fullRoomId] ?? fullRoomId;

  // Guard browser back: intercept popstate and navigate to dashboard instead
  const handleActionRef = useRef<(action: any) => void>(() => {});

  const handleAction = (action: any) => {
    // Mark explicit exit so passive room_exited telemetry does not double-fire.
    if (action?.type === "room_exit" || action?.action_type === "exit") {
      hasExplicitlyExitedRef.current = true;
    }
    void executeAction(action, actionContext);
  };

  handleActionRef.current = handleAction;

  useEffect(() => {
    if (phase !== "render") return;
    const handler = () => {
      handleActionRef.current({
        type: "room_exit",
        payload: { room_id: fullRoomId },
      });
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [phase, fullRoomId]);

  if (phase === "picker") {
    return (
      <LifeContextPickerSheet
        roomId={fullRoomId}
        allowedContexts={(sd?.life_context_allowed as string[] | null) || null}
        onPick={(ctx) => {
          setLifeContext(ctx);
          dispatch(updateScreenData({ room_life_context: ctx }));
          void executeAction(
            {
              type: "room_telemetry",
              payload: {
                event_type: "context_picked",
                room_id: fullRoomId,
                life_context: ctx,
              },
            },
            actionContext,
          );
          void fetchRender(ctx);
        }}
        onSkip={() => {
          setLifeContext(null);
          dispatch(updateScreenData({ room_life_context: null }));
          void executeAction(
            {
              type: "room_telemetry",
              payload: {
                event_type: "context_skipped",
                room_id: fullRoomId,
                life_context: null,
              },
            },
            actionContext,
          );
          void fetchRender(null);
        }}
        onBack={() => webNavigate("/en/mitra/dashboard")}
      />
    );
  }

  const roomBgStyle: React.CSSProperties = {
    minHeight: "100dvh",
    background: "#FFF8EF",
    backgroundImage: "url(/rooms_bg.jpg)",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  };

  if (phase === "loading") {
    return (
      <div
        style={{
          ...roomBgStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "var(--kalpx-text-muted)" }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "2px solid var(--kalpx-cta)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ fontSize: 13 }}>Entering {roomName}…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  function handleCloseReflection() {
    dispatch(updateScreenData({ show_room_reflection: false }));
  }

  function handleReflectionNavigateTellMitra() {
    dispatch(updateScreenData({ show_room_reflection: false }));
    webNavigate("/en/mitra/tell-mitra");
  }

  function handleReflectionViewAllSteps() {
    dispatch(updateScreenData({ show_room_reflection: false }));
    // The guided section's "View all steps" is within RoomRenderer — just close reflection
  }

  return (
    <div style={roomBgStyle}>
      <div style={{ maxWidth: isDesktop ? 1440 : 480, margin: "0 auto" }}>
      {envelope ? (
        <RoomRenderer
          envelope={envelope}
          screenData={screenState.screenData}
          onAction={handleAction}
          isDesktop={isDesktop}
        />
      ) : (
        <div style={{ padding: 24, textAlign: "center" }}>
          <p style={{ color: "var(--kalpx-text-muted)" }}>
            This space is not available right now.
          </p>
          <button
            onClick={() =>
              handleAction({
                type: "room_exit",
                payload: { room_id: fullRoomId },
              })
            }
            style={{
              marginTop: 16,
              padding: "10px 24px",
              borderRadius: 8,
              background: "var(--kalpx-cta)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
            data-testid="room-unavailable-return"
          >
            Return to dashboard
          </button>
        </div>
      )}
      {showReflection && envelope && (
        <RoomReflectionSheet
          roomId={fullRoomId}
          renderId={(envelope as any).provenance?.render_id ?? null}
          tellMitraEventId={(envelope as any).room_context?.entry_context?.tell_mitra_event_id ?? null}
          onClose={handleCloseReflection}
          onNavigateTellMitra={handleReflectionNavigateTellMitra}
          onViewAllSteps={handleReflectionViewAllSteps}
          onReturnHome={() => { hasExplicitlyExitedRef.current = true; dispatch(updateScreenData({ show_room_reflection: false })); webNavigate("/en/mitra/dashboard"); }}
        />
      )}
      </div>
    </div>
  );
}
