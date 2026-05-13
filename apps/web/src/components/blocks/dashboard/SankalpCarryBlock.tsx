interface Props {
  sd: Record<string, any>;
}

export function SankalpCarryBlock({ sd }: Props) {
  const items: string[] = Array.isArray(sd.sankalp_how_to_live)
    ? sd.sankalp_how_to_live
    : [];
  const label: string = sd.sankalp_how_to_live_label || "How To Live This";

  if (!items.length) return null;

  return (
    <div
      data-testid="sankalp-carry-block"
      style={{
        marginBottom: 20,
        padding: "14px 16px",
        borderRadius: 12,

        border: "1px solid rgba(233, 214, 179, 0.95)",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          color: "#d4a017",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              fontSize: 14,
              color: "var(--kalpx-text-soft)",
              lineHeight: 1.5,
              paddingLeft: 12,
              borderLeft: "2px solid #d4a017",
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
