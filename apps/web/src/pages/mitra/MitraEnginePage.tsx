import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
import Quick1Icon from "../../../../mobile/assets/quick_1.svg";
import Quick2Icon from "../../../../mobile/assets/quick_2.svg";
import Quick3Icon from "../../../../mobile/assets/quick_3.svg";
import Quick4Icon from "../../../../mobile/assets/quick_4.svg";
import { CompletionReturnBlock } from "../../components/blocks/CompletionReturnBlock";
import { PracticeTimerBlock } from "../../components/blocks/PracticeTimerBlock";
import {
  CollapsibleCard,
  MantraTextCard,
  RepCounterBlock,
} from "../../components/blocks/RepCounterBlock";
import { SankalpHoldBlock } from "../../components/blocks/SankalpHoldBlock";
import { TriggerPracticeRunnerBlock } from "../../components/blocks/TriggerPracticeRunnerBlock";
import { MitraMobileShell } from "../../components/layout/MitraMobileShell";
import { executeAction } from "../../engine/actionExecutor";
import { addAdditionalItem } from "../../engine/mitraApi";
import { ScreenRenderer } from "../../engine/ScreenRenderer";
import { createCalmAudio } from "../../lib/audio/calmMusic";
import type { AudioHandle } from "../../lib/audio/howlerAudio";
import { webNavigate } from "../../lib/webRouter";
import type { AppDispatch } from "../../store";
import {
  loadScreenWithData,
  updateScreenData,
  useScreenState,
} from "../../store/screenSlice";
import { showSnackBar } from "../../store/snackBarSlice";
import { QuickResetPage } from "./QuickResetPage";

function CommunityRunnerActionBar({
  addLoading,
  onAdd,
}: {
  addLoading: boolean;
  onAdd: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "8px 16px 24px",
        marginTop: -100,
      }}
    >
      <button
        onClick={onAdd}
        disabled={addLoading}
        style={{
          flex: 1,

          borderRadius: 12,
          border: "1px solid var(--kalpx-border-gold)",
          background: "rgba(255,248,239,0.92)",
          color: "var(--kalpx-cta)",
          fontSize: 14,
          fontWeight: 700,
          padding: "12px 14px",
          cursor: addLoading ? "not-allowed" : "pointer",
          opacity: addLoading ? 0.65 : 1,
        }}
      >
        {addLoading ? "Adding..." : "Add to My Practice"}
      </button>
    </div>
  );
}

const TRIGGER_BROWN = "#432104";
const TRIGGER_GOLD = "#C7A048";
const TRIGGER_MUTED = "#857567";
const TRIGGER_RING_SIZE = 230;
const TRIGGER_RING_RADIUS = 86;
const TRIGGER_BEAD_SIZE = 28;
const TRIGGER_RING_CSS = `
@keyframes kalpx-trigger-ring-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes kalpx-trigger-center-pulse { 0%,100%{ transform: translate(-50%,-50%) scale(1); } 50%{ transform: translate(-50%,-50%) scale(1.05); } }
`;

function resolveTriggerAudioSource(url?: string): string {
  if (!url) return "/Om.mp4";
  if (url.includes("Hari Om")) return "/Hari Om -Female.mp4";
  if (url.includes("Om Shanti")) return "/Om Shanti.mp4";
  if (url.includes("Om.mp4")) return "/Om.mp4";
  return url;
}

