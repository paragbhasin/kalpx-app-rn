/**
 * RoomOpeningExperience — opening surface for v3.1 canonical rooms.
 *
 * Renders opening_line and second_beat_line immediately on mount. No phases,
 * no timers, no staggered motion. onReveal() is called synchronously in the
 * first effect so RoomActionList is never gated.
 *
 * ready_hint is intentionally not rendered — it was authored for a
 * silence-window prompt ("Tap when ready") that no longer exists.
 */

import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { RoomRenderV1 } from "./types";

interface Props {
  envelope: RoomRenderV1;
  onReveal?: () => void;
}

const RoomOpeningExperience: React.FC<Props> = ({ envelope, onReveal }) => {
  const { opening_line, second_beat_line } = envelope;

  useEffect(() => {
    onReveal?.();
    // Intentional: fire once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.wrap} testID="room_opening_experience">
      <Text style={styles.openingLine} testID="room_opening_line">
        {opening_line}
      </Text>
      {second_beat_line ? (
        <Text style={styles.secondBeat} testID="room_second_beat_line">
          {second_beat_line}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  openingLine: {
    fontSize: 20,
    lineHeight: 28,
    textAlign: "center",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  secondBeat: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    color: "#4A4A4A",
    marginBottom: 12,
  },
});

export default RoomOpeningExperience;
