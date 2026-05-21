import { normalizeDashboardWhyThisState } from "@kalpx/contracts";
import type {
  DashboardWhyThis,
  JourneyTriadReminders,
  JourneyTriadRemindersPatch,
} from "@kalpx/types";
import { Bell, Leaf, Music, Sparkles } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ContinuityBanner } from "../../components/blocks/dashboard/ContinuityBanner";
import { CycleProgressBlock } from "../../components/blocks/dashboard/CycleProgressBlock";
import { SankalpCarryBlock } from "../../components/blocks/dashboard/SankalpCarryBlock";
import { MitraMobileShell } from "../../components/layout/MitraMobileShell";
import { executeAction } from "../../engine/actionExecutor";
import {
  apiGetJourneyReminders,
  apiPatchJourneyReminders,
  getDashboardView,
  mitraJourneyEntryView,
} from "../../engine/mitraApi";
import { ingestDailyView } from "../../engine/v3Ingest";
import type { AppDispatch } from "../../store";
import { updateScreenData, useScreenState } from "../../store/screenSlice";

function innerPathHeldLabel(slot: string): string {
  if (slot === "mantra") return "Mantra held today · return anytime";
  if (slot === "sankalp") return "Sankalp carried today · return anytime";
  if (slot === "practice") return "Practice held today · return anytime";
  return "Held today · return anytime";
}

