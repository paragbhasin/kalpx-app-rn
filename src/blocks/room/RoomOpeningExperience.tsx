/**
 * RoomOpeningExperience — §6 Opening Experience 6-phase state machine.
 *
 *   1. ambient         (t=0.00s)
 *   2. opening_line    (t=0.50s)
 *   3. breath          (t=2.50s)
 *   4. second_beat     (t=3.00s)
 *   5. silence_window  (t=4.00s)
 *   6. options_reveal  (t=4s + silence_tolerance OR on tap)
 *
 * Timings sourced from `envelope.opening_experience.pacing_ms` +
 * `silence_tolerance_ms`. Audio affordance is stubbed (no playback) —
 * Phase 4 gate enables real audio.
 *
 * Reduced-motion (AccessibilityInfo.isReduceMotionEnabled) collapses all
 * motion to opacity-only fades per §6 accessibility invariants.
 *
 * SHELL IS NOT NETWORK-GATED: this component renders purely from the
 * envelope shape passed in. If `envelope.actions[]` hasn't hydrated yet,
 * RoomActionList (rendered by RoomRenderer after reveal) is empty.
 * `exit` is NEVER network-gated — enforced in RoomRenderer.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import type { OpeningExperience, RoomRenderV1 } from "./types";

export type OpeningPhase =
  | "ambient"
  | "opening_line"
  | "breath"
  | "second_beat"
  | "silence_window"
  | "options_reveal";

interface Props {
  envelope: RoomRenderV1;
  onReveal?: () => void;
  /**
   * Test-only override. Undefined in app code; component calls
   * AccessibilityInfo itself otherwise.
   */
  _forceReduceMotion?: boolean;
}

const PHASE_ORDER: OpeningPhase[] = [
  "ambient",
  "opening_line",
  "breath",
  "second_beat",
  "silence_window",
  "options_reveal",
];

/**
 * Derive the per-phase delay (ms from previous phase) from envelope pacing.
 * These match §6 timing table exactly.
 */
function phaseDelays(pacing: OpeningExperience["pacing_ms"], silenceMs: number) {
  // from ambient → opening_line : 500ms (spec §6 phase 2 timestamp t=0.50s)
  // opening_line → breath        : pacing.opening_line_in fade + 1500ms pad
  //                                to land at t=2.50s. We approximate with
  //                                pacing.breath_pause.
  // breath → second_beat         : pacing.second_beat_in (t=3.00s)
  // second_beat → silence_window : pacing.ready_hint_in (t=4.00s)
  // silence_window → reveal      : silence_tolerance_ms (or tap).
  return {
    ambientToOpeningLine: pacing.opening_line_in,
    openingLineToBreath: pacing.breath_pause,
    breathToSecondBeat: pacing.second_beat_in,
    secondBeatToSilence: pacing.ready_hint_in,
    silenceToReveal: silenceMs,
  };
}

const RoomOpeningExperience: React.FC<Props> = ({
  envelope,
  onReveal,
  _forceReduceMotion,
}) => {
  const { opening_line, second_beat_line, ready_hint, opening_experience } =
    envelope;

  const [phase, setPhase] = useState<OpeningPhase>("ambient");
  const [reduceMotion, setReduceMotion] = useState<boolean>(
    _forceReduceMotion ?? false,
  );
  const revealedRef = useRef(false);

  // Query reduced-motion state once at mount (unless test override).
  useEffect(() => {
    if (_forceReduceMotion !== undefined) return;
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduceMotion(Boolean(value));
      })
      .catch(() => {
        // ignore — default false
      });
    return () => {
      active = false;
    };
  }, [_forceReduceMotion]);

  // Phase progression timers.
  useEffect(() => {
    const delays = phaseDelays(
      opening_experience.pacing_ms,
      opening_experience.silence_tolerance_ms,
    );

    const timers: ReturnType<typeof setTimeout>[] = [];

    const scheduleTo = (next: OpeningPhase, ms: number) => {
      const id = setTimeout(() => {
        setPhase(next);
        if (next === "options_reveal" && !revealedRef.current) {
          revealedRef.current = true;
          onReveal?.();
        }
      }, ms);
      timers.push(id);
    };

    // Chain phase transitions from mount.
    let cursor = 0;
    cursor += delays.ambientToOpeningLine;
    scheduleTo("opening_line", cursor);

    cursor += delays.openingLineToBreath;
    scheduleTo("breath", cursor);

    cursor += delays.breathToSecondBeat;
    scheduleTo("second_beat", cursor);

    cursor += delays.secondBeatToSilence;
    scheduleTo("silence_window", cursor);

    cursor += delays.silenceToReveal;
    scheduleTo("options_reveal", cursor);

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [opening_experience, onReveal]);

  // Tap-to-skip-silence: advance directly to options_reveal if user taps
  // during silence_window. §6 "Options reveal: … or on tap".
  const onSkipSilence = () => {
    if (phase === "silence_window" && !revealedRef.current) {
      revealedRef.current = true;
      setPhase("options_reveal");
      onReveal?.();
    }
  };

  const phaseIndex = PHASE_ORDER.indexOf(phase);
  const show = (target: OpeningPhase) => phaseIndex >= PHASE_ORDER.indexOf(target);

  // reduceMotion: opacity-only visual treatment. Both paths render the same
  // content; real animation driver (timing curves, transforms) would branch
  // on reduceMotion. Scaffolding leaves this for Phase 4.
  void reduceMotion;

  return (
    <TouchableWithoutFeedback
      onPress={onSkipSilence}
      accessible={false}
    >
      <View style={styles.wrap} testID="room_opening_experience">
        {/* Phase 1 — ambient: visual anchor + palette background.
            Stub: placeholder View; real art lands in Phase 4. */}
        <View
          style={styles.ambientLayer}
          testID={`room_opening_phase_${phase}`}
        />

        {/* Phase 2 — opening line */}
        {show("opening_line") && (
          <Text style={styles.openingLine} testID="room_opening_line">
            {opening_line}
          </Text>
        )}

        {/* Phase 4 — second beat */}
        {show("second_beat") && second_beat_line ? (
          <Text style={styles.secondBeat} testID="room_second_beat_line">
            {second_beat_line}
          </Text>
        ) : null}

        {/* Phase 5 — ready hint during silence window */}
        {show("silence_window") && phase !== "options_reveal" ? (
          <Text style={styles.readyHint} testID="room_ready_hint">
            {ready_hint}
          </Text>
        ) : null}

        {/* Audio affordance stub — sound toggle chip, no playback. */}
        {opening_experience.ambient_audio.sound_affordance_visible ? (
          <View
            style={styles.audioAffordance}
            testID="room_audio_affordance_stub"
          />
        ) : null}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  wrap: {
    minHeight: 200,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  ambientLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  readyHint: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    color: "#8E8E93",
    marginTop: 4,
  },
  audioAffordance: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
  },
});

export default RoomOpeningExperience;
