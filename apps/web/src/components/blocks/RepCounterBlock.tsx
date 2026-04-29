import { Check, ChevronDown, ChevronUp } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AudioPlayerBlock } from "./AudioPlayerBlock";

/* ── Constants ────────────────────────────────────────────────────── */
const BEAD_COUNT = 18;
const RING_R = 86; // px — distance from ring centre to bead centre
const CONTAINER_SIZE = 230; // px — square that holds ring + center button
const REP_PRESETS = [1, 9, 27, 54, 108] as const;
const MAX_VISUAL_BEADS = 18;

/* ── Colour tokens (match mobile) ────────────────────────────────── */
const GOLD = "#b89450";
const BROWN = "#432104";
const MUTED = "#8a7a5a";

/* ── Inject CSS once ─────────────────────────────────────────────── */
const SPIN_CSS = `
@keyframes kalpx-ring-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes kalpx-center-pulse { 0%,100%{ transform: translate(-50%,-50%) scale(1); } 50%{ transform: translate(-50%,-50%) scale(1.05); } }
`;
let cssInjected = false;
function ensureCSS() {
  if (cssInjected || typeof document === "undefined") return;
  cssInjected = true;
  const s = document.createElement("style");
  s.textContent = SPIN_CSS;
  document.head.appendChild(s);
}

/* ── Types ────────────────────────────────────────────────────────── */
interface Props {
  block: { unlimited?: boolean; total?: number; [key: string]: any };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

/* ── CollapsibleCard ──────────────────────────────────────────────── */
export function CollapsibleCard({
  label,
  children,
  expanded,
  onToggle,
}: {
  label: string;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 10,
        border: "1px solid rgba(184,148,80,0.2)",
        background: "rgba(255,255,255,0.3)",
        padding: "12px 14px",
        cursor: "pointer",
        boxSizing: "border-box",
      }}
      onClick={onToggle}
    >
      {/* ── Divider · Label · Divider ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{ flex: 1, height: 1, background: "#E8C587", opacity: 0.6 }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 17,
              fontFamily: "var(--kalpx-font-serif)",
              fontWeight: 700,
              color: BROWN,
            }}
          >
            {label}
          </span>
          <span style={{ fontSize: 11, color: GOLD }}>
            {expanded ? "▲" : "▼"}
          </span>
        </div>
        <div
          style={{ flex: 1, height: 1, background: "#E8C587", opacity: 0.6 }}
        />
      </div>

      {expanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: 14,
            fontSize: 16,
            lineHeight: 1.65,
            color: "#5a3c21",
            fontFamily: "var(--kalpx-font-serif)",
            textAlign: "center",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ── MantraTextCard (IAST / Devanagari) ──────────────────────────── */
export function MantraTextCard({
  text,
  isDevanagari,
  expanded,
  onToggle,
}: {
  text: string;
  isDevanagari?: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  // Measure whether text overflows 2 lines — matches mobile's onTextLayout
  // isTruncated check. Chevron only shows when text is actually longer than 2 lines.
  const measureRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    // scrollHeight > clientHeight means text is taller than the 2-line clamp
    setIsTruncated(el.scrollHeight > el.clientHeight + 2);
  }, [text]);

  const textStyle: React.CSSProperties = isDevanagari
    ? {
        fontFamily: "'Noto Serif Devanagari', serif",
        fontSize: 17,
        color: "#432104",
        textAlign: "center",
        fontWeight: 600,
        lineHeight: 1.55,
        margin: 0,
      }
    : {
        fontSize: 13,
        letterSpacing: 1.2,
        textTransform: "uppercase" as const,
        color: "#432104",
        textAlign: "center",
        fontWeight: 600,
        lineHeight: 1.4,
        margin: 0,
      };

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(184,148,80,0.18)",
        background: expanded
          ? "rgba(255,255,255,0.8)"
          : "rgba(255,255,255,0.4)",
        padding: "15px",
        cursor: isTruncated ? "pointer" : "default",
        transition: "background 0.2s",
        boxSizing: "border-box",
      }}
      onClick={isTruncated ? onToggle : undefined}
    >
      {/* Hidden full-text paragraph used only for measuring overflow */}
      <p
        ref={measureRef}
        aria-hidden="true"
        style={{
          ...textStyle,
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical" as any,
          width: "calc(100% - 28px)", // match card padding
        }}
      >
        {text}
      </p>

      {/* Visible text — clamped to 2 lines unless expanded */}
      <p
        style={{
          ...textStyle,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: expanded ? undefined : 2,
          WebkitBoxOrient: "vertical" as any,
        }}
      >
        {text}
      </p>

      {/* Chevron only when text actually overflows 2 lines */}
      {isTruncated && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 2,
            opacity: 0.55,
          }}
        >
          {expanded ? (
            <ChevronUp size={15} color={GOLD} />
          ) : (
            <ChevronDown size={15} color={GOLD} />
          )}
        </div>
      )}
    </div>
  );
}

