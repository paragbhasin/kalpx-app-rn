import { useState } from "react";

type GuidanceMode = "universal" | "hybrid" | "rooted";

interface ModeConfig {
  id: GuidanceMode;
  title: string;
  desc: string;
  example: string;
  accent: string;
  cardBg: string;
  cardBorder: string;
  iconBg: string;
  exampleColor: string;
}

const MODES: ModeConfig[] = [
  {
    id: "universal",
    title: "Keep it simple and modern",
    desc: "Clear, accessible language. No unfamiliar terms.",
    example: '"Today calls for slower pacing."',
    accent: "#7D9A62",
    cardBg: "rgba(255, 255, 255, 0.82)",
    cardBorder: "rgba(237, 222, 180, 0.65)",
    iconBg: "rgba(234, 240, 223, 0.6)",
    exampleColor: "#8A7656",
  },
  {
    id: "hybrid",
    title: "A blend — modern clarity with spiritual depth",
    desc: "Familiar terms, occasional Sanatan language where it fits.",
    example: '"Today is a Tamas-leaning day. Slow pacing helps."',
    accent: "#C79A2B",
    cardBg: "rgba(255, 252, 246, 0.95)",
    cardBorder: "rgba(199, 154, 43, 0.7)",
    iconBg: "rgba(255, 245, 220, 0.7)",
    exampleColor: "#A07835",
  },
  {
    id: "rooted",
    title: "I am drawn to the deeper roots",
    desc: "Sanatan vocabulary visible. Gunas, doshas, panchang context.",
    example:
      '"Tamas rising. Your Kapha-pitta body is asking for sattvic rhythm."',
    accent: "#8673B5",
    cardBg: "rgba(248, 246, 255, 0.9)",
    cardBorder: "rgba(183, 170, 219, 0.65)",
    iconBg: "rgba(237, 233, 255, 0.7)",
    exampleColor: "#7D6AAE",
  },
];

function LeafIcon({ color }: { color: string }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 3C20 3 12 3.5 7 8.5C2 13.5 2 21 2 21C2 21 9.5 21 14.5 16C17 13.5 18.5 10.5 20 3Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 21L10 13"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BalanceIcon({ color }: { color: string }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <line
        x1="12"
        y1="3"
        x2="12"
        y2="21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="6"
        y1="21"
        x2="18"
        y2="21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="3"
        y1="7"
        x2="21"
        y2="7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="3"
        y1="7"
        x2="1"
        y2="13"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="1"
        y1="13"
        x2="7"
        y2="13"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M1 13 Q4 17 7 13"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <line
        x1="21"
        y1="7"
        x2="23"
        y2="13"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="17"
        y1="13"
        x2="23"
        y2="13"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M17 13 Q20 17 23 13"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LotusIcon({ color }: { color: string }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 19 C12 19 8 14.5 8 10.5 C8 7.5 10 5.5 12 5.5 C14 5.5 16 7.5 16 10.5 C16 14.5 12 19 12 19Z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M12 19 C12 19 6 16 4.5 12 C3.5 9 5 6.5 7 6.5 C9 6.5 11 9 10.5 12"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M12 19 C12 19 18 16 19.5 12 C20.5 9 19 6.5 17 6.5 C15 6.5 13 9 13.5 12"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M7 19 C7 19 4 17 4 14"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M17 19 C17 19 20 17 20 14"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="7"
        y1="19"
        x2="17"
        y2="19"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ModeIcon({ mode }: { mode: ModeConfig }) {
  if (mode.id === "universal") return <LeafIcon color={mode.accent} />;
  if (mode.id === "hybrid") return <BalanceIcon color={mode.accent} />;
  return <LotusIcon color={mode.accent} />;
}

function ChevronIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <polyline
        points="9 18 15 12 9 6"
        stroke="#C79A2B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface Props {
  block: {
    headline?: string;
    subtext?: string;
    on_response?: { type: string };
    [key: string]: any;
  };
  onAction?: (action: any) => void;
}

export function GuidanceModePickerBlock({ block, onAction }: Props) {
  const [selected, setSelected] = useState<GuidanceMode | null>(null);
  const [busy, setBusy] = useState(false);
  const onResponse = block.on_response;

  async function handleSelect(mode: GuidanceMode) {
    if (busy) return;
    setSelected(mode);
    if (!onResponse || !onAction) return;
    setBusy(true);
    try {
      await onAction({
        type: onResponse.type,
        payload: { guidance_mode: mode },
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4,
      }}
    >
      {(block.headline || block.subtext) && (
        <div style={{ textAlign: "center", padding: "10px" }}>
          {block.headline && (
            <h2
              style={{
                margin: "0 0 10px",
                fontFamily: "var(--kalpx-font-serif)",
                fontSize: 30,
                lineHeight: 1.2,
                fontWeight: 700,
                color: "var(--kalpx-text)",
              }}
            >
              {block.headline}
            </h2>
          )}
          {block.subtext && (
            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.5,
                color: "var(--kalpx-text-soft)",
              }}
            >
              {block.subtext}
            </p>
          )}
        </div>
      )}

      {MODES.map((mode) => {
        const isSelected = selected === mode.id;
        return (
          <button
            key={mode.id}
            data-testid={`guidance-mode-${mode.id}`}
            disabled={busy}
            onClick={() => void handleSelect(mode.id)}
            style={{
              position: "relative",
              padding: 15,
              borderRadius: 24,
              border: `1px solid ${isSelected ? mode.accent : mode.cardBorder}`,
              background: mode.cardBg,
              color: "var(--kalpx-text)",
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.7 : 1,
              textAlign: "left",
              overflow: "hidden",
            }}
          >
            {/* MOST CHOSEN badge — hybrid only */}
            {mode.id === "hybrid" && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: "#D5AE54",
                  color: "#ffffff",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.6px",
                  padding: "5px 10px",
                  borderRadius: "0 24px 0 14px",
                }}
              >
                MOST CHOSEN
              </span>
            )}

            {/* Row: icon circle + text + chevron */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* Icon circle */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border: `1px solid ${mode.accent}30`,
                  background: mode.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginRight: 14,
                }}
              >
                <ModeIcon mode={mode} />
              </div>

              {/* Text column */}
              <div style={{ flex: 1, paddingRight: 8 }}>
                <div
                  style={{
                    fontFamily: "var(--kalpx-font-serif)",
                    fontWeight: 700,
                    fontSize: 18,
                    lineHeight: 1.45,
                    color: "var(--kalpx-text)",
                    marginBottom: 4,
                    marginTop: mode.id === "hybrid" ? 8 : 0,
                  }}
                >
                  {mode.title}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "#5F5444",
                    marginBottom: 8,
                  }}
                >
                  {mode.desc}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: mode.exampleColor,
                  }}
                >
                  {mode.example}
                </div>
              </div>

              {/* Chevron */}
              <ChevronIcon />
            </div>
          </button>
        );
      })}
    </div>
  );
}
