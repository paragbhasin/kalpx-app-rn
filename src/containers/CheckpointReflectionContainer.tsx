/**
 * CheckpointReflectionContainer
 *
 * Thin pass-through container for Day 7 / Day 14 checkpoint reflection.
 * Renders CycleReflectionBlock directly — the block owns its own background,
 * header state, and all UI logic. No interference from CycleTransitionsContainer.
 *
 * Routed via:
 *   containerId: "checkpoint_reflection"
 *   stateId:     "day_7" | "day_14"
 *
 * The stateId is available in currentStateId but CycleReflectionBlock detects
 * the cycle from screenData (day_number / checkpoint_day_7 / checkpoint_day_14).
 */

import React from "react";
import { StyleSheet, View } from "react-native";
import CycleReflectionBlock from "../blocks/CycleReflectionBlock";

interface CheckpointReflectionContainerProps {
  schema?: any;
}

const CheckpointReflectionContainer: React.FC<
  CheckpointReflectionContainerProps
> = () => {
  return (
    <View style={styles.root}>
      <CycleReflectionBlock />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default CheckpointReflectionContainer;
