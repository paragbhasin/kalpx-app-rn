/**
 * RoutineBuilderContainer — Routine depth selection screen.
 * Renders choice_card blocks for gentle / standard / deep depth selection.
 *
 * Simple ScrollView layout delegating all rendering to BlockRenderer.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';

interface RoutineBuilderContainerProps {
  schema: {
    blocks: any[];
    tone?: {
      theme?: string;
      mood?: string;
    };
  };
}

const RoutineBuilderContainer: React.FC<RoutineBuilderContainerProps> = ({ schema }) => {
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
        <BlockRenderer key={`${block.type}-${index}`} block={block} />
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

export default RoutineBuilderContainer;
