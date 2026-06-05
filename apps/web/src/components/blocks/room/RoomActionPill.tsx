/**
 * RoomActionPill — renders a single room action from the RoomRenderV1 envelope.
 * Phase 13.5: Parity with RN StepPill / InquiryPill / CarryCaptureModal.
 *
 * Handles: runner_mantra, runner_sankalp, runner_practice, teaching, inquiry,
 *          in_room_step, in_room_carry, exit.
 */
import React, { useState } from "react";
import { useTranslation } from "../../../lib/i18n";
import { postRoomSacred } from "../../../engine/mitraApi";
import { CarryCaptureModal } from "./CarryCaptureModal";
import { InquiryModal } from "./InquiryModal";
import type { StepModalResult } from "./StepModal";
import { StepModal, classifyStep } from "./StepModal";

interface RoomAction {
  action_id: string;
  label: string;
  action_type: string;
  action_family?: string;
  analytics_key?: string | null;
  helper_line?: string | null;
  runner_payload?: any;
  teaching_payload?: any;
  inquiry_payload?: any;
  step_payload?: any;
  carry_payload?: any;
  exit_payload?: any;
  primary_recommendation?: boolean;
  persistence?: { writes_event?: string | null };
  display?: { display_title?: string | null; transliteration?: string | null };
  [key: string]: any;
}