/* ── MalaBeadRing ─────────────────────────────────────────────────── */
function MalaBeadRing({
  count,
  reps,
  repsTotal,
  unlimited,
  onTap,
}: {
  count: number;
  reps: number;
  repsTotal: number;
  unlimited: boolean;
  onTap: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  const pressRef = useRef(false);

  const beads = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2; // start top
    const cx = CONTAINER_SIZE / 2 + Math.cos(angle) * RING_R;
    const cy = CONTAINER_SIZE / 2 + Math.sin(angle) * RING_R;
    const lit = repsTotal > MAX_VISUAL_BEADS ? i < reps % count : i < reps;
    return { cx, cy, lit, i };
  });

  return (
    <div
      style={{
        position: "relative",
        width: CONTAINER_SIZE,
        height: CONTAINER_SIZE,
        flexShrink: 0,
      }}
    >
      {/* ── Glow layers (static) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {/* outer glow */}
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            boxShadow: "0 0 32px 10px rgba(232,197,135,0.38)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* inner glow */}
          <div
            style={{
              width: 154,
              height: 154,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.85)",
              boxShadow: "0 0 22px 6px rgba(232,197,135,0.42)",
            }}
          />
        </div>
      </div>

      {/* ── Rotating bead ring ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          animation: "kalpx-ring-spin 40s linear infinite",
        }}
      >
        {beads.map(({ cx, cy, lit, i }) => (
          <img
            key={i}
            src="/rudraksh.svg"
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              width: 28,
              height: 28,
              left: cx - 14,
              top: cy - 14,
              opacity: lit ? 0.18 : 1,
              transition: "opacity 0.25s ease",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        ))}
      </div>

      <button
        data-testid="rep-tap-target"
        onPointerDown={() => {
          pressRef.current = true;
          setPressed(true);
        }}
        onPointerUp={() => {
          pressRef.current = false;
          setPressed(false);
          onTap();
        }}
        onPointerLeave={() => {
          pressRef.current = false;
          setPressed(false);
        }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 104,
          height: 104,
          transform: pressed
            ? "translate(-50%,-50%) scale(0.93)"
            : "translate(-50%,-50%) scale(1)",
          borderRadius: "50%",
          background: "#fffdf9",
          border: "1.5px solid #e8c587",
          boxShadow: "0 2px 10px rgba(184,148,80,0.16)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          transition: "transform 150ms ease",
          zIndex: 3,
          animation: "kalpx-center-pulse 3s ease-in-out infinite",
        }}
      >
        <span
          style={{
            fontSize: 20,
            letterSpacing: 4,
            fontWeight: 700,
            color: GOLD,
            lineHeight: 1,
          }}
        >
          TAP
        </span>
        <span
          style={{
            fontSize: 10,
            letterSpacing: 1.2,
            color: MUTED,
            lineHeight: 1,
            marginTop: 1,
          }}
        >
          HERE
        </span>
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: `1px solid ${GOLD}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 4,
          }}
        >
          <Check size={13} strokeWidth={1.5} color={GOLD} />
        </span>
      </button>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────────────── */
export function RepCounterBlock({ block, screenData = {}, onAction }: Props) {
  ensureCSS();

  /* ── Data resolution ── */
  const initialTotal: number =
    block.total ?? (screenData["reps_total"] as number) ?? 27;
  const [repsTotal, setRepsTotal] = useState(initialTotal);
  const [reps, setReps] = useState(
    (screenData["runner_reps_completed"] as number) || 0,
  );
  const unlimited = block.unlimited === true || repsTotal <= 0;
  const completingRef = useRef(false);

  const activeItem: any = screenData["runner_active_item"] || {};
  const title: string = activeItem.title || screenData["mantra_text"] || "";
  const deity: string = activeItem.deity || activeItem.source_deity || "";
  const source: string = activeItem.source || activeItem.tradition || "";
  const traditionLine =
    deity && source ? `${deity} — ${source}` : deity || source;
  const iast: string = activeItem.iast || activeItem.transliteration || "";
  const devanagari: string =
    activeItem.devanagari || screenData["mantra_devanagari"] || "";
  const meaning: string = activeItem.meaning || activeItem.summary || "";
  const essence: string = activeItem.essence || activeItem.insight || "";
  const audioUrl: string =
    activeItem.audio_url || screenData["mantra_audio_url"] || "";
  const audioScreenData = audioUrl
    ? { ...screenData, mantra_audio_url: audioUrl }
    : screenData;

  /* ── Expand states ── */
  const [iastExp, setIastExp] = useState(false);
  const [devExp, setDevExp] = useState(false);
  const [meanExp, setMeanExp] = useState(false);
  const [essExp, setEssExp] = useState(true); // open by default (matches mobile)

  /* ── Visual bead count ── */
  const beadCount = unlimited
    ? MAX_VISUAL_BEADS
    : Math.min(repsTotal, MAX_VISUAL_BEADS);

  /* ── Increment ── */
  const increment = useCallback(() => {
    if (completingRef.current) return;
    setReps((prev) => {
      const next = prev + 1;
      onAction?.({
        type: "set_screen_value",
        key: "runner_reps_completed",
        value: next,
      });
      if (!unlimited && next >= repsTotal) {
        completingRef.current = true;
        setTimeout(() => onAction?.({ type: "complete_runner" }), 600);
      }
      return next;
    });
  }, [unlimited, repsTotal, onAction]);

  /* ── Preset pills ── */
  function setPreset(n: number) {
    setRepsTotal(n);
    setReps(0);
    completingRef.current = false;
    onAction?.({ type: "set_screen_value", key: "reps_total", value: n });
    onAction?.({
      type: "set_screen_value",
      key: "runner_reps_completed",
      value: 0,
    });
  }

  /* ── Render ── */
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 36,
        paddingBottom: 52,
        paddingInline: 20,
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {/* 1 ── Title */}
      {title && (
        <p
          style={{
            fontFamily: "var(--kalpx-font-serif)",
            fontSize: 22,
            fontWeight: 700,
            color: BROWN,
            textAlign: "center",
            margin: "0 0 6px",
            lineHeight: 1.3,
          }}
        >
          {title}
        </p>
      )}

      {/* 2 ── Tradition eyebrow */}
      {traditionLine && (
        <p
          style={{
            fontSize: 11,
            letterSpacing: 1.3,
            fontFamily: "var(--kalpx-font-sans, sans-serif)",
            fontWeight: 600,
            color: GOLD,
            textAlign: "center",
            textTransform: "uppercase",
            margin: "0 0 2px",
          }}
        >
          {traditionLine}
        </p>
      )}

      {/* 3 ── Progress counter */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          margin: "-6px 0 8px",
        }}
      >
        <span
          style={{
            fontSize: 64,
            fontFamily: "var(--kalpx-font-serif)",
            fontWeight: 300,
            color: GOLD,
            lineHeight: 1,
          }}
        >
          {reps}
        </span>
        {!unlimited && (
          <span
            style={{
              fontSize: 32,
              fontFamily: "var(--kalpx-font-serif)",
              color: "#d1c1a1",
              lineHeight: 1,
            }}
          >
            / {repsTotal}
          </span>
        )}
      </div>

      {/* 4 ── Mala bead ring */}
      <MalaBeadRing
        count={beadCount}
        reps={reps}
        repsTotal={repsTotal}
        unlimited={unlimited}
        onTap={increment}
      />

      {/* 5 ── IAST / Devanagari text cards */}
      {(iast || devanagari) && (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 20,
            marginBottom: 4,
          }}
        >
          {iast && (
            <MantraTextCard
              text={iast}
              expanded={iastExp}
              onToggle={() => setIastExp((v) => !v)}
            />
          )}
          {devanagari && (
            <MantraTextCard
              text={devanagari}
              isDevanagari
              expanded={devExp}
              onToggle={() => setDevExp((v) => !v)}
            />
          )}
        </div>
      )}

      {/* 6 ── Rep preset pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 10,
          marginTop: 22,
          marginBottom: 26,
        }}
      >
        {REP_PRESETS.map((n) => {
          const sel = repsTotal === n && !unlimited;
          return (
            <button
              key={n}
              onClick={() => setPreset(n)}
              data-testid={`rep-chip-${n}`}
              style={{
                paddingInline: 18,
                paddingBlock: 8,
                borderRadius: 20,
                border: `1px solid ${sel ? GOLD : "#e8c587"}`,
                background: sel ? GOLD : "transparent",
                color: sel ? "#fff" : MUTED,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {n}
              {sel ? " ✓" : ""}
            </button>
          );
        })}
      </div>

      {/* 7 ── Audio player */}
      {audioUrl && (
        <div style={{ width: "100%", marginBottom: 24 }}>
          <AudioPlayerBlock
            block={{ audio_key: "mantra_audio_url", loop: true }}
            screenData={audioScreenData}
          />
        </div>
      )}

      {/* 8 ── Meaning collapsible */}
      {meaning && (
        <div style={{ width: "100%", marginBottom: 12 }}>
          <CollapsibleCard
            label="Meaning"
            expanded={meanExp}
            onToggle={() => setMeanExp((v) => !v)}
          >
            {meaning}
          </CollapsibleCard>
        </div>
      )}

      {/* 9 ── Essence collapsible */}
      {essence && (
        <div style={{ width: "100%", marginBottom: 32 }}>
          <CollapsibleCard
            label="Essence"
            expanded={essExp}
            onToggle={() => setEssExp((v) => !v)}
          >
            {essence}
          </CollapsibleCard>
        </div>
      )}

      {/* 10 ── Back link */}
      <button
        onClick={() => onAction?.({ type: "runner_exit" })}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 15,
          fontFamily: "var(--kalpx-font-serif)",
          color: BROWN,
          textDecoration: "underline",
          padding: "4px 0",
          marginTop: 4,
          marginBottom: 88,
        }}
      >
        Back
      </button>
    </div>
  );
}
