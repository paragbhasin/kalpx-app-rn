/**
 * OnboardingPage — Phase 6.
 * Renders the welcome_onboarding container state-by-state using ScreenRenderer.
 * URL: /en/mitra/onboarding?containerId=welcome_onboarding&stateId=<turn>
 *
 * Does NOT require an active journey — onboarding creates the journey.
 */

import { AUTH_KEYS } from "@kalpx/api-client";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MitraMobileShell } from "../../components/layout/MitraMobileShell";
import { executeAction } from "../../engine/actionExecutor";
import { apiPatchJourneyReminders, startJourneyV3 } from "../../engine/mitraApi";
import { OnboardingReminderStep } from "./OnboardingReminderStep";
import { ScreenRenderer } from "../../engine/ScreenRenderer";
import { useGuestIdentity } from "../../hooks/useGuestIdentity";
import {
  invalidateJourneyStatusCache,
  useJourneyStatus,
} from "../../hooks/useJourneyStatus";
import { useTranslation } from '../../lib/i18n';
import { getActiveLocale } from '../../lib/locale';
import { WEB_ENV } from "../../lib/env";
import { webNavigate } from "../../lib/webRouter";
import type { AppDispatch } from "../../store";
import {
  loadScreen,
  loadScreenWithData,
  setScreenValue,
  updateScreenData,
  useScreenState,
} from "../../store/screenSlice";

