import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
import { RepCounterBlock } from "../../components/blocks/RepCounterBlock";
import { CompletionReturnBlock } from "../../components/blocks/CompletionReturnBlock";
import { SankalpHoldBlock } from "../../components/blocks/SankalpHoldBlock";
import { PracticeTimerBlock } from "../../components/blocks/PracticeTimerBlock";
import { MitraMobileShell } from "../../components/layout/MitraMobileShell";
import { executeAction } from "../../engine/actionExecutor";
import { ScreenRenderer } from "../../engine/ScreenRenderer";
import { createCalmAudio } from "../../lib/audio/calmMusic";
import type { AudioHandle } from "../../lib/audio/howlerAudio";
import { webNavigate } from "../../lib/webRouter";
import type { AppDispatch } from "../../store";
import { loadScreenWithData, useScreenState } from "../../store/screenSlice";

export function MitraEnginePage() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const screenState = useScreenState();
  const [resolving, setResolving] = useState(false);
  const calmAudioRef = useRef<AudioHandle | null>(null);

  const containerId: string =
    (location.state as any)?.containerId ||
    searchParams.get("containerId") ||
    screenState.currentContainerId;
  const stateId: string =
    (location.state as any)?.stateId ||
    searchParams.get("stateId") ||
    screenState.currentStateId;

  const isRunnerContainer = containerId === "practice_runner";

  // Calm music: play on runner mount, stop on unmount
  useEffect(() => {
    if (!isRunnerContainer) return;
    const handle = createCalmAudio();
    calmAudioRef.current = handle;
    const t = setTimeout(() => {
      try {
        handle.play();
      } catch {}
    }, 300);
    return () => {
      clearTimeout(t);
      handle.stop();
      handle.unload();
      calmAudioRef.current = null;
    };
  }, [isRunnerContainer]);

  useEffect(() => {
    if (!containerId || !stateId) return;
    if (
      screenState.currentContainerId === containerId &&
      screenState.currentStateId === stateId &&
      screenState.currentScreen
    ) {
      return;
    }
    setResolving(true);
    dispatch(loadScreenWithData({ containerId, stateId })).finally(() =>
      setResolving(false),
    );
  }, [containerId, stateId, dispatch]);

  const actionContext = {
    dispatch,
    screenData: screenState.screenData,
    currentStateId: screenState.currentStateId,
  };

  if (!containerId || !stateId) {
    return (
      <MitraMobileShell>
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            padding: 32,
            textAlign: "center",
          }}
        >
          <p
            style={{ color: "var(--kalpx-text-muted)", marginBottom: 16 }}
            data-testid="engine-not-found"
          >
            This screen is not available.
          </p>
          <button
            onClick={() => webNavigate("/en/mitra/dashboard")}
            data-testid="engine-return-btn"
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              background: "var(--kalpx-cta)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Return to dashboard
          </button>
        </div>
      </MitraMobileShell>
    );
  }

  const isMantraRunnerState =
    isRunnerContainer &&
    (stateId === "mantra_runner" || stateId === "free_mantra_chanting");

  if (isMantraRunnerState) {
    return (
      <MitraMobileShell backgroundImage="/beige_bg.png">
        {resolving ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div
              style={{
                width: 28,
                height: 28,
                border: "2px solid var(--kalpx-cta)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          // RepCounterBlock rendered directly — bypasses ScreenRenderer so only
          // the mantra runner UI shows; no schema footer/button blocks rendered.
          <RepCounterBlock
            block={{
              // reps_total from screenData wins; master_mantra.reps_total is the
              // authoritative backend value seeded by start_runner action.
              total:
                (screenState.screenData["reps_total"] as number) ??
                (screenState.screenData["master_mantra"] as any)?.reps_total ??
                27,
            }}
            screenData={screenState.screenData}
            onAction={(action) => executeAction(action, actionContext)}
          />
        )}
      </MitraMobileShell>
    );
  }

  // ── Completion return: render CompletionReturnBlock DIRECTLY on beige bg
  if (isRunnerContainer && stateId === "completion_return") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "url(/beige_bg.png) center/cover fixed, #F8F2E8",
          overflowY: "auto",
        }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <CompletionReturnBlock
            block={{}}
            screenData={screenState.screenData}
            onAction={(action) => executeAction(action, actionContext)}
          />
        </div>
      </div>
    );
  }

  // ── Sankalp runner: render SankalpHoldBlock DIRECTLY on beige bg
  // Matches CycleTransitionsContainer sankalp_embody flow (mobile).
  const isSankalpState =
    isRunnerContainer && stateId === "sankalp_embody";

  if (isSankalpState) {
    return (
      <MitraMobileShell backgroundImage="/beige_bg.png">
        {resolving ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div
              style={{
                width: 28,
                height: 28,
                border: "2px solid var(--kalpx-cta)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <SankalpHoldBlock
            block={{}} 
            screenData={screenState.screenData}
            onAction={(action) => executeAction(action, actionContext)}
          />
        )}
      </MitraMobileShell>
    );
  }

  // ── Practice runner: render PracticeTimerBlock DIRECTLY on guided_bg
  // Matches CycleTransitionsContainer practice flow (mobile).
  const isPracticeState =
    isRunnerContainer && stateId === "practice_step_runner";

  if (isPracticeState) {
    return (
      <MitraMobileShell backgroundImage="/guided_bg.png">
        {resolving ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div
              style={{
                width: 28,
                height: 28,
                border: "2px solid var(--kalpx-cta)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <PracticeTimerBlock
            block={{}}
            screenData={screenState.screenData}
            onAction={(action) => executeAction(action, actionContext)}
          />
        )}
      </MitraMobileShell>
    );
  }

  // ── Practice / Sankalp runner: warm per-variant backgrounds, no shell ─
  if (isRunnerContainer) {
    const runnerVariant = screenState.screenData?.runner_variant as
      | string
      | null;
    // Mantra gets beige (matches mobile); sankalp/practice keep their own
    const runnerBg =
      runnerVariant === "sankalp"
        ? "url(/Sankalpbg.png) center/cover fixed, #FBF5F5"
        : runnerVariant === "practice"
          ? "url(/guided_bg.png) center/cover fixed, #F5F0E5"
          : "url(/beige_bg.png) center/cover fixed, #F8F2E8"; // mantra: beige (matches RN)
    const exitBtnColor = "var(--kalpx-text-muted)";
    const exitBtnBg = "rgba(255,248,239,0.7)";
    const exitBtnBorder = "1px solid var(--kalpx-border-gold)";
    return (
      <div
        style={{
          position: "relative",
          minHeight: "100dvh",
          background: runnerBg,
        }}
      >
        {!resolving && stateId !== "completion_return" && (
          <div style={{ position: "absolute", top: 12, right: 16, zIndex: 10 }}>
            <button
              onClick={() =>
                void executeAction({ type: "runner_exit" }, actionContext)
              }
              data-testid="runner-exit-btn"
              aria-label="Exit runner"
              style={{
                background: exitBtnBg,
                border: exitBtnBorder,
                borderRadius: 20,
                cursor: "pointer",
                fontSize: 12,
                color: exitBtnColor,
                padding: "5px 14px",
                backdropFilter: "blur(4px)",
              }}
            >
              ✕ Exit
            </button>
          </div>
        )}
        {resolving ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div
              style={{
                width: 28,
                height: 28,
                border: "2px solid #C9A84C",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div
            style={{
              maxWidth: 480,
              margin: "0 auto",
              paddingTop: 56,
              paddingBottom: 48,
            }}
          >
            <ScreenRenderer
              schema={screenState.currentScreen}
              screenData={screenState.screenData}
              onAction={(action) => executeAction(action, actionContext)}
            />
          </div>
        )}
      </div>
    );
  }

  // ── Regular engine screen: wrapped in MitraMobileShell ──────────────
  return (
    <MitraMobileShell>
      <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 48 }}>
        {resolving && (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div
              style={{
                width: 28,
                height: 28,
                border: "2px solid var(--kalpx-cta)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            <p style={{ fontSize: 13, color: "var(--kalpx-text-muted)" }}>
              Loading…
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        {!resolving && (
          <ScreenRenderer
            schema={screenState.currentScreen}
            screenData={screenState.screenData}
            onAction={(action) => executeAction(action, actionContext)}
          />
        )}
      </div>
    </MitraMobileShell>
  );
}