interface Props {
  action: RoomAction;
  roomId: string;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

// Carry types that write sacred text (need modal + API call)
const TEXT_CARRY_WRITES_EVENTS = new Set([
  "joy_carry",
  "joy_named",
  "release_capture",
  "release_named",
  "growth_reflect",
  "growth_journal",
  "clarity_note",
  "clarity_journal",
  "stillness_note",
  "stillness_named",
  "connection_note",
  "connection_named",
  "connection_reach_out",
]);

export function RoomActionPill({
  action,
  roomId,
  screenData = {},
  onAction,
}: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [done, setDone] = useState(false);
  const [stepSaved, setStepSaved] = useState(false);
  const [carrySaved, setCarrySaved] = useState(false);
  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [inquiryModalVisible, setInquiryModalVisible] = useState(false);
  const [carryModalVisible, setCarryModalVisible] = useState(false);
  // Active step payload — either action.step_payload (normal tap) or synthesized from inquiry practice launch
  const [activeStepPayload, setActiveStepPayload] = useState<any>(null);

  const isExit = action.action_type === "exit";
  const isRunner = action.action_type.startsWith("runner_");
  const isTeaching = action.action_type === "teaching";
  const isInquiry = action.action_type === "inquiry";
  const isStep = action.action_type === "in_room_step";
  const isCarry = action.action_type === "in_room_carry";
  const currentStepPayload = activeStepPayload ?? action.step_payload;
  const stepKind = isStep
    ? classifyStep(currentStepPayload?.template_id)
    : "unknown";
  const stepMemoryModal = currentStepPayload?.memory_modal ?? null;
  const isStepTextCapture =
    isStep && stepKind === "text_input" && !!stepMemoryModal;

  // Whether this carry action writes text (needs modal)
  const writesEvent =
    action.carry_payload?.writes_event ??
    action.carry_payload?.persistence?.writes_event ??
    action.persistence?.writes_event ??
    null;
  const carryNeedsTextInput =
    isCarry &&
    !!writesEvent &&
    (TEXT_CARRY_WRITES_EVENTS.has(writesEvent) ||
      String(writesEvent).includes("capture") ||
      String(writesEvent).includes("carry") ||
      String(writesEvent).includes("note") ||
      String(writesEvent).includes("reflect"));

  // Joy carry flag (navigates to dashboard on confirm)
  const isJoyCarry = writesEvent === "joy_carry";

  const handleTap = () => {
    if (isExit) {
      onAction?.({ type: "room_exit", payload: { room_id: roomId } });
      return;
    }

    if (isRunner) {
      const rp = action.runner_payload || {};
      const variant =
        action.action_type === "runner_mantra"
          ? "mantra"
          : action.action_type === "runner_sankalp"
            ? "sankalp"
            : "practice";
      // canonical_rich_runner.v1 sends the authored runner fields at the
      // runner_payload root. Preserve the full payload so runner screens can
      // render insight/how_to_live/benefits/meaning/etc. instead of losing
      // detail during launch from rooms.
      const item = {
        ...(rp.item || rp.offering || rp),
        item_id: rp.item_id || rp.item?.item_id || rp.offering?.item_id,
        id: rp.item_id || rp.item?.id || rp.offering?.id || rp.item?.item_id || rp.offering?.item_id,
        item_type:
          rp.item_type || rp.item?.item_type || rp.offering?.item_type || variant,
        title: rp.title || rp.item?.title || rp.offering?.title || "",
        subtitle: rp.subtitle || rp.subtitle_or_line || rp.item?.subtitle || rp.offering?.subtitle || "",
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
          rp.devanagari || rp.item?.devanagari || rp.offering?.devanagari || "",
        audio_url: rp.audio_url || rp.item?.audio_url || rp.offering?.audio_url || "",
        reps_total:
          rp.reps_default_selection ||
          rp.reps_target ||
          rp.item?.reps_total ||
          rp.offering?.reps_total ||
          null,
        duration_seconds:
          rp.duration_min != null
            ? Math.round(rp.duration_min * 60)
            : rp.item?.duration_seconds || rp.offering?.duration_seconds || null,
        steps: rp.steps || rp.item?.steps || rp.offering?.steps || [],
      };
      // G17 Fix 1: use BE-provided runner_source so track-completion records a valid source.
      // 'support_room' is the canonical fallback (matches RN VALID_SOURCE_SURFACES).
      onAction?.({
        type: "start_runner",
        payload: { source: rp.runner_source || "support_room", variant, item },
      });
      return;
    }

    if (isTeaching) {
      // R2c: Teaching expands inline (approved web divergence — RN navigates to WhyThisL2Sheet).
      // Dispatch is room_step_completed, NOT open_why_this_l2. This is intentional.
      setExpanded(!expanded);
      if (!expanded) {
        onAction?.({
          type: "room_step_completed",
          payload: {
            room_id: roomId,
            action_id: action.action_id,
            analytics_key: action.analytics_key,
          },
        });
      }
      return;
    }

    if (isInquiry) {
      setInquiryModalVisible(true);
      if (!expanded) {
        onAction?.({
          type: "room_inquiry_opened",
          payload: {
            room_id: roomId,
            action_id: action.action_id,
            analytics_key: action.analytics_key,
          },
        });
        setExpanded(true);
      }
      return;
    }

    if (isStep) {
      const kind = classifyStep(action.step_payload?.template_id);
      if (kind !== "unknown") {
        setActiveStepPayload(action.step_payload);
        setStepModalVisible(true);
      } else if (!done) {
        // Unknown template: complete immediately
        setDone(true);
        onAction?.({
          type: "room_step_completed",
          payload: {
            room_id: roomId,
            action_id: action.action_id,
            analytics_key: action.analytics_key,
            template_id: action.step_payload?.template_id,
            writes_event: action.step_payload?.persistence?.writes_event,
          },
        });
      }
      return;
    }

    if (isCarry) {
      if (carryNeedsTextInput && !done) {
        setCarryModalVisible(true);
      } else if (!done) {
        setDone(true);
        onAction?.({
          type: "room_carry_captured",
          payload: {
            room_id: roomId,
            action_id: action.action_id,
            analytics_key: action.analytics_key,
            label: action.label,
            writes_event: writesEvent,
          },
        });
      }
      return;
    }

    console.warn("[RoomActionPill] unknown action_type:", action.action_type);
  };

  const pillStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    borderRadius: 22,
    border: isExit
      ? "1px solid var(--kalpx-border-gold)"
      : action.primary_recommendation && !done
        ? "1.4px solid #D4A017"
        : "1px solid rgba(159,159,159,0.3)",
    background: isExit
      ? "rgba(255,248,239,0.6)"
      : done
        ? "rgba(201,168,76,0.06)"
        : "#FBF5F5",
    color: isExit
      ? "var(--kalpx-text-muted)"
      : done
        ? "var(--kalpx-text-muted)"
        : "var(--kalpx-text)",
    fontSize: 15,
    textAlign: "center" as const,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
    boxShadow: isExit ? "none" : "var(--kalpx-shadow-pill)",
    touchAction: "manipulation" as const,
  };

  const expandableContent = isTeaching
    ? action.teaching_payload?.body || action.teaching_payload?.text || ""
    : "";

  // Transliteration: shown for runner_mantra if available
  const transliteration =
    action.action_type === "runner_mantra"
      ? action.display?.transliteration ||
        action.runner_payload?.transliteration ||
        null
      : null;

  const stepConfirmationText = stepMemoryModal?.confirmation || "Saved.";
  const stepAddAnotherLabel =
    stepMemoryModal?.add_another_label || "Write another";
  const carryConfirmationText =
    action.carry_payload?.memory_modal?.confirmation || "Saved.";
  const carryAddAnotherLabel =
    action.carry_payload?.memory_modal?.add_another_label || "Write another";

