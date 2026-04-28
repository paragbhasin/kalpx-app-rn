import React from "react";

interface Props {
  block: { content?: string; variant?: string; [key: string]: any };
}

function sanitizeStyle(style: any): React.CSSProperties {
  if (!style || typeof style !== "object") return {};
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(style)) {
    if (typeof v === "string" && /^-?\d+(\.\d+)?px$/.test(v)) {
      clean[k] = parseFloat(v);
    } else if (
      typeof v === "string" &&
      /^-?\d+(\.\d+)?$/.test(v) &&
      k !== "fontWeight" &&
      k !== "color"
    ) {
      clean[k] = parseFloat(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

export function HeadlineBlock({ block }: Props) {
  if (block.content === "I'm Mitra.\nI'm here with you.") {
    return null;
  }

  return (
    <h2
      style={{
        fontSize: 20,
        fontWeight: 600,
        color: "var(--kalpx-text)",
        margin: "16px 0 8px",
        lineHeight: 1.3,
        whiteSpace: "pre-line",
        textAlign: "center",
        fontFamily: "var(--kalpx-font-serif)",
        ...sanitizeStyle(block.style),
      }}
    >
      {block.content || ""}
    </h2>
  );
}
