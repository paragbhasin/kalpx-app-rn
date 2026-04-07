import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useScreenStore } from './useScreenBridge';
import EngineErrorBoundary from './ErrorBoundary';

// Import Containers
import GenericContainer from '../containers/GenericContainer';
import PortalContainer from '../containers/PortalContainer';
import ChoiceStackContainer from '../containers/ChoiceStackContainer'
import StableScanContainer from '../containers/StableScanContainer';
import LockRitualContainer from '../containers/LockRitualContainer';
import InsightSummaryContainer from '../containers/InsightSummaryContainer';
import PracticeDetailOverlay from '../components/PracticeDetailOverlay';
import CompanionDashboardContainer from '../containers/CompanionDashboardContainer';
import PracticeRunnerContainer from '../containers/PracticeRunnerContainer';
import CycleTransitionsContainer from '../containers/CycleTransitionsContainer';
import AwarenessTriggerContainer from '../containers/AwarenessTriggerContainer';
import ComposerContainer from '../containers/ComposerContainer';
import RoutineBuilderContainer from '../containers/RoutineBuilderContainer';
import EmbodimentChallengeRunnerContainer from '../containers/EmbodimentChallengeRunnerContainer';

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
};

const ScreenRenderer: React.FC = () => {
  const currentScreen = useScreenStore((state) => state.currentScreen);
  const currentContainerId = useScreenStore((state) => state.currentContainerId);
  const { currentOverlayData, setOverlayData } = useScreenStore();

  if (!currentScreen) return null;

  // Use specific container or fallback to Generic
  const Container = containerMap[currentContainerId || 'generic'] || GenericContainer;

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
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  wrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default ScreenRenderer;
