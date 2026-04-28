interface Props {
  block?: Record<string, any>;
  screenData?: Record<string, any>;
}

type Kind = "mantra" | "sankalp" | "practice";

interface CardDef {
  kind: Kind;
  titleKey: string;
  whyKey: string;
}

const CARDS: CardDef[] = [
  {
    kind: "mantra",
    titleKey: "companion_mantra_title",
    whyKey: "companion_mantra_one_line",
  },
  {
    kind: "sankalp",
    titleKey: "companion_sankalp_line",
    whyKey: "companion_sankalp_one_line",
  },
  {
    kind: "practice",
    titleKey: "companion_practice_title",
    whyKey: "companion_practice_one_line",
  },
];

const LABELS: Record<Kind, string> = {
  mantra: "Your Mantra",
  sankalp: "Your Intention",
  practice: "Your Practice",
};

const THEME: Record<Kind, { accent: string; bg: string; border: string }> = {
  mantra: {
    accent: "#5E8D55",
    bg: "rgba(244,250,241,0.95)",
    border: "rgba(207,224,199,0.95)",
  },
  sankalp: {
    accent: "#8168AA",
    bg: "rgba(249,246,255,0.95)",
    border: "rgba(215,204,236,0.95)",
  },
  practice: {
    accent: "#C08F2C",
    bg: "rgba(255,250,242,0.95)",
    border: "rgba(233,214,181,0.95)",
  },
};

const ICONS: Record<Kind, string> = {
  mantra: "ॐ",
  sankalp: "♡",
  practice: "🧘",
};

function ChevronIcon({ color }: { color: string }) {
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
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PathEmergesBlock({ screenData }: Props) {
  const sd = screenData || {};

  const hasData = CARDS.some((c) => !!sd[c.titleKey]);

  if (!hasData) {
    return (
      <div
        style={{
          padding: 20,
          borderRadius: 12,
          border: "1px dashed var(--kalpx-border-gold)",
          textAlign: "center",
          color: "var(--kalpx-text-soft)",
          fontSize: 14,
          marginBottom: 20,
        }}
      >
        Preparing your path…
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 6,
        marginBottom: 18,
        maxWidth: 560,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {/* Error banner — v3_start_failed */}
      {!!sd.v3_start_failed && (
        <div
          style={{
            background: "#fff3cd",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            borderLeft: "3px solid #e6a817",
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "#7a5c00",
              lineHeight: 1.43,
              margin: 0,
            }}
          >
            Something went wrong. Please try again.
          </p>
        </div>
      )}

      {CARDS.map((card) => {
        const theme = THEME[card.kind];
        const rawTitle = sd[card.titleKey] || "";
        if (!rawTitle) return null;
        const title =
          card.kind === "sankalp" ? `'${rawTitle.trim()}'` : rawTitle;
        const why: string = sd[card.whyKey] || "";

        return (
          <div
            key={card.kind}
            data-testid={`triad-${card.kind}`}
            style={{
              borderRadius: 28,
              border: `1px solid ${theme.border}`,
              background: theme.bg,
              padding: "22px 18px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 0,
              boxShadow: "0 8px 18px rgba(179, 140, 54, 0.05)",
            }}
          >
            {/* Icon circle */}
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: `1px solid ${theme.accent}30`,
                background: "rgba(255,255,255,0.58)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 19,
                color: theme.accent,
                flexShrink: 0,
                marginRight: 16,
              }}
            >
              {ICONS[card.kind]}
            </div>

            {/* Text column */}
            <div style={{ flex: 1, paddingRight: 8 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "3.2px",
                  color: theme.accent,
                  textTransform: "uppercase",
                  marginBottom: 8,
                  margin: "0 0 8px",
                }}
              >
                {LABELS[card.kind].toUpperCase()}
              </p>
              <p
                style={{
                  fontFamily: "var(--kalpx-font-serif)",
                  fontWeight: 700,
                  fontSize: "clamp(18px, 4.8vw, 20px)",
                  lineHeight: 1.4,
                  color: "var(--kalpx-text)",
                  marginBottom: 4,
                  margin: "0 0 4px",
                  textWrap: "balance",
                }}
              >
                {title}
              </p>
              {why && (
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.57,
                    color: card.kind === "sankalp" ? "#6F6190" : "#5D5B58",
                    marginTop: 2,
                    margin: "2px 0 0",
                    textWrap: "balance",
                  }}
                >
                  {why}
                </p>
              )}
            </div>

            <div style={{ marginLeft: 6 }}>
              <ChevronIcon color={theme.accent} />
            </div>
          </div>
        );
      })}

      {/* Footer: two gold lines with lotus between */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 6,
          marginBottom: 14,
        }}
      >
        <div
          style={{ width: 108, height: 1, background: "rgba(199,154,43,0.55)" }}
        />
        <img
          src="/new_home_lotus.png"
          alt=""
          style={{ width: 20, height: 16, margin: "0 12px", opacity: 0.72 }}
        />
        <div
          style={{ width: 108, height: 1, background: "rgba(199,154,43,0.55)" }}
        />
      </div>

      <p
        style={{
          fontFamily: "var(--kalpx-font-serif)",
          fontSize: "clamp(18px, 4.1vw, 18px)",
          lineHeight: 1.75,
          color: "var(--kalpx-text)",
          textAlign: "center",

          margin: 0,
          textWrap: "balance",
        }}
      >
        This isn't homework. It's sadhana — a daily practice that builds
        something real over time.
      </p>
    </div>
  );
}
