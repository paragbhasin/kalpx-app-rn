/**
 * StepModal — web equivalent of RN StepModal (Phase 13.5).
 * Supports: timer, text-input/journal, grounding, unknown-fallback.
 * Voice-note and reach-out are stub-only on web (same as RN MVP).
 */
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    lottie?: {
      loadAnimation: (config: Record<string, unknown>) => {
        play: () => void;
        pause: () => void;
        destroy: () => void;
        playSegments: (
          segments: [number, number] | [number, number][],
          forceFlag?: boolean,
        ) => void;
        goToAndStop: (value: number, isFrame?: boolean) => void;
        addEventListener: (name: string, cb: () => void) => void;
        removeEventListener: (name: string, cb: () => void) => void;
      };
    };
  }
}

export type StepModalKind =
  | "timer_breathe"
  | "timer_walk"
  | "timer_sit"
  | "timer_heart"
  | "text_input"
  | "grounding"
  | "voice_note"
  | "reach_out"
  | "unknown";

export interface StepModalResult {
  text?: string;
  grounding?: string[];
  source?: "voice_note" | "reach_out";
  duration_sec?: number;
  stub?: boolean;
}

/** Derive UI kind from template_id prefix — mirrors RN classifyStep */
export function classifyStep(templateId?: string | null): StepModalKind {
  if (!templateId) return "unknown";
  if (templateId.startsWith("step_breathe_")) return "timer_breathe";
  if (templateId.startsWith("step_walk_timer_")) return "timer_walk";
  if (templateId.startsWith("step_sit_ambient_")) return "timer_sit";
  if (templateId.startsWith("step_hand_on_heart_")) return "timer_heart";
  if (templateId.startsWith("step_text_input_")) return "text_input";
  if (templateId.startsWith("step_journal_")) return "text_input";
  if (templateId.startsWith("step_grounding_")) return "grounding";
  if (templateId.startsWith("step_voice_note")) return "voice_note";
  if (templateId.startsWith("step_reach_out")) return "reach_out";
  return "unknown";
}

const GROUNDING_PROMPTS = [
  "Name 5 things you can see",
  "Name 4 things you can hear",
  "Name 3 things you can feel",
  "Name 2 things you can smell",
  "Name 1 thing you can taste",
];

const GROUNDING_PROMPTS_ROOM = [
  "What do you see around you?",
  "What sounds do you notice?",
  "What do you feel against your skin?",
  "Is there a scent nearby?",
  "What taste is in your mouth?",
];

const TIMER_COMPLETION_LINES: Record<string, string> = {
  timer_breathe: "You made space.",
  timer_sit: "You sat with it.",
  timer_heart: "Your heart has steadied.",
  timer_walk: "You moved through it.",
};

const HEART_PHASES = [
  "Rest your hand on your heart.",
  "Feel the warmth.",
  "Breathe slowly.",
];

const MAX_TEXT = 1000;

const ROOM_TIMER_KEYFRAMES = `
@keyframes kalpx-sit-pulse{0%,100%{opacity:0.35}50%{opacity:0.65}}
@keyframes kalpx-heart-beat{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
`;

interface Props {
  visible: boolean;
  stepPayload?: any;
  label: string;
  onCancel: () => void;
  onDone: (extra: StepModalResult) => void;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  presentation?: "modal" | "screen";
  /** When true: enables room-guided UX (auto-start, companion prompts, optional input). */
  isRoomGuided?: boolean;
  helperLine?: string | null;
}