function TriggerMantraSupportScreen({
  screenData,
  onAction,
  mode = "trigger",
}: {
  screenData: Record<string, any>;
  onAction: (action: any) => void;
  mode?: "trigger" | "checkin";
}) {
  const activeItem: any = screenData.runner_active_item || {};
  const reps = Number(screenData.runner_reps_completed || 0);
  const pranaType = (screenData.current_prana_type as string) || "";
  const mantraLabel =
    mode === "checkin"
      ? (screenData.checkin_mantra_text as string) ||
        (screenData.mantra_text as string) ||
        "OM"
      : (screenData.mantra_text as string) || "OM";
  const mantraDevanagari =
    mode === "checkin"
      ? (screenData.checkin_mantra_devanagari as string) ||
        (screenData.mantra_devanagari as string) ||
        "ॐ"
      : (screenData.mantra_devanagari as string) || "ॐ";
  const mantraAudioUrl =
    (activeItem.audio_url as string) ||
    (screenData.mantra_audio_url as string) ||
    (screenData.om_audio_url as string) ||
    "/sankalp_om.mp3";
  const headline =
    mode === "checkin" ? "Pause and breathe." : "Pause before this grows.";
  const subtext =
    mode === "checkin"
      ? pranaType === "drained"
        ? "Your system may need a gentler moment before the next step."
        : "Your energy may need settling before you move forward."
      : "You do not need to solve everything right now. Stay here for a few breaths and let the intensity soften first.";
  const meaning =
    (activeItem.meaning as string) || (activeItem.summary as string) || "";
  const essence =
    (activeItem.essence as string) || (activeItem.insight as string) || "";
  const negativeLabel =
    (screenData._trigger_negative_label as string) || "Try another way";
  const [labelExpanded, setLabelExpanded] = useState(false);
  const [devExpanded, setDevExpanded] = useState(false);
  const [meaningExpanded, setMeaningExpanded] = useState(false);
  const [essenceExpanded, setEssenceExpanded] = useState(true);
  const [mediaMuted, setMediaMuted] = useState(false);
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const omAudioRef = useRef<HTMLAudioElement | null>(null);
  const ringCount = 18;
  const litCount = reps % ringCount;
  const beads = Array.from({ length: ringCount }, (_, i) => {
    const angle = (i / ringCount) * 2 * Math.PI - Math.PI / 2;
    const cx = TRIGGER_RING_SIZE / 2 + Math.cos(angle) * TRIGGER_RING_RADIUS;
    const cy = TRIGGER_RING_SIZE / 2 + Math.sin(angle) * TRIGGER_RING_RADIUS;
    return { cx, cy, dimmed: litCount > 0 && i < litCount };
  });

  useEffect(() => {
    const intro = new Audio("/Audio_Be_still.mp4");
    intro.preload = "auto";
    intro.loop = false;
    intro.volume = mediaMuted ? 0 : 1;
    intro.muted = mediaMuted;
    introAudioRef.current = intro;

    const mantra = new Audio(resolveTriggerAudioSource(mantraAudioUrl));
    mantra.preload = "auto";
    mantra.loop = true;
    mantra.volume = mediaMuted ? 0 : 1;
    mantra.muted = mediaMuted;
    omAudioRef.current = mantra;
    intro.load();
    mantra.load();

    const handleIntroEnd = () => {
      void mantra.play().catch(() => {});
    };
    intro.addEventListener("ended", handleIntroEnd);
    void intro.play().catch(() => {
      void mantra.play().catch(() => {});
    });

    return () => {
      if (introAudioRef.current) {
        introAudioRef.current.removeEventListener("ended", handleIntroEnd);
        introAudioRef.current.pause();
        introAudioRef.current.src = "";
        introAudioRef.current = null;
      }
      if (omAudioRef.current) {
        omAudioRef.current.pause();
        omAudioRef.current.src = "";
        omAudioRef.current = null;
      }
    };
  }, [mantraAudioUrl]);

  useEffect(() => {
    const intro = introAudioRef.current;
    const om = omAudioRef.current;
    if (intro) {
      intro.muted = mediaMuted;
      intro.volume = mediaMuted ? 0 : 1;
    }
    if (om) {
      om.muted = mediaMuted;
      om.volume = mediaMuted ? 0 : 1;
    }
  }, [mediaMuted]);

  return (
    <MitraMobileShell backgroundImage="/beige_bg.png">
      <div
        style={{
          minHeight: "100dvh",
          padding: "28px 18px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: TRIGGER_BROWN,
        }}
      >
        <style>{TRIGGER_RING_CSS}</style>
        <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
          <div
            style={{
              position: "relative",
              textAlign: "center",
              marginBottom: 14,
            }}
          >
            <p
              style={{
                fontFamily: "var(--kalpx-font-serif)",
                fontSize: 24,
                fontWeight: 700,
                color: TRIGGER_GOLD,
                margin: 0,
                lineHeight: 1.35,
              }}
            >
              {headline}
            </p>

            <button
              onClick={() => setMediaMuted((v) => !v)}
              aria-label={mediaMuted ? "Unmute audio" : "Mute audio"}
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid rgba(212,160,23,0.18)",
                background: "rgba(255,255,255,0.68)",
                boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
                color: TRIGGER_GOLD,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {mediaMuted ? (
                <VolumeX size={24} strokeWidth={1.8} />
              ) : (
                <Volume2 size={24} strokeWidth={1.8} />
              )}
            </button>
          </div>
          <p
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 18,

              color: TRIGGER_MUTED,

              maxWidth: 360,
            }}
          >
            {subtext}
          </p>

          <div
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 72,
              fontWeight: 300,
              color: TRIGGER_GOLD,
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {reps}
          </div>

          <div
            style={{
              position: "relative",
              width: TRIGGER_RING_SIZE,
              height: TRIGGER_RING_SIZE,
              margin: "0 auto 22px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  boxShadow: "0 0 32px 10px rgba(232,197,135,0.38)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 154,
                    height: 154,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.85)",
                    boxShadow: "0 0 22px 6px rgba(232,197,135,0.42)",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                animation: "kalpx-trigger-ring-spin 40s linear infinite",
              }}
            >
              {beads.map((bead, i) => (
                <img
                  key={i}
                  src="/rudraksh.svg"
                  alt=""
                  draggable={false}
                  style={{
                    position: "absolute",
                    width: TRIGGER_BEAD_SIZE,
                    height: TRIGGER_BEAD_SIZE,
                    left: bead.cx - TRIGGER_BEAD_SIZE / 2,
                    top: bead.cy - TRIGGER_BEAD_SIZE / 2,
                    opacity: bead.dimmed ? 0.18 : 1,
                    transition: "opacity 0.25s ease",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />
              ))}
            </div>

            <button
              onClick={() =>
                onAction({
                  type: "set_screen_value",
                  key: "runner_reps_completed",
                  value: reps + 1,
                })
              }
              data-testid="trigger-support-tap-target"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 104,
                height: 104,
                borderRadius: "50%",
                background: "#fffdf9",
                border: "1.5px solid #e8c587",
                boxShadow: "0 2px 10px rgba(184,148,80,0.16)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                cursor: "pointer",
                zIndex: 3,
                animation: "kalpx-trigger-center-pulse 3s ease-in-out infinite",
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  letterSpacing: 4,
                  fontWeight: 700,
                  color: TRIGGER_GOLD,
                  lineHeight: 1,
                }}
              >
                TAP
              </span>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 1.2,
                  color: TRIGGER_MUTED,
                  lineHeight: 1,
                  marginTop: 1,
                }}
              >
                HERE
              </span>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: `1px solid ${TRIGGER_GOLD}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: TRIGGER_GOLD,
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                ✓
              </span>
            </button>

            <div
              style={{
                position: "absolute",
                right: -4,
                top: "50%",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: TRIGGER_GOLD,
                transform: "translateY(-50%)",
                boxShadow: "0 0 10px rgba(199,160,72,0.35)",
              }}
            />
          </div>

          <p
            style={{
              fontSize: 12,
              letterSpacing: 2.2,
              fontWeight: 700,
              color: TRIGGER_GOLD,
              textTransform: "uppercase",
              margin: "0 0 18px",
            }}
          >
            Tap the bead after each mantra.
          </p>

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <MantraTextCard
              text={mantraLabel}
              expanded={labelExpanded}
              onToggle={() => setLabelExpanded((v) => !v)}
            />
            <MantraTextCard
              text={mantraDevanagari}
              isDevanagari
              expanded={devExpanded}
              onToggle={() => setDevExpanded((v) => !v)}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              margin: "18px auto 26px",
              maxWidth: 300,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(199,160,72,0.45)",
              }}
            />
            <div
              style={{
                width: 10,
                height: 10,
                background: TRIGGER_GOLD,
                transform: "rotate(45deg)",
              }}
            />
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(199,160,72,0.45)",
              }}
            />
          </div>

          <button
            onClick={() => onAction({ type: "trigger_calmer_now" })}
            style={{
              width: "100%",
              maxWidth: 250,
              padding: "10px",
              borderRadius: 30,
              border: "1px solid rgba(120,120,120,0.25)",
              background: "#FBF5F5",
              color: TRIGGER_BROWN,
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 18,
              boxShadow: "0 7px 16px rgba(0,0,0,0.14)",
              cursor: "pointer",
              marginBottom: 16,
            }}
          >
            I feel calmer now
          </button>

          <button
            onClick={() => onAction({ type: "trigger_still_feeling" })}
            style={{
              width: "100%",
              maxWidth: 250,
              padding: "10px",
              borderRadius: 30,
              border: `1.5px solid ${TRIGGER_GOLD}`,
              background: "rgba(255,255,255,0.25)",
              color: TRIGGER_GOLD,
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 18,
            }}
          >
            {negativeLabel}
          </button>

          {meaning && (
            <div style={{ width: "100%", marginBottom: 12 }}>
              <CollapsibleCard
                label="Meaning"
                expanded={meaningExpanded}
                onToggle={() => setMeaningExpanded((v) => !v)}
              >
                {meaning}
              </CollapsibleCard>
            </div>
          )}

          {essence && (
            <div style={{ width: "100%", marginBottom: 24 }}>
              <CollapsibleCard
                label="Essence"
                expanded={essenceExpanded}
                onToggle={() => setEssenceExpanded((v) => !v)}
              >
                {essence}
              </CollapsibleCard>
            </div>
          )}

          <button
            onClick={() => onAction({ type: "return_to_dashboard" })}
            style={{
              background: "none",
              border: "none",
              color: "#6E6258",
              textDecoration: "underline",
              fontSize: 14,
              cursor: "pointer",
              marginBottom: 40,
            }}
          >
            Return to Mitra Home
          </button>
        </div>
      </div>
    </MitraMobileShell>
  );
}

function QuickCheckinScreen({ onAction }: { onAction: (action: any) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = [
    { id: "energized", title: "Energized", icon: Quick1Icon, color: "#EAB308" },
    { id: "balanced", title: "Balanced", icon: Quick2Icon, color: "#10B981" },
    { id: "agitated", title: "Agitated", icon: Quick4Icon, color: "#8B5CF6" },
    { id: "drained", title: "Drained", icon: Quick3Icon, color: "#64748B" },
  ];

  return (
    <MitraMobileShell backgroundImage="/beige_bg.png">
      <div
        style={{
          maxWidth: 420,
          margin: "0 auto",
          padding: "42px 20px 56px",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2
          style={{
            margin: "20px 0 34px",
            textAlign: "center",
            fontFamily: "var(--kalpx-font-serif)",
            fontSize: 27,
            fontWeight: 600,
            color: TRIGGER_BROWN,
            lineHeight: 1.35,
          }}
        >
          How is your energy right now?
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          {options.map((option) => {
            const active = selected === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                data-testid={`quick-checkin-${option.id}`}
                style={{
                  width: "100%",
                  borderRadius: 15,
                  padding: "20px 18px 18px",
                  border: active
                    ? `2px solid rgba(212,160,23,0.95)`
                    : "1.5px solid rgba(231,203,143,0.95)",
                  background: "rgba(248,244,238,0.82)",
                  color: TRIGGER_BROWN,
                  fontSize: 17,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: active
                    ? "0 16px 28px rgba(212,160,23,0.16)"
                    : "0 6px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  transform: active ? "translateY(-1px)" : "none",
                  transition:
                    "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
                }}
              >
                <img
                  src={option.icon}
                  alt=""
                  aria-hidden="true"
                  style={{
                    width: 54,
                    height: 54,
                    objectFit: "contain",
                    filter: active
                      ? "drop-shadow(0 6px 10px rgba(0,0,0,0.12))"
                      : "none",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--kalpx-font-serif)",
                    fontSize: 20,
                    lineHeight: 1.2,
                  }}
                >
                  {option.title}
                </span>
              </button>
            );
          })}
        </div>

        <p
          style={{
            margin: "40px 0 0",
            textAlign: "center",
            color: TRIGGER_BROWN,

            lineHeight: 1.45,
            fontSize: 14,
            maxWidth: 360,
            alignSelf: "center",
          }}
        >
          Share how you’re feeling right now.KalpX will guide you with a
          practice that fits your current energy
        </p>

        <button
          onClick={() =>
            selected &&
            onAction({
              type: "submit",
              payload: { prana_type: selected },
            })
          }
          disabled={!selected}
          data-testid="quick-checkin-proceed"
          style={{
            width: 230,
            alignSelf: "center",
            marginTop: 34,
            borderRadius: 999,
            border: "1px solid rgba(163,163,163,0.45)",
            padding: "16px 24px",
            background: selected
              ? "rgba(255,249,246,0.96)"
              : "rgba(255,249,246,0.7)",
            color: selected ? TRIGGER_BROWN : "rgba(67,33,4,0.52)",
            fontSize: 18,
            fontWeight: 700,
            cursor: selected ? "pointer" : "not-allowed",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}
        >
          Proceed →
        </button>

        <button
          onClick={() => onAction({ type: "return_to_dashboard" })}
          style={{
            width: "100%",
            marginTop: 28,
            background: "none",
            border: "none",
            color: "#6E6258",
            textDecoration: "underline",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Return to Mitra Home
        </button>
      </div>
    </MitraMobileShell>
  );
}

function QuickCheckinAckScreen({
  screenData,
  onAction,
}: {
  screenData: Record<string, any>;
  onAction: (action: any) => void;
}) {
  return (
    <MitraMobileShell backgroundImage="/beige_bg.png">
      <div
        style={{
          maxWidth: 420,
          minHeight: "80dvh",
          margin: "0 auto",
          padding: "56px 20px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <img src="/mantra-lotus-3d.svg" alt="" />

        <h2
          style={{
            margin: 0,
            fontFamily: "var(--kalpx-font-serif)",
            fontSize: 28,
            fontWeight: 600,
            color: TRIGGER_BROWN,
            lineHeight: 1.35,
          }}
        >
          {(screenData.checkin_ack_headline as string) ||
            "You are exactly where you need to be."}
        </h2>

        <p
          style={{
            margin: "18px 0 0",
            whiteSpace: "pre-line",
            fontSize: 16,
            lineHeight: 1.8,
            color: TRIGGER_MUTED,
          }}
        >
          {(screenData.checkin_ack_body as string) ||
            "There is a quiet steadiness within you.\nStay here. Let it deepen."}
        </p>

        {!!screenData.checkin_ack_accent && (
          <p
            style={{
              margin: "22px 0 0",
              color: TRIGGER_GOLD,

              lineHeight: 1.6,
            }}
          >
            {screenData.checkin_ack_accent as string}
          </p>
        )}

        <button
          onClick={() => onAction({ type: "return_to_dashboard" })}
          data-testid="quick-checkin-ack-return"
          style={{
            width: "100%",
            marginTop: 30,
            borderRadius: 28,

            padding: "15px 18px",
            background: "#FBF5F5",
            color: TRIGGER_BROWN,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            border: "0.5px solid #9f9f9f",
          }}
          className="shadow-2xl"
        >
          Return to your path →
        </button>
      </div>
    </MitraMobileShell>
  );
}

export function MitraEnginePage() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isQuickResetRoute = location.pathname === "/en/mitra/quick-reset";
  const screenState = useScreenState();
  const [resolving, setResolving] = useState(false);
  const [communityAddLoading, setCommunityAddLoading] = useState(false);
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
  const isCycleTransitionsContainer = containerId === "cycle_transitions";
  const isMantraRunnerState =
    isRunnerContainer &&
    (stateId === "mantra_runner" || stateId === "free_mantra_chanting");
  const isTriggerSupportMantra =
    isRunnerContainer &&
    (stateId === "free_mantra_chanting" || stateId === "post_trigger_mantra") &&
    (screenState.screenData?.runner_source === "support_trigger" ||
      screenState.screenData?.runner_active_item?.source === "support" ||
      stateId === "post_trigger_mantra");
  const isCheckinSupportMantra =
    isRunnerContainer &&
    stateId === "checkin_breath_reset" &&
    screenState.screenData?.runner_source === "support_checkin";
  const isDashboardPracticeRunner =
    isRunnerContainer &&
    stateId === "practice_step_runner" &&
    !(
      screenState.screenData?.runner_source === "support_trigger" ||
      screenState.screenData?.runner_source === "support_checkin" ||
      screenState.screenData?.runner_source === "community"
    );
  const isCommunityRunner =
    screenState.screenData?.runner_source === "community";
  const activeRunnerItem: any =
    screenState.screenData?.runner_active_item || {};
  const activeRunnerItemId = String(
    activeRunnerItem.item_id ||
      activeRunnerItem.itemId ||
      activeRunnerItem.id ||
      "",
  );
  const activeRunnerType = String(
    screenState.screenData?.runner_variant ||
      activeRunnerItem.item_type ||
      activeRunnerItem.itemType ||
      "",
  );
  const activeAdditionalItemId =
    screenState.screenData?.runner_additional_item_id ?? null;

  // Calm music should layer only for the dashboard practice runner.
  useEffect(() => {
    if (!isDashboardPracticeRunner) return;
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
  }, [isDashboardPracticeRunner]);

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

  const ensureCommunityAdditionalItem = async () => {
    if (!activeRunnerItemId || !activeRunnerType) return null;
    if (activeAdditionalItemId) {
      return { additionalItem: { id: activeAdditionalItemId }, created: false };
    }

    const res = await addAdditionalItem(
      activeRunnerItemId,
      activeRunnerType,
      "community",
    );
    const nextId = res?.additionalItem?.id ?? res?.additional_item?.id ?? null;
    if (nextId != null) {
      dispatch(
        updateScreenData({
          runner_additional_item_id: nextId,
        }),
      );
    }
    dispatch(
      showSnackBar(
        res?.created
          ? "Added to your Mitra practice."
          : "Already in your Mitra practice.",
      ),
    );
    return res;
  };

  const handleCommunityAdd = async () => {
    if (communityAddLoading) return;
    if (!activeRunnerItemId || !activeRunnerType) {
      dispatch(showSnackBar("Could not add this item right now."));
      return;
    }
    setCommunityAddLoading(true);
    try {
      await ensureCommunityAdditionalItem();
    } catch {
      dispatch(showSnackBar("Could not add this item right now."));
    } finally {
      setCommunityAddLoading(false);
    }
  };

  if (isQuickResetRoute) {
    return <QuickResetPage />;
  }

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

  if (isTriggerSupportMantra) {
    return resolving ? (
      <MitraMobileShell backgroundImage="/mantra3.png">
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
      </MitraMobileShell>
    ) : (
      <TriggerMantraSupportScreen
        screenData={screenState.screenData}
        onAction={(action) => executeAction(action, actionContext)}
        mode="trigger"
      />
    );
  }

  if (isCheckinSupportMantra) {
    return resolving ? (
      <MitraMobileShell backgroundImage="/mantra3.png">
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
      </MitraMobileShell>
    ) : (
      <TriggerMantraSupportScreen
        screenData={screenState.screenData}
        onAction={(action) => executeAction(action, actionContext)}
        mode="checkin"
      />
    );
  }

  if (isCycleTransitionsContainer && stateId === "quick_checkin") {
    return resolving ? (
      <MitraMobileShell backgroundImage="/beige_bg.png">
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
      </MitraMobileShell>
    ) : (
      <QuickCheckinScreen
        onAction={(action) => executeAction(action, actionContext)}
      />
    );
  }

  if (isCycleTransitionsContainer && stateId === "quick_checkin_ack") {
    return resolving ? (
      <MitraMobileShell backgroundImage="/beige_bg.png">
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
      </MitraMobileShell>
    ) : (
      <QuickCheckinAckScreen
        screenData={screenState.screenData}
        onAction={(action) => executeAction(action, actionContext)}
      />
    );
  }

  if (isMantraRunnerState) {
    return (
      <MitraMobileShell
        backgroundImage="/beige_bg.png"
        wideDesktop
        plainDesktopBackground
      >
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
          <>
            <RepCounterBlock
              block={{
                total:
                  (screenState.screenData["reps_total"] as number) ??
                  (screenState.screenData["master_mantra"] as any)
                    ?.reps_total ??
                  27,
              }}
              screenData={screenState.screenData}
              onAction={(action) => executeAction(action, actionContext)}
            />
            {isCommunityRunner && (
              <CommunityRunnerActionBar
                addLoading={communityAddLoading}
                onAdd={() => {
                  void handleCommunityAdd();
                }}
              />
            )}
          </>
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
          {isCommunityRunner && (
            <div
              style={{
                position: "relative",
                zIndex: 2,
                padding: "0 20px 28px",
                marginTop: 0,
                transform: "translateY(-149px)",
                pointerEvents: "auto",
              }}
            >
              <button
                onClick={() => {
                  void handleCommunityAdd();
                }}
                disabled={communityAddLoading}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: "1px solid var(--kalpx-border-gold)",
                  background: "rgba(255,248,239,0.92)",
                  color: "var(--kalpx-cta)",
                  fontSize: 14,
                  fontWeight: 700,
                  padding: "12px 14px",
                  cursor: communityAddLoading ? "not-allowed" : "pointer",
                  opacity: communityAddLoading ? 0.65 : 1,
                }}
              >
                {communityAddLoading ? "Adding..." : "Add to My Practice"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Sankalp runner: render SankalpHoldBlock DIRECTLY on beige bg
  // Matches CycleTransitionsContainer sankalp_embody flow (mobile).
  const isSankalpState = isRunnerContainer && stateId === "sankalp_embody";

  if (isSankalpState) {
    return (
      <MitraMobileShell
        backgroundImage="/beige_bg.png"
        wideDesktop
        plainDesktopBackground
      >
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
          <>
            <SankalpHoldBlock
              block={{}}
              screenData={screenState.screenData}
              onAction={(action) => executeAction(action, actionContext)}
            />
            {isCommunityRunner && (
              <CommunityRunnerActionBar
                addLoading={communityAddLoading}
                onAdd={() => {
                  void handleCommunityAdd();
                }}
              />
            )}
          </>
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
      <MitraMobileShell
        backgroundImage="/guided_bg.png"
        wideDesktop
        plainDesktopBackground
      >
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
          <>
            <PracticeTimerBlock
              block={{}}
              screenData={screenState.screenData}
              onAction={(action) => executeAction(action, actionContext)}
            />
            {isCommunityRunner && (
              <CommunityRunnerActionBar
                addLoading={communityAddLoading}
                onAdd={() => {
                  void handleCommunityAdd();
                }}
              />
            )}
          </>
        )}
      </MitraMobileShell>
    );
  }

  // ── Trigger practice runner: "I feel triggered" support flow
  // Matches PracticeRunnerContainer isSupportPractice section (mobile).
  // Container is practice_runner OR awareness_trigger, stateId = trigger_practice_runner.
  const isTriggerPracticeState = stateId === "trigger_practice_runner";

  if (isTriggerPracticeState) {
    return (
      <MitraMobileShell backgroundImage="/mantra3.png">
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
          <TriggerPracticeRunnerBlock
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
            {isCommunityRunner && stateId !== "completion_return" && (
              <CommunityRunnerActionBar
                addLoading={communityAddLoading}
                onAdd={() => {
                  void handleCommunityAdd();
                }}
              />
            )}
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
