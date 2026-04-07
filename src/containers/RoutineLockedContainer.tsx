/**
 * RoutineLockedContainer — Shows locked routine summary after user seals practice.
 * Has locked state indicators. Background: cream (#fffdf9).
 */

import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';
import { Fonts } from '../theme/fonts';

interface RoutineLockedContainerProps {
  schema: any;
}

const RoutineLockedContainer: React.FC<RoutineLockedContainerProps> = ({ schema }) => {
  const { updateBackground, updateHeaderHidden } = useScreenStore();

  React.useEffect(() => {
    updateBackground(null);
    updateHeaderHidden(false);
  }, []);

  if (!schema) return null;

  const blocks = schema.blocks || [];
  const headerBlocks = blocks.filter((b: any) => b.position === 'header');
  const contentBlocks = blocks.filter((b: any) => !b.position || b.position === 'content');
  const footerBlocks = blocks.filter((b: any) => b.position === 'footer' || b.position === 'footer_actions');

  return (
    <View style={styles.container}>
      {/* Locked indicator banner */}
      <View style={styles.lockedBanner}>
        <Text style={styles.lockIcon}>{'\uD83D\uDD12'}</Text>
        <Text style={styles.lockedText}>Routine Sealed</Text>
      </View>

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

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf9',
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 168, 76, 0.2)',
  },
  lockIcon: {
    fontSize: 14,
  },
  lockedText: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#8b7a5e',
    fontWeight: '600',
    fontFamily: Fonts.sans.semiBold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
});

export default RoutineLockedContainer;
