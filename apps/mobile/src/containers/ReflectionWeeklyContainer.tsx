/**
 * ReflectionWeeklyContainer — Mitra v3 Moment 23 route container.
 *
 * Spec: /Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_reflection_weekly.md
 * Web parity: kalpx-frontend/src/containers/CycleTransitionsContainer.vue
 *   (reflection layout) and src/engine/ScreenRenderer.vue container routing.
 *
 * Single-route render. Delegates block rendering to BlockRenderer, with a
 * safe-area top and a neutral cream backdrop consistent with the letter's
 * reading tone.
 *
 * REG-016: child block (WeeklyReflectionBlock) is itself responsible for its
 * bottom thumb-zone CTA placement; container simply provides a
 * keyboard-aware full-height frame.
 */

import React from "react";
import { StyleSheet, View } from "react-native";
import BlockRenderer from "../engine/BlockRenderer";

interface Props {
  schema: any;
}

const ReflectionWeeklyContainer: React.FC<Props> = ({ schema }) => {
  return (
    <View style={styles.root}>
      {schema.blocks?.map((block: any, idx: number) => (
        <BlockRenderer
          key={block.id || `${block.type}-${idx}`}
          block={block}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fdf9ee" },
});

export default ReflectionWeeklyContainer;