export function StepModal({
  visible,
  stepPayload,
  label,
  onCancel,
  onDone,
  errorMessage,
  isSubmitting = false,
  presentation = "modal",
  isRoomGuided = false,
  helperLine = null,
}: Props) {
  const kind = classifyStep(stepPayload?.template_id);
  const isScreen = presentation === "screen";
  const contextLine: string | null =
    stepPayload?.memory_modal?.sanatan_context ??
    stepPayload?.memory_modal?.why_we_ask ??
    helperLine ??
    null;

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, onCancel]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: isScreen ? "relative" : "fixed",
        inset: isScreen ? undefined : 0,
        background: isScreen ? "transparent" : "rgba(0,0,0,0.35)",
        zIndex: isScreen ? undefined : 300,
        display: "flex",
        alignItems: isScreen ? "stretch" : "flex-end",
        justifyContent: "center",
        minHeight: isScreen ? "100%" : undefined,
      }}
      onClick={(e) => !isScreen && e.target === e.currentTarget && onCancel()}
    >
      <div
        data-testid="step-modal"
        style={{
          width: "100%",
          maxWidth: isScreen ? 780 : 480,
          background: isScreen ? "transparent" : "#fdf8ef",
          backgroundImage: isScreen ? "none" : "url(/beige_bg.png)",
          backgroundSize: isScreen ? undefined : "cover",
          backgroundPosition: isScreen ? undefined : "center",
          borderRadius: isScreen ? 0 : "24px 24px 0 0",
          padding: "0 0 32px",
          minHeight: isScreen ? "100%" : undefined,
          maxHeight: isScreen ? "100dvh" : "90dvh",
          overflowY: "auto",
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

        {/* Header */}
        <div
          style={{
            display: "flex",
            padding: isScreen ? "22px 24px 8px" : "14px 16px 4px",
          }}
        >
          <button
            data-testid="step-modal-cancel"
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              fontSize: 15,
              color: "#6E6E73",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Cancel
          </button>
        </div>
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#1C1C1E",
            textAlign: "center",
            padding: isScreen ? "0 24px 20px" : "0 20px 12px",
            lineHeight: 1.4,
          }}
        >
          {label}
        </p>

        {/* Body */}
        <div
          style={{
            padding: isScreen ? "0 24px 32px" : "0 24px",
            opacity: isSubmitting ? 0.55 : 1,
          }}
          data-testid="step-modal-body"
        >
          {(kind === "timer_breathe" ||
            kind === "timer_walk" ||
            kind === "timer_sit" ||
            kind === "timer_heart") && (
            <TimerBody kind={kind} stepPayload={stepPayload} onDone={onDone} isRoomGuided={isRoomGuided} contextLine={contextLine} />
          )}
          {kind === "text_input" && (
            <TextInputBody stepPayload={stepPayload} onDone={onDone} />
          )}
          {kind === "grounding" && (
            <GroundingBody onDone={onDone} isScreen={isScreen} isRoomGuided={isRoomGuided} contextLine={contextLine} />
          )}
          {kind === "voice_note" && <VoiceNoteBody onDone={onDone} />}
          {kind === "reach_out" && <ReachOutBody onDone={onDone} />}
          {kind === "unknown" && <UnknownBody onDone={onDone} />}
        </div>

        {errorMessage && (
          <p
            data-testid="step-modal-error"
            style={{
              color: "#C0392B",
              fontSize: 13,
              textAlign: "center",
              marginTop: 4,
              padding: "0 16px",
            }}
          >
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Timer body ────────────────────────────────────────────────────────────────

function defaultTimerSeconds(kind: string): number {
  if (kind === "timer_heart") return 30;
  return 60;
}

function defaultInstruction(kind: string): string {
  if (kind === "timer_heart") return "Rest your hand on your heart. Breathe.";
  if (kind === "timer_breathe") return "Breathe gently.";
  if (kind === "timer_walk") return "Walk at your own pace.";
  return "Let your thoughts settle like dust in still water.";
}

let lottieScriptPromise: Promise<void> | null = null;
let walkAnimationDataPromise: Promise<any> | null = null;
const WALK_ANIMATION_END_FRAME = 68;
const WALK_PERSON_COLOR = [74 / 255, 59 / 255, 47 / 255];

function ensureLottieWeb(): Promise<void> {
  if (window.lottie) return Promise.resolve();
  if (lottieScriptPromise) return lottieScriptPromise;

  lottieScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-kalpx-lottie-web="true"]',
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load lottie-web")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie.min.js";
    script.async = true;
    script.dataset.kalpxLottieWeb = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load lottie-web"));
    document.head.appendChild(script);
  });

  return lottieScriptPromise;
}

