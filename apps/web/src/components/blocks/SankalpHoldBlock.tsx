import React, { useCallback, useEffect, useRef, useState } from "react";

/* ── Colour tokens ────────────────────────────────────────────────── */
const BROWN = "#432104";
const GOLD = "#b89450";
const MUTED = "#8a7a5a";

/* ── CSS injected once ────────────────────────────────────────────── */
const CSS = `
@keyframes kalpx-coin-spin {
  0%   { transform: perspective(800px) rotateY(0deg)    scaleX(1);    }
  25%  { transform: perspective(800px) rotateY(90deg)  scaleX(0.05); }
  50%  { transform: perspective(800px) rotateY(180deg) scaleX(1);    }
  75%  { transform: perspective(800px) rotateY(270deg) scaleX(0.05); }
  100% { transform: perspective(800px) rotateY(360deg) scaleX(1);    }
}
@keyframes kalpx-sankalp-pulse {
  0%,100% { opacity: 1; }
  50%     { opacity: 0.6; }
}
`;
let cssInjected = false;
function ensureCSS() {
  if (cssInjected || typeof document === "undefined") return;
  cssInjected = true;
  const s = document.createElement("style");
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ── CollapsibleCard (same style as RepCounterBlock) ─────────────── */
function CollapsibleCard({
  label,
  children,
  expanded,
  onToggle,
}: {
  label: string;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 10,
        border: "1px solid rgba(184,148,80,0.2)",
        background: "rgba(255,255,255,0.3)",
        padding: "12px 14px",
        cursor: "pointer",
        boxSizing: "border-box",
      }}
      onClick={onToggle}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{ flex: 1, height: 1, background: "#E8C587", opacity: 0.6 }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 17,
              fontFamily: "var(--kalpx-font-serif)",
              fontWeight: 700,
              color: BROWN,
            }}
          >
            {label}
          </span>
          <span style={{ fontSize: 11, color: GOLD }}>
            {expanded ? "▲" : "▼"}
          </span>
        </div>
        <div
          style={{ flex: 1, height: 1, background: "#E8C587", opacity: 0.6 }}
        />
      </div>
      {expanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: 14,
            fontSize: 16,
            lineHeight: 1.65,
            color: "#5a3c21",
            fontFamily: "var(--kalpx-font-serif)",
            textAlign: "center",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Props ────────────────────────────────────────────────────────── */
interface Props {
  block: { hold_duration?: number; [key: string]: any };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

function useIsDesktopRunner() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth >= 1024,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isDesktop;
}

function DesktopInfoSection({
  label,
  expanded,
  onToggle,
  children,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 28,
        border: "1px solid rgba(184,148,80,0.22)",
        background: "rgba(255,253,249,0.7)",
        boxShadow: "0 18px 48px rgba(184,148,80,0.08)",
        padding: expanded ? "32px 38px 34px" : "26px 38px",
        boxSizing: "border-box",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: 0,
          cursor: "pointer",
        }}
      >
        <span
          style={{ flex: 1, height: 1, background: "rgba(184,148,80,0.45)" }}
        />
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--kalpx-font-serif)",
            fontSize: 26,
            fontWeight: 700,
            color: BROWN,
            lineHeight: 1.1,
          }}
        >
          {label}
          <span style={{ fontSize: 15, color: GOLD }}>
            {expanded ? "▲" : "▼"}
          </span>
        </span>
        <span
          style={{ flex: 1, height: 1, background: "rgba(184,148,80,0.45)" }}
        />
      </button>

      {expanded && (
        <div
          style={{
            marginTop: 28,
            fontFamily: "var(--kalpx-font-serif)",
            fontSize: 21,
            lineHeight: 2.05,
            color: "#5a3c21",
            textAlign: "left",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────── */
export function SankalpHoldBlock({ block, screenData = {}, onAction }: Props) {
  ensureCSS();
  const isDesktop = useIsDesktopRunner();
  const infoViewOnly = screenData["info_view_only"] === true;

  /* ── Data resolution (matches mobile `info` object) ── */
  const activeItem: any = screenData["runner_active_item"] || {};
  const info: any = activeItem;

  const title: string =
    info.title ||
    info.title_snapshot ||
    screenData["sankalp_text"] ||
    "Intention";
  const bodyText: string =
    info.subtitle_or_line ||
    info.subtitle ||
    info.description_snapshot ||
    info.body ||
    info.line ||
    screenData["sankalp_prefix"] ||
    "";
  const howToLive: any = info.how_to_live || null;
  const insight: string =
    info.insight || info.essence || info.description_snapshot || "";
  const benefits: any = info.benefits || null;
  const audioUrl: string =
    info.audio_url || screenData["sankalp_audio_url"] || "";

  /* ── Expand states ── */
  const [essenceExpanded, setEssenceExpanded] = useState(true); // open by default
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);

  /* ── Activation state ── */
  const [activating, setActivating] = useState(false);
  const [done, setDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Audio URL priority: backend-seeded sankalp_audio_url → static /om.mp4 fallback
  const audioSrc = audioUrl || "/sankalp_om.mp3";

  const FALLBACK_MS = block.hold_duration ?? 8000; // used only if audio never loads

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  const handleComplete = useCallback(() => {
    setDone(true);
    setActivating(false);
    stopAudio();
    onAction?.({ type: "complete_runner" });
  }, [onAction]);

  const handleTap = useCallback(() => {
    if (activating || done) return;
    setActivating(true);

    // Play audio — rotate coin while audio plays, complete when 'ended'
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.volume = 0.7;

    audio.addEventListener("ended", handleComplete, { once: true });

    // Fallback timer in case audio fails to load or src is absent
    timerRef.current = setTimeout(handleComplete, FALLBACK_MS);

    audio.play().catch(() => {
      // Audio blocked or not found — fallback timer still runs
    });
  }, [activating, done, audioSrc, FALLBACK_MS, handleComplete]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  /* ── Helper: hasContent (matches mobile hasContent) ── */
  function hasContent(val: any): boolean {
    if (!val) return false;
    if (typeof val === "string") return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    return false;
  }

  if (isDesktop) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 1360,
          margin: "0 auto",
          padding: "44px 20px 84px",
          boxSizing: "border-box",
        }}
        data-testid="sankalp-hold-block"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.12fr) minmax(420px, 0.78fr)",
            gap: 40,
            alignItems: "start",
          }}
        >
          <div
            style={{
              position: "relative",
              borderRadius: 30,
              border: "1px solid rgba(184,148,80,0.22)",
              background:
                "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.95) 0%, rgba(255,253,249,0.92) 36%, rgba(251,246,238,0.84) 100%)",
              boxShadow: "0 24px 60px rgba(184,148,80,0.1)",
              padding: "34px 34px 30px",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 50% 45%, rgba(233,205,145,0.28), transparent 42%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <p
                  style={{
                    maxWidth: 640,
                    fontFamily: "var(--kalpx-font-serif)",
                    fontSize: 30,
                    fontWeight: 700,
                    color: BROWN,
                    textAlign: "center",
                    margin: "0 0 10px",
                    lineHeight: 1.35,
                  }}
                >
                  {title}
                </p>
                {bodyText && (
                  <p
                    style={{
                      fontFamily: "var(--kalpx-font-serif)",
                      fontSize: 21,
                      color: BROWN,
                      textAlign: "center",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {bodyText}
                  </p>
                )}
              </div>

              {hasContent(howToLive) && (
                <div
                  style={{
                    width: "100%",
                    borderRadius: 22,
                    border: "1px solid rgba(184,148,80,0.2)",
                    background: "rgba(255,255,255,0.45)",
                    padding: "24px 28px 26px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        background: "#E8C587",
                        opacity: 0.6,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 18,
                        letterSpacing: 1.8,
                        fontWeight: 700,
                        color: GOLD,
                        textTransform: "uppercase",
                      }}
                    >
                      How To Live
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        background: "#E8C587",
                        opacity: 0.6,
                      }}
                    />
                  </div>
                  {Array.isArray(howToLive) ? (
                    <div
                      style={{ display: "flex", flexDirection: "column", gap: 12 }}
                    >
                      {howToLive.map((line: string, i: number) => (
                        <p
                          key={i}
                          style={{
                            fontFamily: "var(--kalpx-font-serif)",
                            fontSize: 20,
                            color: BROWN,
                            lineHeight: 1.65,
                            margin: 0,
                            textAlign: "center",
                          }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p
                      style={{
                        fontFamily: "var(--kalpx-font-serif)",
                        fontSize: 18,
                        color: "#5a3c21",
                        lineHeight: 1.65,
                        margin: 0,
                        textAlign: "center",
                      }}
                    >
                      {howToLive}
                    </p>
                  )}
                </div>
              )}

              {!infoViewOnly && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 18,
                    marginTop: 28,
                    width: "100%",
                  }}
                >
                  <p
                    style={{
                      fontSize: 17,
                      color: MUTED,
                      textAlign: "center",
                      fontFamily: "var(--kalpx-font-serif)",
                      margin: 0,
                      transition: "opacity 0.4s",
                      opacity: activating ? 0.5 : 1,
                    }}
                  >
                    {activating
                      ? "Let the vibration settle within..."
                      : "Tap to embody your intention"}
                  </p>

                  <button
                    onClick={handleTap}
                    disabled={activating || done}
                    data-testid="sankalp-hold-circle"
                    aria-label="Tap to embody sankalp"
                  >
                    <img
                      src="/namaste.png"
                      alt="Namaste"
                      width={280}
                      height={280}
                      draggable={false}
                      style={{
                        animation: activating
                          ? "kalpx-coin-spin 4s linear infinite"
                          : "none",
                        opacity: done ? 0.3 : 1,
                        transition: "opacity 0.4s",
                        objectFit: "contain",
                      }}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 34,
              paddingTop: 148,
            }}
          >
            {hasContent(insight) && (
              <DesktopInfoSection
                label="Essence"
                expanded={essenceExpanded}
                onToggle={() => setEssenceExpanded((v) => !v)}
              >
                {insight}
              </DesktopInfoSection>
            )}

            {hasContent(benefits) && (
              <DesktopInfoSection
                label="Benefits"
                expanded={benefitsExpanded}
                onToggle={() => setBenefitsExpanded((v) => !v)}
              >
                {Array.isArray(benefits) ? (
                  <ul style={{ margin: 0, paddingLeft: 24 }}>
                    {benefits.map((b: string, i: number) => (
                      <li key={i} style={{ marginBottom: 8 }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : (
                  benefits
                )}
              </DesktopInfoSection>
            )}

            <button
              onClick={() => onAction?.({ type: "runner_exit" })}
              style={{
                alignSelf: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 20,
                fontFamily: "var(--kalpx-font-serif)",
                color: BROWN,
                textDecoration: "underline",
                padding: "4px 0",
                marginTop: 10,
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 32,
        paddingBottom: 52,
        paddingInline: 20,
        boxSizing: "border-box",
        width: "100%",
      }}
      data-testid="sankalp-hold-block"
    >
      {/* ── 1. Info card: title + body ── */}
      <div
        style={{
          marginBottom: 20,
        }}
      >
        <p
          style={{
            fontFamily: "var(--kalpx-font-serif)",
            fontSize: 22,
            fontWeight: 700,
            color: BROWN,
            textAlign: "center",
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          {title}
        </p>
        {bodyText && (
          <p
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 17,
              color: BROWN,
              textAlign: "center",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {bodyText}
          </p>
        )}
      </div>

      {/* ── 2. How To Live section (when present) ── */}
      {hasContent(howToLive) && (
        <div
          style={{
            width: "100%",
            borderRadius: 14,
            border: "1px solid rgba(184,148,80,0.2)",
            background: "rgba(255,255,255,0.35)",
            padding: "16px 20px",
            marginBottom: 20,
            boxSizing: "border-box",
          }}
        >
          {/* Section header — matches mobile SectionHeader */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: "#E8C587",
                opacity: 0.6,
              }}
            />
            <span
              style={{
                fontSize: 13,
                letterSpacing: 1.2,
                fontWeight: 700,
                color: GOLD,
                textTransform: "uppercase",
              }}
            >
              How To Live
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: "#E8C587",
                opacity: 0.6,
              }}
            />
          </div>
          {Array.isArray(howToLive) ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {howToLive.map((line: string, i: number) => (
                <p
                  key={i}
                  style={{
                    fontFamily: "var(--kalpx-font-serif)",
                    fontSize: 18,
                    color: BROWN,
                    lineHeight: 1.55,
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: "var(--kalpx-font-serif)",
                fontSize: 16,
                color: "#5a3c21",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {howToLive}
            </p>
          )}
        </div>
      )}

      {!infoViewOnly && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            marginBottom: 32,
            width: "100%",
          }}
        >
          <p
            style={{
              fontSize: 15,
              color: MUTED,
              textAlign: "center",
              fontFamily: "var(--kalpx-font-serif)",
              margin: 0,
              transition: "opacity 0.4s",
              opacity: activating ? 0.5 : 1,
            }}
          >
            {activating
              ? "Let the vibration settle within..."
              : "Tap to embody your intention"}
          </p>

          <button
            onClick={handleTap}
            disabled={activating || done}
            data-testid="sankalp-hold-circle"
            aria-label="Tap to embody sankalp"
          >
            <img
              src="/namaste.png"
              alt="Namaste"
              width={300}
              height={300}
              draggable={false}
              style={{
                animation: activating
                  ? "kalpx-coin-spin 4s linear infinite"
                  : "none",
                opacity: done ? 0.3 : 1,
                transition: "opacity 0.4s",
                objectFit: "contain",
                marginTop: -40,
              }}
            />
          </button>
        </div>
      )}

      {/* ── 4. Essence collapsible (info.insight) ── */}
      {hasContent(insight) && (
        <div style={{ width: "100%", marginBottom: 12, marginTop: infoViewOnly ? 0 : -80 }}>
          <CollapsibleCard
            label="Essence"
            expanded={essenceExpanded}
            onToggle={() => setEssenceExpanded((v) => !v)}
          >
            {insight}
          </CollapsibleCard>
        </div>
      )}

      {/* ── 5. Benefits collapsible ── */}
      {hasContent(benefits) && (
        <div style={{ width: "100%", marginBottom: 32 }}>
          <CollapsibleCard
            label="Benefits"
            expanded={benefitsExpanded}
            onToggle={() => setBenefitsExpanded((v) => !v)}
          >
            {Array.isArray(benefits) ? (
              <ul style={{ margin: 0, paddingLeft: 18, textAlign: "left" }}>
                {benefits.map((b: string, i: number) => (
                  <li
                    key={i}
                    style={{
                      marginBottom: 6,
                      fontFamily: "var(--kalpx-font-serif)",
                      fontSize: 16,
                      color: "#5a3c21",
                      lineHeight: 1.5,
                    }}
                  >
                    {b}
                  </li>
                ))}
              </ul>
            ) : (
              benefits
            )}
          </CollapsibleCard>
        </div>
      )}

      {/* ── Back link ── */}
      <button
        onClick={() => onAction?.({ type: "runner_exit" })}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 15,
          fontFamily: "var(--kalpx-font-serif)",
          color: BROWN,
          textDecoration: "underline",
          padding: "4px 0",
          marginTop: 4,
          marginBottom: 88,
        }}
      >
        Back
      </button>
    </div>
  );
}
