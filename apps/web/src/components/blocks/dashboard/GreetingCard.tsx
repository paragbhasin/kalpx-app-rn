interface Props {
  sd: Record<string, any>;
}

function isSameCalendarDay(tsMs: number, nowMs: number): boolean {
  const a = new Date(tsMs);
  const b = new Date(nowMs);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function GreetingCard({ sd }: Props) {
  const greet = sd.greeting || {};
  const userName: string = greet.user_name || sd.user_name || "";
  const displayName: string = userName || "friend";
  const context: string = greet.supporting_line || sd.greeting_context || "";
  const tone: string = greet.tone_line || sd.tone_line || "";
  const joyCarry = sd.joy_carry;
  const carryIsToday =
    joyCarry &&
    typeof joyCarry.captured_at === "number" &&
    isSameCalendarDay(joyCarry.captured_at, Date.now());
  const carryLabel: string =
    typeof joyCarry?.label === "string" && joyCarry.label ? joyCarry.label : "";

  return (
    <div
      data-testid="greeting-card"
      style={{
        marginBottom: 15,
        borderRadius: 14,
        border: "1px solid var(--kalpx-border-gold)",
        background: "var(--kalpx-card-bg)",
        boxShadow: "var(--kalpx-shadow-card)",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
      }}
    >
      {/* Gold left-accent bar */}
      <div
        style={{ width: 4, background: "var(--kalpx-gold)", flexShrink: 0 }}
      />

      {/* Body */}
      <div style={{ flex: 1, padding: "16px 14px" }}>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "var(--kalpx-font-serif)",
            color: "var(--kalpx-text)",
            lineHeight: 1.3,
            margin: "0 0 4px",
          }}
        >
          Welcome, {displayName}.
        </h1>
        {context && (
          <p
            style={{
              fontSize: 12,
              color: "var(--kalpx-text-soft)",
              margin: "0 0 4px",
              lineHeight: 1.6,
            }}
          >
            {context}
          </p>
        )}
        {tone && (
          <p
            style={{
              fontSize: 12,
              color: "var(--kalpx-text-muted)",
              fontStyle: "italic",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {tone}
          </p>
        )}
        {carryIsToday && carryLabel && (
          <div
            data-testid="greeting-joy-carry"
            style={{
              marginTop: 10,
              padding: "4px 10px",
              borderRadius: 12,

              border: "1px solid var(--kalpx-gold-hairline)",
              fontSize: 11,
              color: "var(--kalpx-text)",
              display: "inline-block",
              letterSpacing: "0.2px",
            }}
          >
            {carryLabel} — held today
          </div>
        )}
      </div>

      {/* Mandala / lotus — 56px container matches RN MantraLotus3d width */}
      <div
        style={{
          flexShrink: 0,
          width: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 10px 12px 4px",
        }}
      >
        <img
          src="/mantra-lotus-3d.svg"
          width={56}
          height={56}
          alt=""
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
