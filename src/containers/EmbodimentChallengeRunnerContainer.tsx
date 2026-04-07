/**
 * EmbodimentChallengeRunnerContainer — Runner for embodiment challenge flows.
 * Similar to PracticeRunnerContainer but dedicated to challenge-type practices.
 *
 * Uses header/content/footer layout with centered content area for timer
 * and progress blocks. Delegates all rendering to BlockRenderer.
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';
import Header from '../components/Header';

interface EmbodimentChallengeRunnerContainerProps {
  schema: {
    container_id?: string;
    blocks: any[];
    tone?: {
      theme?: string;
      mood?: string;
    };
    variant?: string;
  };
}

const EmbodimentChallengeRunnerContainer: React.FC<EmbodimentChallengeRunnerContainerProps> = ({ schema }) => {
  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore((state) => state.updateHeaderHidden);

  React.useEffect(() => {
    updateBackground(null);
    updateHeaderHidden(true);
  }, []);

  if (!schema) return null;

  const blocks = schema.blocks || [];
  const headerBlocks = blocks.filter((b: any) => b.position === 'header');
  const contentBlocks = blocks.filter((b: any) => !b.position || b.position === 'content');
  const footerBlocks = blocks.filter((b: any) => b.position === 'footer');

  return (
    <View style={styles.container}>
      <Header isTransparent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.inner}>
          {/* Header */}
          <View style={styles.header}>
            {headerBlocks.map((block: any, idx: number) => (
              <BlockRenderer key={`header-${idx}`} block={block} />
            ))}
          </View>

          {/* Content — centered for timer/progress blocks */}
          <View style={styles.content}>
            {contentBlocks.map((block: any, idx: number) => (
              <BlockRenderer key={`content-${idx}`} block={block} />
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {footerBlocks.map((block: any, idx: number) => (
              <BlockRenderer key={`footer-${idx}`} block={block} />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf9',
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

export default EmbodimentChallengeRunnerContainer;
