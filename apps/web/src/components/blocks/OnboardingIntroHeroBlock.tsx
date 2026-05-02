import { useState } from "react";

interface Chip {
  id: string;
  label: string;
  style?: string;
}

interface Props {
  block: {
    headline?: string;
    subtext?: string;
    reply_chips?: Chip[];
    on_response?: { type: string };
    [key: string]: any;
  };
  onAction?: (action: any) => void;
}

export function OnboardingIntroHeroBlock({ block, onAction }: Props) {
  const [busy, setBusy] = useState(false);
  const chips: Chip[] = block.reply_chips || [];
  const onResponse = block.on_response;

  async function handleChip(chip: Chip) {
    if (busy || !onResponse || !onAction) return;
    setBusy(true);
    try {
      await onAction({ type: onResponse.type, payload: { chip_id: chip.id } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "24px 10px 18px",
        position: "relative",
      }}
    >
      <div
        style={{
          textAlign: "center",
          width: "100%",
          maxWidth: 360,
          position: "relative",
          zIndex: 1,
        }}
      >
        {block.headline && (
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "var(--kalpx-text)",
              lineHeight: 1.12,
              marginBottom: 14,
              fontFamily: "var(--kalpx-font-serif)",
              textAlign: "center",
              textShadow: "0 8px 26px rgba(255,255,255,0.4)",
            }}
          >
            {block.headline}
          </h2>
        )}
        {block.subtext && (
          <p
            style={{
              fontSize: 17,
              color: "var(--kalpx-text)",
              opacity: 0.8,
              margin: "0 auto",
              lineHeight: 1.5,
              maxWidth: 320,
              marginBottom: 34,
              fontFamily: "var(--kalpx-font-sans)",
              textAlign: "center",
            }}
          >
            {block.subtext}
          </p>
        )}
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 360,
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          marginTop: 18,
        }}
      >
        {chips.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              width: "100%",
            }}
          >
            {chips.map((chip) => (
              <button
                key={chip.id}
                data-testid={`chip-${chip.id}`}
                disabled={busy}
                onClick={() => void handleChip(chip)}
                style={{
                  padding: "16px 24px",
                  borderRadius: 999,
                  border: "1px solid rgba(201, 168, 76, 0.42)",
                  background: "rgba(255, 252, 246, 0.88)",
                  color: "var(--kalpx-text)",
                  fontSize: 17,
                  cursor: busy ? "not-allowed" : "pointer",
                  opacity: busy ? 0.7 : 1,
                  textAlign: "center",
                  lineHeight: 1.2,
                  boxShadow: "0 10px 24px rgba(67,33,4,0.12)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  touchAction: "manipulation",
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
