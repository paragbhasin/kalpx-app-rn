import { Flower2, Heart, Leaf, RefreshCw } from "lucide-react";

type JourneyPath = "support" | "growth" | "return" | string;

interface Props {
  sd: Record<string, any>;
}

function iconForPath(path: JourneyPath) {
  switch (path) {
    case "support":
      return Heart;
    case "growth":
      return Leaf;
    case "return":
      return RefreshCw;
    default:
      return Flower2;
  }
}

export function PathChip({ sd }: Props) {
  const arc = sd.arc_state || {};
  const path: JourneyPath = arc.journey_path || sd.journey_path || "";
  const label: string = arc.journey_path_label || sd.journey_path_label || "";

  if (!path && !label) return null;

  const displayLabel =
    label ||
    (path === "support"
      ? "Support Path"
      : path === "growth"
        ? "Growth Path"
        : path === "return"
          ? "Re-entry"
          : "Your Path");

  const Icon = iconForPath(path);

  return (
    <div
      data-testid="path-chip"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        marginBottom: 10,
        padding: "5px 10px",
        borderRadius: 14,
        background: "var(--kalpx-card-bg)",
        border: "1px solid var(--kalpx-gold-hairline)",
      }}
    >
      <Icon size={13} strokeWidth={1.8} color="var(--kalpx-gold)" />
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--kalpx-text-muted)",
        }}
      >
        {displayLabel}
      </span>
    </div>
  );
}
