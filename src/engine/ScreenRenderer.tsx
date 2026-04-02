import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useScreenStore } from './ScreenStore';

// Import Containers
import GenericContainer from '../containers/GenericContainer';
import PortalContainer from '../containers/PortalContainer';
import ChoiceStackContainer from '../containers/ChoiceStackContainer'
import StableScanContainer from '../containers/StableScanContainer';
import LockRitualContainer from '../containers/LockRitualContainer';
import InsightSummaryContainer from '../containers/InsightSummaryContainer';

const containerMap: Record<string, React.ComponentType<any>> = {
  portal: PortalContainer,
  generic: GenericContainer,
  choice_stack: ChoiceStackContainer,
  stable_scan: StableScanContainer,
  lock_ritual_overlay: LockRitualContainer,
  lock_ritual: LockRitualContainer,
  insight_summary: InsightSummaryContainer,
};

const ScreenRenderer: React.FC = () => {
  const currentScreen = useScreenStore((state) => state.currentScreen);
  const currentContainerId = useScreenStore((state) => state.currentContainerId);

  if (!currentScreen) return null;

  // Use specific container or fallback to Generic
  const Container = containerMap[currentContainerId || 'generic'] || GenericContainer;

  // Overlays should cover the entire screen, including Safe Area
  const Wrapper = currentScreen?.overlay ? View : SafeAreaView;

  return (
    <View style={styles.root}>
      <Wrapper style={styles.wrapper}>
        <Container schema={currentScreen} />
      </Wrapper>
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
