/**
 * CompletionReturnBlock — Web parity with CompletionReturnTransient (mobile).
 *
 * Layout (top → bottom):
 *   1. Animated gold ✓ stroke-draw  (800 ms, matches mobile Animated.timing)
 *   2. Message card  (left gold border, 26 px serif)  — from API slot or fallback
 *   3. Wisdom anchor line  (italic, only when present)
 *   4. Reflection text input  ("Anything to carry from this?")
 *   5. Glowing lotus image
 *   6. "Return to Mitra Home" pill CTA  (#FBF5F5, border, brown text)
 *   7. "Repeat" underlined link
 *
 * Data: reads completion_return slots from screenData (same content-slot
 * system as mobile useContentSlots).  Falls back to static strings when
 * slots not yet hydrated so the screen is never blank.
 */

import React, { useEffect, useState } from "react";
import { VoiceTextInput } from "../VoiceTextInput";

/* ── Colour tokens (match mobile styles) ─────────────────────────── */
const BROWN       = "#5C3A12";
const GOLD_BORDER = "#DAC28E";
const GOLD        = "#A68246";
const MUTED       = "#946A47";

/* ── Static fallbacks (matches mobile variant dict) ──────────────── */
const FALLBACKS: Record<string, { headline: string; body: string }> = {
  mantra: {
    headline: "Complete. You stayed with the sound.",
    body: "Action without grasping carries its own fullness.",
  },
  sankalp: {
    headline: "Your sankalp is alive.",
    body: "Carry it gently through your day.",
  },
  practice: {
    headline: "Complete. You stayed with the practice.",
    body: "Let what arose remain with you.",
  },
};

/* ── CSS injected once ────────────────────────────────────────────── */
const COMPLETION_CSS = `
@keyframes kalpx-check-draw {
  from { stroke-dashoffset: 48; }
  to   { stroke-dashoffset: 0;  }
}
@keyframes kalpx-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0);    }
}
`;
let cssOnce = false;
function ensureCSS() {
  if (cssOnce || typeof document === "undefined") return;
  cssOnce = true;
  const s = document.createElement("style");
  s.textContent = COMPLETION_CSS;
  document.head.appendChild(s);
}

