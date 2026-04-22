import React, { useEffect } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import EngineErrorBoundary from "./ErrorBoundary";
import { useScreenStore } from "./useScreenBridge";
import type { RootState } from "../store";

// Import Containers
import PracticeDetailOverlay from "../components/PracticeDetailOverlay";
import AwarenessTriggerContainer from "../containers/AwarenessTriggerContainer";
import ChoiceStackContainer from "../containers/ChoiceStackContainer";
import ComposerContainer from "../containers/ComposerContainer";
import CycleTransitionsContainer from "../containers/CycleTransitionsContainer";
import EmbodimentChallengeRunnerContainer from "../containers/EmbodimentChallengeRunnerContainer";
import GenericContainer from "../containers/GenericContainer";
import InsightsProgressContainer from "../containers/InsightsProgressContainer";
import InsightSummaryContainer from "../containers/InsightSummaryContainer";
import LockRitualContainer from "../containers/LockRitualContainer";
import PortalContainer from "../containers/PortalContainer";
import PortalSplashContainer from "../containers/PortalSplashContainer";
import PracticeRunnerContainer from "../containers/PracticeRunnerContainer";
import RoutineBuilderContainer from "../containers/RoutineBuilderContainer";
import RoutineLockedContainer from "../containers/RoutineLockedContainer";
import StableScanContainer from "../containers/StableScanContainer";
import OnboardingContainer from "../containers/OnboardingContainer";
// Week 4 — Support Path
import SupportTriggerContainer from "../containers/SupportTriggerContainer";
import SupportCheckinContainer from "../containers/SupportCheckinContainer";
// Week 5 — Reflection containers (Moments 23, 34)
import ReflectionWeeklyContainer from "../containers/ReflectionWeeklyContainer";
import ReflectionEveningContainer from "../containers/ReflectionEveningContainer";
// Week 7 — Support routes (Moments 46, 47)
import GriefRoomContainer from "../extensions/moments/grief_room";
import LonelinessRoomContainer from "../extensions/moments/loneliness_room";
// Track 1 — first-class Joy + Growth support rooms (Moments 48, 49).
import JoyRoomContainer from "../extensions/moments/joy_room";
import GrowthRoomContainer from "../extensions/moments/growth_room";
// T3A-3 — Crisis safety surface
import CrisisRoomContainer from "../containers/CrisisRoomContainer";
// Checkpoint reflection — thin container that renders CycleReflectionBlock directly.
// Avoids CycleTransitionsContainer background interference.
import CheckpointReflectionContainer from "../containers/CheckpointReflectionContainer";
// Phase 5 Stage 2 — Canonical v3.1 room renderer (flag-gated at RoomRenderer).
// Fetches GET /api/mitra/rooms/{room_id}/render/ and mounts <RoomRenderer />.
import RoomContainer from "../containers/RoomContainer";
// Phase 3 — Mitra v3 new dashboard shell (11 required components).
// Registered under `companion_dashboard_v3` so Home.tsx can route to it
// when the flag flips. Gated behind EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1;
// the Home.tsx flag check is already in place (Home.tsx:270). Phase 5
// flips the flag in the release channel — no code swap required here.
import NewDashboardContainer from "../containers/NewDashboardContainer";

