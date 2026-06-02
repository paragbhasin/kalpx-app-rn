/**
 * CarryCaptureModal — web equivalent of RN carry capture flow (Phase 13.5).
 * Handles in_room_carry actions that require text input + sacred POST.
 *
 * Keep the authored fallback copy in sync with:
 * apps/mobile/src/blocks/room/actions/RoomActionCarryPill.tsx
 */
import { useEffect, useState } from "react";
import { postRoomSacred } from "../../../engine/mitraApi";

const MAX_TEXT = 1000;

type CarryModalCopy = {
  title?: string;
  prompt: string;
  placeholder: string;
  primary_label: string;
  sanatan_context?: string;
  why_we_ask?: string;
  confirmation?: string;
  add_another_label?: string;
};

// Generic fallback copy for carry types (RN source: CARRY_MEMORY_MODAL)
const CARRY_MEMORY_MODAL: Record<string, CarryModalCopy> = {
  joy_carry: {
    prompt: "What do you want to carry with you from this moment?",
    placeholder: "What you noticed, felt, or want to hold onto...",
    primary_label: "Carry this",
    sanatan_context: "Joy held with awareness becomes a source of light.",
  },
  release_capture: {
    prompt: "What are you setting down right now?",
    placeholder: "Name what you are releasing...",
    primary_label: "Release it",
  },
  growth_reflect: {
    prompt: "What insight or intention do you want to take with you?",
    placeholder: "Your reflection...",
    primary_label: "Hold this",
  },
  clarity_note: {
    prompt: "What has become clearer for you?",
    placeholder: "Your clarity note...",
    primary_label: "Remember this",
  },
  stillness_note: {
    title: "Write what became still",
    prompt: "What did stillness offer you today?",
    placeholder: "What arose in the quiet...",
    primary_label: "Keep this",
  },
  stillness_named: {
    title: "Write what became still",
    sanatan_context:
      "Stillness begins when attention returns to one steady anchor.",
    why_we_ask:
      "Naming what settled helps you recognize the ground beneath the noise.",
    prompt: "What feels quieter now?",
    placeholder: "Write one word or a few lines…",
    primary_label: "Save this stillness",
    confirmation: "Saved.",
    add_another_label: "Write another",
  },
  clarity_journal: {
    title: "Write one honest question",
    sanatan_context:
      "Clarity comes when we stop obeying confusion and look at what is actually here.",
    why_we_ask:
      "Writing the question separates the real decision from the noise around it.",
    prompt: "What is the question you are actually sitting with?",
    placeholder: "Write your honest question…",
    primary_label: "Save this question",
    confirmation: "Saved. You can write another.",
    add_another_label: "Write another",
  },
  connection_named: {
    title: "Name someone who matters",
    sanatan_context:
      "Naming someone helps you return from feeling alone to one thread of care.",
    why_we_ask: "Sambandha reminds us that even one true bond can hold us.",
    prompt: "Who is close to your heart right now?",
    placeholder: "Write a name, relationship, or a few words…",
    primary_label: "Save this connection",
    confirmation: "Saved. You can name another.",
    add_another_label: "Name another",
  },
  joy_named: {
    title: "Write what’s good right now",
    sanatan_context: "Santosha begins by noticing what is already enough.",
    why_we_ask:
      "Writing one good thing helps the mind stay with it instead of rushing past it.",
    prompt: "What feels good, steady, or quietly enough right now?",
    placeholder: "Write one good thing…",
    primary_label: "Save this joy",
    confirmation: "Saved. You can write another.",
    add_another_label: "Write another",
  },
  growth_journal: {
    title: "Write what you noticed",
    sanatan_context: "Growth ripens through one right action, not speed.",
    why_we_ask:
      "Naming what you noticed turns observation into the seed of a next step.",
    prompt: "What did you notice, or what is forming?",
    placeholder: "Write what came up…",
    primary_label: "Save this",
    confirmation: "Saved. You can write another.",
    add_another_label: "Write another",
  },
  connection_reach_out: {
    title: "Reach out to one person",
    sanatan_context:
      "A short act of reaching is itself the practice of sambandha.",
    why_we_ask:
      "Writing the message — even without sending — brings the connection closer.",
    prompt: "Write a short message to someone who matters.",
    placeholder: "Your message…",
    primary_label: "Save and copy message",
    confirmation: "Saved. You can add another.",
    add_another_label: "Add another",
  },
  release_named: {
    title: "Name what you’re setting down",
    sanatan_context:
      "Naming the weight helps you separate yourself from what you are carrying.",
    why_we_ask:
      "Letting go is not giving up. It is loosening the grip so life can move again.",

    prompt: "What is ready to be set down for now?",
    placeholder: "Write one word or a few lines…",
    primary_label: "Save this release",
    confirmation: "Saved. You set it down.",
    add_another_label: "Name another",
  },
  connection_note: {
    prompt: "What do you want to carry from this sense of connection?",
    placeholder: "Your note...",
    primary_label: "Save this",
  },
  generic: {
    prompt: "What do you want to remember from this?",
    placeholder: "Your reflection...",
    primary_label: "Save",
  },
};

