/**
 * AwarenessTriggerContainer — Dedicated container for trigger flow screens.
 * Handles: sensory_grounding, trigger_reflection, trigger_advice_reveal, trigger_recheck.
 *
 * Replaces the previous mapping to PracticeRunnerContainer with a purpose-built
 * layout: header/content/footer sections on a cream background.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';

interface AwarenessTriggerContainerProps {
  schema: {
    blocks: any[];
    tone?: {
      theme?: string;
      mood?: string;
    };
  };
}

const AwarenessTriggerContainer: React.FC<AwarenessTriggerContainerProps> = ({ schema }) => {
  const { updateBackground, updateHeaderHidden } = useScreenStore();

  React.useEffect(() => {
    updateBackground(null);
    updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  if (!schema) return null;

  const blocks = schema.blocks || [];
  const headerBlocks = blocks.filter((b: any) => b.position === 'header');
  const contentBlocks = blocks.filter((b: any) => !b.position || b.position === 'content');
  const footerBlocks = blocks.filter((b: any) => b.position === 'footer' || b.position === 'footer_actions');
  const pageBottomBlocks = blocks.filter((b: any) => b.position === 'page_bottom');

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header blocks */}
        {headerBlocks.length > 0 && (
          <View style={styles.header}>
            {headerBlocks.map((block: any, i: number) => (
              <BlockRenderer key={`h-${i}`} block={block} />
            ))}
          </View>
        )}

        {/* Content blocks */}
        <View style={styles.content}>
          {contentBlocks.map((block: any, i: number) => (
            <BlockRenderer key={`c-${i}`} block={block} />
          ))}
        </View>

        {/* Footer action buttons */}
        {footerBlocks.length > 0 && (
          <View style={styles.footer}>
            {footerBlocks.map((block: any, i: number) => (
              <BlockRenderer key={`f-${i}`} block={block} />
            ))}
          </View>
        )}

        {/* Page bottom blocks */}
        {pageBottomBlocks.length > 0 && (
          <View style={styles.pageBottom}>
            {pageBottomBlocks.map((block: any, i: number) => (
              <BlockRenderer key={`pb-${i}`} block={block} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf9',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  content: {
    marginBottom: 24,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
    gap: 12,
  },
  pageBottom: {
    marginTop: 24,
    alignItems: 'center',
    paddingBottom: 20,
  },
});

export default AwarenessTriggerContainer;
