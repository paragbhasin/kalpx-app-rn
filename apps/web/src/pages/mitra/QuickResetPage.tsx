import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { QuickResetMantra, QuickResetOpeningState, QuickChantCompleteResponse } from "@kalpx/types";
import { getQuickResetActionLabel, normalizeBrowseMantras, pickDifferentMantra } from "@kalpx/contracts";
import {
  getQuickResetOpening,
  postQuickChantComplete,
  postQuickResetSetDefault,
  postBrowseMantras,
} from "../../engine/mitraApi";

type Phase = "loading" | "opening" | "preview" | "running" | "done" | "error";

// ── Shared styles ──────────────────────────────────────────────────────────────

const S = {
  page: { minHeight: "100dvh", background: "#FFF8EF", display: "flex", flexDirection: "column" } as const,
  main: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px 40px" } as const,
  container: { width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 } as const,
  backBtn: { background: "none", border: "none", color: "#C99317", fontSize: 15, cursor: "pointer", alignSelf: "flex-start", padding: 0, marginBottom: 4 } as const,
  pageTitle: { fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 26, color: "#432104", margin: 0 } as const,
  mantraTitle: { fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 22, color: "#432104", textAlign: "center", margin: 0 } as const,
  mantraDevanagari: { fontSize: 34, color: "#C99317", textAlign: "center", lineHeight: 1.3, margin: 0 } as const,
  mantraMeaning: { fontSize: 15, color: "#7B6550", textAlign: "center", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as const,
  primaryBtn: { width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: "linear-gradient(90deg,#C99317 0%,#E0AE21 50%,#C99317 100%)", color: "#fff", fontFamily: "var(--kalpx-font-serif)", fontSize: 17, fontWeight: 700, cursor: "pointer" } as const,
  secondaryBtn: { background: "none", border: "none", color: "#C99317", fontSize: 15, cursor: "pointer", textDecoration: "underline", padding: "8px 0" } as const,
  subtleText: { fontSize: 14, color: "#7B6550", textAlign: "center", margin: 0 } as const,
  copyHeadline: { fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 24, color: "#432104", textAlign: "center", margin: 0, lineHeight: 1.5 } as const,
  copySubtext: { fontSize: 15, color: "#7B6550", textAlign: "center", margin: 0, marginTop: 8 } as const,
  endEarlyBtn: { background: "none", border: "none", color: "#9b8b77", fontSize: 14, cursor: "pointer", textDecoration: "underline" } as const,
  beadCircle: { width: 80, height: 80, borderRadius: "50%", background: "#C99317", border: "none", cursor: "pointer", color: "#fff", fontSize: 22, fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" } as const,
  beadCount: { fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 36, color: "#432104" } as const,
  overlay: { position: "fixed", inset: 0, background: "#FFF8EF", zIndex: 100, display: "flex", flexDirection: "column" } as const,
  pickerList: { flex: 1, overflowY: "auto", padding: "0 16px" } as const,
  pickerItem: { padding: "16px 0", borderBottom: "0.5px solid #DAC28E", cursor: "pointer" } as const,
  pickerItemTitle: { fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 17, color: "#432104", margin: 0 } as const,
  pickerItemDevanagari: { fontSize: 15, color: "#8B6914", margin: 0, marginTop: 2 } as const,
};

export function QuickResetPage() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("loading");
  const [openingState, setOpeningState] = useState<QuickResetOpeningState | null>(null);
  const [selectedMantra, setSelectedMantra] = useState<QuickResetMantra | null>(null);
  const [completionData, setCompletionData] = useState<QuickChantCompleteResponse | null>(null);
  const [beadCount, setBeadCount] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMantras, setPickerMantras] = useState<QuickResetMantra[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [defaultSetConfirmed, setDefaultSetConfirmed] = useState(false);

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
  const handleSetDefault = useCallback(async (mantra: QuickResetMantra) => {
    await postQuickResetSetDefault(mantra.item_id);
    setDefaultSetConfirmed(true);
    await loadOpening();
  }, [loadOpening]);

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
  }, []);

  // ── Runner start ───────────────────────────────────────────────────────────
  const handleBeginChanting = useCallback(() => {
    runnerStartedAt.current = Date.now();
    setBeadCount(0);
    setPhase("running");
  }, []);

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
  const handleSecondaryAction = useCallback((action: string) => {
    if (action === "mitra_suggest_for_this_moment") {
      handleShowAnother();
    } else if (action === "set_as_default" && activeMantra) {
      handleSetDefault(activeMantra);
    } else if (action === "change_mantra" || action === "choose_from_library") {
      openPicker();
    }
  }, [handleShowAnother, handleSetDefault, openPicker, activeMantra]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const renderMantraBlock = (mantra: QuickResetMantra) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}>
      <p style={S.mantraTitle}>{mantra.title}</p>
      <p style={S.mantraDevanagari}>{mantra.devanagari}</p>
      {mantra.meaning && <p style={S.mantraMeaning}>{mantra.meaning}</p>}
    </div>
  );

  const renderCopyWithBreaks = (text: string) =>
    text.split("\n").map((line, i) => (
      <span key={i} style={{ display: "block" }}>{line}</span>
    ));

  const renderBackBtn = (label = "← Back") => (
    <button style={S.backBtn} onClick={() => navigate(-1)}>{label}</button>
  );

  // ── Phase: loading ─────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div style={S.page}>
        <main style={S.main}>
          <div style={S.container}>
            <p style={{ color: "#C99317", fontSize: 15 }}>Loading…</p>
          </div>
        </main>
      </div>
    );
  }

  // ── Phase: error ───────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div style={S.page}>
        <main style={S.main}>
          <div style={S.container}>
            {renderBackBtn()}
            <p style={S.copyHeadline}>Unable to open Quick Reset</p>
            <p style={S.subtleText}>Please try again.</p>
            <button style={S.primaryBtn} onClick={loadOpening}>Retry</button>
          </div>
        </main>
      </div>
    );
  }

  // ── Phase: opening ─────────────────────────────────────────────────────────
  if (phase === "opening" && openingState) {
    const displayMantra = activeMantra!;
    return (
      <div style={S.page}>
        <main style={S.main}>
          <div style={S.container}>
            {renderBackBtn()}
            <p style={S.pageTitle}>Quick Reset</p>
            {renderMantraBlock(displayMantra)}
            <button style={S.primaryBtn} onClick={handleBeginChanting}>
              {openingState.primary_cta}
            </button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              {openingState.secondary_actions.map((action) => (
                <button key={action} style={S.secondaryBtn} onClick={() => handleSecondaryAction(action)}>
                  {getQuickResetActionLabel(action)}
                </button>
              ))}
            </div>
            {defaultSetConfirmed && <p style={S.subtleText}>Set as your Quick Reset mantra.</p>}
          </div>
        </main>
        {pickerOpen && renderPickerOverlay()}
      </div>
    );
  }

  // ── Phase: preview ─────────────────────────────────────────────────────────
  if (phase === "preview" && selectedMantra) {
    return (
      <div style={S.page}>
        <main style={S.main}>
          <div style={S.container}>
            {renderBackBtn()}
            <p style={S.pageTitle}>Quick Reset</p>
            {renderMantraBlock(selectedMantra)}
            <button style={S.primaryBtn} onClick={handleBeginChanting}>Begin chanting</button>
            <button style={S.secondaryBtn} onClick={() => handleSetDefault(selectedMantra)}>
              Set as my Quick Reset mantra
            </button>
            <button style={S.secondaryBtn} onClick={openPicker}>Choose another</button>
            {defaultSetConfirmed && <p style={S.subtleText}>Set as your Quick Reset mantra.</p>}
          </div>
        </main>
        {pickerOpen && renderPickerOverlay()}
      </div>
    );
  }

  // ── Phase: running ─────────────────────────────────────────────────────────
  if (phase === "running" && activeMantra) {
    return (
      <div style={S.page}>
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} loop={false} preload="auto" style={{ display: "none" }} />
        )}
        <main style={S.main}>
          <div style={S.container}>
            <p style={S.mantraTitle}>{activeMantra.title}</p>
            <p style={S.mantraDevanagari}>{activeMantra.devanagari}</p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <button
                style={S.beadCircle as React.CSSProperties}
                onClick={() => setBeadCount((c) => c + 1)}
              >
                {beadCount || "TAP"}
              </button>
              {beadCount > 0 && <p style={S.beadCount}>{beadCount}</p>}
            </div>
            <button style={S.primaryBtn} onClick={handleDoneChanting}>Done chanting</button>
            <button style={S.endEarlyBtn} onClick={handleEndEarly}>End early</button>
          </div>
        </main>
      </div>
    );
  }

  // ── Phase: done ────────────────────────────────────────────────────────────
  if (phase === "done" && completionData?.copy) {
    const fromBrowse = selectedMantra !== null;
    const isExplicit = openingState?.screen_state === "explicit";
    return (
      <div style={S.page}>
        <main style={S.main}>
          <div style={S.container}>
            <p style={S.copyHeadline}>{renderCopyWithBreaks(completionData.copy.headline)}</p>
            {completionData.copy.subtext && (
              <p style={S.copySubtext}>{completionData.copy.subtext}</p>
            )}
            {fromBrowse && !isExplicit && selectedMantra && (
              <button style={S.secondaryBtn} onClick={() => handleSetDefault(selectedMantra)}>
                Set as my Quick Reset mantra
              </button>
            )}
            {defaultSetConfirmed && <p style={S.subtleText}>Set as your Quick Reset mantra.</p>}
            <button style={S.primaryBtn} onClick={() => navigate(-1)}>Close</button>
          </div>
        </main>
      </div>
    );
  }

  // Fallback during phase transition
  return (
    <div style={S.page}>
      <main style={S.main}>
        <div style={S.container}>
          <p style={{ color: "#C99317", fontSize: 15 }}>Loading…</p>
        </div>
      </main>
    </div>
  );

  // ── Picker overlay ─────────────────────────────────────────────────────────
  function renderPickerOverlay() {
    return (
      <div style={S.overlay as React.CSSProperties}>
        <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", borderBottom: "0.5px solid #DAC28E", paddingBottom: 12 }}>
          <button style={S.backBtn} onClick={() => setPickerOpen(false)}>← Back</button>
          <p style={{ ...S.pageTitle, margin: "0 auto", fontSize: 20 }}>Choose a Mantra</p>
          <div style={{ width: 56 }} />
        </div>
        <div style={S.pickerList as React.CSSProperties}>
          {pickerLoading ? (
            <p style={{ color: "#C99317", fontSize: 15, textAlign: "center", marginTop: 32 }}>Loading…</p>
          ) : (
            pickerMantras.map((mantra) => (
              <div
                key={mantra.item_id}
                style={S.pickerItem}
                onClick={() => handlePickerSelect(mantra)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handlePickerSelect(mantra)}
              >
                <p style={S.pickerItemTitle}>{mantra.title}</p>
                {mantra.devanagari && <p style={S.pickerItemDevanagari}>{mantra.devanagari}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
}
