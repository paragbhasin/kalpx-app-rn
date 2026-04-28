import React, { useEffect, useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import { useScreenStore } from "../engine/useScreenBridge";

interface BaselineSliderBlockProps {
  block: {
    id: string;
    label: string;
    value: number;
    min?: number;
    max?: number;
  };
  textColor?: string;
}

const BaselineSliderBlock: React.FC<BaselineSliderBlockProps> = ({
  block,
  textColor,
}) => {
  const updateScreenData = useScreenStore((state) => state.updateScreenData);
  const min = block.min ?? 1;
  const max = block.max ?? 10;

  // Local state for immediate feedback during drag
  const [localValue, setLocalValue] = useState(block.value);
  const trackWidth = useRef(0);

  // Sync with prop changes if any
  useEffect(() => {
    setLocalValue(block.value);
  }, [block.value]);

  const updateValueFromGesture = (gestureX: number) => {
    if (trackWidth.current <= 0) return;

    let ratio = gestureX / trackWidth.current;
    ratio = Math.max(0, Math.min(1, ratio));

    const newValue = Math.round(min + (max - min) * ratio);
    if (newValue !== localValue) {
      setLocalValue(newValue);
      updateScreenData(block.label, newValue);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        updateValueFromGesture(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        updateValueFromGesture(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: (evt) => {
        updateValueFromGesture(evt.nativeEvent.locationX);
      },
    }),
  ).current;

  const percentage = ((localValue - min) / (max - min)) * 100;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, textColor ? { color: textColor } : null]}>
        {block.label}
      </Text>

      <View style={styles.sliderTrackContainer}>
        <Text style={styles.limitText}>Low</Text>
        <View
          style={styles.track}
          onLayout={(e) => {
            trackWidth.current = e.nativeEvent.layout.width;
          }}
          {...panResponder.panHandlers}
        >
          <View style={styles.trackLine} />
          <View style={[styles.activeTrack, { width: `${percentage}%` }]} />
          <View style={[styles.thumb, { left: `${percentage}%` }]}>
            <View style={styles.thumbInner} />
          </View>
        </View>
        <Text style={styles.limitText}>High</Text>
      </View>

      <Text style={[styles.valueText, textColor ? { color: textColor } : null]}>
        Current: {localValue} / {max}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  label: {
    fontSize: 20,
    fontFamily: "CormorantGaramond_700Bold",
    color: "#432104",
    marginBottom: 10,
  },
  sliderTrackContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 8,
  },
  track: {
    flex: 1,
    height: 40, // Larger hit area
    justifyContent: "center",
    position: "relative",
  },
  trackLine: {
    height: 3,
    backgroundColor: "#E7E0D2",
    borderRadius: 2,
    position: "absolute",
    left: 0,
    right: 0,
  },
  activeTrack: {
    height: 3,
    backgroundColor: "#D9B44A",
    borderRadius: 2,
    position: "absolute",
    left: 0,
  },
  thumb: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#D9B44A",
    marginLeft: -16,
    zIndex: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  thumbInner: {
    flex: 1,
  },
  limitText: {
    fontSize: 14,
    color: "#8c8881",
    fontFamily: "Inter_400Regular",
    minWidth: 35,
  },
  valueText: {
    textAlign: "center",
    fontSize: 16,
    color: "#432104",
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
});

export default BaselineSliderBlock;
