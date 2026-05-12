/**
 * RoomGuidedSection — guided room layout with hero content, begin CTA,
 * expandable wisdom card, and access to the full room step list.
 */
import { ROOM_GUIDED_COPY } from "@kalpx/contracts";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { postRoomSacred, postRoomTelemetry } from "../../../engine/mitraApi";
import { WEB_ENV } from "../../../lib/env";
import { CarryCaptureModal } from "./CarryCaptureModal";
import { InquiryModal } from "./InquiryModal";
import type { StepModalResult } from "./StepModal";
import { StepModal, classifyStep } from "./StepModal";

interface Props {
  envelope: any;
  roomName?: string;
  lifeContextLabel?: string | null;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

function normalizeWhyThisRoomLine(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const compact = value.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
  if (/^because you shared\s*:/i.test(compact)) return null;
  return value;
}

function extractBecauseYouSharedLabel(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  const firstLine = lines[0] ?? "";
  if (!/^because you shared\s*:/i.test(firstLine)) {
    const compact = value.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
    const match = compact.match(/^because you shared\s*:\s*[·•-]?\s*(.+)$/i);
    return match?.[1]?.trim() || null;
  }

  const inlineRemainder = firstLine
    .replace(/^because you shared\s*:/i, "")
    .trim()
    .replace(/^[·•-]\s*/, "");

  const bulletLines = lines
    .slice(1)
    .map((line) => line.replace(/^[·•-]\s*/, "").trim())
    .filter(Boolean);

  const parts = [inlineRemainder, ...bulletLines].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function RoomGuidedSection({
  envelope,
  roomName,
  lifeContextLabel,
  screenData,
  onAction,
}: Props) {
  const ctx = envelope.room_context?.entry_context ?? {};
  const roomCtx = envelope.room_context ?? {};
  const recId: string | null = ctx.recommended_first_action_id ?? null;
  const recTitle: string = ctx.recommended_first_action_title ?? "";
  const recDesc: string = ctx.recommended_first_action_description ?? "";
  const roomId: string = envelope.room_id;
  const renderId: string = envelope.provenance?.render_id ?? "";

  const recAction = recId
    ? ((envelope.actions as any[]).find((a: any) => a.action_id === recId) ??
      null)
    : null;

  const nonExitActions: any[] = (envelope.actions as any[]).filter(
    (a: any) => a.action_type !== "exit",
  );
  const orderedActions = useMemo(() => {
    const actionMap = new Map(
      (envelope.actions as any[]).map((action: any) => [
        action.action_id,
        action,
      ]),
    );
    const steps = Array.isArray(envelope.room_steps)
      ? [...envelope.room_steps].sort(
          (a: any, b: any) => (a?.step_number ?? 0) - (b?.step_number ?? 0),
        )
      : [];

    const orderedIds: string[] = [];
    if (recId) orderedIds.push(recId);

    for (const step of steps) {
      const actionId = step?.action_id;
      if (!actionId || orderedIds.includes(actionId)) continue;
      orderedIds.push(actionId);
    }

    const fromSteps = orderedIds
      .map((actionId) => actionMap.get(actionId))
      .filter(Boolean);

    return fromSteps.length > 0 ? fromSteps : nonExitActions;
  }, [envelope.actions, envelope.room_steps, nonExitActions, recId]);

  const situationAck =
    roomCtx.situation_acknowledgement_line ??
    ctx.situation_acknowledgement_line ??
    null;
  const roomPurposeLine =
    roomCtx.room_purpose_line ?? ctx.room_purpose_line ?? null;
  const rawWhyThisRoomLine =
    roomCtx.why_this_room_line ?? ctx.why_this_room_line ?? null;
  const whyThisRoomLine = normalizeWhyThisRoomLine(rawWhyThisRoomLine);
  const derivedLifeContextLabel =
    lifeContextLabel || extractBecauseYouSharedLabel(rawWhyThisRoomLine);
  const sanatanInsightLine =
    roomCtx.sanatan_insight_line ?? ctx.sanatan_insight_line ?? null;
  const principleBanner = envelope.principle_banner ?? null;
  const openingLine = envelope.opening_line ?? "";
  const secondBeatLine = envelope.second_beat_line ?? "";
  const memoryEchoLine = envelope.memory_echo_line ?? null;
  const completionMessage =
    envelope.opening_line || "Complete. You stayed with the practice.";
  const completionWisdom =
    roomCtx.bridge_line ||
    roomCtx.sanatan_insight_line ||
    "Let what became clear stay with you.";

  const [whyExpanded, setWhyExpanded] = useState(false);
  const [recommendedExpanded, setRecommendedExpanded] = useState(false);
  const [sequenceActive, setSequenceActive] = useState(
    !!screenData?.room_sequence_active,
  );
  const [stepsOpen, setStepsOpen] = useState(false);
  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [inquiryModalVisible, setInquiryModalVisible] = useState(false);
  const [carryModalVisible, setCarryModalVisible] = useState(false);
  const [activeAction, setActiveAction] = useState<any | null>(null);
  const [activeStepPayload, setActiveStepPayload] = useState<any>(null);

  function maybeAdvanceToNextAction(completedActionId?: string | null) {
    if (!sequenceActive || !completedActionId) return;
    const currentIndex = orderedActions.findIndex(
      (action: any) => action?.action_id === completedActionId,
    );
    if (currentIndex < 0) return;
    const nextAction = orderedActions[currentIndex + 1];
    if (!nextAction) {
      setSequenceActive(false);
      onAction?.({
        type: "room_sequence_completed",
        payload: {
          room_id: roomId,
          completion_return: {
            message: completionMessage,
            wisdom_anchor_line: completionWisdom,
            return_home_cta: "Return to Mitra Home",
            repeat_cta: "Repeat",
            reflection_prompt: "Anything to carry from this?",
          },
        },
      });
      return;
    }
    setTimeout(() => openAction(nextAction), 120);
  }

  function openAction(
    action: any,
    options?: { forceSequenceActive?: boolean },
  ) {
    if (!action) return;
    setStepsOpen(false);
    setActiveAction(action);
    const isSequenceActive = options?.forceSequenceActive ?? sequenceActive;

    if (action.action_type === "in_room_step") {
      const kind = classifyStep(action.step_payload?.template_id);
      if (kind !== "unknown") {
        setActiveStepPayload(action.step_payload);
        setStepModalVisible(true);
      } else {
        onAction?.({
          type: "room_step_completed",
          payload: {
            room_id: roomId,
            action_id: action.action_id,
            analytics_key: action.analytics_key,
            template_id: action.step_payload?.template_id,
            writes_event:
              action.step_payload?.persistence?.writes_event ??
              action.persistence?.writes_event,
          },
        });
      }
      return;
    }

    if (action.action_type === "inquiry") {
      setInquiryModalVisible(true);
      return;
    }

    if (action.action_type === "in_room_carry") {
      setCarryModalVisible(true);
      return;
    }

    if (action.action_type.startsWith("runner_")) {
      const rp = action.runner_payload;
      if (!rp) {
        if (WEB_ENV.isDev)
          console.warn(
            "[RoomGuidedSection] missing runner_payload for",
            action.action_type,
          );
        return;
      }
      const variant: string =
        rp.runner_kind ||
        (action.action_type.startsWith("runner_")
          ? action.action_type.replace("runner_", "")
          : action.action_type) ||
        "mantra";
      const currentIndex = orderedActions.findIndex(
        (candidate: any) => candidate?.action_id === action.action_id,
      );
      onAction?.({
        type: "start_runner",
        payload: {
          source: rp.runner_source ?? "support_room",
          variant,
          item: {
            ...(rp.item || rp.offering || rp),
            item_id: rp.item_id || rp.item?.item_id || rp.offering?.item_id,
            id:
              rp.item_id ||
              rp.item?.id ||
              rp.offering?.id ||
              rp.item?.item_id ||
              rp.offering?.item_id,
            item_type:
              rp.item_type ||
              rp.item?.item_type ||
              rp.offering?.item_type ||
              variant,
            title: rp.title || rp.item?.title || rp.offering?.title || "",
            subtitle:
              rp.subtitle ||
              rp.subtitle_or_line ||
              rp.item?.subtitle ||
              rp.offering?.subtitle ||
              "",
            subtitle_or_line:
              rp.subtitle_or_line ||
              rp.subtitle ||
              rp.item?.subtitle_or_line ||
              rp.offering?.subtitle_or_line ||
              "",
            line:
              rp.line ||
              rp.subtitle_or_line ||
              rp.item?.line ||
              rp.offering?.line ||
              "",
            devanagari:
              rp.devanagari ||
              rp.item?.devanagari ||
              rp.offering?.devanagari ||
              "",
            audio_url:
              rp.audio_url ||
              rp.item?.audio_url ||
              rp.offering?.audio_url ||
              "",
            reps_total:
              rp.reps_default_selection ||
              rp.reps_target ||
              rp.item?.reps_total ||
              rp.offering?.reps_total ||
              null,
            duration_seconds:
              rp.duration_min != null
                ? Math.round(rp.duration_min * 60)
                : rp.item?.duration_seconds ||
                  rp.offering?.duration_seconds ||
                  null,
            steps: rp.steps || rp.item?.steps || rp.offering?.steps || [],
          },
          action_id: action.action_id,
          room_sequence_active: isSequenceActive,
          room_sequence_action_ids: orderedActions.map(
            (candidate: any) => candidate.action_id,
          ),
          room_sequence_index: currentIndex,
        },
      });
    }
  }

  useEffect(() => {
    if (!screenData?.room_sequence_active) return;
    setSequenceActive(true);
  }, [screenData?.room_sequence_active]);

  useEffect(() => {
    const resumeActionId = screenData?.room_sequence_resume_action_id;
    if (!resumeActionId) return;
    const action = orderedActions.find(
      (candidate: any) => candidate?.action_id === resumeActionId,
    );
    if (!action) return;
    onAction?.({ type: "room_sequence_resume_consumed" });
    openAction(action);
  }, [onAction, orderedActions, screenData?.room_sequence_resume_action_id]);

  function handleBegin() {
    if (WEB_ENV.isDev)
      console.log("[S17-D4B] handleBegin", {
        recId,
        recAction_found: !!recAction,
        recAction_type: (recAction as any)?.action_type,
        runner_payload_present: !!(recAction as any)?.runner_payload,
        inquiry_payload_present: !!(recAction as any)?.inquiry_payload,
        actions_count: (envelope.actions as any[]).length,
        action_ids: (envelope.actions as any[]).map((a: any) => a.action_id),
        render_id: renderId,
      });
    if (!recAction) return;
    setSequenceActive(true);
    void postRoomTelemetry({
      room_id: roomId,
      event_type: "recommended_action_started",
      render_id: renderId,
      action_id: recAction.action_id,
    } as any);
    openAction(recAction, { forceSequenceActive: true });
  }

  function handleExit() {
    void postRoomTelemetry({
      room_id: roomId,
      event_type: "room_exited",
      phase: "welcome",
      render_id: renderId,
    } as any);
    if (onAction) {
      onAction({ type: "room_exit", payload: { room_id: roomId } });
    }
  }

  return (
    <div
      style={{
        padding: "8px 20px 80px",
        minHeight: "calc(100dvh - 90px)",
        display: "flex",
        flexDirection: "column",
      }}
      data-testid="room-guided-section"
    >
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <img
          src="/lotus_icon.png"
          alt=""
          aria-hidden="true"
          style={{
            width: 38,
            height: 30,
            opacity: 0.9,
            margin: "0 auto 14px",
            display: "block",
          }}
        />
        <h1
          style={{
            fontFamily: "var(--kalpx-font-serif)",
            fontWeight: 700,
            fontSize: 38,
            lineHeight: 1.15,
            color: "#432104",
            margin: "0 0 16px",
            textWrap: "balance",
          }}
        >
          {roomName || envelope.room_display_name || ""}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            marginBottom: 20,
            color: "#D4A64A",
          }}
        >
          <div
            style={{
              width: 82,
              height: 1,
              background: "rgba(212,166,74,0.42)",
            }}
          />
          <span style={{ fontSize: 16, lineHeight: 1 }}>◇</span>
          <div
            style={{
              width: 82,
              height: 1,
              background: "rgba(212,166,74,0.42)",
            }}
          />
        </div>
        {situationAck && (
          <p
            style={{
              fontSize: 16,
              fontStyle: "italic",
              color: "#7A6A58",
              lineHeight: 1.55,
              margin: "0 0 10px",
              textWrap: "balance",
            }}
          >
            {situationAck}
          </p>
        )}
        {/* {roomPurposeLine && (
          <p
            style={{
              fontSize: 15,
              color: "#5F5144",
              lineHeight: 1.7,
              margin: "0 0 12px",
              textWrap: "balance",
            }}
          >
            {roomPurposeLine}
          </p>
        )} */}
        {/* {openingLine && (
          <p
            style={{
              fontSize: 16,
              color: "#3F2710",
              lineHeight: 1.7,
              margin: "0 0 10px",
              textWrap: "balance",
            }}
          >
            {openingLine}
          </p>
        )} */}
        {/* {secondBeatLine && (
          <p
            style={{
              fontSize: 16,
              color: "#3F2710",
              lineHeight: 1.6,
              margin: "0 0 10px",
              textWrap: "balance",
            }}
          >
            {secondBeatLine}
          </p>
        )} */}
      </div>

      <button
        onClick={handleBegin}
        data-testid="room-guided-begin"
        style={{
          width: "100%",
          maxWidth: 220,
          margin: "0 auto 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          padding: "10px",
          borderRadius: 999,
          border: "none",
          background: "#432104",
          color: "#FFF8EF",
          fontSize: 18,
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: 0.2,
          boxShadow: "0 14px 30px rgba(82,44,10,0.22)",
        }}
      >
        <span>{ROOM_GUIDED_COPY.begin}</span>
        <span style={{ fontSize: 24, lineHeight: 1, marginTop: -2 }}>→</span>
      </button>

      {recDesc && (
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <img
            src="/lotus_icon.png"
            alt=""
            aria-hidden="true"
            style={{
              width: 26,
              height: 20,
              opacity: 0.72,
              margin: "0 auto 8px",
              display: "block",
            }}
          />
          <button
            type="button"
            onClick={() => setRecommendedExpanded((v) => !v)}
            data-testid="room-guided-recommended-description"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              cursor: "pointer",
              color: "#6E6357",
              fontSize: 14,
              fontStyle: "italic",
              lineHeight: 1.6,
              textAlign: "center",
              maxWidth: 320,
            }}
          >
            <span
              style={
                recommendedExpanded
                  ? undefined
                  : {
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical" as const,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }
              }
            >
              {recDesc}
            </span>
          </button>
        </div>
      )}

