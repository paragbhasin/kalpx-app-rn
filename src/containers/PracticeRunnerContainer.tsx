import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useScreenStore } from '../engine/ScreenStore';
import BlockRenderer from '../engine/BlockRenderer';
import Header from '../components/Header';

interface PracticeRunnerContainerProps {
  schema: {
    container_id: string;
    blocks: any[];
    tone?: {
      theme?: string;
      mood?: string;
    };
    variant?: string;
  };
}

const PracticeRunnerContainer: React.FC<PracticeRunnerContainerProps> = ({ schema }) => {
  const loadScreen = useScreenStore(state => state.loadScreen);
  const updateBackground = useScreenStore(state => state.updateBackground);

  React.useEffect(() => {
    updateBackground(require('../../assets/companion.png'));
  }, [updateBackground]);
  
  const renderHeader = () => {
    const headerBlocks = schema.blocks?.filter(b => b.position === 'header') || [];
    return (
      <View style={styles.header}>
        {headerBlocks.map((block, idx) => (
          <BlockRenderer key={`header-${idx}`} block={block} />
        ))}
      </View>
    );
  };

  const renderContent = () => {
    const contentBlocks = schema.blocks?.filter(b => !b.position || b.position === 'content') || [];
    return (
      <View style={styles.content}>
        {contentBlocks.map((block, idx) => (
            <BlockRenderer key={`content-${idx}`} block={block} />
        ))}
      </View>
    );
  };

  const renderFooter = () => {
    const footerBlocks = schema.blocks?.filter(b => b.position === 'footer') || [];
    return (
      <View style={styles.footer}>
        {footerBlocks.map((block, idx) => (
          <BlockRenderer key={`footer-${idx}`} block={block} />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
        <Header isTransparent />
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.inner}>
                {renderHeader()}
                {renderContent()}
                {renderFooter()}
            </View>
        </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  safeArea: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
    paddingTop: 20,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  content: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    gap: 20,
  },
});

export default PracticeRunnerContainer;
