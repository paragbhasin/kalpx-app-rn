import { ArrowRight, Cloud, Leaf, Sparkles, Sun } from "lucide-react";
import { useState } from "react";

interface Chip {
  id: string;
  label: string;
  style?: string;
}

interface Props {
  block: {
    id?: string;
    headline?: string;
    mitra_message?: string | string[];
    reply_chips?: Chip[];
    open_input?: { enabled: boolean; placeholder?: string };
    on_response?: { type: string };
    [key: string]: any;
  };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function OnboardingConversationTurnBlock({ block, onAction }: Props) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const messages: string[] = Array.isArray(block.mitra_message)
    ? block.mitra_message
    : block.mitra_message
      ? [block.mitra_message]
      : [];

  const chips: Chip[] = block.reply_chips || [];
  const inputEnabled = block.open_input?.enabled === true;
  const onResponse = block.on_response;

  async function fireResponse(payload: Record<string, any>) {
    if (busy || !onResponse || !onAction) return;
    setBusy(true);
    try {
      await onAction({ type: onResponse.type, payload });
    } finally {
      setBusy(false);
    }
  }

  if (!messages.length && !chips.length && !inputEnabled) return null;

  if (block.id === "turn1") {
    const rowIcons = [Sun, Cloud, Leaf];

    return (
      <div
        style={{
          minHeight: "calc(100dvh - 140px)",
          display: "flex",
          flexDirection: "column",
          paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            borderRadius: 28,
            background: "rgba(255, 253, 247, 0.9)",
            border: "1px solid var(--kalpx-border-gold)",
            boxShadow: "var(--kalpx-shadow-card-lift)",
            padding: "26px 18px 22px",
            marginBottom: 18,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontSize: 32,
              lineHeight: 1.28,
              color: "var(--kalpx-text)",
              fontWeight: 700,
              fontFamily: "var(--kalpx-font-serif)",
              marginBottom: 18,
              whiteSpace: "pre-line",
            }}
          >
            {"I'm Mitra.\nI'm here with you."}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 74,
                height: 1,
                background: "var(--kalpx-border-gold)",
              }}
            />
            <span style={{ color: "var(--kalpx-gold)", fontSize: 14 }}>◈</span>
            <div
              style={{
                width: 74,
                height: 1,
                background: "var(--kalpx-border-gold)",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {messages.map((msg, i) => {
              const Icon = rowIcons[i] || Sun;
              return (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
                >
                  <div>
                    <Icon
                      size={22}
                      strokeWidth={1.8}
                      color="var(--kalpx-gold)"
                    />
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 18,
                      fontFamily: "var(--kalpx-font-serif)",
                      color: "var(--kalpx-text)",
                      lineHeight: 1.45,
                    }}
                  >
                    {msg}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <img
            src="/new_home_lotus.png"
            alt=""
            style={{ width: "56%", maxWidth: 260, pointerEvents: "none" }}
          />
        </div> */}

        {chips.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: "100%",
              marginTop: "auto",
            }}
          >
            {chips.map((chip, index) => {
              const primary = chip.style === "primary";
              return (
                <button
                  key={chip.id}
                  data-testid={`chip-${chip.id}`}
                  disabled={busy}
                  onClick={() =>
                    void fireResponse({
                      chip_id: chip.id,
                      freeform_text: text || undefined,
                    })
                  }
                  style={{
                    padding: 10,
                    borderRadius: 34,
                    border: primary ? "none" : "2px solid var(--kalpx-gold)",
                    background: primary
                      ? "var(--kalpx-gold)"
                      : "rgba(255, 253, 247, 0.5)",
                    color: primary ? "#fff" : "var(--kalpx-text)",
                    fontSize: primary ? 18 : 16,
                    fontWeight: primary ? 700 : 600,
                    cursor: busy ? "not-allowed" : "pointer",
                    opacity: busy ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",

                    boxShadow: primary
                      ? "0 10px 24px rgba(201, 168, 76, 0.22)"
                      : "none",
                    backdropFilter: primary ? undefined : "blur(4px)",
                    WebkitBackdropFilter: primary ? undefined : "blur(4px)",
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {primary ? (
                      <Sparkles size={20} strokeWidth={2} />
                    ) : (
                      <span />
                    )}
                  </span>
                  <span>{chip.label}</span>
                  <span
                    style={{
                      width: 26,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {primary ? (
                      <ArrowRight size={24} strokeWidth={2.4} />
                    ) : (
                      <span />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: 20,
        background: "var(--kalpx-card-bg)",
        border: "1px solid var(--kalpx-border-gold)",
        boxShadow: "var(--kalpx-shadow-card-lift)",
        padding: 20,
        marginBottom: 24,
      }}
    >
      {/* Headline + gold divider */}
      {block.headline && (
        <>
          <h2
            style={{
              fontSize: 22,
              fontFamily: "var(--kalpx-font-serif)",
              fontWeight: 700,
              textAlign: "center",
              color: "var(--kalpx-text)",
              marginBottom: 8,
              lineHeight: 1.35,
            }}
          >
            {block.headline}
          </h2>
          <div
            style={{
              width: 44,
              height: 1,
              background: "var(--kalpx-border-gold)",
              margin: "0 auto 16px",
            }}
          />
        </>
      )}

      {/* Mitra messages */}
      {messages.map((msg, i) => (
        <p
          key={i}
          style={{
            fontSize: 18,
            fontFamily: "var(--kalpx-font-serif)",
            color: "var(--kalpx-text)",
            lineHeight: 1.6,
            marginBottom: 10,
          }}
        >
          {msg}
        </p>
      ))}

      {/* Reply chips */}
      {chips.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 16,
          }}
        >
          {chips.map((chip) => (
            <button
              key={chip.id}
              data-testid={`chip-${chip.id}`}
              disabled={busy}
              onClick={() =>
                void fireResponse({
                  chip_id: chip.id,
                  freeform_text: text || undefined,
                })
              }
              style={{
                padding: "13px 18px",
                minHeight: 48,
                borderRadius: 24,
                border:
                  chip.style === "primary"
                    ? "none"
                    : `1px solid var(--kalpx-border-gold)`,
                background:
                  chip.style === "primary"
                    ? "var(--kalpx-gold)"
                    : "var(--kalpx-bg)",
                color:
                  chip.style === "primary"
                    ? "#ffffff"
                    : "var(--kalpx-text-soft)",
                fontSize: 15,
                fontWeight: chip.style === "primary" ? 600 : 400,
                cursor: busy ? "not-allowed" : "pointer",
                opacity: busy ? 0.7 : 1,
                textAlign: "left",
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Optional freeform text input */}
      {inputEnabled && (
        <div style={{ marginTop: 14 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={block.open_input?.placeholder || "Type your response…"}
            rows={3}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: `1px solid var(--kalpx-border-gold)`,
              fontSize: 15,
              color: "var(--kalpx-text)",
              background: "var(--kalpx-bg)",
              resize: "none",
              boxSizing: "border-box",
            }}
          />
          {text.trim() && onResponse && (
            <button
              disabled={busy}
              onClick={() => void fireResponse({ freeform_text: text })}
              style={{
                marginTop: 10,
                padding: "12px 24px",
                minHeight: 48,
                borderRadius: 24,
                border: "none",
                background: "var(--kalpx-gold)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: 15,
                cursor: busy ? "not-allowed" : "pointer",
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? "…" : "Continue"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