function retintWalkAnimation(node: any): void {
  if (Array.isArray(node)) {
    node.forEach(retintWalkAnimation);
    return;
  }
  if (!node || typeof node !== "object") return;

  if (
    node.ty === "fl" &&
    node.nm === "Fill 1" &&
    node.c?.k &&
    Array.isArray(node.c.k)
  ) {
    node.c.k = [...WALK_PERSON_COLOR];
  }

  for (const value of Object.values(node)) {
    retintWalkAnimation(value);
  }
}

function getWalkAnimationData(): Promise<any> {
  if (walkAnimationDataPromise) return walkAnimationDataPromise;
  walkAnimationDataPromise = fetch("/walk-animation.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch walk animation");
      return res.json();
    })
    .then((data) => {
      const cloned = JSON.parse(JSON.stringify(data));
      retintWalkAnimation(cloned);
      // Match mobile behavior: trim the dead tail frames so the walk loops
      // continuously until the timer ends or the user stops it.
      cloned.op = WALK_ANIMATION_END_FRAME;
      return cloned;
    });
  return walkAnimationDataPromise;
}

function WalkLottie({
  running,
  atZero,
}: {
  running: boolean;
  atZero: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<{
    play: () => void;
    pause: () => void;
    destroy: () => void;
    goToAndStop: (value: number, isFrame?: boolean) => void;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([ensureLottieWeb(), getWalkAnimationData()])
      .then(([, animationData]) => {
        if (cancelled || !containerRef.current || !window.lottie) return;
        containerRef.current.innerHTML = "";
        animationRef.current?.destroy();
        animationRef.current = window.lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: false,
          animationData,
        });
        if (running && !atZero) {
          animationRef.current.play();
        } else {
          animationRef.current.goToAndStop(0, true);
        }
      })
      .catch(() => {
        // Silent fallback — the timer remains usable even if the CDN fails.
      });

    return () => {
      cancelled = true;
      animationRef.current?.destroy();
      animationRef.current = null;
    };
  }, []);

  useEffect(() => {
    const anim = animationRef.current;
    if (!anim) return;
    if (running && !atZero) anim.play();
    else anim.goToAndStop(0, true);
  }, [running, atZero]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        margin: "20px 0 36px",
        minHeight: 180,
        alignItems: "center",
      }}
    >
      <div
        ref={containerRef}
        data-testid="step-modal-walk-figure"
        style={{ width: 120, height: 120 }}
      />
    </div>
  );
}

function BreathingOrb({
  running,
  inhaleSec,
  exhaleSec,
}: {
  running: boolean;
  inhaleSec: number;
  exhaleSec: number;
}) {
  const inhaleMs = Math.max(1, inhaleSec) * 1000;
  const exhaleMs = Math.max(1, exhaleSec) * 1000;
  const [phase, setPhase] = useState("Inhale");
  const isExpanded = running && phase === "Inhale";

  useEffect(() => {
    if (!running) {
      setPhase("Inhale");
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const loop = () => {
      if (cancelled) return;
      setPhase("Inhale");
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        setPhase("Exhale");
        timeoutId = setTimeout(loop, exhaleMs);
      }, inhaleMs);
    };

    loop();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [running, inhaleMs, exhaleMs]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        margin: "20px 0 36px",
      }}
    >
      <div
        data-testid="step-modal-breathing-orb"
        style={{
          width: 368,
          maxWidth: "60vw",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          border: "2px solid rgba(230, 209, 160, 0.8)",
          background: "rgba(244, 236, 215, 0.42)",
          boxShadow: "inset 0 2px 10px rgba(255,255,255,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: isExpanded ? "scale(1.12)" : "scale(1)",
          transition: isExpanded
            ? `transform ${inhaleMs}ms ease-in-out`
            : running
              ? `transform ${exhaleMs}ms ease-in-out`
              : "transform 280ms ease-out",
        }}
      >
        <span
          style={{
            fontFamily: "var(--kalpx-font-serif)",
            fontSize: 38,
            lineHeight: 1,
            fontWeight: 700,
            color: "#4A2B12",
          }}
        >
          {phase}
        </span>
      </div>
    </div>
  );
}