const CARRY_MODAL_BY_CONTEXT: Record<string, Record<string, CarryModalCopy>> = {
  clarity_journal: {
    money_security: {
      title: "Write the money question clearly",
      sanatan_context:
        "Naming the question is itself the first act of clarity.",
      why_we_ask:
        "Money confusion often comes from too many questions tangled together. Writing one separates it from the rest.",
      prompt: "What is the actual money question you are holding?",
      placeholder: "Write one clear question…",
      primary_label: "Save this question",
      confirmation: "Saved. You can write another.",
      add_another_label: "Write another",
    },
    work_career: {
      title: "Write what your work is actually asking",
      sanatan_context:
        "When action and dharma align, clarity follows. First, see what is actually being asked.",
      why_we_ask:
        "Work often has one real question underneath the noise. Writing it down reveals what actually needs answering.",
      prompt: "What is your work actually asking of you right now?",
      placeholder: "Write the real question…",
      primary_label: "Save this",
      confirmation: "Saved. You can write another.",
      add_another_label: "Write another",
    },
  },
  release_named: {
    money_security: {
      title: "Name what you are setting down for now",
      sanatan_context:
        "The weight grows heavier only when we forget we can set it down.",
      why_we_ask:
        "Money worry often locks in the body. Naming what you are setting down, even for a moment, loosens the grip.",
      prompt: "What money worry is ready to be set down for now?",
      placeholder: "Write one word or a few lines…",
      primary_label: "Save this release",
      confirmation: "Saved. You set it down.",
      add_another_label: "Name another",
    },
    relationships: {
      title: "Name what you are releasing in this relationship",
      sanatan_context:
        "Sambandha reminds us that even one true bond can hold us.",
      why_we_ask:
        "Naming someone helps you return from feeling alone to one thread of care.",
      prompt: "What are you ready to release in this relationship for now?",
      placeholder: "Write one word or a few lines…",
      primary_label: "Save this release",
      confirmation: "Saved. You set it down.",
      add_another_label: "Name another",
    },
  },
  growth_journal: {
    work_career: {
      title: "Write the next work step",
      sanatan_context:
        "Action done with attention, not speed, is what ripens into real growth.",
      why_we_ask:
        "At work, the next right step is often smaller than we think. Writing it makes it real.",
      prompt: "What is the one next step your work is asking for?",
      placeholder: "Write one clear step…",
      primary_label: "Save this step",
      confirmation: "Saved. You can write another.",
      add_another_label: "Write another",
    },
    purpose_direction: {
      title: "Write what is yours to do next",
      sanatan_context:
        "Dharma is not a life plan — it is the next right action, done faithfully.",
      why_we_ask:
        "When the path is unclear, writing what feels yours to do next is the act of listening.",
      prompt:
        "What feels like yours to do, even if the whole path is not yet clear?",
      placeholder: "Write what comes…",
      primary_label: "Save this",
      confirmation: "Saved. You can write another.",
      add_another_label: "Write another",
    },
  },
  joy_named: {
    health_energy: {
      title: "Write one good thing from today's body",
      sanatan_context:
        "The body is a gift. Gratitude for it, even small, returns something.",
      why_we_ask:
        "When the body feels difficult, finding one good thing in it is a gentle act of care.",
      prompt: "What is one thing your body is doing well or feeling right now?",
      placeholder: "Write one good thing…",
      primary_label: "Save this joy",
      confirmation: "Saved. You can write another.",
      add_another_label: "Write another",
    },
  },
  connection_named: {
    relationships: {
      title: "Name the person you want to return to",
      sanatan_context:
        "Sambandha says a bond held in memory is a bond that continues to care.",
      why_we_ask:
        "When a relationship feels far or strained, naming the person keeps the thread alive.",
      prompt: "Who is the person you want to stay close to?",
      placeholder: "Write a name or a few words…",
      primary_label: "Save this connection",
      confirmation: "Saved. You can name another.",
      add_another_label: "Name another",
    },
    health_energy: {
      title: "Name someone who is close to you now",
      sanatan_context:
        "Caring company is itself a form of medicine. Even naming who is close changes something.",
      why_we_ask:
        "When the body is struggling, naming who is close to you brings real comfort.",
      prompt: "Who is with you in this, even from a distance?",
      placeholder: "Write a name or a few words…",
      primary_label: "Save this connection",
      confirmation: "Saved. You can name another.",
      add_another_label: "Name another",
    },
  },
  stillness_named: {
    money_security: {
      title: "Write what became quiet beneath the worry",
      sanatan_context:
        "What is underneath the noise has always been quiet. It is still there.",
      why_we_ask:
        "Money pressure is loud. Writing what stayed quiet beneath it helps you locate your steadiness.",
      prompt:
        "Beneath the money worry, what feels quiet or steady, even a little?",
      placeholder: "Write one word or a few lines…",
      primary_label: "Save this stillness",
      confirmation: "Saved.",
      add_another_label: "Write another",
    },
  },
};