      {memoryEchoLine && (
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <img
            src="/lotus_icon.png"
            alt=""
            aria-hidden="true"
            style={{
              width: 26,
              height: 20,
              opacity: 0.72,
              margin: "0 auto 8px",
              display: "block",
            }}
          />
          <p
            style={{
              fontSize: 14,
              fontStyle: "italic",
              color: "#6E6357",
              lineHeight: 1.6,
              margin: 0,
              textWrap: "balance",
            }}
          >
            {memoryEchoLine}
          </p>
        </div>
      )}

      {(principleBanner || sanatanInsightLine || roomPurposeLine) && (
        <div
          style={{
            background: "rgba(255, 251, 244, 0.9)",
            border: "1px solid rgba(214,183,130,0.28)",
            borderRadius: 24,
            padding: "10px",
            boxShadow: "0 18px 42px rgba(67,33,4,0.08)",
            backdropFilter: "blur(4px)",
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => {
              if (whyThisRoomLine) {
                void postRoomTelemetry({
                  room_id: roomId,
                  event_type: "why_this_viewed",
                  render_id: renderId,
                } as any);
              }
              setWhyExpanded((v) => !v);
            }}
            data-testid="room-guided-why-this"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              color: "#432104",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(247, 238, 225, 0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src="/lotus_icon.png"
                alt=""
                aria-hidden="true"
                style={{ width: 20, height: 16, opacity: 0.8 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              {whyExpanded && (
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#432104",
                    lineHeight: 1.3,
                    marginBottom: 12,
                  }}
                >
                  {principleBanner?.source_line || "Sanatan wisdom says"}
                </div>
              )}
              {!whyExpanded && sanatanInsightLine && (
                <div
                  style={{
                    fontSize: 15,
                    color: "#3F352B",
                    lineHeight: 1.55,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {sanatanInsightLine}
                </div>
              )}
            </div>
            <span style={{ fontSize: 15, lineHeight: 1, color: "#C89B39" }}>
              {whyExpanded ? (
                <ChevronUp size={20} color="#C89B39" strokeWidth={2.5} />
              ) : (
                <ChevronDown size={20} color="#C89B39" strokeWidth={2.5} />
              )}
            </span>
          </button>

          {whyExpanded && (
            <div
              data-testid="room-why-this-expanded"
              style={{
                marginTop: 18,
                padding: "0 6px 4px 54px",
                fontSize: 15,
                color: "#3F352B",
                lineHeight: 1.8,
              }}
            >
              {sanatanInsightLine && (
                <p style={{ margin: "0 0 18px" }}>{sanatanInsightLine}</p>
              )}
              {roomPurposeLine && (
                <p style={{ margin: 0 }}>{roomPurposeLine}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: "auto",
          paddingTop: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        {derivedLifeContextLabel && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 6,
                padding: "12px 18px",
                borderRadius: 999,
                background: "rgba(255,250,245,0.88)",
                border: "1px solid rgba(214,183,130,0.22)",
                color: "#5E5449",
                boxShadow: "0 10px 24px rgba(67,33,4,0.06)",
                fontSize: 14,
                lineHeight: 1.45,
                textAlign: "center",
                maxWidth: "100%",
              }}
            >
              <span style={{ whiteSpace: "nowrap" }}>Because you shared ·</span>
              <strong style={{ color: "#3E2A15", fontWeight: 600 }}>
                {derivedLifeContextLabel}
              </strong>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleExit}
            data-testid="room-guided-exit"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "#b0a090",
            }}
          >
            {ROOM_GUIDED_COPY.exitLabel}
          </button>
        </div>
      </div>

      {stepsOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(30,20,10,0.45)",
            zIndex: 999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => setStepsOpen(false)}
        >
          <div
            style={{
              background: "#FFF8EF",
              borderRadius: "18px 18px 0 0",
              width: "100%",
              maxWidth: 480,
              padding: "20px 0 40px",
              maxHeight: "70dvh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#432104",
                textAlign: "center",
                margin: "0 0 16px",
              }}
            >
              Steps in this space
            </p>
            {nonExitActions.map((a: any, i: number) => (
              <button
                key={a.action_id}
                data-testid={`room-step-${a.action_id}`}
                onClick={() => openAction(a)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "12px 20px",
                  borderBottom: "1px solid rgba(200,180,154,0.2)",
                  background:
                    a.action_id === recId
                      ? "rgba(201,168,76,0.08)"
                      : "transparent",
                  borderLeft: "none",
                  borderRight: "none",
                  borderTop: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: "#9f9f9f",
                    minWidth: 20,
                    textAlign: "right",
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: 14, color: "#432104" }}>
                  {a.label}
                </span>
                {a.action_id === recId && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "#8B6914",
                      fontStyle: "italic",
                    }}
                  >
                    suggested
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <StepModal
        visible={stepModalVisible}
        stepPayload={activeStepPayload}
        label={activeAction?.label || "Step"}
        onCancel={() => {
          setStepModalVisible(false);
          setActiveStepPayload(null);
          setActiveAction(null);
        }}
        onDone={(extra: StepModalResult) => {
          const stepPl = activeStepPayload;
          const action = activeAction;
          setStepModalVisible(false);
          setActiveStepPayload(null);
          setActiveAction(null);
          if (!action) return;
          if (extra.text || extra.grounding) {
            postRoomSacred(roomId, {
              writes_event:
                stepPl?.persistence?.writes_event ??
                action.persistence?.writes_event ??
                null,
              label: action.label,
              action_id: action.action_id,
              analytics_key: action.analytics_key ?? null,
              captured_at: Date.now(),
              text: extra.text ?? null,
              life_context: screenData?.room_life_context ?? null,
              journey_id: screenData?.journey_id ?? null,
              day_number: screenData?.day_number ?? null,
              source_surface: "step_pill",
            });
          }
          onAction?.({
            type: "room_step_completed",
            payload: {
              room_id: roomId,
              action_id: action.action_id,
              analytics_key: action.analytics_key,
              template_id: stepPl?.template_id,
              writes_event:
                stepPl?.persistence?.writes_event ??
                action.persistence?.writes_event,
              ...(extra.text ? { text: extra.text } : {}),
              ...(extra.grounding ? { grounding: extra.grounding } : {}),
            },
          });
          maybeAdvanceToNextAction(action.action_id);
        }}
      />
      <InquiryModal
        visible={inquiryModalVisible}
        label={activeAction?.label || "Inquiry"}
        inquiryPayload={activeAction?.inquiry_payload}
        onCancel={() => {
          setInquiryModalVisible(false);
          setActiveAction(null);
        }}
        onOpened={() =>
          activeAction &&
          onAction?.({
            type: "room_inquiry_opened",
            payload: {
              room_id: roomId,
              action_id: activeAction.action_id,
              analytics_key: activeAction.analytics_key,
            },
          })
        }
        onCategorySelected={(cat) =>
          activeAction &&
          onAction?.({
            type: "room_inquiry_category_selected",
            payload: {
              room_id: roomId,
              action_id: activeAction.action_id,
              category_id: cat.id,
            },
          })
        }
        onLaunchPractice={(_cat, templateId) => {
          setInquiryModalVisible(false);
          setActiveStepPayload({ template_id: templateId });
          setStepModalVisible(true);
        }}
        onSubmitJournal={(cat, text) => {
          const action = activeAction;
          setInquiryModalVisible(false);
          setActiveAction(null);
          if (!action) return;
          postRoomSacred(roomId, {
            writes_event: "inquiry_journal",
            label: action.label,
            action_id: action.action_id,
            analytics_key: action.analytics_key ?? null,
            captured_at: Date.now(),
            text,
            life_context: screenData?.room_life_context ?? null,
            journey_id: screenData?.journey_id ?? null,
            day_number: screenData?.day_number ?? null,
            source_surface: "inquiry_pill",
          });
          onAction?.({
            type: "room_step_completed",
            payload: {
              room_id: roomId,
              action_id: action.action_id,
              analytics_key: action.analytics_key,
              template_id: "step_journal_inquiry",
              text,
              category_id: cat.id,
              source: "inquiry",
            },
          });
          maybeAdvanceToNextAction(action.action_id);
        }}
      />
      <CarryCaptureModal
        visible={carryModalVisible}
        label={activeAction?.label || "Carry"}
        roomId={roomId}
        actionId={activeAction?.action_id || ""}
        analyticsKey={activeAction?.analytics_key ?? null}
        writesEvent={
          activeAction?.carry_payload?.writes_event ??
          activeAction?.carry_payload?.persistence?.writes_event ??
          activeAction?.persistence?.writes_event ??
          null
        }
        carryPayload={activeAction?.carry_payload}
        lifeContext={screenData?.room_life_context ?? null}
        journeyId={screenData?.journey_id ?? null}
        dayNumber={screenData?.day_number ?? null}
        onCancel={() => {
          setCarryModalVisible(false);
          setActiveAction(null);
        }}
        onSave={(_text, _sacredWriteOk) => {
          const action = activeAction;
          setCarryModalVisible(false);
          setActiveAction(null);
          if (!action) return;
          onAction?.({
            type: "room_carry_captured",
            payload: {
              room_id: roomId,
              action_id: action.action_id,
              analytics_key: action.analytics_key,
              label: action.label,
              writes_event:
                action.carry_payload?.writes_event ??
                action.carry_payload?.persistence?.writes_event ??
                action.persistence?.writes_event ??
                null,
            },
          });
          maybeAdvanceToNextAction(action.action_id);
        }}
      />
    </div>
  );
}
