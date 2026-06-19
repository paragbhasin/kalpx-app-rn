import {
  getQuickResetActionLabel,
  normalizeBrowseMantras,
  pickDifferentMantra,
} from "@kalpx/contracts";
import type {
  QuickChantCompleteResponse,
  QuickResetMantra,
  QuickResetOpeningState,
} from "@kalpx/types";
import { RotateCw, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../lib/i18n";
import { AudioPlayerBlock } from "../../components/blocks/AudioPlayerBlock";
import {
  CollapsibleCard,
  MantraTextCard,
} from "../../components/blocks/RepCounterBlock";
import { LibrarySearchModal } from "../../components/blocks/dashboard/LibrarySearchModal";
import { MitraMobileShell } from "../../components/layout/MitraMobileShell";
import { HighlightedToast } from "../../components/ui/HighlightedToast";
import {
  getMitraHomeV3,
  getQuickResetOpening,
  postBrowseMantras,
  postQuickChantComplete,
  postQuickResetSetDefault,
} from "../../engine/mitraApi";
import { useJapaEngine } from "../../engine/useJapaEngine";
import { setHomeData } from "../../store/doorSlice";

type Phase = "loading" | "opening" | "preview" | "running" | "done" | "error";

const QUICK_RESET_RING_CSS = `
@keyframes kalpx-quickreset-ring-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

function getVisualBeadCount(): number {
  return 18;
}

// ── Shared styles ──────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
  } as const,
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "0px 16px 40px",
  } as const,
  container: {
    width: "100%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  } as const,
  backBtn: {
    background: "none",
    border: "none",
    color: "#C99317",
    fontSize: 15,
    cursor: "pointer",
    alignSelf: "flex-start",
    padding: 0,
    marginBottom: 4,
  } as const,
  pageTitle: {
    fontFamily: "var(--kalpx-font-serif)",
    fontWeight: 700,
    fontSize: 26,
    color: "#432104",
    margin: 0,
  } as const,
  mantraTitle: {
    fontFamily: "var(--kalpx-font-serif)",
    fontWeight: 700,
    fontSize: 22,
    color: "#432104",
    textAlign: "center",
    margin: 0,
  } as const,
  mantraDevanagari: {
    fontSize: 34,
    color: "#C99317",
    textAlign: "center",
    lineHeight: 1.3,
    margin: 0,
  } as const,
  mantraMeaning: {
    fontSize: 15,
    color: "#7B6550",
    textAlign: "center",
    margin: 0,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  } as const,
  primaryBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: 9,
    border: "none",
    background: "linear-gradient(90deg,#C99317 0%,#E0AE21 50%,#C99317 100%)",
    color: "#fff",
    fontFamily: "var(--kalpx-font-serif)",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
  } as const,
  secondaryBtn: {
    background: "none",
    border: "none",
    color: "#432104",
    fontSize: 15,
    cursor: "pointer",
    padding: 0,
  } as const,
  subtleText: {
    fontSize: 14,
    color: "#7B6550",
    textAlign: "center",
    margin: 0,
  } as const,
  copyHeadline: {
    fontFamily: "var(--kalpx-font-serif)",
    fontWeight: 700,
    fontSize: 24,
    color: "#432104",
    textAlign: "center",
    margin: 0,
    lineHeight: 1.5,
  } as const,
  copySubtext: {
    fontSize: 15,
    color: "#7B6550",
    textAlign: "center",
    margin: 0,
    marginTop: 8,
  } as const,
  endEarlyBtn: {
    background: "none",
    border: "none",
    color: "#9b8b77",
    fontSize: 14,
    cursor: "pointer",
    textDecoration: "underline",
  } as const,
  beadCircle: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "#C99317",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    fontSize: 22,
    fontFamily: "var(--kalpx-font-serif)",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as const,
  beadCount: {
    fontFamily: "var(--kalpx-font-serif)",
    fontWeight: 700,
    fontSize: 36,
    color: "#432104",
  } as const,
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "#FFF8EF",
    backgroundImage: "url(/beige_bg.png)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
  } as const,
  pickerList: { flex: 1, overflowY: "auto", padding: "0 16px" } as const,
  pickerItem: {
    padding: "15px",
    borderRadius: 22,
    border: "1px solid rgba(218,194,142,0.55)",
    background: "rgba(255,255,255,0.72)",
    boxShadow: "0 14px 34px rgba(201,168,76,0.08)",
    cursor: "pointer",
    marginBottom: 14,
  } as const,
  pickerItemTitle: {
    fontFamily: "var(--kalpx-font-serif)",
    fontWeight: 700,
    fontSize: 16,
    color: "#432104",
    margin: 0,
    lineHeight: 1.55,
    textAlign: "center",
  } as const,
  pickerItemDevanagari: {
    fontSize: 15,
    color: "#8B6914",
    margin: 0,
    marginTop: 12,
    lineHeight: 1.55,
    textAlign: "center",
  } as const,
  openingShell: {
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "6px 6px 28px",
  } as const,
  openingHeading: {
    fontFamily: "var(--kalpx-font-serif)",
    fontWeight: 700,
    fontSize: 24,
    color: "#432104",
    textAlign: "center",
    margin: "0 0 10px",
    lineHeight: 1.3,
  } as const,
  openingSubhead: {
    fontSize: 12,
    letterSpacing: 2.2,
    fontWeight: 700,
    color: "#C7A048",
    textTransform: "uppercase",
    textAlign: "center",
    margin: "0 0 18px",
  } as const,
  progressWrap: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    margin: "0 0 10px",
  } as const,
  progressMain: {
    fontSize: 60,
    fontFamily: "var(--kalpx-font-serif)",
    fontWeight: 300,
    color: "#C7A048",
    lineHeight: 1,
  } as const,
  progressSub: {
    fontSize: 28,
    fontFamily: "var(--kalpx-font-serif)",
    color: "#D8C6A2",
    lineHeight: 1,
  } as const,
  mantraCards: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 18,
    marginBottom: 18,
  } as const,
  mantraCard: {
    width: "100%",
    borderRadius: 18,
    border: "1px solid rgba(184,148,80,0.18)",
    background: "rgba(255,255,255,0.55)",
    padding: "18px 18px 16px",
    boxSizing: "border-box",
  } as const,
  iastText: {
    fontSize: 17,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#432104",
    textAlign: "center",
    fontWeight: 700,
    lineHeight: 1.45,
    margin: 0,
  } as const,
  openingActions: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  } as const,
  confirmOverlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  } as const,
  confirmBox: {
    background: "#fff",
    borderRadius: 20,
    padding: "28px 24px 20px",
    width: "min(90vw, 340px)",
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
  } as const,
  confirmTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#1a1a1a",
  } as const,
  confirmBody: {
    margin: 0,
    fontSize: 14,
    color: "#555",
    lineHeight: 1.5,
  } as const,
  confirmBtns: {
    display: "flex",
    gap: 10,
    marginTop: 12,
  } as const,
  confirmStay: {
    flex: 1,
    padding: "12px 0",
    borderRadius: 50,
    border: "none",
    background: "#f0ece6",
    color: "#1a1a1a",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  } as const,
  confirmEnd: {
    flex: 1,
    padding: "12px 0",
    borderRadius: 50,
    border: "none",
    background: "transparent",
    color: "#C0392B",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  } as const,
};

function useIsDesktopQuickReset() {
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

export function QuickResetPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDesktop = useIsDesktopQuickReset();
  const { t } = useTranslation();

  const [phase, setPhase] = useState<Phase>("loading");
  const [openingState, setOpeningState] =
    useState<QuickResetOpeningState | null>(null);
  const [selectedMantra, setSelectedMantra] = useState<QuickResetMantra | null>(
    null,
  );
  const [completionData, setCompletionData] =
    useState<QuickChantCompleteResponse | null>(null);
  const [iastExpanded, setIastExpanded] = useState(false);
  const [devExpanded, setDevExpanded] = useState(false);
  const [meaningExpanded, setMeaningExpanded] = useState(false);
  const [essenceExpanded, setEssenceExpanded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [endChantConfirmOpen, setEndChantConfirmOpen] = useState(false);
  const [defaultSetConfirmed, setDefaultSetConfirmed] = useState(false);
  const [highlightedToastTitle, setHighlightedToastTitle] =
    useState("Mantra Updated ✦");
  const [highlightedToastMessage, setHighlightedToastMessage] = useState(
    "Your rhythm has been gently realigned.",
  );
  const [mantraUpdatedToastVisible, setMantraUpdatedToastVisible] =
    useState(false);

  const runnerStartedAt = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = (selectedMantra ?? openingState?.mantra)?.audio_url ?? null;

  const activeMantra = selectedMantra ?? openingState?.mantra ?? null;

  const japaEngine = useJapaEngine({
    mantraRef: activeMantra?.item_id ?? null,
    sourceSurface: "quick_chant",
    goalType: "unlimited",
  });
  const beadCount = japaEngine.sessionCount;

  // Refresh stats when mantra becomes known (API responds after mount)
  useEffect(() => {
    if (activeMantra?.item_id) japaEngine.refreshStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMantra?.item_id]);

  // ── Audio: play on entering running phase ──────────────────────────────────
  useEffect(() => {
    if (phase === "running" && audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    if (phase !== "running" && audioRef.current) {
      audioRef.current.pause();
    }
  }, [phase, audioUrl]);

  useEffect(() => {
    if (!mantraUpdatedToastVisible) return;
    const timeout = window.setTimeout(() => {
      setMantraUpdatedToastVisible(false);
    }, 2600);
    return () => window.clearTimeout(timeout);
  }, [mantraUpdatedToastVisible]);

  // ── Initial load ───────────────────────────────────────────────────────────
  const loadOpening = useCallback(async () => {
    setPhase("loading");
    const state = await getQuickResetOpening();
    if (state) {
      setOpeningState(state);
      setSelectedMantra(null);
      setPhase("opening");
    } else {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    loadOpening();
  }, [loadOpening]);

  // ── Secondary action: "Show another calming mantra" ────────────────────────
  const handleShowAnother = useCallback(async () => {
    if (!activeMantra) return;
    const raw = await postBrowseMantras("peacecalm");
    const candidates = normalizeBrowseMantras(raw);
    const different = pickDifferentMantra(candidates, activeMantra.item_id);
    if (different) {
      setSelectedMantra(different);
    }
  }, [activeMantra]);

  // ── Secondary action: "Set as my Quick Reset mantra" ──────────────────────
  const handleSetDefault = useCallback(
    async (mantra: QuickResetMantra) => {
      await postQuickResetSetDefault(mantra.item_id);
      setDefaultSetConfirmed(true);
      setHighlightedToastTitle("Mantra Updated ✦");
      setHighlightedToastMessage("Your rhythm has been gently realigned.");
      setMantraUpdatedToastVisible(true);
      await loadOpening();
    },
    [loadOpening],
  );

  // ── Mantra picker ──────────────────────────────────────────────────────────
  const openPicker = useCallback(() => {
    setPickerOpen(true);
  }, []);

  const handleLibraryItemSelected = useCallback((item: any) => {
    const mantra: QuickResetMantra = {
      item_id:    item.itemId || item.item_id || item.id,
      title:      item.title,
      devanagari: item.devanagari ?? "",
      iast:       item.iast ?? "",
      meaning:    item.meaning ?? "",
      essence:    item.essence ?? null,
      audio_url:  item.audio_url ?? null,
    };
    setSelectedMantra(mantra);
    setPickerOpen(false);
    setPhase("preview");
    setHighlightedToastTitle("Mantra Updated ✦");
    setHighlightedToastMessage("Your rhythm has been gently realigned.");
    setMantraUpdatedToastVisible(true);
    postQuickResetSetDefault(mantra.item_id);
  }, []);

  // ── Runner start ───────────────────────────────────────────────────────────
  const handleBeginChanting = useCallback(() => {
    runnerStartedAt.current = Date.now();
    setPhase("running");
  }, []);

  const handleTapBead = useCallback(() => {
    if (phase !== "running") {
      runnerStartedAt.current = Date.now();
      setPhase("running");
    }
    japaEngine.increment();
  }, [phase, japaEngine]);

  // ── Done chanting ──────────────────────────────────────────────────────────
  const handleDoneChanting = useCallback(async () => {
    if (!activeMantra) return;
    const duration_ms = Date.now() - runnerStartedAt.current;
    await japaEngine.completeSession();
    const result = await postQuickChantComplete({
      mantra_ref: activeMantra.item_id,
      duration_ms,
      completed: true,
    });
    if (result && result.copy) {
      setCompletionData(result);
      setPhase("done");
    } else {
      navigate(-1);
    }
  }, [activeMantra, japaEngine, navigate]);

  // ── End early — always silent ──────────────────────────────────────────────
  const handleEndEarly = useCallback(async () => {
    if (!activeMantra) {
      navigate(-1);
      return;
    }
    const duration_ms = Date.now() - runnerStartedAt.current;
    japaEngine.syncNow();
    postQuickChantComplete({
      mantra_ref: activeMantra.item_id,
      duration_ms,
      completed: false,
    });
    navigate(-1);
  }, [activeMantra, navigate]);

  // ── Secondary action dispatcher ────────────────────────────────────────────
  const handleSecondaryAction = useCallback(
    (action: string) => {
      if (action === "mitra_suggest_for_this_moment") {
        handleShowAnother();
      } else if (action === "set_as_default" && activeMantra) {
        handleSetDefault(activeMantra);
      } else if (
        action === "change_mantra" ||
        action === "choose_from_library"
      ) {
        if (beadCount > 0) {
          setEndChantConfirmOpen(true);
        } else {
          openPicker();
        }
      }
    },
    [handleShowAnother, handleSetDefault, openPicker, activeMantra, beadCount],
  );

  // ── Return from done: refresh home so completed_today is current ──────────
  const handleReturn = useCallback(async () => {
    try {
      const fresh = await getMitraHomeV3({ forceFresh: true });
      if (fresh) dispatch(setHomeData(fresh));
    } catch {
      /* non-blocking */
    }
    navigate(-1);
  }, [dispatch, navigate]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const renderOpeningMantraSurface = (
    mantra: QuickResetMantra,
    primaryLabel: string,
    secondaryActions: string[],
    isRunning = false,
  ) => {
    const visualBeadCount = getVisualBeadCount();
    const beads = Array.from({ length: visualBeadCount }, (_, i) => {
      const angle = (i / visualBeadCount) * 2 * Math.PI - Math.PI / 2;
      const cx = 115 + Math.cos(angle) * 86;
      const cy = 115 + Math.sin(angle) * 86;
      const lit = i < beadCount % visualBeadCount;
      return { cx, cy, i, lit };
    });

    if (isDesktop) {
      return (
        <div
          style={{
            width: "100%",
            maxWidth: 1360,
            margin: "0 auto",
            padding: "25px 15px",
            boxSizing: "border-box",
          }}
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
                <div style={{ height: 8 }} />
                <p
                  style={{
                    fontFamily: "var(--kalpx-font-serif)",
                    fontWeight: 700,
                    fontSize: 30,
                    color: "#432104",
                    textAlign: "center",
                    margin: "0 0 10px",
                    lineHeight: 1.35,
                    maxWidth: 560,
                  }}
                >
                  {mantra.title}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    letterSpacing: 2.8,
                    fontWeight: 600,
                    color: "#C7A048",
                    textTransform: "uppercase",
                    textAlign: "center",
                    margin: "0 0 22px",
                  }}
                >
                  {t('mitra.quickReset.subtitle')}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    margin: "0 0 6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 56,
                      fontFamily: "var(--kalpx-font-serif)",
                      fontWeight: 300,
                      color: "#C7A048",
                      lineHeight: 1,
                    }}
                  >
                    {beadCount}
                  </span>
                </div>

                {(japaEngine.todayCount > 0 || japaEngine.weekCount > 0 || japaEngine.yearCount > 0 || japaEngine.lifetimeCount > 0) && (
                  <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
                    {japaEngine.todayCount > 0 && <span style={{ fontSize: 12, color: "#8A7A5A" }}>Today {japaEngine.todayCount.toLocaleString()}</span>}
                    {japaEngine.weekCount > 0 && <span style={{ fontSize: 12, color: "#8A7A5A" }}>Week {japaEngine.weekCount.toLocaleString()}</span>}
                    {japaEngine.yearCount > 0 && <span style={{ fontSize: 12, color: "#8A7A5A" }}>Year {japaEngine.yearCount.toLocaleString()}</span>}
                    {japaEngine.lifetimeCount > 0 && <span style={{ fontSize: 12, color: "#8A7A5A" }}>Lifetime {japaEngine.lifetimeCount.toLocaleString()}</span>}
                  </div>
                )}

                <div
                  style={{
                    position: "relative",
                    width: 230,
                    height: 230,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      animation:
                        "kalpx-quickreset-ring-spin 40s linear infinite",
                    }}
                  >
                    {beads.map(({ cx, cy, i, lit }) => (
                      <img
                        key={i}
                        src="/rudraksh.svg"
                        alt=""
                        draggable={false}
                        style={{
                          position: "absolute",
                          width: 28,
                          height: 28,
                          left: cx - 14,
                          top: cy - 14,
                          opacity: lit ? 0.18 : 1,
                          transition: "opacity 0.25s ease",
                          userSelect: "none",
                          pointerEvents: "none",
                        }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleTapBead}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: 108,
                      height: 108,
                      transform: "translate(-50%,-50%)",
                      borderRadius: "50%",
                      background: "#fffdf9",
                      border: "1.5px solid #e8c587",
                      boxShadow: "0 2px 10px rgba(184,148,80,0.16)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 20,
                        letterSpacing: 4,
                        fontWeight: 700,
                        color: "#b89450",
                        lineHeight: 1,
                      }}
                    >
                      TAP
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: 1.2,
                        color: "#8a7a5a",
                        lineHeight: 1,
                      }}
                    >
                      HERE
                    </span>
                  </button>
                </div>

                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    marginTop: 12,
                  }}
                >
                  {mantra.iast && (
                    <MantraTextCard
                      text={mantra.iast}
                      expanded={iastExpanded}
                      onToggle={() => setIastExpanded((v) => !v)}
                    />
                  )}
                  {mantra.devanagari && (
                    <MantraTextCard
                      text={mantra.devanagari}
                      isDevanagari
                      expanded={devExpanded}
                      onToggle={() => setDevExpanded((v) => !v)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              {mantra.audio_url && (
                <div style={{ width: "100%" }}>
                  <AudioPlayerBlock
                    block={{
                      audio_url: mantra.audio_url,
                      audio_key: "quick_reset_audio_url",
                      loop: true,
                      autoplay: false,
                      label: "Mantra Audio",
                    }}
                    screenData={{ quick_reset_audio_url: mantra.audio_url }}
                  />
                </div>
              )}

              {mantra.meaning && (
                <div style={{ width: "100%" }}>
                  <CollapsibleCard
                    label="Meaning"
                    expanded={meaningExpanded}
                    onToggle={() => setMeaningExpanded((v) => !v)}
                  >
                    {mantra.meaning}
                  </CollapsibleCard>
                </div>
              )}

              {mantra.essence && (
                <div style={{ width: "100%" }}>
                  <CollapsibleCard
                    label="Essence"
                    expanded={essenceExpanded}
                    onToggle={() => setEssenceExpanded((v) => !v)}
                  >
                    {mantra.essence}
                  </CollapsibleCard>
                </div>
              )}

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {isRunning ? (
                  <button style={S.primaryBtn} onClick={handleDoneChanting}>
                    {t('mitra.quickReset.doneChanting')}
                  </button>
                ) : (
                  <button style={S.primaryBtn} onClick={handleBeginChanting}>
                    {primaryLabel}
                  </button>
                )}
                {isRunning && (
                  <button style={S.endEarlyBtn} onClick={handleEndEarly}>
                    {t('mitra.quickReset.endEarly')}
                  </button>
                )}
                {secondaryActions.map((action) => (
                  <button
                    key={action}
                    style={{
                      ...S.secondaryBtn,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: 18,
                    }}
                    onClick={() => handleSecondaryAction(action)}
                  >
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        border: "1px dashed rgba(212,160,23,0.38)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#C99317",
                        background: "rgba(255,255,255,0.42)",
                        flexShrink: 0,
                      }}
                    >
                      {action === "change_mantra" ? (
                        <RotateCw size={20} strokeWidth={1.8} />
                      ) : (
                        <SlidersHorizontal size={20} strokeWidth={1.8} />
                      )}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--kalpx-font-serif)",
                          fontSize: 16,
                          color: "#432104",
                          lineHeight: 1.2,
                          textAlign: "left",
                        }}
                      >
                        {action === "mitra_suggest_for_this_moment"
                          ? "Suggest a mantra"
                          : action === "change_mantra"
                          ? "Choose Mantra"
                          : getQuickResetActionLabel(action)}
                      </span>
                      <span
                        style={{
                          width: "100%",
                          marginTop: 6,
                          borderBottom: "2px dotted rgba(232,197,135,0.95)",
                        }}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    const topActions = secondaryActions.filter(a => a !== "set_as_default");

    return (
      <div style={S.openingShell}>
        {/* {renderBackBtn()} */}
        {topActions.length > 0 && (
          <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 360, marginBottom: 16 }}>
            {topActions.map((action) => (
              <button
                key={action}
                onClick={() => handleSecondaryAction(action)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "10px 10px",
                  borderRadius: 14,
                  border: "1px solid rgba(201,168,76,0.3)",
                  background: "rgba(255,255,255,0.75)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "var(--kalpx-font-sans)",
                  color: "#432104",
                  fontWeight: 500,
                }}
              >
                {action === "change_mantra" ? (
                  <RotateCw size={14} strokeWidth={2} color="#B08A3E" />
                ) : (
                  <SlidersHorizontal size={14} strokeWidth={2} color="#B08A3E" />
                )}
                {action === "mitra_suggest_for_this_moment"
                  ? "Suggest a mantra"
                  : action === "change_mantra"
                  ? "Choose Mantra"
                  : getQuickResetActionLabel(action)}
              </button>
            ))}
          </div>
        )}
        <div style={{ height: 4 }} />
        <p style={S.openingHeading}>{mantra.title}</p>
        <p style={S.openingSubhead}>{t('mitra.quickReset.subtitle')}</p>

        <div style={S.progressWrap}>
          <span style={S.progressMain}>{beadCount}</span>
        </div>

        {(japaEngine.todayCount > 0 || japaEngine.weekCount > 0 || japaEngine.yearCount > 0 || japaEngine.lifetimeCount > 0) && (
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: -4, marginBottom: 6 }}>
            {japaEngine.todayCount > 0 && (
              <span style={{ fontSize: 12, color: "#8A7A5A" }}>Today {japaEngine.todayCount.toLocaleString()}</span>
            )}
            {japaEngine.weekCount > 0 && (
              <span style={{ fontSize: 12, color: "#8A7A5A" }}>Week {japaEngine.weekCount.toLocaleString()}</span>
            )}
            {japaEngine.yearCount > 0 && (
              <span style={{ fontSize: 12, color: "#8A7A5A" }}>Year {japaEngine.yearCount.toLocaleString()}</span>
            )}
            {japaEngine.lifetimeCount > 0 && (
              <span style={{ fontSize: 12, color: "#8A7A5A" }}>Lifetime {japaEngine.lifetimeCount.toLocaleString()}</span>
            )}
          </div>
        )}

        <div
          style={{
            position: "relative",
            width: 230,
            height: 230,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              animation: "kalpx-quickreset-ring-spin 40s linear infinite",
            }}
          >
            {beads.map(({ cx, cy, i, lit }) => (
              <img
                key={i}
                src="/rudraksh.svg"
                alt=""
                draggable={false}
                style={{
                  position: "absolute",
                  width: 28,
                  height: 28,
                  left: cx - 14,
                  top: cy - 14,
                  opacity: lit ? 0.18 : 1,
                  transition: "opacity 0.25s ease",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            ))}
          </div>
          <button
            onClick={handleTapBead}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 108,
              height: 108,
              transform: "translate(-50%,-50%)",
              borderRadius: "50%",
              background: "#fffdf9",
              border: "1.5px solid #e8c587",
              boxShadow: "0 2px 10px rgba(184,148,80,0.16)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <span
              style={{
                fontSize: 20,
                letterSpacing: 4,
                fontWeight: 700,
                color: "#b89450",
                lineHeight: 1,
              }}
            >
              TAP
            </span>
            <span
              style={{
                fontSize: 10,
                letterSpacing: 1.2,
                color: "#8a7a5a",
                lineHeight: 1,
              }}
            >
              HERE
            </span>
          </button>
        </div>

        <div style={S.mantraCards}>
          {mantra.iast && (
            <div>
              <MantraTextCard
                text={mantra.iast}
                expanded={iastExpanded}
                onToggle={() => setIastExpanded((v) => !v)}
              />
            </div>
          )}
          {mantra.devanagari && (
            <div>
              <MantraTextCard
                text={mantra.devanagari}
                isDevanagari
                expanded={devExpanded}
                onToggle={() => setDevExpanded((v) => !v)}
              />
            </div>
          )}
        </div>
        {mantra.audio_url && (
          <div style={{ width: "100%", marginBottom: 20 }}>
            <AudioPlayerBlock
              block={{
                audio_url: mantra.audio_url,
                audio_key: "quick_reset_audio_url",
                loop: true,
                autoplay: false,
                label: "Mantra Audio",
              }}
              screenData={{ quick_reset_audio_url: mantra.audio_url }}
            />
          </div>
        )}

        {mantra.meaning && (
          <div style={{ width: "100%", marginBottom: 20 }}>
            <CollapsibleCard
              label="Meaning"
              expanded={meaningExpanded}
              onToggle={() => setMeaningExpanded((v) => !v)}
            >
              {mantra.meaning}
            </CollapsibleCard>
          </div>
        )}

        {mantra.essence && (
          <div style={{ width: "100%", marginBottom: 20 }}>
            <CollapsibleCard
              label="Essence"
              expanded={essenceExpanded}
              onToggle={() => setEssenceExpanded((v) => !v)}
            >
              {mantra.essence}
            </CollapsibleCard>
          </div>
        )}

        <div style={S.openingActions}>
          {isRunning ? (
            <button style={S.primaryBtn} onClick={handleDoneChanting}>
              {t('mitra.quickReset.doneChanting')}
            </button>
          ) : (
            <button style={S.primaryBtn} onClick={handleBeginChanting}>
              {primaryLabel}
            </button>
          )}
          {isRunning && (
            <button style={S.endEarlyBtn} onClick={handleEndEarly}>
              {t('mitra.quickReset.endEarly')}
            </button>
          )}
          {secondaryActions.filter(a => a === "set_as_default").map((action) => (
            <button
              key={action}
              style={{
                ...S.secondaryBtn,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 18,
                maxWidth: 360,
              }}
              onClick={() => handleSecondaryAction(action)}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "1px dashed rgba(212,160,23,0.38)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#C99317",
                  background: "rgba(255,255,255,0.42)",
                  flexShrink: 0,
                }}
              >
                {action === "change_mantra" ? (
                  <RotateCw size={20} strokeWidth={1.8} />
                ) : (
                  <SlidersHorizontal size={20} strokeWidth={1.8} />
                )}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--kalpx-font-serif)",
                    fontSize: 16,
                    color: "#432104",
                    lineHeight: 1.2,
                    textAlign: "left",
                  }}
                >
                  {getQuickResetActionLabel(action)}
                </span>
                <span
                  style={{
                    width: "100%",
                    marginTop: 6,
                    borderBottom: "2px dotted rgba(232,197,135,0.95)",
                  }}
                />
              </span>
            </button>
          ))}
          {/* {defaultSetConfirmed && (
            <p style={S.subtleText}>Set as your Quick Reset mantra.</p>
          )} */}
        </div>
      </div>
    );
  };

  const renderCopyWithBreaks = (text: string) =>
    text.split("\n").map((line, i) => (
      <span key={i} style={{ display: "block" }}>
        {line}
      </span>
    ));

  // const renderBackBtn = (label = "← Back") => (
  //   <button style={S.backBtn} onClick={() => navigate(-1)}>
  //     {label}
  //   </button>
  // );

  const renderShell = (content: React.ReactNode) => (
    <MitraMobileShell
      backgroundImage="/beige_bg.png"
      wideDesktop={isDesktop}
      plainDesktopBackground={isDesktop}
    >
      <div style={S.page}>
        <style>{QUICK_RESET_RING_CSS}</style>
        {content}
        <HighlightedToast
          visible={mantraUpdatedToastVisible}
          title={highlightedToastTitle}
          message={highlightedToastMessage}
          onClose={() => setMantraUpdatedToastVisible(false)}
        />
        {endChantConfirmOpen && (
          <div style={S.confirmOverlay}>
            <div style={S.confirmBox}>
              <p style={S.confirmTitle}>End this chant?</p>
              <p style={S.confirmBody}>Changing mantra will close your current chant session.</p>
              <div style={S.confirmBtns}>
                <button style={S.confirmStay} onClick={() => setEndChantConfirmOpen(false)}>
                  Stay here
                </button>
                <button style={S.confirmEnd} onClick={() => { setEndChantConfirmOpen(false); void japaEngine.syncNow(); openPicker(); }}>
                  End &amp; change
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MitraMobileShell>
  );

  // ── Phase: loading ─────────────────────────────────────────────────────────
  if (phase === "loading") {
    return renderShell(
      <>
        <main style={S.main}>
          <div style={S.container}>
            <p style={{ color: "#C99317", fontSize: 15 }}>{t('mitra.quickReset.loading')}</p>
          </div>
        </main>
      </>,
    );
  }

  // ── Phase: error ───────────────────────────────────────────────────────────
  if (phase === "error") {
    return renderShell(
      <>
        <main style={S.main}>
          <div style={S.container}>
            {/* {renderBackBtn()} */}
            <p style={S.copyHeadline}>{t('mitra.quickReset.unableToOpen')}</p>
            <p style={S.subtleText}>{t('mitra.quickReset.pleaseRetry')}</p>
            <button style={S.primaryBtn} onClick={loadOpening}>
              {t('mitra.quickReset.retry')}
            </button>
          </div>
        </main>
      </>,
    );
  }

  // ── Phase: opening ─────────────────────────────────────────────────────────
  if (phase === "opening" && openingState) {
    const displayMantra = activeMantra!;
    return renderShell(
      <>
        <main
          style={{ ...S.main, justifyContent: "flex-start", paddingTop: 24 }}
        >
          {renderOpeningMantraSurface(
            displayMantra,
            openingState.primary_cta,
            openingState.secondary_actions,
            false,
          )}
        </main>
        <LibrarySearchModal
          isVisible={pickerOpen}
          onClose={() => setPickerOpen(false)}
          mode="select"
          lockedItemType="mantra"
          headerTitle={t('mitra.quickReset.chooseMantra')}
          selectLabel={t('mitra.quickReset.useThisMantra')}
          onItemSelected={handleLibraryItemSelected}
        />
      </>,
    );
  }

  // ── Phase: preview ─────────────────────────────────────────────────────────
  if (phase === "preview" && selectedMantra) {
    return renderShell(
      <>
        <main
          style={{ ...S.main, justifyContent: "flex-start", paddingTop: 24 }}
        >
          {renderOpeningMantraSurface(
            selectedMantra,
            t('mitra.quickReset.beginChanting'),
            ["set_as_default", "change_mantra"],
            false,
          )}
        </main>
        <LibrarySearchModal
          isVisible={pickerOpen}
          onClose={() => setPickerOpen(false)}
          mode="select"
          lockedItemType="mantra"
          headerTitle={t('mitra.quickReset.chooseMantra')}
          selectLabel={t('mitra.quickReset.useThisMantra')}
          onItemSelected={handleLibraryItemSelected}
        />
      </>,
    );
  }

  // ── Phase: running ─────────────────────────────────────────────────────────
  if (phase === "running" && activeMantra) {
    return renderShell(
      <>
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            loop={false}
            preload="auto"
            style={{ display: "none" }}
          />
        )}
        <main
          style={{ ...S.main, justifyContent: "flex-start", paddingTop: 24 }}
        >
          {renderOpeningMantraSurface(
            activeMantra,
            openingState?.primary_cta || t('mitra.quickReset.beginChanting'),
            [],
            true,
          )}
        </main>
      </>,
    );
  }

  // ── Phase: done ────────────────────────────────────────────────────────────
  if (phase === "done" && completionData?.copy) {
    const fromBrowse = selectedMantra !== null;
    const isExplicit = openingState?.screen_state === "explicit";
    return renderShell(
      <>
        <main
          style={{
            ...S.main,
            justifyContent: "center",
            minHeight: "calc(100vh - 140px)",
          }}
        >
          <div style={S.container}>
            <p style={S.copyHeadline}>
              {renderCopyWithBreaks(completionData.copy.headline)}
            </p>
            {completionData.copy.subtext && (
              <p style={S.copySubtext}>{completionData.copy.subtext}</p>
            )}
            {fromBrowse && !isExplicit && selectedMantra && (
              <button
                style={S.secondaryBtn}
                onClick={() => handleSetDefault(selectedMantra)}
              >
                {t('mitra.quickReset.setAsMantra')}
              </button>
            )}
            {defaultSetConfirmed && (
              <p style={S.subtleText}>Set as your Quick Reset mantra.</p>
            )}
            <button style={S.primaryBtn} onClick={handleReturn}>
              {t('mitra.quickReset.close')}
            </button>
          </div>
        </main>
      </>,
    );
  }

  // Fallback during phase transition
  return renderShell(
    <>
      <main style={S.main}>
        <div style={S.container}>
          <p style={{ color: "#C99317", fontSize: 15 }}>{t('mitra.quickReset.loading')}</p>
        </div>
      </main>
    </>,
  );

}