function getCarryCopy(
  writesEvent?: string | null,
  carryPayload?: any,
  lifeContext?: string | null,
) {
  const mm = carryPayload?.memory_modal;
  if (mm) {
    return {
      title: mm.title,
      prompt: mm.prompt,
      placeholder: mm.placeholder || "Type what you feel..",
      primary_label: mm.primary_label || "Save",
      sanatan_context: mm.sanatan_context,
      why_we_ask: mm.why_we_ask,
      confirmation: mm.confirmation,
      add_another_label: mm.add_another_label,
    };
  }
  if (lifeContext) {
    const ctxCopy = CARRY_MODAL_BY_CONTEXT[writesEvent || ""]?.[lifeContext];
    if (ctxCopy) return ctxCopy;
  }
  const key = writesEvent || "generic";
  return CARRY_MEMORY_MODAL[key] ?? CARRY_MEMORY_MODAL.generic;
}

interface ConfirmationState {
  visible: boolean;
}

interface Props {
  visible: boolean;
  label: string;
  roomId: string;
  actionId: string;
  analyticsKey?: string | null;
  writesEvent?: string | null;
  carryPayload?: any;
  lifeContext?: string | null;
  journeyId?: string | null;
  dayNumber?: number | null;
  onSave: (text: string, sacredWriteOk: boolean) => void;
  onCancel: () => void;
  onAddAnother?: () => void;
  onReturnHome?: () => void;
  isJoyCarry?: boolean;
  showConfirmationTray?: boolean;
  presentation?: "modal" | "screen";
}

