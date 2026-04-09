import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import EngineErrorBoundary from "./ErrorBoundary";
import { useScreenStore } from "./useScreenBridge";

// Import Containers
import PracticeDetailOverlay from "../components/PracticeDetailOverlay";
import AwarenessTriggerContainer from "../containers/AwarenessTriggerContainer";
import ChoiceStackContainer from "../containers/ChoiceStackContainer";
import CompanionDashboardContainer from "../containers/CompanionDashboardContainer";
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

const containerMap: Record<string, React.ComponentType<any>> = {
  portal: PortalContainer,
  generic: GenericContainer,
  choice_stack: ChoiceStackContainer,
  stable_scan: StableScanContainer,
  lock_ritual_overlay: LockRitualContainer,
  lock_ritual: LockRitualContainer,
  insight_summary: InsightSummaryContainer,
  companion_dashboard: CompanionDashboardContainer,
  practice_runner: PracticeRunnerContainer,
  awareness_trigger: AwarenessTriggerContainer,
  composer: ComposerContainer,
  routine_builder: RoutineBuilderContainer,
  embodiment_challenge_runner: EmbodimentChallengeRunnerContainer,
  cycle_transitions: CycleTransitionsContainer,
  insights_progress: InsightsProgressContainer,
  portal_splash: PortalSplashContainer,
  routine_locked: RoutineLockedContainer,
};

const ScreenRenderer: React.FC = () => {
  const currentScreen = useScreenStore((state) => state.currentScreen);
  const currentContainerId = useScreenStore(
    (state) => state.currentContainerId,
  );
  const { currentOverlayData, setOverlayData, goBack, history, loadScreen } =
    useScreenStore();

  if (__DEV__) {
    console.log(
      `[ScreenRenderer] containerId=${currentContainerId} hasScreen=${!!currentScreen} blocks=${currentScreen?.blocks?.length || 0}`,
    );
  }

  if (!currentScreen) return null;

  // Use specific container or fallback to Generic
  const Container =
    containerMap[currentContainerId || "generic"] || GenericContainer;

  // Overlays should cover the entire screen, including Safe Area
  const Wrapper = currentScreen?.overlay ? View : SafeAreaView;
  const showBackButton = !currentScreen?.overlay && history.length > 0;

  const handleBack = () => {
    if (history.length > 0) {
      goBack();
      return;
    }
    loadScreen({ container_id: "portal", state_id: "portal" });
  };

  return (
    <View style={styles.root}>
      <EngineErrorBoundary>
        <Wrapper style={styles.wrapper}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#432104" />
            </TouchableOpacity>
          )}
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
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  wrapper: {
    flex: 1,
    backgroundColor: "transparent",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ScreenRenderer;
