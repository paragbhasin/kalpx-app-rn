/**
 * LifeContextPickerSheet — web bottom-sheet parity with mobile context tray.
 */
import { ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "../../../lib/i18n";
import { LIFE_CONTEXT_OPTIONS } from "./roomConstants";

interface Props {
  roomId: string;
  allowedContexts?: string[] | null;
  onPick: (context: string) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function LifeContextPickerSheet({
  roomId,
  allowedContexts,
  onPick,
  onSkip,
  onBack,
}: Props) {
  const { t } = useTranslation();
  const options = allowedContexts
    ? LIFE_CONTEXT_OPTIONS.filter((o) => allowedContexts.includes(o.id))
    : LIFE_CONTEXT_OPTIONS;

  const getPickerLabel = (id: string, label: string) => {
    const key = `mitra.room.lifeContext.${id}`;
    const translated = t(key as any);
    return translated !== key ? translated : label;
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onBack();
    };
    const onPopState = () => onBack();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", onPopState);
    };
  }, [onBack]);

  return (
    <div
      data-testid="life-context-picker-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onBack();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 220,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.35)",
      }}
    >
      <div
        data-testid="life-context-picker"
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "80dvh",
          overflowY: "auto",
          borderRadius: "28px 28px 0 0",
          background: [
            "radial-gradient(circle at 82% 74%, rgba(234, 199, 134, 0.26), transparent 28%)",
            "radial-gradient(circle at 94% 100%, rgba(228, 194, 132, 0.2), transparent 18%)",
            "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(252,246,237,0.98))",
          ].join(", "),
          boxShadow: "0 -12px 40px rgba(58, 39, 20, 0.14)",
          border: "1px solid rgba(212, 183, 132, 0.28)",
          padding: "14px 22px 28px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 40,
              height: 5,
              borderRadius: 999,
              background: "rgba(201, 168, 76, 0.24)",
            }}
          />
        </div>

        <h2
          style={{
            margin: "0 0 18px",
            fontFamily: "var(--kalpx-font-serif)",
            fontWeight: 700,
            fontSize: 20,
            lineHeight: 1.4,
            color: "var(--kalpx-text)",
            letterSpacing: 0.15,
          }}
        >
          {t('mitra.room.lifeContextHeader')}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onPick(opt.id)}
              data-testid={`context-option-${opt.id}`}
              style={{
                width: "100%",

                padding: "10px",
                borderRadius: 10,
                border: "1px solid rgba(212, 183, 132, 0.58)",
                background: "rgba(255,255,255,0.7)",
                color: "var(--kalpx-text)",
                fontFamily: "var(--kalpx-font-serif)",
                fontSize: 16,
                fontWeight: 700,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                backdropFilter: "blur(1px)",
                WebkitBackdropFilter: "blur(1px)",
              }}
            >
              <span>{getPickerLabel(opt.id, opt.label)}</span>
              <ChevronRight
                size={18}
                strokeWidth={1.8}
                color="rgba(109, 83, 55, 0.7)"
              />
            </button>
          ))}
        </div>

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid rgba(212, 183, 132, 0.26)",
          }}
        >
          <button
            onClick={onSkip}
            data-testid="context-picker-skip"
            style={{
              display: "block",
              width: "100%",
              background: "none",
              border: "none",
              color: "var(--kalpx-text-muted)",
              fontSize: 13,
              cursor: "pointer",

              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {t('mitra.room.skipForNow')}
          </button>
        </div>
      </div>
    </div>
  );
}