  const renderStepSavedCard = () => (
    <div
      data-testid={`room-action-step-saved-${action.action_id}`}
      style={{
        width: "100%",
        padding: "18px 18px 20px",
        borderRadius: 22,
        border: "1px solid rgba(212, 183, 132, 0.55)",
        background: "rgba(251,245,245,0.95)",
        boxShadow: "var(--kalpx-shadow-pill)",
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: "0 0 4px",
          fontSize: 12,
          letterSpacing: 1,
          textTransform: "none",
          color: "#D4A017",
        }}
      >
        {t('common.carryWithYou')}
      </p>
      <p
        style={{
          margin: "0 0 16px",
          fontSize: 16,
          color: "#2C2A26",
          fontWeight: 600,
        }}
      >
        {stepConfirmationText}
      </p>
      <div
        style={{
          display: "flex",
          gap: 14,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => {
            setStepSaved(false);
            setStepModalVisible(true);
          }}
          style={{
            minWidth: 152,
            padding: "12px 18px",
            borderRadius: 999,
            border: "1px solid rgba(60,60,67,0.45)",
            background: "rgba(255,255,255,0.5)",
            fontSize: 15,
            color: "#432104",
            cursor: "pointer",
          }}
        >
          {stepAddAnotherLabel}
        </button>
        <button
          onClick={() =>
            onAction?.({ type: "room_exit", payload: { room_id: roomId } })
          }
          style={{
            minWidth: 152,
            padding: "12px 18px",
            borderRadius: 999,
            border: "1px solid rgba(212, 183, 132, 0.9)",
            background: "rgba(255,255,255,0.5)",
            fontSize: 15,
            color: "#432104",
            cursor: "pointer",
          }}
        >
          {t('common.returnHome')}
        </button>
      </div>
    </div>
  );

  const renderCarrySavedCard = () => (
    <div
      data-testid={`room-action-carry-saved-${action.action_id}`}
      style={{
        width: "100%",
        padding: 10,
        borderRadius: 22,
        border: "1px solid rgba(212, 183, 132, 0.55)",
        background: "rgba(251,245,245,0.95)",
        boxShadow: "var(--kalpx-shadow-pill)",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 12, color: "#D4A017" }}>{t('common.carryWithYou')}</p>
      <p
        style={{
          margin: "0 0 16px",
          fontSize: 16,
          color: "#2C2A26",
          fontWeight: 600,
        }}
      >
        {carryConfirmationText}
      </p>
      <div
        style={{
          display: "flex",
          gap: 14,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => {
            setCarrySaved(false);
            setCarryModalVisible(true);
          }}
          style={{
            borderRadius: 999,
            padding: "8px",

            border: "1px solid rgba(60,60,67,0.45)",
            background: "rgba(255,255,255,0.5)",
            fontSize: 13,
            color: "#432104",
            cursor: "pointer",
          }}
        >
          {carryAddAnotherLabel}
        </button>
        <button
          onClick={() =>
            onAction?.({ type: "room_exit", payload: { room_id: roomId } })
          }
          style={{
            padding: "8px",
            borderRadius: 999,
            border: "1px solid rgba(60,60,67,0.45)",
            background: "rgba(255,255,255,0.5)",
            fontSize: 13,
            color: "#432104",
            cursor: "pointer",
          }}
        >
          {t('common.returnHome')}
        </button>
      </div>
    </div>
  );

  // Exit renders as a plain underlined text link — no pill wrapper, no action_family label (matches RN RoomActionExitPill)
  if (isExit) {
    return (
      <div
        data-testid={`room-action-${action.action_id}`}
        style={{ textAlign: "center", margin: "4px 0" }}
      >
        <button
          onClick={handleTap}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            color: "var(--kalpx-text)",
            textDecoration: "underline",
            padding: "8px 0",
          }}
          data-testid={`room-action-exit-${action.action_id}`}
        >
          {action.label || "I'll go now"}
        </button>
      </div>
    );
  }