export function OnboardingPage() {
  useGuestIdentity();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const screenState = useScreenState();
  const [resolving, setResolving] = useState(false);

  const { loading: statusLoading, hasActiveJourney } = useJourneyStatus();
  // Prevents the post-auth turn_7 recovery effect from firing more than once per page load
  const hasResumedRef = useRef(false);

  // stateId drives which turn to show; default to turn_1 if missing.
  // Guard against stale Redux currentStateId from a different container (e.g. 'portal',
  // 'practice_runner', 'dashboard') — only carry it forward when already in welcome_onboarding.
  const stateId: string =
    searchParams.get("stateId") ||
    (screenState.currentContainerId === "welcome_onboarding"
      ? screenState.currentStateId
      : null) ||
    "turn_1";

  // Active journey users must not re-run onboarding — duplicate journey risk.
  // Exempt turn_9_reminders: the journey was just created during onboarding and
  // hasActiveJourney will flip to true before the user finishes the reminder step.
  useEffect(() => {
    if (statusLoading) return;
    if (stateId === "turn_9_reminders") return;
    if (hasActiveJourney === true) {
      navigate("/en/mitra/dashboard", { replace: true });
    }
  }, [statusLoading, hasActiveJourney, stateId, navigate]);

  // Post-auth turn_7 recovery — mirrors RN Home.tsx navigateToMitra() post-auth hook.
  // When a guest hit turn_7, stashed inference, logged in, and was returned to turn_7,
  // we skip re-showing the screen and call start-v3 directly, then advance to turn_8.
  useEffect(() => {
    if (statusLoading) return;
    if (stateId !== "turn_7") return;
    if (hasActiveJourney) return;
    if (hasResumedRef.current) return;

    const sd = screenState.screenData;
    const isAuthed = (() => {
      try {
        return !!(
          localStorage.getItem(AUTH_KEYS.accessToken) ||
          localStorage.getItem("access_token")
        );
      } catch {
        return false;
      }
    })();
    if (!isAuthed) return;
    if (!sd.stashed_inference_state) return;
    if (sd.onboarding_turn !== "turn_7_awaiting_auth") return;

    hasResumedRef.current = true;

    const inf = sd.stashed_inference_state as Record<string, any>;
    const guidanceMode =
      (sd.stashed_guidance_mode as string | undefined) || "hybrid";
    const draft =
      (sd.onboarding_draft_state as Record<string, any> | undefined) || {};

    (async () => {
      try {
        const start = await startJourneyV3({
          inference_state: {
            lane: inf.lane || draft.path || "support",
            primary_kosha: inf.primary_kosha,
            secondary_kosha: inf.secondary_kosha,
            top_klesha: inf.primary_klesha,
            top_vritti: inf.primary_vritti,
            vritti_candidates: inf.vritti_candidates || [],
            klesha_candidates: inf.klesha_candidates || [],
            life_context: inf.life_context,
            support_style: inf.support_style,
            intervention_bias: inf.intervention_bias || [],
            confidence: inf.confidence || 0.0,
          },
          guidance_mode: guidanceMode,
          locale: getActiveLocale(),
          tz:
            Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
          stage0_choice: draft.stage0_choice || draft.path,
          stage1_choice: draft.stage1_choice,
          stage2_choice: draft.stage2_choice,
          stage3_choice: draft.stage3_choice,
        });

        if (start) {
          const t = start.triad || {};
          dispatch(
            updateScreenData({
              v3_start_failed: false,
              mantra_text: t.mantra?.title,
              companion_mantra_title: t.mantra?.title,
              companion_mantra_id: t.mantra?.item_id,
              sankalp_text: t.sankalp?.title,
              companion_sankalp_line: t.sankalp?.title,
              companion_sankalp_id: t.sankalp?.item_id,
              practice_title: t.practice?.title,
              companion_practice_title: t.practice?.title,
              companion_practice_id: t.practice?.item_id,
              scan_focus: start.scan_focus,
              onboarding_triad_data: start,
              ...(start.journey_id ? { journey_id: start.journey_id } : {}),
              // Clear stashed auth-gate state only on success
              stashed_inference_state: null,
              stashed_guidance_mode: null,
              onboarding_draft_state: null,
              onboarding_turn: "turn_8",
            }),
          );
          invalidateJourneyStatusCache();
          dispatch(
            loadScreen({
              containerId: "welcome_onboarding",
              stateId: "turn_8",
            }),
          );
          webNavigate(
            `/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_8`,
          );
        } else {
          dispatch(setScreenValue({ key: "v3_start_failed", value: true }));
          if (WEB_ENV.isDev)
            console.warn(
              "[OnboardingPage] post-auth start-v3 returned null — staying on turn_7",
            );
        }
      } catch (err) {
        dispatch(setScreenValue({ key: "v3_start_failed", value: true }));
        if (WEB_ENV.isDev)
          console.error("[OnboardingPage] post-auth start-v3 failed:", err);
      }
    })();
  }, [
    stateId,
    statusLoading,
    hasActiveJourney,
    screenState.screenData,
    dispatch,
  ]);

  useEffect(() => {
    // turn_9_reminders is a local step — no backend schema to fetch
    if (stateId === "turn_9_reminders") return;
    if (
      screenState.currentContainerId === "welcome_onboarding" &&
      screenState.currentStateId === stateId &&
      screenState.currentScreen
    ) {
      return;
    }
    setResolving(true);
    dispatch(
      loadScreenWithData({ containerId: "welcome_onboarding", stateId }),
    ).finally(() => setResolving(false));
  }, [stateId, dispatch]);

  // Reload current screen immediately when locale changes
  useEffect(() => {
    function onLocaleChange() {
      if (stateId === "turn_9_reminders") return;
      setResolving(true);
      dispatch(
        loadScreenWithData({ containerId: "welcome_onboarding", stateId }),
      ).finally(() => setResolving(false));
    }
    window.addEventListener('kalpx:locale-changed', onLocaleChange);
    return () => window.removeEventListener('kalpx:locale-changed', onLocaleChange);
  }, [stateId, dispatch]);

  if (statusLoading) {
    return (
      <MitraMobileShell>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px",
          }}
        >
          <p style={{ color: "var(--kalpx-text-muted)", fontSize: 14 }}>
            {t('mitra.common.loading')}
          </p>
        </div>
      </MitraMobileShell>
    );
  }

  const actionContext = {
    dispatch,
    screenData: screenState.screenData,
    currentStateId: stateId,
  };

  const isHeroTurn = stateId === "turn_1" || stateId === "turn_2";
  const backgroundImage = isHeroTurn ? "/new_home.png" : "/beige_bg.png";

  return (
    <MitraMobileShell backgroundImage={backgroundImage}>
      <div>
        {stateId === "turn_9_reminders" ? (
          <OnboardingReminderStep
            destination={
              (screenState.screenData.post_onboarding_destination as string | undefined) || "/en/mitra"
            }
            patchReminders={apiPatchJourneyReminders}
          />
        ) : (
          <>
            {resolving && (
              <div
                style={{
                  textAlign: "center",
                  paddingTop: 80,
                  color: "var(--kalpx-text-muted)",
                }}
              >
                {t('mitra.common.loading')}
              </div>
            )}
            {!resolving && (
              <ScreenRenderer
                schema={screenState.currentScreen}
                screenData={screenState.screenData}
                onAction={(action) => executeAction(action, actionContext)}
              />
            )}
          </>
        )}
      </div>
    </MitraMobileShell>
  );
}