export function CarryCaptureModal({
  visible,
  label,
  roomId,
  actionId,
  analyticsKey,
  writesEvent,
  carryPayload,
  lifeContext,
  journeyId,
  dayNumber,
  onSave,
  onCancel,
  onAddAnother,
  onReturnHome,
  isJoyCarry = false,
  showConfirmationTray = true,
  presentation = "modal",
}: Props) {
  const [text, setText] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    visible: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = getCarryCopy(writesEvent, carryPayload, lifeContext);
  const trimmed = text.trim();
  const enabled = trimmed.length >= 1 && !isSubmitting;
  const isScreen = presentation === "screen";

  useEffect(() => {
    if (!visible) {
      setText("");
      setConfirmation({ visible: false });
      setIsSubmitting(false);
      setError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !confirmation.visible) onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, onCancel, confirmation.visible]);

  if (!visible) return null;

  const handleSave = async () => {
    if (!enabled) return;
    setIsSubmitting(true);
    setError(null);
    // postRoomSacred catches internally — returns data or null; never throws
    const sacredResult = await postRoomSacred(roomId, {
      writes_event: writesEvent,
      label,
      action_id: actionId,
      analytics_key: analyticsKey,
      captured_at: Date.now(),
      text: trimmed,
      life_context: lifeContext ?? null,
      journey_id: journeyId ?? null,
      day_number: dayNumber ?? null,
      source_surface: "carry_pill",
    });
    setIsSubmitting(false);
    const sacredWriteOk = sacredResult !== null;
    onSave(trimmed, sacredWriteOk);
    // R2d: joy_carry auto-navigates to dashboard (matches RN) — skip confirmation screen
    if (isJoyCarry) {
      onReturnHome?.();
    } else if (showConfirmationTray) {
      setConfirmation({ visible: true });
    }
  };

  return (
    <div
      style={{
        position: isScreen ? "relative" : "fixed",
        inset: isScreen ? undefined : 0,
        background: isScreen ? "transparent" : "rgba(0,0,0,0.35)",
        zIndex: isScreen ? undefined : 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: isScreen ? "100%" : undefined,
      }}
      onClick={(e) =>
        !isScreen &&
        e.target === e.currentTarget &&
        !confirmation.visible &&
        onCancel()
      }
      data-testid="carry-capture-modal-backdrop"
    >
      <div
        data-testid="carry-capture-modal"
        style={{
          width: "100%",
          maxWidth: 780,
          background: isScreen ? "transparent" : "#fdf8ef",
          backgroundImage: isScreen ? "none" : "url(/beige_bg.png)",
          backgroundSize: isScreen ? undefined : "cover",
          backgroundPosition: isScreen ? undefined : "center",
          minHeight: isScreen ? "100%" : undefined,
          padding: "0 0 32px",
          maxHeight: isScreen ? "100dvh" : "calc(100dvh - 40px)",
          overflowY: "auto",
          boxShadow: isScreen ? "none" : "0 18px 50px rgba(48, 28, 6, 0.16)",
        }}
      >
        {!isScreen && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "12px 0 4px",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: "#E0E0E2",
              }}
            />
          </div>
        )}

        {confirmation.visible ? (
          /* Confirmation state */
          <div
            style={{ padding: "36px 34px 20px", textAlign: "center" }}
            data-testid="carry-capture-confirmation"
          >
            <p style={{ fontSize: 12, color: "#D4A017", margin: "0 0 4px" }}>
              Carry with you
            </p>
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#2C2A26",
                margin: "0 0 18px",
              }}
            >
              {copy.confirmation || "Saved."}
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {onAddAnother && !isJoyCarry && (
                <button
                  data-testid="carry-confirm-add-another"
                  onClick={() => {
                    setText("");
                    setConfirmation({ visible: false });
                    onAddAnother?.();
                  }}
                  style={{
                    minWidth: 150,
                    padding: "12px 18px",
                    borderRadius: 999,
                    border: "1px solid rgba(60,60,67,0.45)",
                    background: "rgba(255,255,255,0.5)",
                    fontSize: 15,
                    color: "#432104",
                    cursor: "pointer",
                  }}
                >
                  {copy.add_another_label || "Write another"}
                </button>
              )}
              {onReturnHome && (
                <button
                  data-testid="carry-confirm-return-home"
                  onClick={() => {
                    setConfirmation({ visible: false });
                    onReturnHome();
                  }}
                  style={{
                    minWidth: 150,
                    padding: "12px 18px",
                    borderRadius: 999,
                    border: "1px solid rgba(212, 183, 132, 0.9)",
                    background: "rgba(255,255,255,0.5)",
                    fontSize: 15,
                    color: "#432104",
                    cursor: "pointer",
                  }}
                >
                  Return home
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Input state */
          <div style={{ padding: "0 18px 0" }}>
            {/* Header */}
            <div style={{ padding: "5px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <button
                  onClick={onCancel}
                  aria-label="Back"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    border: "1.2px solid rgba(191, 151, 84, 0.75)",
                    background: "rgba(255,255,255,0.52)",
                    color: "#A7792E",
                    fontSize: 28,
                    lineHeight: 1,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  ‹
                </button>
                <button
                  data-testid="carry-capture-cancel"
                  onClick={onCancel}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 16,
                    color: "#45403A",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Cancel
                </button>
              </div>

              <div
                style={{
                  textAlign: "center",
                  maxWidth: 620,
                  margin: "0 auto",
                }}
              >
                <img
                  src="/lotus_icon.png"
                  alt=""
                  width={34}
                  height={26}
                  style={{ display: "block", margin: "0 auto 18px" }}
                />
                <h2
                  style={{
                    margin: 0,
                    color: "#2C1C11",
                    fontFamily: "var(--kalpx-font-serif)",
                    fontSize: "clamp(30px, 4.8vw, 30px)",

                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {copy.title || label}
                </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                    margin: "18px 0 0",
                    color: "#B88632",
                  }}
                >
                  <span
                    style={{
                      width: 48,
                      height: 1,
                      background: "rgba(184, 134, 50, 0.42)",
                    }}
                  />
                  <span style={{ fontSize: 16, lineHeight: 1 }}>◆</span>
                  <span
                    style={{
                      width: 48,
                      height: 1,
                      background: "rgba(184, 134, 50, 0.42)",
                    }}
                  />
                </div>
              </div>
            </div>

            {copy.why_we_ask && (
              <p
                style={{
                  fontSize: 14,
                  color: "#A97817",
                  fontStyle: "italic",
                  textAlign: "center",
                  margin: "0 auto 18px",
                  lineHeight: 1.45,
                  maxWidth: 560,
                }}
              >
                {copy.why_we_ask}
              </p>
            )}
            {copy.sanatan_context && (
              <p
                style={{
                  fontSize: 14,
                  color: "#35302B",
                  textAlign: "center",
                  margin: "0 auto 30px",
                  lineHeight: 1.55,
                  maxWidth: 640,
                }}
              >
                {copy.sanatan_context}
              </p>
            )}
            <p
              style={{
                fontSize: 16,
                color: "#2E241B",
                margin: "0 auto 18px",
                lineHeight: 1.3,
                textAlign: "center",
                fontFamily: "var(--kalpx-font-serif)",
                maxWidth: 560,
                fontWeight: 700,
              }}
            >
              {copy.prompt}
            </p>

            <div style={{ position: "relative", marginBottom: 24 }}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
                placeholder={copy.placeholder}
                data-testid="carry-capture-input"
                maxLength={MAX_TEXT}
                style={{
                  width: "100%",
                  minHeight: 250,
                  border: "1px solid rgba(196, 181, 161, 0.92)",
                  borderRadius: 28,
                  padding: "28px 28px 54px",
                  fontSize: 18,
                  color: "#1C1C1E",
                  background: "rgba(255,255,255,0.72)",
                  resize: "none",
                  boxSizing: "border-box",
                  outline: "none",
                  lineHeight: 1.5,
                  boxShadow: "0 6px 16px rgba(72, 46, 13, 0.12)",
                }}
              />
              <p
                style={{
                  position: "absolute",
                  right: 22,
                  bottom: 18,
                  margin: 0,
                  fontSize: 13,
                  color: "#75706A",
                  pointerEvents: "none",
                }}
              >
                {text.length} / {MAX_TEXT}
              </p>
            </div>

            {error && (
              <p
                data-testid="carry-capture-error"
                style={{
                  color: "#C0392B",
                  fontSize: 13,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                {error}
              </p>
            )}

            <button
              data-testid="carry-capture-save"
              disabled={!enabled}
              onClick={handleSave}
              style={{
                width: "100%",
                maxWidth: 560,
                display: "block",
                margin: "0 auto",
                padding: "10px",
                // height: 64,
                borderRadius: 999,
                border: "1px solid rgba(85, 42, 11, 0.22)",
                background: "linear-gradient(180deg, #6D3A10 0%, #4D2408 100%)",
                boxShadow: "0 10px 22px rgba(94, 51, 15, 0.2)",
                fontSize: 18,
                fontWeight: 600,
                color: "#FFF7EF",
                cursor: enabled ? "pointer" : "default",
                opacity: enabled ? 1 : 0.45,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <img src="/lotus_icon.png" alt="" width={22} height={18} />
                {isSubmitting ? "Saving…" : copy.primary_label}
              </span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                display: "block",
                margin: "18px auto 0",
                background: "none",
                border: "none",
                borderBottom: "1px solid rgba(72, 57, 41, 0.45)",
                padding: "0 0 3px",
                fontSize: 14,
                color: "#4A433C",
                cursor: "pointer",
              }}
            >
              I&apos;ll go now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
