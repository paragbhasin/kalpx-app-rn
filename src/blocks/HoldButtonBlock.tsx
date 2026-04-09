/**
 * HoldButtonBlock — Button that requires hold-to-confirm.
 * Simpler than HoldTriggerBlock: linear progress bar instead of circular SVG.
 */

import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import { Fonts } from "../theme/fonts";

interface HoldButtonBlockProps {
  block: {
    label?: string;
    hold_duration?: number;
    action?: any;
    on_complete?: any;
    style?: any;
  };
}

const HoldButtonBlock: React.FC<HoldButtonBlockProps> = ({ block }) => {
  const {
    screenData: screenState,
    loadScreen,
    goBack,
    currentScreen,
  } = useScreenStore();
  const duration = block.hold_duration || 2000;

  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startHold = () => {
    if (isComplete) return;
    setIsHolding(true);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(p);

      if (p >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setIsComplete(true);
        setIsHolding(false);

        const action = block.on_complete || block.action;
        if (action) {
          executeAction(action, {
            loadScreen,
            goBack,
            setScreenValue: (value: any, key: string) => {
              const { screenActions } = require("../store/screenSlice");
              const { store } = require("../store");
              store.dispatch(screenActions.setScreenValue({ key, value }));
            },
            screenState: { ...screenState },
          }).catch((err: any) =>
            console.error("[HoldButtonBlock] Action failed:", err),
          );
        }
      }
    }, 16);
  };

  const stopHold = () => {
    setIsHolding(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (progress < 100) {
      setProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const labelText = isComplete
    ? "Confirmed"
    : isHolding
      ? "Hold..."
      : block.label || "Hold to Confirm";

  return (
    <View style={[styles.container, block?.style]}>
      <View
        style={[styles.button, isComplete && styles.buttonComplete]}
        onTouchStart={startHold}
        onTouchEnd={stopHold}
        onTouchCancel={stopHold}
      >
        {/* Progress fill */}
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
        <Text style={[styles.label, isComplete && styles.labelComplete]}>
          {labelText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "93%",
    alignSelf: "center",
    marginVertical: 12,
  },
  button: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(201, 168, 76, 0.15)",
    borderWidth: 1,
    borderColor: "#C9A84C",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  buttonComplete: {
    backgroundColor: "rgba(201, 168, 76, 0.3)",
    borderColor: "#C9A84C",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(201, 168, 76, 0.25)",
    borderRadius: 26,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F3F3F4",
    fontFamily: Fonts.sans.semiBold,
    textTransform: "uppercase",
    letterSpacing: 1,
    zIndex: 1,
  },
  labelComplete: {
    color: "#432104",
  },
});

export default HoldButtonBlock;
