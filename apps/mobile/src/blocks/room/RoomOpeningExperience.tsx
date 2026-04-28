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

import { Fonts } from "../../theme/fonts";
import type { RoomRenderV1 } from "./types";

interface Props {
  envelope: RoomRenderV1;
  onReveal?: () => void;
}

const RoomOpeningExperience: React.FC<Props> = ({ envelope, onReveal }) => {
  const { opening_line, second_beat_line, memory_echo_line } = envelope;

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
      {memory_echo_line ? (
        <Text style={styles.memoryEchoLine} testID="room_memory_echo_line">
          {memory_echo_line}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    // paddingVertical: 24,
    // paddingHorizontal: 24,
    // marginTop: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  openingLine: {
    fontFamily: Fonts.sans.bold,
    fontSize: 20,
    lineHeight: 28,
    textAlign: "center",
    color: "#432104",
    marginBottom: 8,
    paddingHorizontal: 24,
    // paddingVertical: 24,
  },
  secondBeat: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    color: "#432104",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  memoryEchoLine: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: "#8B6914",
    fontStyle: "italic",
    paddingHorizontal: 28,
    marginTop: 6,
    marginBottom: 4,
  },
});

export default RoomOpeningExperience;