/* ── Props ────────────────────────────────────────────────────────── */
interface Props {
  block: { variant_key?: string; [key: string]: any };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

/* ── Component ────────────────────────────────────────────────────── */
export function CompletionReturnBlock({ block, screenData = {}, onAction }: Props) {
  ensureCSS();

  /* ── Variant ── */
  const variantKey = block.variant_key || "runner_variant";
  const variant: string = (screenData[variantKey] as string) || "mantra";

  /* ── Content slots (mirrors mobile readMomentSlot) ── */
  const slots: any = (screenData["completion_return"] as any) || {};

  // "message" slot — primary API-driven message
  const message: string =
    slots.message ||
    FALLBACKS[variant]?.headline ||
    FALLBACKS.mantra.headline;

  // wisdom anchor line — optional third beat
  const wisdomAnchorLine: string = slots.wisdom_anchor_line || "";

  // CTA labels — API-driven; fall back to static English
  const returnHomeLabel: string  = slots.return_home_cta   || "Return to Mitra Home";
  const repeatLabel: string      = slots.repeat_cta        || "Repeat";
  const reflectionPrompt: string = slots.reflection_prompt || "Anything to carry from this?";

  /* ── Return action (G17 / G27 parity) ── */
  const returnSource: string = (screenData["runner_source"] as string) || "core";
  const SUPPORT_SOURCES = new Set(["support_room", "support_trigger"]);
  const returnAction = SUPPORT_SOURCES.has(returnSource)
    ? "return_to_source"
    : "return_to_dashboard";

  /* ── Reflection submit ── */
  function handleSubmitReflection(text: string, responseType: "text" | "voice") {
    const trimmed = text.trim().slice(0, 120);
    if (!trimmed) return;
    onAction?.({
      type: "track_event",
      payload: {
        eventName: "post_completion_reflection",
        meta: {
          item_type: variant,
          item_id: (screenData["runner_active_item"] as any)?.item_id ?? null,
          text: trimmed,
          response_type: responseType,
        },
      },
    });
    onAction?.({ type: returnAction });
  }

  /* ── Fade-in delay for message card (matches mobile checkProgress callback) ── */
  const [msgVisible, setMsgVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMsgVisible(true), 900); // after checkmark draw
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      data-testid="completion-return-block"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 48,
        paddingBottom: 80,
        paddingInline: 20,
        boxSizing: "border-box",
        width: "100%",
        minHeight: "100dvh",
        justifyContent: "space-between",
      }}
    >
      {/* ── Top content section ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

        {/* 1 ── Animated gold checkmark (stroke-draw 800 ms) */}
        <div
          style={{
            width: 64,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 48,
          }}
        >
          <svg width={48} height={48} viewBox="0 0 48 48" fill="none">
            <path
              d="M10 24 L20 34 L38 14"
              stroke={GOLD}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={48}
              style={{
                animation: "kalpx-check-draw 800ms ease forwards",
              }}
            />
          </svg>
        </div>

        {/* 2 ── Message card (left gold border, fades in after checkmark) */}
        <div
          style={{
            width: "100%",
            opacity: msgVisible ? 1 : 0,
            transition: "opacity 0.8s ease",
          }}
        >
          {/* Left-border message card — matches mobile messageCard style */}
          <div
            style={{
              borderLeft: `2px solid ${GOLD_BORDER}`,
              paddingLeft: 20,
              paddingTop: 4,
              paddingBottom: 4,
              marginBottom: 40,
              alignSelf: "flex-start",
              width: "100%",
              boxSizing: "border-box",
            }}
            data-testid="completion-message"
          >
            <p
              style={{
                fontFamily: "var(--kalpx-font-serif)",
                fontSize: 26,
                lineHeight: "38px",
                color: BROWN,
                margin: 0,
              }}
            >
              {message}
            </p>
          </div>

          {/* 3 ── Wisdom anchor (italic, optional third beat) */}
          {wisdomAnchorLine && (
            <div
              style={{
                paddingLeft: 20,
                marginBottom: 20,
                width: "100%",
                boxSizing: "border-box",
              }}
              data-testid="completion-wisdom-anchor"
            >
              <p
                style={{
                  fontFamily: "var(--kalpx-font-serif)",
                  fontSize: 17,
                  lineHeight: "24px",
                  color: BROWN,
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                {wisdomAnchorLine}
              </p>
            </div>
          )}

          {/* 4 ── Reflection input — reuses web VoiceTextInput (matches mobile VoiceTextInput) */}
          <div
            style={{ width: "100%", marginBottom: 8 }}
            data-testid="completion-reflection-placeholder"
          >
            <VoiceTextInput
              placeholder={reflectionPrompt}
              onSend={handleSubmitReflection}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom section ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          animation: "kalpx-fade-up 0.6s ease forwards",
          animationDelay: "0.3s",
          opacity: 0,
        }}
      >
        {/* 5 ── Glowing lotus */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: -20,
            marginBottom: 16,
          }}
        >
          <img
            src="/mantra-lotus-3d.svg"
            alt="Lotus"
            width={180}
            height={140}
            style={{ opacity: 0.65 }}
            onError={(e) => {
              // fallback: hide if asset missing
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* 6 ── Return to Mitra Home CTA */}
        <button
          onClick={() => onAction?.({ type: returnAction })}
          data-testid="return-to-dashboard-btn"
          style={{
            background: "#FBF5F5",
            border: "0.3px solid #9f9f9f",
            borderRadius: 32,
            paddingBlock: 16,
            paddingInline: 40,
            width: "100%",
            maxWidth: 280,
            fontSize: 16,
            color: "#432104",
            letterSpacing: 0.2,
            cursor: "pointer",
            fontFamily: "var(--kalpx-font-sans, sans-serif)",
            boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
            marginBottom: 4,
          }}
        >
          {returnHomeLabel}
        </button>

        {/* 7 ── Repeat underlined link */}
        <button
          onClick={() => onAction?.({ type: "repeat_runner" })}
          data-testid="repeat-runner-btn"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            fontFamily: "var(--kalpx-font-serif)",
            color: "#432104",
            textDecoration: "underline",
            letterSpacing: 0.5,
            marginTop: 10,
            padding: "10px 0",
            marginBottom: 88,
          }}
        >
          {repeatLabel}
        </button>
      </div>
    </div>
  );
}
