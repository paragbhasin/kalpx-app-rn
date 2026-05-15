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
import { useNavigate } from "react-router-dom";
import { AudioPlayerBlock } from "../../components/blocks/AudioPlayerBlock";
import {
  CollapsibleCard,
  MantraTextCard,
} from "../../components/blocks/RepCounterBlock";
import { MitraMobileShell } from "../../components/layout/MitraMobileShell";
import { HighlightedToast } from "../../components/ui/HighlightedToast";
import {
  getQuickResetOpening,
  postBrowseMantras,
  postQuickChantComplete,
  postQuickResetSetDefault,
} from "../../engine/mitraApi";

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
};

export function QuickResetPage() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("loading");
  const [openingState, setOpeningState] =
    useState<QuickResetOpeningState | null>(null);
  const [selectedMantra, setSelectedMantra] = useState<QuickResetMantra | null>(
    null,
  );
  const [completionData, setCompletionData] =
    useState<QuickChantCompleteResponse | null>(null);
  const [beadCount, setBeadCount] = useState(0);
  const [iastExpanded, setIastExpanded] = useState(false);
  const [devExpanded, setDevExpanded] = useState(false);
  const [meaningExpanded, setMeaningExpanded] = useState(false);
  const [essenceExpanded, setEssenceExpanded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMantras, setPickerMantras] = useState<QuickResetMantra[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
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
      setHighlightedToastTitle("Quick Reset Mantra Set ✦");
      setHighlightedToastMessage(
        "Your mantra has been set for future Quick Reset moments.",
      );
      setMantraUpdatedToastVisible(true);
      await loadOpening();
    },
    [loadOpening],
  );

  // ── Mantra picker ──────────────────────────────────────────────────────────
  const openPicker = useCallback(async () => {
    setPickerOpen(true);
    setPickerLoading(true);
    const raw = await postBrowseMantras("peacecalm");
    setPickerMantras(normalizeBrowseMantras(raw));
    setPickerLoading(false);
  }, []);

  const handlePickerSelect = useCallback((mantra: QuickResetMantra) => {
    setSelectedMantra(mantra);
    setPickerOpen(false);
    setPhase("preview");
    setHighlightedToastTitle("Mantra Updated ✦");
    setHighlightedToastMessage("Your rhythm has been gently realigned.");
    setMantraUpdatedToastVisible(true);
  }, []);

  // ── Runner start ───────────────────────────────────────────────────────────
  const handleBeginChanting = useCallback(() => {
    runnerStartedAt.current = Date.now();
    setBeadCount(0);
    setPhase("running");
  }, []);

  const handleTapBead = useCallback(() => {
    if (phase !== "running") {
      runnerStartedAt.current = Date.now();
      setBeadCount(1);
      setPhase("running");
      return;
    }
    setBeadCount((count) => count + 1);
  }, [phase]);

  // ── Done chanting ──────────────────────────────────────────────────────────
  const handleDoneChanting = useCallback(async () => {
    if (!activeMantra) return;
    const duration_ms = Date.now() - runnerStartedAt.current;
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
  }, [activeMantra, navigate]);

  // ── End early — always silent ──────────────────────────────────────────────
  const handleEndEarly = useCallback(async () => {
    if (!activeMantra) {
      navigate(-1);
      return;
    }
    const duration_ms = Date.now() - runnerStartedAt.current;
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
        openPicker();
      }
    },
    [handleShowAnother, handleSetDefault, openPicker, activeMantra],
  );

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

    return (
      <div style={S.openingShell}>
        {/* {renderBackBtn()} */}
        <div style={{ height: 18 }} />
        <p style={S.openingHeading}>{mantra.title}</p>
        <p style={S.openingSubhead}>Quick Reset Mantra</p>

        <div style={S.progressWrap}>
          <span style={S.progressMain}>{beadCount}</span>
        </div>

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
              Done chanting
            </button>
          ) : (
            <button style={S.primaryBtn} onClick={handleBeginChanting}>
              {primaryLabel}
            </button>
          )}
          {isRunning && (
            <button style={S.endEarlyBtn} onClick={handleEndEarly}>
              End early
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
    <MitraMobileShell backgroundImage="/beige_bg.png">
      <div style={S.page}>
        <style>{QUICK_RESET_RING_CSS}</style>
        {content}
        <HighlightedToast
          visible={mantraUpdatedToastVisible}
          title={highlightedToastTitle}
          message={highlightedToastMessage}
          onClose={() => setMantraUpdatedToastVisible(false)}
        />
      </div>
    </MitraMobileShell>
  );

  // ── Phase: loading ─────────────────────────────────────────────────────────
  if (phase === "loading") {
    return renderShell(
      <>
        <main style={S.main}>
          <div style={S.container}>
            <p style={{ color: "#C99317", fontSize: 15 }}>Loading…</p>
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
            <p style={S.copyHeadline}>Unable to open Quick Reset</p>
            <p style={S.subtleText}>Please try again.</p>
            <button style={S.primaryBtn} onClick={loadOpening}>
              Retry
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
        {pickerOpen && renderPickerOverlay()}
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
            "Begin chanting",
            ["set_as_default", "change_mantra"],
            false,
          )}
        </main>
        {pickerOpen && renderPickerOverlay()}
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
            openingState?.primary_cta || "Begin chanting",
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
                Set as my Quick Reset mantra
              </button>
            )}
            {defaultSetConfirmed && (
              <p style={S.subtleText}>Set as your Quick Reset mantra.</p>
            )}
            <button style={S.primaryBtn} onClick={() => navigate(-1)}>
              Close
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
          <p style={{ color: "#C99317", fontSize: 15 }}>Loading…</p>
        </div>
      </main>
    </>,
  );

  // ── Picker overlay ─────────────────────────────────────────────────────────
  function renderPickerOverlay() {
    return (
      <div style={S.overlay as React.CSSProperties}>
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            margin: "0 auto",
            padding: "18px 16px 0",
            position: "relative",
          }}
        >
          <img
            src="/leaves-bird.png"
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-57px",
              right: "9px",
              width: "165px",

              pointerEvents: "none",
              userSelect: "none",
            }}
          />
          {/* <button
            style={{
              ...S.backBtn,
              marginBottom: 24,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
            onClick={() => setPickerOpen(false)}
          >
            <ArrowLeft size={22} strokeWidth={2} />
            Back
          </button> */}
          <div style={{ textAlign: "center" }}>
            <p style={{ ...S.pageTitle, margin: "0 0 12px", fontSize: 22 }}>
              Choose a Mantra
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                color: "#C7A048",
              }}
            >
              <div
                style={{
                  width: 78,
                  height: 1,
                  background: "rgba(199,160,72,0.45)",
                }}
              />
              <span style={{ fontSize: 18, lineHeight: 1 }}>✦</span>
              <div
                style={{
                  width: 78,
                  height: 1,
                  background: "rgba(199,160,72,0.45)",
                }}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            ...(S.pickerList as React.CSSProperties),
            width: "100%",
            maxWidth: 420,
            margin: "0 auto",
            padding: "0 16px 24px",
            boxSizing: "border-box",
          }}
        >
          {pickerLoading ? (
            <p
              style={{
                color: "#C99317",
                fontSize: 15,
                textAlign: "center",
                marginTop: 32,
              }}
            >
              Loading…
            </p>
          ) : (
            pickerMantras.map((mantra) => (
              <div
                key={mantra.item_id}
                style={{
                  ...S.pickerItem,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                }}
                onClick={() => handlePickerSelect(mantra)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && handlePickerSelect(mantra)
                }
              >
                <div style={{ flex: 1 }}>
                  <p style={S.pickerItemTitle}>{mantra.title}</p>
                  {mantra.devanagari && (
                    <p style={S.pickerItemDevanagari}>{mantra.devanagari}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
}
