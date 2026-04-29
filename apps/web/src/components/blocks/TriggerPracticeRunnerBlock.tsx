import React, { useCallback, useEffect, useRef, useState } from "react";

const BROWN = "#432104";
const GOLD = "#D4A017";
const MUTED = "#8A7A5A";
const CARD_BG = "rgba(255,255,255,0.5)";
const CARD_BORDER = "rgba(184,148,80,0.25)";

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
        border: `1px solid ${CARD_BORDER}`,
        background: CARD_BG,
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

interface Props {
  block?: { [key: string]: any };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function TriggerPracticeRunnerBlock({
  block: _block,
  screenData = {},
  onAction,
}: Props) {
  const activeItem: any = screenData.runner_active_item || {};
  const title =
    activeItem.title ||
    screenData.runner_headline ||
    "Take one steadying action.";
  const subtitle =
    activeItem.summary ||
    activeItem.subtitle ||
    screenData.runner_subtext ||
    "Move through the steps gently. You do not need to force a shift.";
  const steps: string[] = (() => {
    if (Array.isArray(activeItem.steps)) return activeItem.steps;
    if (activeItem.steps_text) {
      return String(activeItem.steps_text)
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean)
        .map((s: string) => s.replace(/^\d+\.\s*/, ""));
    }
    return [];
  })();
  const benefits: string[] = Array.isArray(activeItem.benefits)
    ? activeItem.benefits
    : [];
  const insight: string = activeItem.insight || "";
  const summary: string = activeItem.summary || "";
  const negativeLabel: string =
    (screenData._trigger_negative_label as string) || "Try another way";

  const [meaningExpanded, setMeaningExpanded] = useState(false);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);
  const [insightExpanded, setInsightExpanded] = useState(false);
  const calmAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/Audio-calmmusic.mp3");
    audio.loop = true;
    audio.volume = 0.15;
    calmAudioRef.current = audio;
    audio.play().catch(() => {});

    return () => {
      if (calmAudioRef.current) {
        calmAudioRef.current.pause();
        calmAudioRef.current.src = "";
        calmAudioRef.current = null;
      }
    };
  }, []);

  const stopMusic = useCallback(() => {
    if (calmAudioRef.current) {
      calmAudioRef.current.pause();
      calmAudioRef.current.src = "";
      calmAudioRef.current = null;
    }
  }, []);

  const hasContent = (v: any) => {
    if (!v) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return false;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px",
      }}
      data-testid="trigger-practice-runner"
    >
      <div
        style={{
          width: "100%",

          padding: "18px 20px",
          marginBottom: 16,
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--kalpx-font-serif)",
            fontSize: 22,
            fontWeight: 700,
            color: BROWN,
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: "var(--kalpx-font-serif)",
            fontSize: 18,
            color: MUTED,
            margin: 0,
            lineHeight: 1.65,
          }}
        >
          {subtitle}
        </p>
      </div>

      {steps.length > 0 && (
        <div
          style={{
            width: "100%",
            borderRadius: 14,
            border: `1px solid ${CARD_BORDER}`,
            background: CARD_BG,
            padding: "16px 20px",
            marginBottom: 16,
            boxSizing: "border-box",
          }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                marginBottom: i === steps.length - 1 ? 0 : 10,
              }}
            >
              <span style={{ color: GOLD, fontWeight: 700, minWidth: 20 }}>
                {i + 1}.
              </span>
              <span style={{ color: "#5a3c21", lineHeight: 1.55 }}>{step}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          stopMusic();
          onAction?.({ type: "trigger_calmer_now" });
        }}
        data-testid="trigger-calmer-now-btn"
        style={{
          width: "100%",
          maxWidth: 250,
          padding: "10px",
          borderRadius: 32,
          border: "1px solid rgba(120,120,120,0.25)",
          background: "#FBF5F5",
          color: BROWN,
          fontSize: 18,
          fontFamily: "var(--kalpx-font-serif)",
          cursor: "pointer",
          marginBottom: 12,
          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
        }}
      >
        I feel calmer now
      </button>

      <button
        onClick={() => {
          stopMusic();
          onAction?.({ type: "trigger_still_feeling" });
        }}
        data-testid="trigger-try-another-btn"
        style={{
          width: "100%",
          maxWidth: 250,
          padding: "10px",
          borderRadius: 32,
          border: `1.5px solid ${GOLD}`,
          background: "rgba(255,255,255,0.4)",
          color: GOLD,
          fontSize: 18,
          fontFamily: "var(--kalpx-font-serif)",
          cursor: "pointer",
          marginBottom: 24,
        }}
      >
        {negativeLabel}
      </button>

      {hasContent(summary) && (
        <div style={{ width: "100%", marginBottom: 12 }}>
          <CollapsibleCard
            label="Meaning"
            expanded={meaningExpanded}
            onToggle={() => setMeaningExpanded((v) => !v)}
          >
            {summary}
          </CollapsibleCard>
        </div>
      )}

      {benefits.length > 0 && (
        <div style={{ width: "100%", marginBottom: 12 }}>
          <CollapsibleCard
            label="Benefits"
            expanded={benefitsExpanded}
            onToggle={() => setBenefitsExpanded((v) => !v)}
          >
            <ul style={{ margin: 0, paddingLeft: 18, textAlign: "left" }}>
              {benefits.map((b, i) => (
                <li
                  key={i}
                  style={{ marginBottom: 6, color: "#5a3c21", lineHeight: 1.5 }}
                >
                  {b}
                </li>
              ))}
            </ul>
          </CollapsibleCard>
        </div>
      )}

      {hasContent(insight) && (
        <div style={{ width: "100%", marginBottom: 24 }}>
          <CollapsibleCard
            label="Why this works"
            expanded={insightExpanded}
            onToggle={() => setInsightExpanded((v) => !v)}
          >
            {insight}
          </CollapsibleCard>
        </div>
      )}

      <button
        onClick={() => {
          stopMusic();
          onAction?.({ type: "return_to_dashboard" });
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          color: "#8c8881",
          textDecoration: "underline",
          padding: "4px 0",
          marginBottom: 88,
        }}
      >
        Return to Mitra Home
      </button>
    </div>
  );
}
