/**
 * ReflectionEveningContainer — Mitra v3 Moment 34 route container.
 *
 * Spec: /Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_reflection_evening.md
 * Web parity: kalpx-frontend/src/containers/CycleTransitionsContainer.vue
 *   daily_reflection state + ScreenRenderer.vue generic routing.
 *
 * Light-weight single-turn render. Evening reflection is itself a single
 * block (EveningReflectionBlock) that owns its internal state; the
 * container just provides the cream backdrop and keyboard-safe frame.
 */

import React from "react";
import { StyleSheet, View } from "react-native";
import BlockRenderer from "../engine/BlockRenderer";

interface Props {
  schema: any;
}

const ReflectionEveningContainer: React.FC<Props> = ({ schema }) => {
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

export default ReflectionEveningContainer;
