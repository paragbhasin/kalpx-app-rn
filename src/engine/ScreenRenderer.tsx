import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useScreenStore } from './ScreenStore';

// Import Containers
import GenericContainer from '../containers/GenericContainer';
import PortalContainer from '../containers/PortalContainer';
import ChoiceStackContainer from '../containers/ChoiceStackContainer'
import StableScanContainer from '../containers/StableScanContainer';


const containerMap: Record<string, React.ComponentType<any>> = {
  portal: PortalContainer,
  generic: GenericContainer,
  choice_stack: ChoiceStackContainer,
  stable_scan: StableScanContainer,
};

const ScreenRenderer: React.FC = () => {
  const currentScreen = useScreenStore((state) => state.currentScreen);
  const currentContainerId = useScreenStore((state) => state.currentContainerId);

  if (!currentScreen) return null;

  // Use specific container or fallback to Generic
  const Container = containerMap[currentContainerId || 'generic'] || GenericContainer;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <Container schema={currentScreen} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default ScreenRenderer;