const containerMap: Record<string, React.ComponentType<any>> = {
  portal: PortalContainer,
  generic: GenericContainer,
  choice_stack: ChoiceStackContainer,
  stable_scan: StableScanContainer,
  lock_ritual_overlay: LockRitualContainer,
  lock_ritual: LockRitualContainer,
  insight_summary: InsightSummaryContainer,
  // Legacy `companion_dashboard` route now resolves to the v3
  // NewDashboardContainer unconditionally. The legacy
  // CompanionDashboardContainer was deleted in journey-v3-fe Step 5.
  companion_dashboard: NewDashboardContainer,
  practice_runner: PracticeRunnerContainer,
  awareness_trigger: AwarenessTriggerContainer,
  composer: ComposerContainer,
  routine_builder: RoutineBuilderContainer,
  embodiment_challenge_runner: EmbodimentChallengeRunnerContainer,
  cycle_transitions: CycleTransitionsContainer,
  insights_progress: InsightsProgressContainer,
  portal_splash: PortalSplashContainer,
  routine_locked: RoutineLockedContainer,
  welcome_onboarding: OnboardingContainer,
  // Week 4 — Support Path
  support_trigger: SupportTriggerContainer,
  support_checkin: SupportCheckinContainer,
  // Week 5
  reflection_weekly: ReflectionWeeklyContainer,
  reflection_evening: ReflectionEveningContainer,
  // Week 7 — Support routes
  support_grief: GriefRoomContainer,
  support_loneliness: LonelinessRoomContainer,
  // Track 1 — first-class Joy + Growth support rooms
  support_joy: JoyRoomContainer,
  support_growth: GrowthRoomContainer,
  // T3A-3 — Crisis safety surface
  crisis_room: CrisisRoomContainer,
  // Day 7 / Day 14 checkpoint — renders CycleReflectionBlock directly.
  checkpoint_reflection: CheckpointReflectionContainer,
  // Phase 3 — Mitra v3 new dashboard. Active only when Home.tsx routes
  // here (EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1). Coexists with
  // companion_dashboard until Phase 5 cutover.
  companion_dashboard_v3: NewDashboardContainer,
  // Phase 5 Stage 2 — Canonical room container. Mounted via
  // loadScreen({ container_id: "room", state_id: "render" }) from the
  // enter_room handler when EXPO_PUBLIC_MITRA_V3_ROOMS=1 AND the per-room
  // flag EXPO_PUBLIC_MITRA_ROOM_<UPPER>=1 are both on. room_id is read
  // from screenData (stamped pre-nav by enter_room).
  room: RoomContainer,
};

const ScreenRenderer: React.FC = () => {
  const navigation = useNavigation<any>();
  const currentScreen = useScreenStore((state) => state.currentScreen);
  const currentContainerId = useScreenStore(
    (state) => state.currentContainerId,
  );
  const { currentOverlayData, setOverlayData } = useScreenStore();

  const user = useSelector(
    (state: RootState) => state.login?.user || state.socialLoginReducer?.user,
  );
  const isLoggedIn = !!(user?.id || user?.email || user?.token || user?.profile);

  // Guard: only navigate back when:
  //   1. currentScreen is null (nothing to render), AND
  //   2. the user is logged OUT (genuine post-logout/RESET_APP blank).
  // During normal screen-to-screen transitions currentScreen is briefly null
  // while the schema is fetching — but the user is still logged in, so we
  // must NOT call goBack() in that window (it would break forward navigation).
  useEffect(() => {
    if (!currentScreen && !isLoggedIn) {
      const timer = setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, isLoggedIn, navigation]);

  if (__DEV__) {
    console.log(
      `[ScreenRenderer] containerId=${currentContainerId} hasScreen=${!!currentScreen} blocks=${currentScreen?.blocks?.length || 0}`,
    );
  }

  // Show a subtle loading state while the schema resolves (briefly null after
  // every navigation since loadScreen/goBack now clear currentScreen immediately
  // to prevent container/schema mismatches). Only logged-in users reach this
  // path during normal nav; logged-out users are handled by the goBack guard above.
  if (!currentScreen) {
    if (isLoggedIn) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#b8922a" />
        </View>
      );
    }
    return null;
  }

  // Use specific container or fallback to Generic
  const Container =
    containerMap[currentContainerId || "generic"] || GenericContainer;

  // Overlays should cover the entire screen, including Safe Area
  const Wrapper = currentScreen?.overlay ? View : SafeAreaView;

  return (
    <View style={styles.root}>
      <EngineErrorBoundary>
        <Wrapper style={styles.wrapper}>
          <Container schema={currentScreen} />
        </Wrapper>
      </EngineErrorBoundary>

      {currentOverlayData && (
        <PracticeDetailOverlay
          data={currentOverlayData}
          onClose={() => setOverlayData(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  wrapper: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default ScreenRenderer;
