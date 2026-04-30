import React, { useCallback, useEffect, useRef, useState } from "react";

/* ── Colour tokens ────────────────────────────────────────────────── */
const BROWN = "#432104";
const GOLD = "#b89450";
const MUTED = "#8a7a5a";

/* ── CSS injected once ────────────────────────────────────────────── */
const CSS = `
@keyframes kalpx-coin-spin {
  0%   { transform: perspective(800px) rotateY(0deg)    scaleX(1);    }
  25%  { transform: perspective(800px) rotateY(90deg)  scaleX(0.05); }
  50%  { transform: perspective(800px) rotateY(180deg) scaleX(1);    }
  75%  { transform: perspective(800px) rotateY(270deg) scaleX(0.05); }
  100% { transform: perspective(800px) rotateY(360deg) scaleX(1);    }
}
@keyframes kalpx-sankalp-pulse {
  0%,100% { opacity: 1; }
  50%     { opacity: 0.6; }
}
`;
let cssInjected = false;
function ensureCSS() {
  if (cssInjected || typeof document === "undefined") return;
  cssInjected = true;
  const s = document.createElement("style");
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ── CollapsibleCard (same style as RepCounterBlock) ─────────────── */
function CollapsibleCard({
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

/* ── Props ────────────────────────────────────────────────────────── */
interface Props {
  block: { hold_duration?: number; [key: string]: any };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

/* ── Main component ───────────────────────────────────────────────── */
export function SankalpHoldBlock({ block, screenData = {}, onAction }: Props) {
  ensureCSS();

  /* ── Data resolution (matches mobile `info` object) ── */
  const activeItem: any = screenData["runner_active_item"] || {};
  const info: any = activeItem;

  const title: string = info.title || screenData["sankalp_text"] || "Intention";
  const bodyText: string =
    info.subtitle_or_line ||
    info.subtitle ||
    info.body ||
    info.line ||
    screenData["sankalp_prefix"] ||
    "";
  const howToLive: any = info.how_to_live || null;
  const insight: string = info.insight || info.essence || "";
  const benefits: any = info.benefits || null;
  const audioUrl: string =
    info.audio_url || screenData["sankalp_audio_url"] || "";

  /* ── Expand states ── */
  const [essenceExpanded, setEssenceExpanded] = useState(true); // open by default
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);

  /* ── Activation state ── */
  const [activating, setActivating] = useState(false);
  const [done, setDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Audio URL priority: backend-seeded sankalp_audio_url → static /om.mp4 fallback
  const audioSrc = audioUrl || "/sankalp_om.mp3";

  const FALLBACK_MS = block.hold_duration ?? 8000; // used only if audio never loads

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  const handleComplete = useCallback(() => {
    setDone(true);
    setActivating(false);
    stopAudio();
    onAction?.({ type: "complete_runner" });
  }, [onAction]);

  const handleTap = useCallback(() => {
    if (activating || done) return;
    setActivating(true);

    // Play audio — rotate coin while audio plays, complete when 'ended'
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.volume = 0.7;

    audio.addEventListener("ended", handleComplete, { once: true });

    // Fallback timer in case audio fails to load or src is absent
    timerRef.current = setTimeout(handleComplete, FALLBACK_MS);

    audio.play().catch(() => {
      // Audio blocked or not found — fallback timer still runs
    });
  }, [activating, done, audioSrc, FALLBACK_MS, handleComplete]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  /* ── Helper: hasContent (matches mobile hasContent) ── */
  function hasContent(val: any): boolean {
    if (!val) return false;
    if (typeof val === "string") return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    return false;
  }

  /* ── Render ── */
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 32,
        paddingBottom: 52,
        paddingInline: 20,
        boxSizing: "border-box",
        width: "100%",
      }}
      data-testid="sankalp-hold-block"
    >
      {/* ── 1. Info card: title + body ── */}
      <div
        style={{
          marginBottom: 20,
        }}
      >
        <p
          style={{
            fontFamily: "var(--kalpx-font-serif)",
            fontSize: 22,
            fontWeight: 700,
            color: BROWN,
            textAlign: "center",
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          {title}
        </p>
        {bodyText && (
          <p
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 17,
              color: BROWN,
              textAlign: "center",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {bodyText}
          </p>
        )}
      </div>

      {/* ── 2. How To Live section (when present) ── */}
      {hasContent(howToLive) && (
        <div
          style={{
            width: "100%",
            borderRadius: 14,
            border: "1px solid rgba(184,148,80,0.2)",
            background: "rgba(255,255,255,0.35)",
            padding: "16px 20px",
            marginBottom: 20,
            boxSizing: "border-box",
          }}
        >
          {/* Section header — matches mobile SectionHeader */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: "#E8C587",
                opacity: 0.6,
              }}
            />
            <span
              style={{
                fontSize: 13,
                letterSpacing: 1.2,
                fontWeight: 700,
                color: GOLD,
                textTransform: "uppercase",
              }}
            >
              How To Live
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: "#E8C587",
                opacity: 0.6,
              }}
            />
          </div>
          {Array.isArray(howToLive) ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {howToLive.map((line: string, i: number) => (
                <p
                  key={i}
                  style={{
                    fontFamily: "var(--kalpx-font-serif)",
                    fontSize: 18,
                    color: BROWN,
                    lineHeight: 1.55,
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: "var(--kalpx-font-serif)",
                fontSize: 16,
                color: "#5a3c21",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {howToLive}
            </p>
          )}
        </div>
      )}

      {/* ── 3. Embody section: instruction + NamasteIcon TAP target ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          marginBottom: 32,
          width: "100%",
        }}
      >
        {/* Instruction text */}
        <p
          style={{
            fontSize: 15,
            color: MUTED,
            textAlign: "center",
            fontFamily: "var(--kalpx-font-serif)",
            margin: 0,
            transition: "opacity 0.4s",
            opacity: activating ? 0.5 : 1,
          }}
        >
          {activating
            ? "Let the vibration settle within..."
            : "Tap to embody your intention"}
        </p>

        {/* Hold tap target — NamasteIcon with 3D flip animation on tap */}
        <button
          onClick={handleTap}
          disabled={activating || done}
          data-testid="sankalp-hold-circle"
          aria-label="Tap to embody sankalp"
        >
          <img
            src="/namaste.png"
            alt="Namaste"
            width={300}
            height={300}
            draggable={false}
            style={{
              // Coin-flip: slow continuous rotateY while activating
              animation: activating
                ? "kalpx-coin-spin 4s linear infinite"
                : "none",
              opacity: done ? 0.3 : 1,
              transition: "opacity 0.4s",
              objectFit: "contain",
              marginTop: -40,
            }}
          />
        </button>
      </div>

      {/* ── 4. Essence collapsible (info.insight) ── */}
      {hasContent(insight) && (
        <div style={{ width: "100%", marginBottom: 12, marginTop: -80 }}>
          <CollapsibleCard
            label="Essence"
            expanded={essenceExpanded}
            onToggle={() => setEssenceExpanded((v) => !v)}
          >
            {insight}
          </CollapsibleCard>
        </div>
      )}

      {/* ── 5. Benefits collapsible ── */}
      {hasContent(benefits) && (
        <div style={{ width: "100%", marginBottom: 32 }}>
          <CollapsibleCard
            label="Benefits"
            expanded={benefitsExpanded}
            onToggle={() => setBenefitsExpanded((v) => !v)}
          >
            {Array.isArray(benefits) ? (
              <ul style={{ margin: 0, paddingLeft: 18, textAlign: "left" }}>
                {benefits.map((b: string, i: number) => (
                  <li
                    key={i}
                    style={{
                      marginBottom: 6,
                      fontFamily: "var(--kalpx-font-serif)",
                      fontSize: 16,
                      color: "#5a3c21",
                      lineHeight: 1.5,
                    }}
                  >
                    {b}
                  </li>
                ))}
              </ul>
            ) : (
              benefits
            )}
          </CollapsibleCard>
        </div>
      )}

      {/* ── Back link ── */}
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
