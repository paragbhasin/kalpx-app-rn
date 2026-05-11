import { normalizeDashboardWhyThisState } from "@kalpx/contracts";
import type { DashboardWhyThis } from "@kalpx/types";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ContinuityBanner } from "../../components/blocks/dashboard/ContinuityBanner";
import { CycleProgressBlock } from "../../components/blocks/dashboard/CycleProgressBlock";
import { PathChip } from "../../components/blocks/dashboard/PathChip";
import { SankalpCarryBlock } from "../../components/blocks/dashboard/SankalpCarryBlock";
import { TriadCardsRow } from "../../components/blocks/dashboard/TriadCardsRow";
import { WhyThisSheet } from "../../components/blocks/dashboard/WhyThisSheet";
import { MitraMobileShell } from "../../components/layout/MitraMobileShell";
import { executeAction } from "../../engine/actionExecutor";
import { getDashboardView, mitraJourneyEntryView } from "../../engine/mitraApi";
import { ingestDailyView } from "../../engine/v3Ingest";
import type { AppDispatch } from "../../store";
import { updateScreenData, useScreenState } from "../../store/screenSlice";

export function InnerPathPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const screenState = useScreenState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whyThisOpen, setWhyThisOpen] = useState(false);

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
          navigate("/en/mitra/onboarding", { replace: true });
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

  const sd = screenState.screenData;
  const hasSankalpCarry = Array.isArray(sd.sankalp_how_to_live) && sd.sankalp_how_to_live.length > 0;

  const handleAction = useCallback(
    (action: any) =>
      void executeAction(action, {
        dispatch,
        screenData: screenState.screenData,
        currentStateId: "inner_path_daily",
      }),
    [dispatch, screenState.screenData],
  );

  const handleBackFromL3 = useCallback(() => {
    dispatch(updateScreenData({ why_this_overlay_level: "l2", why_this_source: null }));
  }, [dispatch]);

  const hasWhyThis =
    normalizeDashboardWhyThisState(sd.why_this as DashboardWhyThis | undefined).canOpenWhyThis ||
    (Array.isArray(sd.why_this_l1_items) && sd.why_this_l1_items.length > 0);

  const hasContinuity = sd.continuity?.tier && sd.continuity.tier !== "none";

  const l1Items = Array.isArray(sd.why_this_l1_items)
    ? (sd.why_this_l1_items as Array<{ id: string; label: string }>).filter(
        (it) => it?.label && it.label.trim().length > 0,
      )
    : [];
  const L1_DISPLAY_LABELS: Record<string, string> = { mantra: "Mantra", sankalp: "Sankalp", practice: "Practice" };

  if (loading) {
    return (
      <MitraMobileShell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
          <div>
            <div style={{
              width: 28, height: 28,
              border: "2px solid var(--kalpx-cta)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 12px",
            }} />
            <p style={{ fontSize: 13, color: "var(--kalpx-text-muted)", textAlign: "center" }}>Loading…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </MitraMobileShell>
    );
  }

  if (error) {
    return (
      <MitraMobileShell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 360 }}>
            <p style={{ fontSize: 14, color: "var(--kalpx-text-soft)", marginBottom: 20 }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 28px", borderRadius: 12,
                background: "var(--kalpx-cta)", color: "#fff",
                border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </MitraMobileShell>
    );
  }

  return (
    <MitraMobileShell>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px 120px" }}>

        <button
          onClick={() => navigate("/en/mitra")}
          style={{
            background: "none", border: "none",
            color: "var(--kalpx-cta)", fontSize: 14,
            cursor: "pointer", padding: "16px 0 8px",
            display: "block",
          }}
        >
          ← Back
        </button>

        {/* Page identity */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontFamily: "var(--kalpx-font-sans)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: "var(--kalpx-text-muted)",
            margin: "0 0 6px",
          }}>
            Inner Path
          </p>
          <h1 style={{
            fontFamily: "var(--kalpx-font-serif)",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--kalpx-text)",
            margin: "0 0 6px",
            lineHeight: 1.3,
          }}>
            Day {sd.day_number} of {sd.total_days}
            {sd.journey_path_label ? (
              <span style={{ color: "var(--kalpx-text-soft)", fontWeight: 400 }}>
                {" · "}{sd.journey_path_label}
              </span>
            ) : null}
          </h1>
          {!!sd.greeting_context && (
            <p style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 15,
              color: "var(--kalpx-text-soft)",
              margin: 0,
              lineHeight: 1.6,
            }}>
              {sd.greeting_context}
            </p>
          )}
        </div>

        {/* Triad — mantra, sankalp, practice */}
        <TriadCardsRow sd={sd} onAction={handleAction} />

        {/* Path identity chip */}
        <PathChip sd={sd} />

        {/* Cycle / day progress */}
        <CycleProgressBlock sd={sd} />

        {/* Sankalp carry-over */}
        {hasSankalpCarry && <SankalpCarryBlock sd={sd} />}

        {/* Per-item transformation labels */}
        {l1Items.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{
              fontFamily: "var(--kalpx-font-sans)",
              fontSize: 11, fontWeight: 600, letterSpacing: 1.2,
              textTransform: "uppercase", color: "var(--kalpx-text-muted)",
              margin: "0 0 10px",
            }}>
              Why these were chosen
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {l1Items.map((it) => (
                <div key={it.id} style={{
                  borderLeft: "3px solid var(--kalpx-cta)",
                  paddingLeft: 12,
                  paddingTop: 2, paddingBottom: 2,
                }}>
                  <p style={{
                    fontFamily: "var(--kalpx-font-sans)",
                    fontSize: 11, fontWeight: 600, letterSpacing: 0.8,
                    textTransform: "uppercase", color: "var(--kalpx-cta)",
                    margin: "0 0 2px",
                  }}>
                    {L1_DISPLAY_LABELS[it.id] ?? it.id}
                  </p>
                  <p style={{
                    fontFamily: "var(--kalpx-font-serif)",
                    fontSize: 14, color: "var(--kalpx-text-soft)",
                    margin: 0, lineHeight: 1.5,
                  }}>
                    {it.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why this was chosen — principle-level sheet */}
        {hasWhyThis && (
          <button
            onClick={() => setWhyThisOpen(true)}
            data-testid="why-this-link"
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              color: "#D4A017",
              fontSize: 18,
              fontFamily: "var(--kalpx-font-serif)",
              fontWeight: 600,
              padding: "4px 0",
              marginBottom: 16,
            }}
          >
            Why this was chosen →
          </button>
        )}

        {hasContinuity && <ContinuityBanner sd={sd} />}

        {whyThisOpen && (
          <WhyThisSheet
            sd={sd}
            onClose={() => setWhyThisOpen(false)}
            onAction={handleAction}
            onBackFromL3={handleBackFromL3}
          />
        )}
      </div>
    </MitraMobileShell>
  );
}
