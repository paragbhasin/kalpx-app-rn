import React from "react";
import { useTranslation } from "../../lib/i18n";

interface Props {
  block?: Record<string, any>;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

type Kind = "mantra" | "sankalp" | "practice";

interface CardDef {
  kind: Kind;
  titleKey: string;
  whyKey: string;
}

const CARDS: CardDef[] = [
  {
    kind: "mantra",
    titleKey: "companion_mantra_title",
    whyKey: "companion_mantra_one_line",
  },
  {
    kind: "sankalp",
    titleKey: "companion_sankalp_line",
    whyKey: "companion_sankalp_one_line",
  },
  {
    kind: "practice",
    titleKey: "companion_practice_title",
    whyKey: "companion_practice_one_line",
  },
];

const THEME: Record<Kind, { accent: string; bg: string; border: string }> = {
  mantra: {
    accent: "#5E8D55",
    bg: "rgba(244,250,241,0.95)",
    border: "rgba(207,224,199,0.95)",
  },
  sankalp: {
    accent: "#8168AA",
    bg: "rgba(249,246,255,0.95)",
    border: "rgba(215,204,236,0.95)",
  },
  practice: {
    accent: "#C08F2C",
    bg: "rgba(255,250,242,0.95)",
    border: "rgba(233,214,181,0.95)",
  },
};

const ICONS: Record<Kind, string> = {
  mantra: "ॐ",
  sankalp: "♡",
  practice: "🧘",
};

function ChevronIcon({ color }: { color: string }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <polyline
        points="9 18 15 12 9 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ToggleChevron({ open }: { open: boolean }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <polyline
        points={open ? "6 15 12 9 18 15" : "6 9 12 15 18 9"}
        stroke="#A89068"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getShift(context: any): string {
  return context?.target_shift || context?.mitra_shift || "";
}

function sentence(value: string | null | undefined, fallback = ""): string {
  const text = String(value || fallback).trim();
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

export function PathEmergesBlock({ screenData, onAction }: Props) {
  const [whyOpen, setWhyOpen] = React.useState(false);
  const [activeWhyTab, setActiveWhyTab] = React.useState<Kind>("mantra");
  const { t } = useTranslation();
  const sd = screenData || {};
  const triad = sd.onboarding_triad_data?.triad || {};

  const LABELS: Record<Kind, string> = {
    mantra: t("turn8.labelMantra"),
    sankalp: t("turn8.labelSankalp"),
    practice: t("turn8.labelPractice"),
  };

  const hasData = CARDS.some((c) => !!sd[c.titleKey]);
  const whyTabs = CARDS.filter((c) => {
    const item = triad[c.kind] || {};
    const context = item.context || {};
    return !!(
      item.title ||
      context.mitra_frame_through ||
      getShift(context) ||
      context.mitra_use_for ||
      context.commentary_lineage
    );
  });
  const activeWhyItem = triad[activeWhyTab] || {};
  const activeWhyContext = activeWhyItem.context || {};
  const activeShift = getShift(activeWhyContext);

  if (!hasData) {
    return (
      <div
        style={{
          padding: 20,
          borderRadius: 12,
          border: "1px dashed var(--kalpx-border-gold)",
          textAlign: "center",
          color: "var(--kalpx-text-soft)",
          fontSize: 14,
          marginBottom: 20,
        }}
      >
        Preparing your path…
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 6,
        marginBottom: 18,
        maxWidth: 560,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {/* Error banner — v3_start_failed */}
      {!!sd.v3_start_failed && (
        <div
          style={{
            background: "#fff3cd",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            borderLeft: "3px solid #e6a817",
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "#7a5c00",
              lineHeight: 1.43,
              margin: 0,
            }}
          >
            Something went wrong. Please try again.
          </p>
        </div>
      )}

      {CARDS.map((card) => {
        const theme = THEME[card.kind];
        const triadItem = triad[card.kind] || {};
        const rawTitle = triadItem.title || sd[card.titleKey] || "";
        if (!rawTitle) return null;
        const title =
          card.kind === "sankalp" ? `'${rawTitle.trim()}'` : rawTitle;
        const why: string =
          triadItem.body ||
          triadItem.description ||
          triadItem.subtitle ||
          sd[card.whyKey] ||
          "";

        return (
          <button
            key={card.kind}
            data-testid={`triad-${card.kind}`}
            onClick={() =>
              onAction?.({
                type: "view_info",
                payload: {
                  type: card.kind,
                  manualData: triadItem,
                  readOnly: true,
                  backTarget: {
                    container_id: "welcome_onboarding",
                    state_id: "turn_8",
                  },
                },
              })
            }
            style={{
              width: "100%",
              borderRadius: 28,
              border: `1px solid ${theme.border}`,

              padding: "15px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 0,
              boxShadow:
                "0 16px 30px rgba(166,125,54,0.08), inset 0 0 0 1px rgba(255,255,255,0.32)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {/* Icon circle */}
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: `1px solid ${theme.accent}30`,
                background: "rgba(255,255,255,0.78)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 19,
                color: theme.accent,
                flexShrink: 0,
                marginRight: 16,
                boxShadow:
                  "0 12px 28px rgba(176,139,70,0.14), inset 0 -8px 18px rgba(246,236,217,0.7)",
              }}
            >
              {ICONS[card.kind]}
            </div>

            {/* Text column */}
            <div style={{ flex: 1, paddingRight: 8 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "3.2px",
                  color: theme.accent,
                  textTransform: "uppercase",
                  marginBottom: 8,
                  margin: "0 0 8px",
                }}
              >
                {LABELS[card.kind].toUpperCase()}
              </p>
              <p
                style={{
                  fontFamily: "var(--kalpx-font-serif)",
                  fontWeight: 700,
                  fontSize: "clamp(16px, 4.8vw, 26px)",
                  lineHeight: 1.28,
                  color: "var(--kalpx-text)",
                  marginBottom: 8,
                  margin: "0 0 8px",
                  textWrap: "balance",
                }}
              >
                {title}
              </p>
              {why && (
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.57,
                    color: card.kind === "sankalp" ? "#6F6190" : "#5D5B58",
                    marginTop: 2,
                    margin: "2px 0 0",
                    textWrap: "balance",
                  }}
                >
                  {why}
                </p>
              )}
            </div>

            <div style={{ marginLeft: 6 }}>
              <ChevronIcon color={theme.accent} />
            </div>
          </button>
        );
      })}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 6,
          marginBottom: 14,
        }}
      >
        <div
          style={{ width: 108, height: 1, background: "rgba(199,154,43,0.55)" }}
        />
        <img
          src="/new_home_lotus.png"
          alt=""
          style={{ width: 20, height: 16, margin: "0 12px", opacity: 0.72 }}
        />
        <div
          style={{ width: 108, height: 1, background: "rgba(199,154,43,0.55)" }}
        />
      </div>

      {whyTabs.length > 0 && (
        <div
          style={{
            marginTop: 4,
            marginBottom: 18,
            borderRadius: 28,
            border: "1px solid rgba(226, 208, 174, 0.9)",
            background:
              "linear-gradient(180deg, rgba(255,251,245,0.98) 0%, rgba(255,247,235,0.94) 48%, rgba(252,242,226,0.96) 100%)",
            boxShadow:
              "0 18px 40px rgba(139, 106, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.85)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at top right, rgba(243,224,188,0.45), transparent 30%), radial-gradient(circle at bottom left, rgba(214,188,134,0.22), transparent 32%)",
              pointerEvents: "none",
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (
                !whyOpen &&
                !whyTabs.find((tab) => tab.kind === activeWhyTab)
              ) {
                setActiveWhyTab(whyTabs[0].kind);
              }
              setWhyOpen((v) => !v);
            }}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              padding: "13px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              textAlign: "left",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(250, 244, 229, 0.95)",
                border: "1px solid rgba(226, 208, 174, 0.65)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src="/lotus_icon.png"
                alt=""
                style={{ width: 20, height: 16, opacity: 0.8 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--kalpx-font-serif)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--kalpx-text)",
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {t("turn8.whyChosen")}
              </div>
              {!whyOpen && (
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "var(--kalpx-text-soft)",
                  }}
                >
                  {t("turn8.whySubtitle")}
                </p>
              )}
            </div>
            <ToggleChevron open={whyOpen} />
          </button>

          {whyOpen && (
            <div
              style={{
                padding: "0 20px 22px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                {/* <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(180deg, rgba(255,247,228,0.95), rgba(247,231,194,0.95))",
                    border: "1px solid rgba(214,183,130,0.55)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      "0 8px 22px rgba(179,135,34,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}
                >
                  <img
                    src="/lotus_icon.png"
                    alt=""
                    style={{ width: 18, height: 14, opacity: 0.82 }}
                  />
                </div> */}
                <div>
                  <p
                    style={{
                      margin: "0 0 3px",
                      fontSize: 11,
                      letterSpacing: 1.6,
                      textTransform: "uppercase",
                      color: "#B38722",
                      fontWeight: 700,
                    }}
                  >
                    {t("turn8.chosenWith")}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--kalpx-font-serif)",
                      fontSize: 18,
                      lineHeight: 1.2,
                      color: "#432104",
                    }}
                  >
                    {t("turn8.whySupports")}
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 18,
                }}
              >
                {whyTabs.map((tab) => {
                  const selected = activeWhyTab === tab.kind;
                  return (
                    <button
                      key={tab.kind}
                      type="button"
                      onClick={() => setActiveWhyTab(tab.kind)}
                      style={{
                        borderRadius: 999,
                        border: selected
                          ? `1px solid ${THEME[tab.kind].accent}`
                          : "1px solid rgba(214,183,130,0.42)",
                        background: selected
                          ? tab.kind === "mantra"
                            ? "linear-gradient(180deg, rgba(246,251,243,1) 0%, rgba(239,247,236,0.98) 100%)"
                            : tab.kind === "sankalp"
                              ? "linear-gradient(180deg, rgba(250,247,255,1) 0%, rgba(245,240,253,0.98) 100%)"
                              : "linear-gradient(180deg, rgba(255,252,246,1) 0%, rgba(255,247,235,0.98) 100%)"
                          : "rgba(255,255,255,0.7)",
                        color: selected ? THEME[tab.kind].accent : "#7A6A58",
                        padding: "8px 15px",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.9,
                        textTransform: "uppercase",
                        cursor: "pointer",
                        boxShadow: selected
                          ? "0 10px 20px rgba(179,135,34,0.12)"
                          : "none",
                      }}
                    >
                      {tab.kind === "sankalp"
                        ? t("turn8.tabSankalp")
                        : tab.kind === "mantra"
                          ? t("turn8.tabMantra")
                          : t("turn8.tabPractice")}
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  borderTop: "1px solid rgba(214,183,130,0.28)",
                  paddingTop: 20,
                  color: "var(--kalpx-text)",
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    fontFamily: "var(--kalpx-font-sans)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: THEME[activeWhyTab].accent,
                  }}
                >
                  {activeWhyTab === "sankalp"
                    ? t("turn8.tabSankalp")
                    : activeWhyTab === "mantra"
                      ? t("turn8.tabMantra")
                      : t("turn8.tabPractice")}
                </p>
                <p
                  style={{
                    fontFamily: "var(--kalpx-font-serif)",
                    fontSize: 18,
                    fontWeight: 700,
                    margin: "0 0 18px",
                    lineHeight: 1.18,
                    color: "#432104",
                  }}
                >
                  {activeWhyTab === "sankalp"
                    ? activeWhyItem.title || ""
                    : `${activeWhyItem.title || ""}`}
                </p>

                {activeWhyTab === "sankalp" ? (
                  <>
                    {!!activeWhyContext.mitra_frame_through && (
                      <div
                        style={{
                          margin: "0 0 14px",
                          padding: "14px 16px",
                          borderRadius: 18,
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,248,237,0.88))",
                          border: "1px solid rgba(230, 214, 186, 0.9)",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 6px",
                            fontSize: 11,
                            letterSpacing: 1.4,
                            textTransform: "uppercase",
                            color: "#A57A2B",
                            fontWeight: 700,
                          }}
                        >
                          {t("turn8.essence")}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 16,
                            lineHeight: 1.75,
                            color: "#5D5348",
                          }}
                        >
                          {sentence(
                            t("turn8.frameSankalp").replace("{frame}", activeWhyContext.mitra_frame_through),
                          )}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  !!activeWhyContext.mitra_frame_through && (
                    <div
                      style={{
                        margin: "0 0 14px",
                        padding: "14px 16px",
                        borderRadius: 18,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,248,237,0.88))",
                        border: "1px solid rgba(230, 214, 186, 0.9)",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontSize: 11,
                          letterSpacing: 1.4,
                          textTransform: "uppercase",
                          color: "#A57A2B",
                          fontWeight: 700,
                        }}
                      >
                        {t("turn8.essence")}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 16,
                          lineHeight: 1.75,
                          color: "#5D5348",
                        }}
                      >
                        {sentence(
                          t("turn8.frameItem")
                            .replace("{title}", activeWhyItem.title || "This")
                            .replace("{frame}", activeWhyContext.mitra_frame_through),
                        )}
                      </p>
                    </div>
                  )
                )}

                {!!activeShift && (
                  <div
                    style={{
                      margin: "0 0 14px",
                      padding: "14px 16px",
                      borderRadius: 18,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,248,237,0.88))",
                      border: "1px solid rgba(230, 214, 186, 0.9)",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontSize: 11,
                        letterSpacing: 1.4,
                        textTransform: "uppercase",
                        color: "#A57A2B",
                        fontWeight: 700,
                      }}
                    >
                      {t("turn8.shift")}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 16,
                        lineHeight: 1.75,
                        color: "#5D5348",
                      }}
                    >
                      {sentence(
                        t("turn8.shiftLabel").replace("{shift}", activeShift),
                      )}
                    </p>
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 12,
                  }}
                >
                  {!!activeWhyContext.mitra_use_for && (
                    <div
                      style={{
                        padding: "14px 16px",
                        borderRadius: 18,
                        background: "rgba(255,255,255,0.64)",
                        border: "1px solid rgba(230, 214, 186, 0.86)",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontSize: 11,
                          letterSpacing: 1.4,
                          textTransform: "uppercase",
                          color: "#A57A2B",
                          fontWeight: 700,
                        }}
                      >
                        {t("turn8.usefulFor")}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 15,
                          lineHeight: 1.7,
                          color: "#5D5348",
                        }}
                      >
                        {sentence(activeWhyContext.mitra_use_for)}
                      </p>
                    </div>
                  )}

                  {!!activeWhyContext.commentary_lineage && (
                    <div
                      style={{
                        padding: "14px 16px",
                        borderRadius: 18,
                        background: "rgba(255,255,255,0.64)",
                        border: "1px solid rgba(230, 214, 186, 0.86)",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontSize: 11,
                          letterSpacing: 1.4,
                          textTransform: "uppercase",
                          color: "#A57A2B",
                          fontWeight: 700,
                        }}
                      >
                        {t("turn8.rootedIn")}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 15,
                          lineHeight: 1.7,
                          color: "#5D5348",
                        }}
                      >
                        {sentence(activeWhyContext.commentary_lineage)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer: two gold lines with lotus between */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 6,
          marginBottom: 14,
        }}
      >
        <div
          style={{ width: 108, height: 1, background: "rgba(199,154,43,0.55)" }}
        />
        <img
          src="/new_home_lotus.png"
          alt=""
          style={{ width: 20, height: 16, margin: "0 12px", opacity: 0.72 }}
        />
        <div
          style={{ width: 108, height: 1, background: "rgba(199,154,43,0.55)" }}
        />
      </div>

      <p
        style={{
          fontFamily: "var(--kalpx-font-serif)",
          fontSize: "clamp(18px, 4.1vw, 18px)",
          lineHeight: 1.75,
          color: "var(--kalpx-text)",
          textAlign: "center",

          margin: 0,
          textWrap: "balance",
        }}
      >
        {t("turn8.footer")}
      </p>
    </div>
  );
}