interface TimerBodyProps {
  kind: string;
  stepPayload: any;
  onDone: (extra: StepModalResult) => void;
  isRoomGuided?: boolean;
  contextLine?: string | null;
}

function TimerBody({ kind, stepPayload, onDone, isRoomGuided = false, contextLine = null }: TimerBodyProps) {
  const totalSec = (() => {
    const raw = stepPayload?.duration_sec;
    if (typeof raw === "number" && raw > 0 && raw <= 3600) return raw;
    const sc = stepPayload?.step_config;
    if (sc) {
      const computed =
        (sc.cycles || 0) *
        ((sc.inhale || 0) + (sc.exhale || 0) + (sc.hold || 0));
      if (computed > 0 && computed <= 3600) return computed;
    }
    return defaultTimerSeconds(kind);
  })();

  const baseCueText =
    (stepPayload?.cue_text && String(stepPayload.cue_text)) ||
    defaultInstruction(kind);

  const [remaining, setRemaining] = useState(totalSec);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const atZero = remaining <= 0;
  const hasCompletedRef = useRef(false);

  const autoStartKinds = ["timer_breathe", "timer_sit", "timer_heart"];
  const isAutoStart = isRoomGuided && autoStartKinds.includes(kind);
  const [preStartVisible, setPreStartVisible] = useState(isAutoStart);

  useEffect(() => {
    if (!isAutoStart) return;
    hasCompletedRef.current = false;
    setPreStartVisible(true);
    const t = setTimeout(() => {
      setPreStartVisible(false);
      setRunning(true);
    }, 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoStart]);

  const [heartPhase, setHeartPhase] = useState(0);
  useEffect(() => {
    if (kind !== "timer_heart" || !running || !isRoomGuided) return;
    const t = setInterval(() => {
      setHeartPhase((p) => Math.min(p + 1, HEART_PHASES.length - 1));
    }, 10000);
    return () => clearInterval(t);
  }, [kind, running, isRoomGuided]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (atZero) setRunning(false);
  }, [atZero]);

  const [completionLineText, setCompletionLineText] = useState<string | null>(null);
  useEffect(() => {
    if (!atZero || !isRoomGuided || hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    const line = TIMER_COMPLETION_LINES[kind] ?? null;
    if (line) setCompletionLineText(line);
    const t = setTimeout(() => { onDone({}); }, 1500);
    return () => clearTimeout(t);
  }, [atZero, isRoomGuided, kind, onDone]);

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const timeLabel = `${mm}:${ss.toString().padStart(2, "0")}`;
  const inhaleSec = Number(stepPayload?.step_config?.inhale ?? 4) || 4;
  const exhaleSec = Number(stepPayload?.step_config?.exhale ?? 6) || 6;

  const displayCue = (kind === "timer_heart" && isRoomGuided)
    ? HEART_PHASES[heartPhase]
    : baseCueText;

  return (
    <div style={{ textAlign: "center", paddingTop: 8, position: "relative" }}>
      {/* CSS keyframes for room animations */}
      {isRoomGuided && (
        <style dangerouslySetInnerHTML={{ __html: ROOM_TIMER_KEYFRAMES }} />
      )}

      {/* Completion line overlay */}
      {completionLineText && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 10,
        }}>
          <p style={{
            fontFamily: "var(--kalpx-font-serif, Georgia, serif)",
            fontSize: 22, fontStyle: "italic", color: "#432104",
            textAlign: "center", maxWidth: 340, lineHeight: 1.5,
          }}>
            {completionLineText}
          </p>
        </div>
      )}

      <p
        style={isRoomGuided ? {
          fontFamily: "var(--kalpx-font-serif, Georgia, serif)",
          fontSize: 19, color: "#4a3a20", marginBottom: 18, lineHeight: 1.5,
        } : {
          fontSize: 16, color: "#4A4A50", marginBottom: 18, lineHeight: 1.4,
        }}
        data-testid="step-modal-timer-cue"
      >
        {preStartVisible ? "Let's begin gently…" : displayCue}
      </p>

      {kind === "timer_breathe" ? (
        <BreathingOrb
          running={running && !atZero}
          inhaleSec={inhaleSec}
          exhaleSec={exhaleSec}
        />
      ) : null}

      {kind === "timer_sit" && isRoomGuided && (
        <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
          <img
            src="/lotus_icon.png"
            alt=""
            style={{
              width: 48, height: 40, opacity: 0.5,
              animation: "kalpx-sit-pulse 4s ease-in-out infinite",
            }}
          />
        </div>
      )}

      {kind === "timer_heart" && isRoomGuided && (
        <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
          <span style={{
            fontSize: 32, lineHeight: 1, color: "#A68246",
            display: "inline-block",
            animation: "kalpx-heart-beat 1.2s ease-in-out infinite",
          }}>
            ♥
          </span>
        </div>
      )}

      {kind === "timer_walk" ? (
        <WalkLottie running={running} atZero={atZero} />
      ) : null}

      {isRoomGuided && contextLine ? (
        <p style={{ fontSize: 13, color: "#8b7a55", fontStyle: "italic", textAlign: "center", margin: "8px 0 4px", padding: "0 24px", lineHeight: 1.5 }}>
          {contextLine}
        </p>
      ) : null}

      <p
        style={isRoomGuided ? {
          fontSize: 14, color: "#8b7a55", margin: "0 0 24px",
          fontVariantNumeric: "tabular-nums", lineHeight: 1,
        } : {
          fontSize: 76, color: "#1C1C1E", margin: "0 0 32px",
          fontVariantNumeric: "tabular-nums", lineHeight: 1, letterSpacing: -2,
        }}
        data-testid="step-modal-timer-digits"
      >
        {timeLabel}
      </p>

      <div
        style={{
          display: "flex",
          gap: 18,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {!running && !atZero && !isAutoStart && (
          <button
            data-testid="step-modal-timer-start"
            onClick={() => setRunning(true)}
            style={{
              minWidth: 124,
              padding: "14px 24px",
              borderRadius: 999,
              border: "1.5px solid #1C1C1E",
              background: "rgba(255,255,255,0.28)",
              fontSize: 15,
              color: "#432104",
              cursor: "pointer",
            }}
          >
            Start
          </button>
        )}
        {running && (
          <button
            data-testid="step-modal-timer-pause"
            onClick={() => setRunning(false)}
            style={{
              minWidth: 124,
              padding: "14px 24px",
              borderRadius: 999,
              border: "1.5px solid #1C1C1E",
              background: "rgba(255,255,255,0.28)",
              fontSize: 15,
              color: "#432104",
              cursor: "pointer",
            }}
          >
            {isRoomGuided ? "Rest" : "Pause"}
          </button>
        )}
        <button
          data-testid="step-modal-timer-done"
          onClick={() => {
            hasCompletedRef.current = true;
            onDone({});
          }}
          style={{
            minWidth: 124,
            padding: "14px 24px",
            borderRadius: 999,
            border: "1.5px solid #D8D8D8",
            background: "#F6F1EE",
            fontSize: 15,
            fontWeight: 600,
            color: "#432104",
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ── Text-input body ───────────────────────────────────────────────────────────

const PROMPT_SLOT_TEXT: Record<string, string> = {
  name_short_prompt: "What's closest to you right now?",
  name_full_prompt: "What feels most full or alive right now?",
};

interface TextInputBodyProps {
  stepPayload: any;
  onDone: (extra: StepModalResult) => void;
}

function TextInputBody({ stepPayload, onDone }: TextInputBodyProps) {
  const mm = stepPayload?.memory_modal;
  const [text, setText] = useState("");
  const promptSlot = stepPayload?.step_config?.prompt_slot;
  const promptText =
    mm?.prompt ||
    (stepPayload?.prompt && String(stepPayload.prompt)) ||
    (typeof promptSlot === "string" && PROMPT_SLOT_TEXT[promptSlot]) ||
    "Take a moment and write what comes.";
  const placeholderText = mm?.placeholder || "Type what you feel..";
  const doneLabel = mm?.primary_label || "Done";
  const trimmed = text.trim();
  const enabled = trimmed.length >= 1;

  return (
    <div style={{ paddingTop: 8 }}>
      {mm?.sanatan_context && (
        <p
          style={{
            fontSize: 13,
            color: "#8B6914",
            fontStyle: "italic",
            textAlign: "center",
            margin: "0 auto 10px",
            lineHeight: 1.5,
            maxWidth: 520,
          }}
        >
          {mm.sanatan_context}
        </p>
      )}
      {mm?.why_we_ask && (
        <p
          style={{
            fontSize: 16,
            color: "#5C5C5C",
            textAlign: "center",
            margin: "0 auto 22px",
            lineHeight: 1.5,
            maxWidth: 560,
          }}
        >
          {mm.why_we_ask}
        </p>
      )}
      <p
        style={{
          fontSize: 17,
          color: "#3C3C43",
          marginBottom: 16,
          lineHeight: 1.4,
          textAlign: "left",
        }}
      >
        {promptText}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
        placeholder={placeholderText}
        data-testid="step-modal-text-input"
        maxLength={MAX_TEXT}
        style={{
          width: "100%",
          minHeight: 230,
          border: "1px solid #D8D8D8",
          borderRadius: 20,
          padding: 22,
          fontSize: 15,
          color: "#1C1C1E",
          background: "rgba(255,255,255,0.38)",
          resize: "none",
          boxSizing: "border-box",
          outline: "none",
          lineHeight: 1.5,
        }}
      />
      <p
        style={{
          fontSize: 12,
          color: "#8E8E93",
          textAlign: "right",
          margin: "6px 0 16px",
        }}
      >
        {text.length} / {MAX_TEXT}
      </p>
      <button
        data-testid="step-modal-text-done"
        disabled={!enabled}
        onClick={() => onDone({ text: trimmed })}
        style={{
          width: "100%",
          height: 46,
          borderRadius: 999,
          border: "1px solid rgba(212, 183, 132, 0.3)",
          background: "rgba(251,245,245,0.55)",
          fontSize: 17,
          fontWeight: 600,
          color: "#432104",
          cursor: enabled ? "pointer" : "default",
          opacity: enabled ? 1 : 0.45,
        }}
      >
        {doneLabel}
      </button>
    </div>
  );
}

// ── Grounding body ────────────────────────────────────────────────────────────

function GroundingBody({
  onDone,
  isScreen = false,
  isRoomGuided = false,
  contextLine = null,
}: {
  onDone: (extra: StepModalResult) => void;
  isScreen?: boolean;
  isRoomGuided?: boolean;
  contextLine?: string | null;
}) {
  const prompts = isRoomGuided ? GROUNDING_PROMPTS_ROOM : GROUNDING_PROMPTS;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", "", "", "", ""]);
  const [closingText, setClosingText] = useState<string | null>(null);
  const hasCompletedRef = useRef(false);
  const current = answers[index] ?? "";
  const prompt = prompts[index];
  const isLast = index === prompts.length - 1;
  const trimmed = current.trim();
  const enabled = isRoomGuided ? true : trimmed.length >= 1;

  const setCurrent = (v: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = v.slice(0, MAX_TEXT);
      return next;
    });
  };

  const handleNext = () => {
    if (!enabled) return;
    if (isLast) {
      if (isRoomGuided && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        setClosingText("The world is present around you.");
        setTimeout(() => {
          onDone({ grounding: answers.map((a) => a.trim()) });
        }, 1500);
      } else if (!isRoomGuided) {
        onDone({ grounding: answers.map((a) => a.trim()) });
      }
      return;
    }
    setIndex((i) => Math.min(prompts.length - 1, i + 1));
  };

  if (closingText) {
    return (
      <div style={{ textAlign: "center", paddingTop: 40 }}>
        <p style={{
          fontFamily: "var(--kalpx-font-serif, Georgia, serif)",
          fontSize: 22, fontStyle: "italic", color: "#432104", lineHeight: 1.5,
        }}>
          {closingText}
        </p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: isScreen ? 8 : 8 }}>
      {isRoomGuided && index === 0 && (
        <p style={{
          fontFamily: "var(--kalpx-font-serif, Georgia, serif)",
          fontSize: 15, fontStyle: "italic", color: "#8b7a55",
          textAlign: "center", marginBottom: 16, lineHeight: 1.5,
        }}>
          Let us return to the room around you.
        </p>
      )}
      {isRoomGuided && index === 0 && contextLine ? (
        <p style={{ fontSize: 13, color: "#8b7a55", fontStyle: "italic", textAlign: "center", margin: "-8px 0 12px", padding: "0 20px", lineHeight: 1.5 }}>
          {contextLine}
        </p>
      ) : null}
      <p
        data-testid="step-modal-grounding-progress"
        style={{
          fontSize: isScreen ? 14 : 12,
          color: "#8E8E93",
          textAlign: "center",
          marginBottom: isScreen ? 18 : 8,
        }}
      >
        {index + 1} of {prompts.length}
      </p>
      <p
        style={{
          fontSize: isScreen ? 18 : 16,
          color: "#432104",
          marginBottom: isScreen ? 24 : 16,
          lineHeight: isScreen ? 1.6 : 1.4,
          textAlign: isScreen ? "center" : "left",
          maxWidth: isScreen ? 560 : undefined,
          marginInline: isScreen ? "auto" : undefined,
          textWrap: isScreen ? "balance" : undefined,
        }}
      >
        {prompt}
      </p>
      <div style={{ position: "relative", marginBottom: isScreen ? 18 : 0 }}>
        <textarea
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="Type what you feel.."
          data-testid="step-modal-grounding-input"
          maxLength={MAX_TEXT}
          style={{
            width: "100%",
            minHeight: isScreen ? 210 : 120,
            border: isScreen
              ? "1px solid rgba(214, 183, 130, 0.7)"
              : "1px solid #D8D8D8",
            borderRadius: isScreen ? 28 : 12,
            padding: isScreen ? "24px 24px 42px" : 12,
            fontSize: isScreen ? 16 : 15,
            color: "#1C1C1E",
            background: isScreen
              ? "rgba(255,255,255,0.56)"
              : "rgba(255,255,255,0.5)",
            resize: isScreen ? "none" : "vertical",
            boxSizing: "border-box",
            lineHeight: 1.6,
            outline: "none",
          }}
        />
        {isScreen && (
          <p
            style={{
              position: "absolute",
              right: 18,
              bottom: 14,
              fontSize: 12,
              color: "#8E8E93",
              margin: 0,
              pointerEvents: "none",
            }}
          >
            {current.length} / {MAX_TEXT}
          </p>
        )}
      </div>
      {isRoomGuided && (
        <p style={{
          fontSize: 13, color: "#8b7a55", textAlign: "center",
          marginTop: 8, marginBottom: 4, fontStyle: "italic",
        }}>
          or just notice quietly.
        </p>
      )}
      <button
        data-testid={
          isLast ? "step-modal-grounding-done" : "step-modal-grounding-next"
        }
        disabled={!enabled}
        onClick={handleNext}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: 16,
          borderRadius: 999,
          border: isScreen
            ? "1px solid rgba(212, 183, 132, 0.28)"
            : "0.3px solid #9f9f9f",
          background: "linear-gradient(180deg, #6D3A10 0%, #4D2408 100%)",
          fontSize: isScreen ? 18 : 17,
          fontWeight: 600,
          color: isScreen ? "#FFF8EF" : "#432104",
          cursor: enabled ? "pointer" : "default",
          opacity: enabled ? 1 : 0.45,
          boxShadow: isScreen
            ? "0 14px 30px rgba(140, 103, 63, 0.16)"
            : undefined,
        }}
      >
        {isLast ? "Done" : "Next"}
      </button>
    </div>
  );
}

