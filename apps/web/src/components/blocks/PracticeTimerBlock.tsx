import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "../../lib/i18n";

/* ── Colour tokens ────────────────────────────────────────────────── */
const GOLD = "#D4A017";
const BROWN = "#432104";
const MUTED = "#8A7A5A";
const CARD_BG = "rgba(255,255,255,0.35)";
const CARD_BORDER = "rgba(184,148,80,0.2)";

/* ── CSS ──────────────────────────────────────────────────────────── */
const CSS = `
@keyframes kalpx-practice-glow {
  from { filter: drop-shadow(0 0 4px rgba(212,160,23,0.6)); }
  to   { filter: drop-shadow(0 0 12px rgba(212,160,23,1.0)); }
}
`;
let cssOnce = false;
function ensureCSS() {
  if (cssOnce || typeof document === "undefined") return;
  cssOnce = true;
  const s = document.createElement("style");
  s.textContent = CSS;
  document.head.appendChild(s);
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ── CollapsibleCard ────────────────────────────────────────────── */
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
        border: `1px solid ${CARD_BORDER}`,
        background: CARD_BG,
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
  block: { [key: string]: any };
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
        borderRadius: 11,
        border: "1px solid rgba(184,148,80,0.22)",
        background: "rgba(255,253,249,0.7)",
        boxShadow: "0 18px 48px rgba(184,148,80,0.08)",
        padding: expanded ? "32px 38px 34px" : "20px",
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

/* ── Calm music — plays when timer starts, stops when done/reset ──── */
// Round-robin track selection via localStorage (matches mobile AsyncStorage logic)
const CALM_TRACKS = [
  "/Audio-calmmusic.mp3",
  "/Audio1.mpeg",
  "/Audio9.mpeg",
  "/Audio6.mpeg",
];
const CALM_IDX_KEY = "_kalpx_calm_music_idx";
function getNextCalmTrack(): string {
  let lastIdx = -1;
  try {
    lastIdx = parseInt(localStorage.getItem(CALM_IDX_KEY) || "-1", 10);
  } catch {}
  const nextIdx =
    ((Number.isFinite(lastIdx) ? lastIdx : -1) + 1) % CALM_TRACKS.length;
  try {
    localStorage.setItem(CALM_IDX_KEY, String(nextIdx));
  } catch {}
  return CALM_TRACKS[nextIdx];
}

const MIN_MINUTES = 1;
const MAX_MINUTES = 10;

/* ── Component ────────────────────────────────────────────────────── */
export function PracticeTimerBlock({
  block,
  screenData = {},
  onAction,
}: Props) {
  ensureCSS();
  const isDesktop = useIsDesktopRunner();
  const { t } = useTranslation();
  const infoViewOnly = screenData["info_view_only"] === true;

  /* ── Data resolution ── */
  const activeItem: any = screenData["runner_active_item"] || {};
  const info: any = activeItem;

  const title: string =
    info.title || info.title_snapshot || screenData["practice_title"] || "";
  const summary: string =
    info.summary ||
    info.subtitle_or_line ||
    info.subtitle ||
    info.description_snapshot ||
    info.line ||
    "";
  const duration: string = info.duration || "";
  const steps: string[] = Array.isArray(info.steps) ? info.steps : [];
  const benefits: any = info.benefits || null;
  const insight: string =
    info.essence || info.insight || info.description_snapshot || "";

  // Duration seeded from backend (practice_duration_seconds) or derived from item
  const rawDurationSec: number =
    (screenData["practice_duration_seconds"] as number) || 0;
  const rawItemMins: number = (() => {
    const raw = info.duration_min ?? info.duration;
    if (typeof raw === "number" && raw > 0) return Math.max(1, Math.round(raw));
    if (typeof raw === "string") {
      const m = raw.match(/(\d+(?:\.\d+)?)/);
      if (m) return Math.max(1, Math.round(Number(m[1])));
    }
    return 3; // default 3 min
  })();

  const defaultMinutes =
    rawDurationSec > 0
      ? Math.max(1, Math.round(rawDurationSec / 60))
      : rawItemMins;

  /* ── State ── */
  const [selectedMinutes, setSelectedMinutes] = useState(defaultMinutes);
  const [initialSeconds, setInitialSeconds] = useState(defaultMinutes * 60);
  const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);
  const [essenceExpanded, setEssenceExpanded] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const calmAudioRef = useRef<HTMLAudioElement | null>(null);

  /* ── Calm music helpers ── */
  function stopCalmMusic() {
    if (calmAudioRef.current) {
      calmAudioRef.current.pause();
      calmAudioRef.current.src = "";
      calmAudioRef.current = null;
    }
  }
  function startCalmMusic() {
    stopCalmMusic();
    const audio = new Audio(getNextCalmTrack());
    audio.volume = 0.35;
    calmAudioRef.current = audio;
    // When track ends, play the next one
    audio.addEventListener(
      "ended",
      () => {
        if (!calmAudioRef.current) return;
        startCalmMusic();
      },
      { once: true },
    );
    audio.play().catch(() => {}); // autoplay may be blocked — silent fail
  }

  /* ── Complete ── */
  const handleComplete = useCallback(() => {
    if (done) return;
    setDone(true);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopCalmMusic();
    onAction?.({ type: "complete_runner" });
  }, [done, onAction]);

  /* ── Tick ── */
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, handleComplete]);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopCalmMusic(); // stop music on unmount (navigating away)
    },
    [],
  );

  /* ── Start ── */
  function handleBegin() {
    const secs = selectedMinutes * 60;
    setInitialSeconds(secs);
    setTimeLeft(secs);
    setRunning(true);
    startCalmMusic(); // ► plays calm music from Begin tap until complete/reset
  }

  /* ── Reset ── */
  function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopCalmMusic();
    setRunning(false);
    setTimeLeft(selectedMinutes * 60);
    setInitialSeconds(selectedMinutes * 60);
    setDone(false);
  }

  /* ── Minutes adjust ── */
  function updateMinutes(m: number) {
    const clamped = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, m));
    setSelectedMinutes(clamped);
    setTimeLeft(clamped * 60);
    setInitialSeconds(clamped * 60);
  }

  /* ── SVG ring ── */
  const RING_R = 108;
  const RING_SIZE = 260;
  const RING_CX = 130;
  const CIRCUMF = 2 * Math.PI * RING_R;
  const progress = running || done ? 1 - timeLeft / initialSeconds : 0;
  const dashOffset = CIRCUMF * (1 - progress);
  const isFinal10 = running && !done && timeLeft <= 10 && timeLeft > 0;

  /* ── Helper ── */
  function hasContent(v: any) {
    if (!v) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return false;
  }

  if (isDesktop) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 1360,
          margin: "0 auto",
          padding: "25px 15px 15px",
          boxSizing: "border-box",
        }}
        data-testid="practice-timer-block"
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
              borderRadius: 11,
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
              {title && (
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <p
                    style={{
                      fontFamily: "var(--kalpx-font-serif)",
                      fontSize: 30,
                      fontWeight: 700,
                      color: BROWN,
                      margin: "0 0 10px",
                      lineHeight: 1.35,
                    }}
                  >
                    {title}
                  </p>
                  {summary && (
                    <p
                      style={{
                        fontFamily: "var(--kalpx-font-serif)",
                        fontSize: 21,
                        color: BROWN,
                        margin: "0 0 8px",
                        lineHeight: 1.7,
                      }}
                    >
                      {summary}
                    </p>
                  )}
                  {duration && (
                    <p
                      style={{
                        fontSize: 16,
                        color: GOLD,
                        margin: 0,
                        letterSpacing: 0.5,
                      }}
                    >
                      {duration}
                    </p>
                  )}
                </div>
              )}

              {steps.length > 0 && (
                <div
                  style={{
                    width: "100%",
                    borderRadius: 22,
                    border: `1px solid ${CARD_BORDER}`,
                    background: "rgba(255,255,255,0.45)",
                    padding: "24px 28px 26px",
                    marginBottom: 22,
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
                        textAlign: "center",
                      }}
                    >
                      {t('practiceRunner.whatThisAsks')}
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
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    {steps.map((step, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 20,
                            color: GOLD,
                            fontFamily: "var(--kalpx-font-serif)",
                            fontWeight: 700,
                            flexShrink: 0,
                            minWidth: 22,
                          }}
                        >
                          {i + 1}.
                        </span>
                        <span
                          style={{
                            fontSize: 20,
                            color: "#5a3c21",
                            fontFamily: "var(--kalpx-font-serif)",
                            lineHeight: 1.65,
                          }}
                        >
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!infoViewOnly && (
                <div
                  style={{
                    width: "100%",
                    borderRadius: 22,
                    border: `1px solid ${CARD_BORDER}`,
                    background: "rgba(255,255,255,0.45)",
                    padding: "28px 28px 30px",
                    boxSizing: "border-box",
                    textAlign: "center",
                  }}
                >
                  {!running && !done ? (
                    <>
                      <p
                        style={{
                          fontFamily: "var(--kalpx-font-serif)",
                          fontSize: 18,
                          color: BROWN,
                          fontWeight: 700,
                          margin: "0 0 8px",
                        }}
                      >
                        {t('practiceRunner.howLongPause')}
                      </p>
                      <p
                        style={{
                          fontSize: 42,
                          fontWeight: 300,
                          color: BROWN,
                          fontFamily: "var(--kalpx-font-serif)",
                          margin: "0 0 16px",
                        }}
                      >
                        {selectedMinutes}{" "}
                        <span style={{ fontSize: 20, color: MUTED }}>min</span>
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          marginBottom: 8,
                        }}
                      >
                        <button
                          onClick={() => updateMinutes(selectedMinutes - 1)}
                          disabled={selectedMinutes <= MIN_MINUTES}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            border: `1px solid ${CARD_BORDER}`,
                            background: "rgba(255,255,255,0.6)",
                            cursor: "pointer",
                            fontSize: 28,
                            color: "#8A5A12",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            opacity: selectedMinutes <= MIN_MINUTES ? 0.4 : 1,
                          }}
                          aria-label="Decrease minutes"
                        >
                          −
                        </button>
                        <input
                          type="range"
                          min={MIN_MINUTES}
                          max={MAX_MINUTES}
                          step={1}
                          value={selectedMinutes}
                          onChange={(e) =>
                            updateMinutes(Number(e.target.value))
                          }
                          style={{
                            flex: 1,
                            accentColor: GOLD,
                            height: 4,
                            cursor: "pointer",
                          }}
                        />
                        <button
                          onClick={() => updateMinutes(selectedMinutes + 1)}
                          disabled={selectedMinutes >= MAX_MINUTES}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            border: `1px solid ${CARD_BORDER}`,
                            background: "rgba(255,255,255,0.6)",
                            cursor: "pointer",
                            fontSize: 28,
                            color: "#8A5A12",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            opacity: selectedMinutes >= MAX_MINUTES ? 0.4 : 1,
                          }}
                          aria-label="Increase minutes"
                        >
                          +
                        </button>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          color: MUTED,
                          marginBottom: 22,
                        }}
                      >
                        <span>{t('practiceRunner.minMin')}</span>
                        <span>{t('practiceRunner.dragToAdjust')}</span>
                        <span>{t('practiceRunner.maxMin')}</span>
                      </div>

                      <button
                        onClick={handleBegin}
                        data-testid="practice-begin-btn"
                        style={{
                          width: "100%",
                          maxWidth: 280,
                          padding: "16px 0",
                          borderRadius: 32,
                          border: "0.3px solid #432104",
                          background: "#FBF5F5",
                          color: "#432104",
                          fontSize: 18,
                          fontFamily: "var(--kalpx-font-sans, sans-serif)",
                          letterSpacing: 0.3,
                          cursor: "pointer",
                        }}
                        className="shadow-2xl"
                      >
                        {t('practiceRunner.begin')}
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          position: "relative",
                          width: RING_SIZE,
                          height: RING_SIZE,
                          margin: "0 auto 16px",
                        }}
                      >
                        <svg
                          width={RING_SIZE}
                          height={RING_SIZE}
                          style={{ position: "absolute", inset: 0 }}
                        >
                          <circle
                            cx={RING_CX}
                            cy={RING_CX}
                            r={RING_R}
                            stroke="rgba(212,160,23,0.2)"
                            strokeWidth={12}
                            fill="none"
                          />
                          <circle
                            cx={RING_CX}
                            cy={RING_CX}
                            r={RING_R}
                            stroke={GOLD}
                            strokeWidth={12}
                            fill="none"
                            strokeDasharray={CIRCUMF}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${RING_CX} ${RING_CX})`}
                            style={{
                              transition: "stroke-dashoffset 1s linear",
                              animation: isFinal10
                                ? "kalpx-practice-glow 1s ease-in-out infinite alternate"
                                : "none",
                            }}
                          />
                        </svg>
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 38,
                              fontWeight: 300,
                              color: isFinal10 ? GOLD : BROWN,
                              transition: "color 0.5s",
                              fontFamily: "var(--kalpx-font-serif)",
                            }}
                          >
                            {fmt(timeLeft)}
                          </span>
                          <span
                            style={{
                              fontSize: 14,
                              color: MUTED,
                              letterSpacing: 0.5,
                              textAlign: "center",
                            }}
                          >
                            Return to the moment
                          </span>
                          <button
                            onClick={handleReset}
                            title="Reset timer"
                            style={{
                              marginTop: 6,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 20,
                              color: MUTED,
                              padding: 4,
                            }}
                            aria-label="Reset timer"
                          >
                            ↺
                          </button>
                          <img
                            src="/mantra-lotus-3d.svg"
                            alt=""
                            aria-hidden="true"
                            width={110}
                            height={80}
                            style={{ marginBottom: -60 }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleComplete}
                        data-testid="end-practice-btn"
                        style={{
                          width: "100%",
                          maxWidth: 280,
                          padding: "16px 0",
                          borderRadius: 32,
                          border: "0.3px solid #432104",
                          background: "#FBF5F5",
                          color: "#432104",
                          fontSize: 18,
                          fontFamily: "var(--kalpx-font-sans, sans-serif)",
                          letterSpacing: 0.3,
                          cursor: "pointer",
                          marginTop: 16,
                        }}
                        className="shadow-2xl"
                      >
                        End Practice
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 34,
            }}
          >
            {hasContent(benefits) && (
              <DesktopInfoSection
                label={t('practiceRunner.benefits')}
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

            {hasContent(insight) && (
              <DesktopInfoSection
                label={t('practiceRunner.essence')}
                expanded={essenceExpanded}
                onToggle={() => setEssenceExpanded((v) => !v)}
              >
                {insight}
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
              {t('practiceRunner.returnToMitraHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      data-testid="practice-timer-block"
    >
      {/* ── 1. Title card ── */}
      {title && (
        <div
          style={{
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 22,
              fontWeight: 700,
              color: BROWN,
              margin: "0 0 6px",
              lineHeight: 1.3,
            }}
          >
            {title}
          </p>
          {summary && (
            <p
              style={{
                fontFamily: "var(--kalpx-font-serif)",
                fontSize: 18,

                color: BROWN,
                margin: "0 0 4px",
              }}
            >
              {summary}
            </p>
          )}
          {duration && (
            <p
              style={{
                fontSize: 13,
                color: "#d4a017",
                margin: 0,
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              {duration}
            </p>
          )}
        </div>
      )}

      {/* ── 2. Steps card ── */}
      {steps.length > 0 && (
        <div
          style={{
            width: "100%",
            borderRadius: 14,
            border: `1px solid ${CARD_BORDER}`,
            background: CARD_BG,
            padding: "16px 20px",
            marginBottom: 16,
            boxSizing: "border-box",
          }}
        >
          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
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
                fontSize: 14,
                letterSpacing: 1.2,
                fontWeight: 700,
                color: GOLD,
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              {t('practiceRunner.whatThisAsks')}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {steps.map((step, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
              >
                <span
                  style={{
                    fontSize: 18,
                    color: GOLD,
                    fontFamily: "var(--kalpx-font-serif)",
                    fontWeight: 700,
                    flexShrink: 0,
                    minWidth: 20,
                  }}
                >
                  {i + 1}.
                </span>
                <span
                  style={{
                    fontSize: 18,
                    color: "#5a3c21",
                    fontFamily: "var(--kalpx-font-serif)",
                    lineHeight: 1.55,
                  }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!infoViewOnly && (
        <div
          style={{
            width: "100%",
            borderRadius: 14,
            border: `1px solid ${CARD_BORDER}`,
            background: CARD_BG,
            padding: "20px 20px 24px",
            marginBottom: 16,
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          {!running && !done ? (
            /* PRE-START */
            <>
              <p
                style={{
                  fontFamily: "var(--kalpx-font-serif)",
                  fontSize: 18,
                  color: BROWN,
                  fontWeight: 700,
                  margin: "0 0 8px",
                }}
              >
                {t('practiceRunner.howLongPause')}
              </p>
              <p
                style={{
                  fontSize: 42,
                  fontWeight: 300,
                  color: BROWN,
                  fontFamily: "var(--kalpx-font-serif)",
                  margin: "0 0 16px",
                }}
              >
                {selectedMinutes}{" "}
                <span style={{ fontSize: 20, color: MUTED }}>min</span>
              </p>

              {/* ─ [−] slider [+] row ─ */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <button
                  onClick={() => updateMinutes(selectedMinutes - 1)}
                  disabled={selectedMinutes <= MIN_MINUTES}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: `1px solid ${CARD_BORDER}`,
                    background: "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    fontSize: 20,
                    color: "#8A5A12",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    opacity: selectedMinutes <= MIN_MINUTES ? 0.4 : 1,
                  }}
                  aria-label="Decrease minutes"
                >
                  −
                </button>
                <input
                  type="range"
                  min={MIN_MINUTES}
                  max={MAX_MINUTES}
                  step={1}
                  value={selectedMinutes}
                  onChange={(e) => updateMinutes(Number(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: GOLD,
                    height: 4,
                    cursor: "pointer",
                  }}
                />
                <button
                  onClick={() => updateMinutes(selectedMinutes + 1)}
                  disabled={selectedMinutes >= MAX_MINUTES}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: `1px solid ${CARD_BORDER}`,
                    background: "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    fontSize: 20,
                    color: "#8A5A12",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    opacity: selectedMinutes >= MAX_MINUTES ? 0.4 : 1,
                  }}
                  aria-label="Increase minutes"
                >
                  +
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: MUTED,
                  marginBottom: 20,
                }}
              >
                <span>{t('practiceRunner.minMin')}</span>
                <span>{t('practiceRunner.dragToAdjust')}</span>
                <span>{t('practiceRunner.maxMin')}</span>
              </div>

              {/* Begin CTA */}
              <button
                onClick={handleBegin}
                data-testid="practice-begin-btn"
                style={{
                  width: "100%",
                  maxWidth: 200,
                  padding: "14px 0",
                  borderRadius: 32,
                  border: " 0.3px solid #432104",
                  background: "#FBF5F5",
                  color: "  #432104",
                  fontSize: 16,
                  fontFamily: "var(--kalpx-font-sans, sans-serif)",
                  letterSpacing: 0.3,
                  cursor: "pointer",
                }}
                className="shadow-2xl"
              >
                {t('practiceRunner.begin')}
              </button>
            </>
          ) : (
            /* RUNNING / DONE */
            <>
              {/* Gold arc ring — 260px matches mobile */}
              <div
                style={{
                  position: "relative",
                  width: RING_SIZE,
                  height: RING_SIZE,
                  margin: "0 auto 16px",
                }}
              >
                <svg
                  width={RING_SIZE}
                  height={RING_SIZE}
                  style={{ position: "absolute", inset: 0 }}
                >
                  {/* Track */}
                  <circle
                    cx={RING_CX}
                    cy={RING_CX}
                    r={RING_R}
                    stroke="rgba(212,160,23,0.2)"
                    strokeWidth={12}
                    fill="none"
                  />
                  {/* Progress arc */}
                  <circle
                    cx={RING_CX}
                    cy={RING_CX}
                    r={RING_R}
                    stroke={GOLD}
                    strokeWidth={12}
                    fill="none"
                    strokeDasharray={CIRCUMF}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${RING_CX} ${RING_CX})`}
                    style={{
                      transition: "stroke-dashoffset 1s linear",
                      animation: isFinal10
                        ? "kalpx-practice-glow 1s ease-in-out infinite alternate"
                        : "none",
                    }}
                  />
                </svg>
                {/* Center content */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 38,
                      fontWeight: 300,
                      color: isFinal10 ? GOLD : BROWN,
                      transition: "color 0.5s",
                      fontFamily: "var(--kalpx-font-serif)",
                    }}
                  >
                    {fmt(timeLeft)}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: MUTED,
                      letterSpacing: 0.5,
                      textAlign: "center",
                    }}
                  >
                    Return to the moment
                  </span>
                  {/* Reset ↺ icon */}
                  <button
                    onClick={handleReset}
                    title="Reset timer"
                    style={{
                      marginTop: 6,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 20,
                      color: MUTED,
                      padding: 4,
                    }}
                    aria-label="Reset timer"
                  >
                    ↺
                  </button>
                  {/* Glowing lotus */}
                  <img
                    src="/mantra-lotus-3d.svg"
                    alt=""
                    aria-hidden="true"
                    width={110}
                    height={80}
                    style={{ marginBottom: -60 }}
                  />
                </div>
              </div>

              {/* End Practice CTA */}
              <button
                onClick={handleComplete}
                data-testid="end-practice-btn"
                style={{
                  width: "100%",
                  maxWidth: 200,
                  padding: "14px 0",
                  borderRadius: 32,
                  border: " 0.3px solid #432104",
                  background: "#FBF5F5",
                  color: "  #432104",
                  fontSize: 16,
                  fontFamily: "var(--kalpx-font-sans, sans-serif)",
                  letterSpacing: 0.3,
                  cursor: "pointer",
                  marginTop: 16,
                }}
                className="shadow-2xl"
              >
                End Practice
              </button>
            </>
          )}
        </div>
      )}

      {/* ── 4. Benefits collapsible ── */}
      {hasContent(benefits) && (
        <div style={{ width: "100%", marginBottom: 12 }}>
          <CollapsibleCard
            label={t('practiceRunner.benefits')}
            expanded={benefitsExpanded}
            onToggle={() => setBenefitsExpanded((v) => !v)}
          >
            {Array.isArray(benefits) ? (
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  textAlign: "left",
                  listStyleType: "disc",
                }}
              >
                {benefits.map((b: string, i: number) => (
                  <li
                    key={i}
                    style={{
                      marginBottom: 6,
                      fontFamily: "var(--kalpx-font-serif)",
                      fontSize: 18,
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

      {/* ── 5. Essence collapsible ── */}
      {hasContent(insight) && (
        <div style={{ width: "100%", marginBottom: 32 }}>
          <CollapsibleCard
            label={t('practiceRunner.essence')}
            expanded={essenceExpanded}
            onToggle={() => setEssenceExpanded((v) => !v)}
          >
            {insight}
          </CollapsibleCard>
        </div>
      )}

      {/* ── Back link — consistent with mantra/sankalp runners ── */}
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
