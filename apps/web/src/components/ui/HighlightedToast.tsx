interface HighlightedToastProps {
  title?: string;
  message: string;
  visible: boolean;
  onClose: () => void;
  iconSrc?: string;
  top?: number;
  maxWidth?: number;
}

export function HighlightedToast({
  title = "Updated ✦",
  message,
  visible,
  onClose,
  iconSrc = "/mantra-lotus-3d.svg",
  top = 118,
  maxWidth = 560,
}: HighlightedToastProps) {
  if (!visible) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 179,
          background: "rgba(67, 33, 4, 0.12)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "calc(100% - 48px)",
          maxWidth,
          zIndex: 180,
        }}
      >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "15px",
          borderRadius: 32,
          border: "1.5px solid rgba(233, 186, 88, 0.9)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,250,241,0.94) 100%)",
          boxShadow:
            "0 0 0 1px rgba(255,240,205,0.7) inset, 0 22px 56px rgba(212,160,23,0.28), 0 0 28px rgba(246,215,140,0.35)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 12% 30%, rgba(255,238,192,0.34), transparent 26%), radial-gradient(circle at 85% 18%, rgba(255,243,213,0.3), transparent 22%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            width: 50,
            height: 50,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 40%, rgba(255,252,241,1), rgba(250,225,155,0.72) 72%, rgba(245,210,120,0.46) 100%)",
            boxShadow:
              "inset 0 2px 8px rgba(255,255,255,0.85), 0 0 0 2px rgba(255,249,235,0.95), 0 12px 28px rgba(214,169,63,0.2)",
          }}
        >
          <img
            src={iconSrc}
            alt=""
            aria-hidden="true"
            style={{ width: 58, height: 58 }}
          />
        </div>
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 18,
              fontWeight: 700,
              color: "#432104",
              lineHeight: 1.15,
              marginBottom: 10,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 12,
              lineHeight: 1.45,
              color: "#6E563E",
            }}
          >
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close message"
          style={{
            position: "relative",
            alignSelf: "flex-start",
            background: "none",
            border: "none",
            color: "#BE9A56",
            fontSize: 32,
            lineHeight: 1,
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>
      </div>
    </>
  );
}