// ── Voice note stub body ──────────────────────────────────────────────────────

function VoiceNoteBody({
  onDone,
}: {
  onDone: (extra: StepModalResult) => void;
}) {
  return (
    <div style={{ textAlign: "center", paddingTop: 20 }}>
      <p style={{ fontSize: 24, marginBottom: 12 }}>🎙</p>
      <p
        style={{
          fontSize: 15,
          color: "#3C3C43",
          marginBottom: 8,
          lineHeight: 1.5,
        }}
      >
        Speaking it aloud can help.
      </p>
      <p
        style={{
          fontSize: 13,
          color: "#8E8E93",
          marginBottom: 28,
          lineHeight: 1.4,
        }}
      >
        Voice recording will be available in a future update.
      </p>
      <button
        data-testid="step-modal-voice-note-done"
        onClick={() => onDone({ source: "voice_note", stub: true })}
        style={{
          padding: "12px 20px",
          borderRadius: 24,
          border: "1px solid #D8D8D8",
          background: "#FBF5F5",
          fontSize: 15,
          fontWeight: 600,
          color: "#432104",
          cursor: "pointer",
        }}
      >
        Done
      </button>
    </div>
  );
}

// ── Reach out stub body ───────────────────────────────────────────────────────

function ReachOutBody({
  onDone,
}: {
  onDone: (extra: StepModalResult) => void;
}) {
  return (
    <div style={{ textAlign: "center", paddingTop: 20 }}>
      <p style={{ fontSize: 24, marginBottom: 12 }}>🤝</p>
      <p
        style={{
          fontSize: 15,
          color: "#3C3C43",
          marginBottom: 8,
          lineHeight: 1.5,
        }}
      >
        Reaching out to someone you trust is a meaningful step.
      </p>
      <p
        style={{
          fontSize: 13,
          color: "#8E8E93",
          marginBottom: 28,
          lineHeight: 1.4,
        }}
      >
        Contact suggestions will be available in a future update.
      </p>
      <button
        data-testid="step-modal-reach-out-done"
        onClick={() => onDone({ source: "reach_out", stub: true })}
        style={{
          padding: "12px 20px",
          borderRadius: 24,
          border: "1px solid #D8D8D8",
          background: "#FBF5F5",
          fontSize: 15,
          fontWeight: 600,
          color: "#432104",
          cursor: "pointer",
        }}
      >
        Done
      </button>
    </div>
  );
}

// ── Unknown / fallback body ───────────────────────────────────────────────────

function UnknownBody({ onDone }: { onDone: (extra: StepModalResult) => void }) {
  return (
    <div style={{ textAlign: "center", paddingTop: 20 }}>
      <p style={{ fontSize: 16, color: "#3C3C43", marginBottom: 24 }}>
        This step will be available in a future update.
      </p>
      <button
        data-testid="step-modal-unknown-done"
        onClick={() => onDone({})}
        style={{
          padding: "12px 20px",
          borderRadius: 24,
          border: "1px solid #D8D8D8",
          background: "#FBF5F5",
          fontSize: 15,
          fontWeight: 600,
          color: "#432104",
          cursor: "pointer",
        }}
      >
        Done
      </button>
    </div>
  );
}