  return (
    <div data-testid={`room-action-${action.action_id}`}>
      {carrySaved && isCarry ? (
        renderCarrySavedCard()
      ) : stepSaved && isStepTextCapture ? (
        renderStepSavedCard()
      ) : (
        <button style={pillStyle} onClick={handleTap}>
          {/* Kind label (action_family) — centered, uppercase */}
          {action.action_family && !done && (
            <span
              style={{
                fontSize: 12,
                color: "#D4A017",
                letterSpacing: 1,
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              {action.action_family}
            </span>
          )}

          {/* Main label */}
          <span
            style={{
              textAlign: "center",
              fontWeight: action.primary_recommendation ? 600 : 500,
            }}
          >
            {action.label}
            {done ? " ✓" : ""}
          </span>

          {/* Transliteration — mantra runner only */}
          {transliteration && !done && (
            <span
              style={{ fontSize: 13, color: "#8F8378", textAlign: "center" }}
            >
              {transliteration}
            </span>
          )}

          {/* helper_line — muted, centered */}
          {action.helper_line && !done && (
            <span
              data-testid={`room-action-helper-${action.action_id}`}
              style={{
                fontSize: 13,
                color: "#9A8C78",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              {action.helper_line}
            </span>
          )}

          {/* Primary recommendation badge */}
          {action.primary_recommendation && !done && (
            <span
              style={{
                fontSize: 10,
                color: "#C9A84C",
                letterSpacing: 1,
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              {t('common.startHere')}
            </span>
          )}
        </button>
      )}

      {/* Teaching expanded content */}
      {expanded && expandableContent && (
        <div
          style={{
            margin: "4px 0 0",
            padding: "10px",
            borderRadius: 12,
            background: "rgba(201,168,76,0.04)",
            border: "1px solid rgba(201,168,76,0.15)",
          }}
          data-testid={`room-action-expanded-${action.action_id}`}
        >
          <p style={{ fontSize: 15, color: "#3D3930", lineHeight: 1.7 }}>
            {expandableContent}
          </p>
        </div>
      )}

      {/* Step Modal */}
      <StepModal
        visible={stepModalVisible}
        stepPayload={activeStepPayload ?? action.step_payload}
        label={action.label}
        onCancel={() => {
          setStepModalVisible(false);
          setActiveStepPayload(null);
        }}
        onDone={(extra: StepModalResult) => {
          const stepPl = activeStepPayload ?? action.step_payload;
          setStepModalVisible(false);
          setActiveStepPayload(null);
          const completedKind = classifyStep(stepPl?.template_id);
          const isSavedTextStep =
            completedKind === "text_input" &&
            !!stepPl?.memory_modal &&
            typeof extra.text === "string" &&
            extra.text.trim().length > 0;
          if (isSavedTextStep) {
            setStepSaved(true);
          } else {
            setDone(true);
          }
          // R2a: fire-and-forget sacred POST for text/grounding steps
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
              life_context: screenData.room_life_context ?? null,
              journey_id: screenData.journey_id ?? null,
              day_number: screenData.day_number ?? null,
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
        }}
      />

      {/* Inquiry Modal */}
      <InquiryModal
        visible={inquiryModalVisible}
        label={action.label}
        inquiryPayload={action.inquiry_payload}
        onCancel={() => setInquiryModalVisible(false)}
        onOpened={() =>
          onAction?.({
            type: "room_inquiry_opened",
            payload: {
              room_id: roomId,
              action_id: action.action_id,
              analytics_key: action.analytics_key,
            },
          })
        }
        onCategorySelected={(cat) =>
          onAction?.({
            type: "room_inquiry_category_selected",
            payload: {
              room_id: roomId,
              action_id: action.action_id,
              category_id: cat.id,
            },
          })
        }
        onLaunchPractice={(_cat, templateId) => {
          // R2b Option A: synthesize step payload from category and open StepModal (matches RN).
          setInquiryModalVisible(false);
          setActiveStepPayload({ template_id: templateId });
          setStepModalVisible(true);
        }}
        onSubmitJournal={(cat, text) => {
          setInquiryModalVisible(false);
          setDone(true);
          // R2b: fire-and-forget sacred POST for inquiry journal submission
          postRoomSacred(roomId, {
            writes_event: "inquiry_journal",
            label: action.label,
            action_id: action.action_id,
            analytics_key: action.analytics_key ?? null,
            captured_at: Date.now(),
            text,
            life_context: screenData.room_life_context ?? null,
            journey_id: screenData.journey_id ?? null,
            day_number: screenData.day_number ?? null,
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
        }}
      />

      {/* Carry Capture Modal */}
      {carryNeedsTextInput && (
        <CarryCaptureModal
          visible={carryModalVisible}
          label={action.label}
          roomId={roomId}
          actionId={action.action_id}
          analyticsKey={action.analytics_key}
          writesEvent={writesEvent}
          carryPayload={action.carry_payload}
          lifeContext={screenData.room_life_context ?? null}
          journeyId={screenData.journey_id ?? null}
          dayNumber={screenData.day_number ?? null}
          onSave={(text, sacredWriteOk) => {
            setCarryModalVisible(false);
            setCarrySaved(true);
            setDone(true);
            onAction?.({
              type: "room_carry_captured",
              payload: {
                room_id: roomId,
                action_id: action.action_id,
                analytics_key: action.analytics_key,
                label: action.label,
                writes_event: writesEvent,
                carry_text: text,
                sacred_write_ok: sacredWriteOk,
              },
            });
          }}
          onCancel={() => setCarryModalVisible(false)}
          onReturnHome={() => {
            setCarryModalVisible(false);
            onAction?.({ type: "room_exit", payload: { room_id: roomId } });
          }}
          onAddAnother={() => {
            // CarryCaptureModal manages its own text state; onAddAnother allows re-open
            setCarryModalVisible(false);
          }}
          isJoyCarry={isJoyCarry}
          showConfirmationTray={false}
        />
      )}
    </div>
  );
}