export function InnerPathPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const screenState = useScreenState();
  const [isDesktop, setIsDesktop] = useState(
    typeof window === "undefined" ? true : window.innerWidth >= 1024,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressOpen, setProgressOpen] = useState(false);
  const [guidanceOpen, setGuidanceOpen] = useState(true);
  const [whyChosenOpen, setWhyChosenOpen] = useState(false);
  const [activeWhyTab, setActiveWhyTab] = useState<
    "mantra" | "sankalp" | "practice"
  >("mantra");
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [reminders, setReminders] = useState<JourneyTriadReminders | null>(
    null,
  );
  const [reminderSaving, setReminderSaving] = useState(false);
  const [showAllCompleteMessage, setShowAllCompleteMessage] = useState(false);

  // P1-4: show calm acknowledgment when all 3 triad items were just completed.
  // The flag is set by return_to_inner_path and cleared here after display.
  useEffect(() => {
    const sd = screenState.screenData;
    if (sd.triad_all_complete) {
      setShowAllCompleteMessage(true);
      dispatch(updateScreenData({ triad_all_complete: false }));
      const t = window.setTimeout(() => setShowAllCompleteMessage(false), 5000);
      return () => window.clearTimeout(t);
    }
  }, [screenState.screenData.triad_all_complete, dispatch]);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await mitraJourneyEntryView();
        if (cancelled) return;

        const viewKey = result.envelope?.target?.view_key;

        if (viewKey === "day_7_view") {
          navigate("/en/mitra/checkpoint/7", { replace: true });
          return;
        }
        if (viewKey === "day_14_view") {
          navigate("/en/mitra/checkpoint/14", { replace: true });
          return;
        }
        if (viewKey === "welcome_back_surface") {
          navigate("/en/mitra/welcome-back", { replace: true });
          return;
        }
        if (!viewKey || viewKey === "onboarding_start") {
          navigate("/en/mitra/onboarding?stateId=turn_1", { replace: true });
          return;
        }
        if (viewKey !== "daily_view") {
          navigate("/en/mitra/dashboard", { replace: true });
          return;
        }

        const entryPayload = result.envelope?.target?.payload;
        const isDailyViewPayload =
          result.envelope?.target?.view_key === "daily_view" &&
          entryPayload?.identity != null &&
          entryPayload?.today != null;

        let envelope: any;
        if (isDailyViewPayload) {
          envelope = entryPayload;
        } else {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              "[InnerPath] entry-view payload absent or mismatched — falling back to daily-view call",
            );
          }
          envelope = await getDashboardView();
          if (cancelled) return;
          if (!envelope || envelope._isLegacyFallback) {
            setError("Your path is preparing — try again in a moment.");
            setLoading(false);
            return;
          }
        }

        const flat = ingestDailyView(envelope);
        dispatch(updateScreenData(flat));
        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Could not load your path.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, dispatch]);

  useEffect(() => {
    apiGetJourneyReminders()
      .then(setReminders)
      .catch(() => {});
  }, []);

  const sd = screenState.screenData;
  const hasSankalpCarry =
    Array.isArray(sd.sankalp_how_to_live) && sd.sankalp_how_to_live.length > 0;

  const handleAction = useCallback(
    (action: any) =>
      void executeAction(action, {
        dispatch,
        screenData: screenState.screenData,
        currentStateId: "inner_path_daily",
      }),
    [dispatch, screenState.screenData],
  );

  const hasContinuity = sd.continuity?.tier && sd.continuity.tier !== "none";

  const l1Items = Array.isArray(sd.why_this_l1_items)
    ? (sd.why_this_l1_items as Array<{ id: string; label: string }>).filter(
        (it) => it?.label && it.label.trim().length > 0,
      )
    : [];
  const L1_DISPLAY_LABELS: Record<string, string> = {
    mantra: "Mantra",
    sankalp: "Sankalp",
    practice: "Practice",
  };
  const whyThis = sd.why_this || {};
  const triadArr: any[] = Array.isArray(sd.today?.triad) ? sd.today.triad : [];
  const getShift = (context: any): string =>
    context?.target_shift || context?.mitra_shift || "";
  const sentence = (
    value: string | null | undefined,
    fallback = "",
  ): string => {
    const text = String(value || fallback).trim();
    if (!text) return "";
    return /[.!?]$/.test(text) ? text : `${text}.`;
  };
  const triadItems = [
    {
      slot: "mantra",
      label: "MANTRA",
      title:
        triadArr.find((t: any) => t?.slot === "mantra")?.title ||
        sd.card_mantra_title ||
        "",
      subtitle: "Return through sound",
      completedToday:
        triadArr.find((t: any) => t?.slot === "mantra")?.completed_today === true,
      master:
        sd.master_mantra ||
        triadArr.find((t: any) => t?.slot === "mantra") ||
        null,
      accent: "#B38722",
      icon: Music,
      iconSrc: null,
    },
    {
      slot: "sankalp",
      label: "SANKALP",
      title:
        triadArr.find((t: any) => t?.slot === "sankalp")?.title ||
        sd.card_sankalpa_title ||
        "",
      subtitle: "Hold today's intention",
      completedToday:
        triadArr.find((t: any) => t?.slot === "sankalp")?.completed_today === true,
      master:
        sd.master_sankalp ||
        triadArr.find((t: any) => t?.slot === "sankalp") ||
        null,
      accent: "#A17826",
      icon: Leaf,
      iconSrc: null,
    },
    {
      slot: "practice",
      label: "PRACTICE",
      title:
        triadArr.find((t: any) => t?.slot === "practice")?.title ||
        sd.card_ritual_title ||
        "",
      subtitle: "Move through the body",
      completedToday:
        triadArr.find((t: any) => t?.slot === "practice")?.completed_today === true,
      master:
        sd.master_practice ||
        triadArr.find((t: any) => t?.slot === "practice") ||
        null,
      accent: "#B38722",
      icon: null,
      iconSrc: "/in1.svg",
    },
  ].filter((item) => item.title);
  const whyTabs = (
    ["mantra", "sankalp", "practice"] as Array<
      "mantra" | "sankalp" | "practice"
    >
  )
    .map((slot) => {
      const item = triadArr.find((t: any) => t?.slot === slot) || {};
      const context = item.context || {};
      return {
        slot,
        label: L1_DISPLAY_LABELS[slot],
        title: item.title || "",
        context,
        shift: getShift(context),
      };
    })
    .filter(
      (item) =>
        !!(
          item.title ||
          item.context?.mitra_frame_through ||
          item.shift ||
          item.context?.mitra_use_for ||
          item.context?.commentary_lineage
        ),
    );
  const activeWhyItem =
    whyTabs.find((item) => item.slot === activeWhyTab) || whyTabs[0] || null;
  const hasWhyThis =
    whyTabs.length > 0 ||
    normalizeDashboardWhyThisState(sd.why_this as DashboardWhyThis | undefined)
      .canOpenWhyThis ||
    l1Items.length > 0;

  const TRIAD_REMINDER_DEFAULTS: Record<
    "mantra" | "sankalp" | "practice",
    string
  > = {
    mantra: "07:00",
    sankalp: "08:00",
    practice: "18:00",
  };

  async function handleReminderToggle(key: "mantra" | "sankalp" | "practice") {
    if (!reminders || reminderSaving) return;
    const enabledKey = `${key}_reminder_enabled` as keyof JourneyTriadReminders;
    const timeKey = `${key}_reminder_time` as keyof JourneyTriadReminders;
    const currentEnabled = reminders[enabledKey] as boolean;
    const patch: JourneyTriadRemindersPatch = {
      [`${key}_reminder_enabled`]: !currentEnabled,
    };
    if (!currentEnabled && !reminders[timeKey]) {
      (patch as any)[`${key}_reminder_time`] = TRIAD_REMINDER_DEFAULTS[key];
    }
    setReminderSaving(true);
    try {
      const updated = await apiPatchJourneyReminders(patch);
      setReminders(updated);
    } catch {
      // non-fatal
    } finally {
      setReminderSaving(false);
    }
  }

  async function handleReminderTime(
    key: "mantra" | "sankalp" | "practice",
    time: string,
  ) {
    if (!reminders || reminderSaving) return;
    setReminderSaving(true);
    try {
      const updated = await apiPatchJourneyReminders({
        [`${key}_reminder_time`]: time,
      } as JourneyTriadRemindersPatch);
      setReminders(updated);
    } catch {
      // non-fatal
    } finally {
      setReminderSaving(false);
    }
  }

  function AccordionRow({
    icon,
    title,
    subtitle,
    open,
    onClick,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    open: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "0.5px solid rgb(255 218 169 / 90%)",
          borderRadius: 5,
          padding: "10px",
          cursor: "pointer",
          textAlign: "left",
          boxShadow: "0 10px 24px rgba(127,90,34,0.05)",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 18,
              color: "#432104",
            }}
          >
            {title}
          </div>
          {!!subtitle && !open && (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 16,
                lineHeight: 1.6,
                color: "var(--kalpx-text-soft)",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 180ms ease",
            flexShrink: 0,
          }}
        >
          <path
            d="M4.5 7l4.5 4.5L13.5 7"
            stroke="#8B7864"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  if (loading) {
    return (
      <MitraMobileShell wideDesktop>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px",
          }}
        >
          <div>
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
            <p
              style={{
                fontSize: 13,
                color: "var(--kalpx-text-muted)",
                textAlign: "center",
              }}
            >
              Loading…
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </MitraMobileShell>
    );
  }

  if (error) {
    return (
      <MitraMobileShell wideDesktop>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 360 }}>
            <p
              style={{
                fontSize: 14,
                color: "var(--kalpx-text-soft)",
                marginBottom: 20,
              }}
            >
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 28px",
                borderRadius: 12,
                background: "var(--kalpx-cta)",
                color: "#fff",
                border: "none",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </MitraMobileShell>
    );
  }

  const whyChosenPanel =
    whyChosenOpen && hasWhyThis ? (
      <div
        style={{
          marginTop: 14,
          padding: isDesktop ? "24px 28px 26px" : "20px 18px 18px",
          borderRadius: 11,
          border: "1px solid rgba(233, 214, 179, 0.95)",
          background:
            "linear-gradient(180deg, rgba(255,251,245,0.98) 0%, rgba(255,247,235,0.94) 48%, rgba(252,242,226,0.96) 100%)",
          boxShadow:
            "0 18px 40px rgba(139, 106, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.85)",
          position: "relative",
          overflow: "hidden",
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
        {whyTabs.length > 0 ? (
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 18,
              }}
            >
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
                  Chosen with care
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
                  Why this supports today
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 18,
                flexWrap: "wrap",
                justifyContent: isDesktop ? "flex-start" : "center",
              }}
            >
              {whyTabs.map((item) => {
                const isActive = activeWhyItem?.slot === item.slot;
                return (
                  <button
                    key={item.slot}
                    type="button"
                    onClick={() => setActiveWhyTab(item.slot)}
                    style={{
                      border: isActive
                        ? "1px solid rgba(179, 135, 34, 0.68)"
                        : "1px solid rgba(214,183,130,0.42)",
                      color: isActive ? "#8B6A2A" : "#7F6A52",
                      padding: "8px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 0.9,
                      textTransform: "uppercase",
                      cursor: "pointer",
                      fontFamily: "var(--kalpx-font-sans)",
                      boxShadow: isActive
                        ? "0 10px 20px rgba(179,135,34,0.12)"
                        : "none",
                      transition:
                        "background 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {activeWhyItem && (
              <div
                style={{
                  borderTop: "1px solid rgba(214,183,130,0.36)",
                  paddingTop: 20,
                }}
              >
                <p
                  style={{
                    margin: "0 0 12px",
                    fontFamily: "var(--kalpx-font-sans)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: "var(--kalpx-cta)",
                  }}
                >
                  {activeWhyItem.label}
                </p>
                <p
                  style={{
                    margin: "0 0 18px",
                    fontFamily: "var(--kalpx-font-serif)",
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1.18,
                    color: "#432104",
                    textWrap: "balance",
                  }}
                >
                  {activeWhyItem.title}
                </p>

                {!!activeWhyItem.context?.mitra_frame_through && (
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
                      Essence
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
                        activeWhyItem.slot === "sankalp"
                          ? `This is ${activeWhyItem.context.mitra_frame_through}`
                          : `${activeWhyItem.title || "This"} is ${activeWhyItem.context.mitra_frame_through}`,
                      )}
                    </p>
                  </div>
                )}

                {!!activeWhyItem.shift && (
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
                      Shift
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
                        `Mitra chose this to guide you from ${activeWhyItem.shift}`,
                      )}
                    </p>
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: 12,
                  }}
                >
                  {!!activeWhyItem.context?.mitra_use_for && (
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
                        Useful for
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 15,
                          lineHeight: 1.7,
                          color: "#5D5348",
                        }}
                      >
                        {sentence(activeWhyItem.context.mitra_use_for)}
                      </p>
                    </div>
                  )}

                  {!!activeWhyItem.context?.commentary_lineage && (
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
                        Rooted in
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 15,
                          lineHeight: 1.7,
                          color: "#5D5348",
                        }}
                      >
                        {sentence(activeWhyItem.context.commentary_lineage)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    ) : null;

  const remindersPanel =
    reminders?.has_journey && remindersOpen ? (
      <div style={{ padding: isDesktop ? "14px 8px 4px" : "12px 4px 4px" }}>
        {(["mantra", "sankalp", "practice"] as const).map((key) => {
          const enabled = reminders[`${key}_reminder_enabled`] as boolean;
          const time = reminders[`${key}_reminder_time`] as string | null;
          const label = key.charAt(0).toUpperCase() + key.slice(1);
          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 10,
                padding: "12px 14px",
                background: enabled
                  ? "rgba(201,168,76,0.08)"
                  : "rgba(0,0,0,0.02)",
                borderRadius: 10,
                border: `1px solid ${enabled ? "rgba(201,168,76,0.25)" : "rgba(0,0,0,0.06)"}`,
                transition: "all 0.2s",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--kalpx-font-serif)",
                  fontSize: 16,
                  color: "#432104",
                  flex: 1,
                }}
              >
                Remind me for {label.toLowerCase()}
              </span>
              {enabled && (
                <input
                  type="time"
                  value={time ? time.slice(0, 5) : TRIAD_REMINDER_DEFAULTS[key]}
                  onChange={(e) =>
                    void handleReminderTime(
                      key,
                      e.target.value || TRIAD_REMINDER_DEFAULTS[key],
                    )
                  }
                  disabled={reminderSaving}
                  style={{
                    border: "1px solid rgba(201,168,76,0.3)",
                    borderRadius: 8,
                    padding: "4px 8px",
                    fontSize: 13,
                    color: "#432104",
                    background: "#fff",
                    outline: "none",
                  }}
                />
              )}
              <button
                type="button"
                onClick={() => void handleReminderToggle(key)}
                disabled={reminderSaving}
                aria-label={`${enabled ? "Disable" : "Enable"} reminder for ${label}`}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  border: "none",
                  background: enabled ? "#C99317" : "rgba(0,0,0,0.15)",
                  cursor: reminderSaving ? "not-allowed" : "pointer",
                  position: "relative",
                  transition: "background 0.2s",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: enabled ? 22 : 2,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.2s",
                  }}
                />
              </button>
            </div>
          );
        })}
        {reminderSaving && (
          <p
            style={{
              fontSize: 12,
              color: "var(--kalpx-text-muted)",
              textAlign: "center",
              margin: "4px 0 0",
            }}
          >
            Saving…
          </p>
        )}
      </div>
    ) : null;

  return (
    <MitraMobileShell wideDesktop>
      <div
        style={{
          maxWidth: isDesktop ? 1360 : 480,
          margin: "0 auto",
          padding: isDesktop ? "24px 20px 48px" : "15px",
          width: "100%",
        }}
      >
        {showAllCompleteMessage && (
          <div
            style={{
              background: "rgba(29, 186, 122, 0.10)",
              border: "1px solid rgba(29, 186, 122, 0.35)",
              borderRadius: 10,
              padding: "14px 18px",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1DBA7A", marginBottom: 4 }}>
              All three held today
            </div>
            <div style={{ fontSize: 13, color: "#5A6B5A", lineHeight: 1.5 }}>
              Mantra, Sankalp, Practice — the cycle is complete.
            </div>
          </div>
        )}
        {/* <button
          onClick={() => navigate("/en/mitra")}
          style={{
            background: "none",
            border: "none",
            color: "#8B6A2A",
            fontSize: 15,
            cursor: "pointer",
            padding: "16px 0 8px",
            display: "block",
            fontFamily: "var(--kalpx-font-serif)",
          }}
        >
          ← Back
        </button> */}

        {/* Page identity */}
        <div style={{ marginBottom: isDesktop ? 24 : 10, textAlign: "center" }}>
          <div style={{ marginBottom: 10 }}>
            <Sparkles
              size={18}
              strokeWidth={1.7}
              color="#D9B45E"
              style={{ margin: "0 auto" }}
            />
          </div>
          <h1
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: "clamp(16px, 8vw, 64px)",
              fontWeight: 700,
              color: "var(--kalpx-text)",
              margin: "0 0 14px",
              lineHeight: 1.08,
              textWrap: "balance",
            }}
          >
            {sd.headline_text ||
              sd.greeting?.headline ||
              sd.focus_phrase ||
              "Steady progress, without pressure."}
          </h1>
          {!!sd.greeting_context && (
            <p
              style={{
                fontFamily: "var(--kalpx-font-serif)",
                fontSize: 17,
                color: "var(--kalpx-text-soft)",
                margin: 0,
                lineHeight: 1.6,
                maxWidth: 420,
                textWrap: "balance",
                marginInline: "auto",
                fontWeight: 700,
              }}
            >
              {sd.greeting_context}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 26, textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setProgressOpen((value) => !value)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "5px 14px",
              borderRadius: 999,
              background: "rgba(255, 252, 246, 0.9)",
              border: "1px solid rgba(223, 205, 181, 0.9)",
              boxShadow: "0 10px 24px rgba(127,90,34,0.05)",
              cursor: "pointer",
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 14,
              color: "#8B6A2A",
              fontWeight: "700",
            }}
          >
            <span>{`Day ${sd.day_number} of ${sd.total_days}`}</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
              style={{
                transform: progressOpen ? "rotate(180deg)" : "none",
                transition: "transform 180ms ease",
              }}
            >
              <path
                d="M4.5 7l4.5 4.5L13.5 7"
                stroke="#8B7864"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {progressOpen && (
          <div style={{ marginBottom: 28 }}>
            <CycleProgressBlock sd={sd} expanded={true} hideHeader={true} />
          </div>
        )}

        {isDesktop ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 0.95fr) minmax(420px, 0.9fr)",
              gap: 40,
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 28,
                }}
              >
                {triadItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.slot}
                      type="button"
                      onClick={() =>
                        handleAction({
                          type: "start_runner",
                          payload: {
                            source: "core",
                            variant: item.slot,
                            item: item.master,
                            practice_launch_surface: "inner_path",
                          },
                        })
                      }
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        padding: "20px 24px",
                        borderRadius: 18,
                        border: "1px solid rgba(242, 223, 182, 0.95)",
                        boxShadow:
                          "0 16px 30px rgba(166,125,54,0.08), inset 0 0 0 1px rgba(255,255,255,0.3)",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          width: 62,
                          height: 62,
                          minWidth: 62,
                          borderRadius: "50%",
                          background: "rgba(255,250,244,0.86)",
                          border: "1px solid rgba(235,221,194,0.95)",
                          boxShadow:
                            "0 12px 28px rgba(176,139,70,0.16), inset 0 -8px 18px rgba(246,236,217,0.85)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {item.iconSrc ? (
                          <img
                            src={item.iconSrc}
                            alt=""
                            style={{ width: 38, height: 38, display: "block" }}
                          />
                        ) : (
                          Icon && (
                            <Icon size={28} strokeWidth={1.7} color={item.accent} />
                          )
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: "0 0 10px",
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: 3.2,
                            color: item.accent,
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            margin: "0 0 10px",
                            fontFamily: "var(--kalpx-font-serif)",
                            fontSize: 24,
                            lineHeight: 1.26,
                            color: "var(--kalpx-text)",
                            textWrap: "balance",
                          }}
                        >
                          {item.title}
                        </p>
                        {!!item.subtitle && (
                          <p
                            style={{
                              margin: 0,
                              fontFamily: "var(--kalpx-font-serif)",
                              fontSize: 16,
                              fontStyle: "italic",
                              color: "#A57A2B",
                              lineHeight: 1.45,
                              fontWeight: 700,
                            }}
                          >
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{ flex: 1, height: 1, background: "rgba(214,183,130,0.35)" }}
                />
                <img
                  src="/lotus_icon.png"
                  alt=""
                  style={{ width: 22, height: 18, opacity: 0.74 }}
                />
                <div
                  style={{ flex: 1, height: 1, background: "rgba(214,183,130,0.35)" }}
                />
              </div>

              {hasSankalpCarry && (
                <div style={{ marginBottom: 14 }}>
                  <AccordionRow
                    icon={<Sparkles size={18} strokeWidth={1.7} color="#8C6BC6" />}
                    title="Today's guidance"
                    open={guidanceOpen}
                    onClick={() => setGuidanceOpen((value) => !value)}
                  />
                  {guidanceOpen && <div style={{ marginTop: 12 }}><SankalpCarryBlock sd={sd} /></div>}
                </div>
              )}

              {hasWhyThis && (
                <div style={{ marginBottom: 14 }}>
                  <AccordionRow
                    icon={<img src="/lotus_icon.png" alt="" style={{ width: 18, height: 14, opacity: 0.8 }} />}
                    title="Why these were chosen"
                    open={whyChosenOpen}
                    onClick={() => setWhyChosenOpen((value) => !value)}
                  />
                </div>
              )}

              {reminders?.has_journey && (
                <div style={{ marginBottom: 14 }}>
                  <AccordionRow
                    icon={<Bell size={16} color="#C99317" />}
                    title="Reminders"
                    open={remindersOpen}
                    onClick={() => setRemindersOpen((o) => !o)}
                  />
                </div>
              )}
            </div>

            <div style={{ paddingTop: 4 }}>
              {hasWhyThis && (
                <div style={{ marginBottom: 16 }}>
                  <AccordionRow
                    icon={<img src="/lotus_icon.png" alt="" style={{ width: 18, height: 14, opacity: 0.8 }} />}
                    title="Why these were chosen"
                    open={whyChosenOpen}
                    onClick={() => setWhyChosenOpen((value) => !value)}
                  />
                  {whyChosenPanel}
                </div>
              )}

              {reminders?.has_journey && (
                <div>
                  <AccordionRow
                    icon={<Bell size={16} color="#C99317" />}
                    title="Reminders"
                    subtitle={
                      [
                        reminders.mantra_reminder_enabled && "Mantra",
                        reminders.sankalp_reminder_enabled && "Sankalp",
                        reminders.practice_reminder_enabled && "Practice",
                      ]
                        .filter(Boolean)
                        .join(", ") || "None set"
                    }
                    open={remindersOpen}
                    onClick={() => setRemindersOpen((o) => !o)}
                  />
                  {remindersPanel}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {triadItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.slot}
                type="button"
                onClick={() =>
                  handleAction({
                    type: "start_runner",
                    payload: {
                      source: "core",
                      variant: item.slot,
                      item: item.master,
                      practice_launch_surface: "inner_path",
                    },
                  })
                }
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "15px",
                  borderRadius: 11,
                  border: "1px solid rgba(242, 223, 182, 0.95)",

                  boxShadow:
                    "0 16px 30px rgba(166,125,54,0.08), inset 0 0 0 1px rgba(255,255,255,0.3)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    borderRadius: "50%",
                    background: "rgba(255,250,244,0.86)",
                    border: "1px solid rgba(235,221,194,0.95)",
                    boxShadow:
                      "0 12px 28px rgba(176,139,70,0.16), inset 0 -8px 18px rgba(246,236,217,0.85)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.iconSrc ? (
                    <img
                      src={item.iconSrc}
                      alt=""
                      style={{ width: 30, height: 30, display: "block" }}
                    />
                  ) : (
                    Icon && (
                      <Icon size={20} strokeWidth={1.7} color={item.accent} />
                    )
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: 3.2,
                      color: item.accent,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontFamily: "var(--kalpx-font-serif)",
                      fontSize: "clamp(20px, 4.6vw, 26px)",
                      lineHeight: 1.26,
                      color: "var(--kalpx-text)",
                      textWrap: "balance",
                    }}
                  >
                    {item.title}
                  </p>
                  {!!item.subtitle && (
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--kalpx-font-serif)",
                        fontSize: 16,
                        fontStyle: "italic",
                        color: "#A57A2B",
                        lineHeight: 1.45,
                        fontWeight: 700,
                      }}
                    >
                      {item.subtitle}
                    </p>
                  )}
                  {item.completedToday && (
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontFamily: "var(--kalpx-font-serif)",
                        fontSize: 12,
                        letterSpacing: 0.4,
                        color: "#7A9E7E",
                      }}
                    >
                      {innerPathHeldLabel(item.slot)}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <div
            style={{ flex: 1, height: 1, background: "rgba(214,183,130,0.35)" }}
          />
          <img
            src="/lotus_icon.png"
            alt=""
            style={{ width: 22, height: 18, opacity: 0.74 }}
          />
          <div
            style={{ flex: 1, height: 1, background: "rgba(214,183,130,0.35)" }}
          />
        </div>
        {guidanceOpen && hasSankalpCarry && (
          <div style={{ marginBottom: 14 }}>
            <AccordionRow
              icon={<Sparkles size={18} strokeWidth={1.7} color="#8C6BC6" />}
              title="Today's guidance"
              open={guidanceOpen}
              onClick={() => setGuidanceOpen((value) => !value)}
            />
            {guidanceOpen && hasSankalpCarry && (
              <div style={{ marginTop: 12 }}>
                <SankalpCarryBlock sd={sd} />
              </div>
            )}
          </div>
        )}

        {/* Per-item transformation labels */}
        {hasWhyThis && (
          <div style={{ marginBottom: 18 }}>
            <AccordionRow
              icon={
                <img
                  src="/lotus_icon.png"
                  alt=""
                  style={{ width: 18, height: 14, opacity: 0.8 }}
                />
              }
              title="Why these were chosen"
              subtitle="Understand why Mitra selected this mantra, sankalp, and practice."
              open={whyChosenOpen}
              onClick={() => setWhyChosenOpen((value) => !value)}
            />
            {whyChosenOpen && (
              <div
                style={{
                  marginTop: 14,
                  padding: "20px 18px 18px",
                  borderRadius: 11,
                  border: "1px solid rgba(233, 214, 179, 0.95)",
                  background:
                    "linear-gradient(180deg, rgba(255,251,245,0.98) 0%, rgba(255,247,235,0.94) 48%, rgba(252,242,226,0.96) 100%)",
                  boxShadow:
                    "0 18px 40px rgba(139, 106, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.85)",
                  position: "relative",
                  overflow: "hidden",
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
                {whyTabs.length > 0 ? (
                  <div style={{ position: "relative", zIndex: 1 }}>
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
                          Chosen with care
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
                          Why this supports today
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 18,
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      {whyTabs.map((item) => {
                        const isActive = activeWhyItem?.slot === item.slot;
                        return (
                          <button
                            key={item.slot}
                            type="button"
                            onClick={() => setActiveWhyTab(item.slot)}
                            style={{
                              border: isActive
                                ? "1px solid rgba(179, 135, 34, 0.68)"
                                : "1px solid rgba(214,183,130,0.42)",

                              color: isActive ? "#8B6A2A" : "#7F6A52",
                              padding: "8px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 700,
                              letterSpacing: 0.9,
                              textTransform: "uppercase",
                              cursor: "pointer",
                              fontFamily: "var(--kalpx-font-sans)",
                              boxShadow: isActive
                                ? "0 10px 20px rgba(179,135,34,0.12)"
                                : "none",
                              transition:
                                "background 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                            }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    {activeWhyItem && (
                      <div
                        style={{
                          borderTop: "1px solid rgba(214,183,130,0.36)",
                          paddingTop: 20,
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 12px",
                            fontFamily: "var(--kalpx-font-sans)",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            color: "var(--kalpx-cta)",
                          }}
                        >
                          {activeWhyItem.label}
                        </p>
                        <p
                          style={{
                            margin: "0 0 18px",
                            fontFamily: "var(--kalpx-font-serif)",
                            fontSize: 18,
                            fontWeight: 700,
                            lineHeight: 1.18,
                            color: "#432104",
                            textWrap: "balance",
                          }}
                        >
                          {activeWhyItem.title}
                        </p>

                        {activeWhyItem.slot === "sankalp"
                          ? !!activeWhyItem.context?.mitra_frame_through && (
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
                                  Essence
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
                                    `This is ${activeWhyItem.context.mitra_frame_through}`,
                                  )}
                                </p>
                              </div>
                            )
                          : !!activeWhyItem.context?.mitra_frame_through && (
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
                                  Essence
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
                                    `${activeWhyItem.title || "This"} is ${activeWhyItem.context.mitra_frame_through}`,
                                  )}
                                </p>
                              </div>
                            )}

                        {!!activeWhyItem.shift && (
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
                              Shift
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
                                `Mitra chose this to guide you from ${activeWhyItem.shift}`,
                              )}
                            </p>
                          </div>
                        )}

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: 12,
                          }}
                        >
                          {!!activeWhyItem.context?.mitra_use_for && (
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
                                Useful for
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 15,
                                  lineHeight: 1.7,
                                  color: "#5D5348",
                                }}
                              >
                                {sentence(activeWhyItem.context.mitra_use_for)}
                              </p>
                            </div>
                          )}

                          {!!activeWhyItem.context?.commentary_lineage && (
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
                                Rooted in
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 15,
                                  lineHeight: 1.7,
                                  color: "#5D5348",
                                }}
                              >
                                {sentence(
                                  activeWhyItem.context.commentary_lineage,
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {(whyThis.level1 || whyThis.level2) && (
                      <div style={{ marginBottom: 18 }}>
                        {whyThis.level1 && (
                          <p
                            style={{
                              fontSize: 20,
                              fontWeight: 700,
                              color: "var(--kalpx-text)",
                              margin: "0 0 8px",
                              fontFamily: "var(--kalpx-font-serif)",
                            }}
                          >
                            {whyThis.level1}
                          </p>
                        )}
                        {whyThis.level2 && (
                          <p
                            style={{
                              fontSize: 15,
                              color: "var(--kalpx-text-soft)",
                              lineHeight: 1.7,
                              margin: 0,
                            }}
                          >
                            {whyThis.level2}
                          </p>
                        )}
                      </div>
                    )}

                    {l1Items.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {l1Items.map((it) => (
                          <div
                            key={it.id}
                            style={{
                              borderLeft: "3px solid var(--kalpx-cta)",
                              paddingLeft: 12,
                              paddingTop: 2,
                              paddingBottom: 2,
                            }}
                          >
                            <p
                              style={{
                                fontFamily: "var(--kalpx-font-sans)",
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: 0.8,
                                textTransform: "uppercase",
                                color: "var(--kalpx-cta)",
                                margin: "0 0 2px",
                              }}
                            >
                              {L1_DISPLAY_LABELS[it.id] ?? it.id}
                            </p>
                            <p
                              style={{
                                fontFamily: "var(--kalpx-font-serif)",
                                fontSize: 14,
                                color: "var(--kalpx-text-soft)",
                                margin: 0,
                                lineHeight: 1.5,
                              }}
                            >
                              {it.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {reminders?.has_journey && (
          <div style={{ marginTop: 16 }}>
            <AccordionRow
              icon={<Bell size={16} color="#C99317" />}
              title="Reminders"
              subtitle={
                [
                  reminders.mantra_reminder_enabled && "Mantra",
                  reminders.sankalp_reminder_enabled && "Sankalp",
                  reminders.practice_reminder_enabled && "Practice",
                ]
                  .filter(Boolean)
                  .join(", ") || "None set"
              }
              open={remindersOpen}
              onClick={() => setRemindersOpen((o) => !o)}
            />
            {remindersPanel}
          </div>
        )}

        {hasContinuity && <ContinuityBanner sd={sd} />}
          </>
        )}
      </div>
    </MitraMobileShell>
  );
}
