/**
 * ComposerContainer — Onboarding composition screen.
 * Shows the user their selected focus + sub-focus + baseline results
 * before generating the companion.
 *
 * Simple ScrollView layout delegating all rendering to BlockRenderer.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';

interface ComposerContainerProps {
  schema: {
    blocks: any[];
    tone?: {
      theme?: string;
      mood?: string;
    };
  };
}

const ComposerContainer: React.FC<ComposerContainerProps> = ({ schema }) => {
  const { updateBackground, updateHeaderHidden } = useScreenStore();

  React.useEffect(() => {
    updateBackground(null);
    updateHeaderHidden(false);
  }, []);

  if (!schema) return null;

  const blocks = schema.blocks || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {blocks.map((block: any, index: number) => (
        <BlockRenderer key={block.id || `block-${block.type}-${index}`} block={block} />
      ))}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf9',
  },
  content: {
    padding: 24,
    paddingTop: 32,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default ComposerContainer;
