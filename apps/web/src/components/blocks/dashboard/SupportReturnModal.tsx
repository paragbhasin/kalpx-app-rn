import React from "react";

type ModalPayload = {
  title?: string;
  body?: string[] | string;
  cta_label?: string;
};

interface Props {
  payload?: ModalPayload | null;
  onClose: () => void;
}

export function SupportReturnModal({ payload, onClose }: Props) {
  if (!payload) return null;

  const lines = Array.isArray(payload.body)
    ? payload.body
    : String(payload.body || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(27, 18, 10, 0.56)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 22,
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close support message"
        style={{
          position: "absolute",
          inset: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 380,
          background:
            "url(/beige_bg.png) center/cover no-repeat, #FFFEF9",
          borderRadius: 26,
          border: "1px solid rgba(212, 160, 23, 0.28)",
          boxShadow: "0 18px 30px rgba(107, 74, 18, 0.18)",
          overflow: "hidden",
          padding: "22px 20px 20px",
          textAlign: "center",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close support message"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 36,
            height: 36,
            borderRadius: 18,
            border: "1.25px solid rgba(201, 168, 76, 0.75)",
            background: "rgba(255, 253, 247, 0.9)",
            color: "var(--kalpx-text)",
            fontSize: 22,
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <img
          src="/lotus_glow.png"
          alt=""
          aria-hidden="true"
          style={{
            width: 220,
            maxWidth: "100%",
            display: "block",
            margin: "10px auto 8px",
          }}
        />

        <h3
          style={{
            margin: 0,
            padding: "0 28px",
            fontFamily: "var(--kalpx-font-serif)",
            fontSize: 22,
            lineHeight: 1.35,
            color: "var(--kalpx-text)",
          }}
        >
          {payload.title || "Stay with your path"}
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            margin: "10px 0 14px",
          }}
        >
          <div style={{ width: 42, height: 1, background: "rgba(201, 168, 76, 0.55)" }} />
          <span style={{ color: "var(--kalpx-gold)", fontSize: 15 }}>✦</span>
          <div style={{ width: 42, height: 1, background: "rgba(201, 168, 76, 0.55)" }} />
        </div>

        <div style={{ display: "grid", gap: 6, marginBottom: 20 }}>
          {lines.map((line, index) => (
            <p
              key={`${line}-${index}`}
              style={{
                margin: 0,
                fontFamily: "var(--kalpx-font-serif)",
                fontSize: 15,
                lineHeight: 1.55,
                color: "var(--kalpx-text)",
              }}
            >
              {line}
            </p>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            minHeight: 50,
            borderRadius: 25,
            border: "none",
            background: "var(--kalpx-cta)",
            color: "#fffdf9",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {payload.cta_label || "Close"}
        </button>
      </div>
    </div>
  );
}
