import { ArrowRight, Cloud, Leaf, Sparkles, Sun } from "lucide-react";
import { useState } from "react";
import { VoiceTextInput } from "../VoiceTextInput";

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

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <img
            src="/new_home_lotus.png"
            alt=""
            style={{ width: "52%", maxWidth: 260, pointerEvents: "none" }}
          />
        </div>

        {chips.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              marginTop: "auto",
            }}
          >
            {chips.map((chip) => {
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
                    padding: "10px",
                    borderRadius: 999,
                    border: primary
                      ? "1px solid rgba(186, 132, 34, 0.7)"
                      : "1px solid rgba(201, 168, 76, 0.7)",
                    background: primary
                      ? "linear-gradient(90deg, #c18a2b 0%, #d4a13b 50%, #bf8523 100%)"
                      : "rgba(255, 252, 246, 0.94)",
                    color: primary ? "#fff9ec" : "var(--kalpx-text)",
                    fontSize: 17,
                    fontWeight: primary ? 700 : 600,
                    cursor: busy ? "not-allowed" : "pointer",
                    opacity: busy ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: primary
                      ? "0 12px 28px rgba(201, 168, 76, 0.28)"
                      : "0 8px 22px rgba(67,33,4,0.08)",
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
                      <Sparkles size={20} strokeWidth={2.2} />
                    ) : (
                      <span />
                    )}
                  </span>
                  <span>
                    {primary ? chip.label.replace(" →", "") : chip.label}
                  </span>
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

        {inputEnabled && (
          <div style={{ marginTop: 18 }}>
            <VoiceTextInput
              placeholder={
                block.open_input?.placeholder || "Share your reflection"
              }
              voiceAvailable={false}
              disabled={busy}
              onTextChange={setText}
              onSend={(value, type) => {
                if (type === "text") {
                  void fireResponse({
                    freeform_text: value,
                    response_type: "text",
                  });
                } else {
                  void fireResponse({ response_type: "voice_requested" });
                }
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: 28,
        background: "rgba(255, 253, 247, 0.88)",
        border: "1px solid var(--kalpx-border-gold)",
        boxShadow: "0 16px 34px rgba(67, 33, 4, 0.08)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        padding: "20px 14px 14px",
        marginBottom: 24,
        maxWidth: 520,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {/* Headline + gold divider */}
      {block.headline && (
        <>
          <h2
            style={{
              fontSize: 30,
              fontFamily: "var(--kalpx-font-serif)",
              fontWeight: 700,
              textAlign: "center",
              color: "var(--kalpx-text)",
              margin: "0 0 6px",
              lineHeight: 1.2,
            }}
          >
            {block.headline}
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              margin: "0 auto 16px",
            }}
          >
            <div
              style={{
                width: 74,
                height: 1,
                background: "var(--kalpx-border-gold)",
              }}
            />
            <span style={{ color: "var(--kalpx-gold)", fontSize: 13 }}>◈</span>
            <div
              style={{
                width: 74,
                height: 1,
                background: "var(--kalpx-border-gold)",
              }}
            />
          </div>
        </>
      )}

      {block.subtext && (
        <p
          style={{
            margin: "0 0 16px",
            textAlign: "center",
            fontSize: 16,
            lineHeight: 1.45,
            color: "var(--kalpx-text-soft)",
          }}
        >
          {block.subtext}
        </p>
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
            gap: 12,
            marginTop: messages.length ? 12 : 0,
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
                padding: "10px",

                borderRadius: 999,
                border:
                  chip.style === "primary"
                    ? "none"
                    : `1px solid var(--kalpx-border-gold)`,
                background:
                  chip.style === "primary"
                    ? "rgba(201, 168, 76, 0.14)"
                    : "rgba(255, 250, 243, 0.88)",
                color:
                  chip.style === "primary"
                    ? "var(--kalpx-text)"
                    : "var(--kalpx-text-soft)",
                fontSize: 17,
                fontWeight: chip.style === "primary" ? 700 : 500,
                cursor: busy ? "not-allowed" : "pointer",
                opacity: busy ? 0.7 : 1,
                textAlign: "center",
                boxShadow: "0 8px 20px rgba(67,33,4,0.09)",
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {inputEnabled && (
        <div style={{ marginTop: 14 }}>
          <VoiceTextInput
            initialValue={text}
            placeholder={
              block.open_input?.placeholder || "Share your reflection"
            }
            voiceAvailable={false}
            disabled={busy}
            onTextChange={setText}
            onSend={(value, type) => {
              if (type === "text") {
                setText(value);
                void fireResponse({
                  freeform_text: value,
                  response_type: "text",
                });
                return;
              }

              void fireResponse({ response_type: "voice_requested" });
            }}
          />
        </div>
      )}
    </div>
  );
}
