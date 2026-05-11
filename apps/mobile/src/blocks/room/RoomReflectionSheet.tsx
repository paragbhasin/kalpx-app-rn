/**
 * RoomReflectionSheet — S17-D4A post-recommended-action reflection (mobile).
 * "What shifted a little?" modal with room-specific options + next-step view.
 * Rendered by RoomContainer when show_room_reflection=true in screenData.
 */
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ROOM_REFLECTION_OPTIONS, ROOM_GUIDED_COPY, ROOM_COMPLETION_HEADER } from "@kalpx/contracts";
import type { VerifiedRoomId } from "@kalpx/types";
import { postRoomReflection, trackRoomTelemetry } from "../../engine/mitraApi";

interface Props {
  roomId: string;
  renderId?: string | null;
  tellMitraEventId?: string | number | null;
  onClose: () => void;
  onNavigateTellMitra: () => void;
  onReturnHome: () => void;
}

type Phase = "reflection" | "next_step";

const RoomReflectionSheet: React.FC<Props> = ({
  roomId,
  renderId,
  tellMitraEventId,
  onClose,
  onNavigateTellMitra,
  onReturnHome,
}) => {
  const [phase, setPhase] = useState<Phase>("reflection");
  const options = ROOM_REFLECTION_OPTIONS[roomId as VerifiedRoomId] ?? [];

  async function handleOption(code: string, isBridge: boolean) {
    void postRoomReflection(roomId, {
      response_code: code,
      render_id: renderId ?? null,
      tell_mitra_event_id: tellMitraEventId ?? null,
    });
    void trackRoomTelemetry({ event_type: 'reflection_submitted' as any, room_id: roomId, surface: 'room' });
    if (isBridge) {
      onNavigateTellMitra();
      return;
    }
    setPhase("next_step");
  }

  function handleNextStep(choice: string) {
    void trackRoomTelemetry({ event_type: 'next_step_selected' as any, room_id: roomId, surface: 'room' });
    switch (choice) {
      case "finish_here":  onClose(); break;
      case "tell_mitra":  onNavigateTellMitra(); break;
      case "return_home": onReturnHome(); break;
      default:            onClose();
    }
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          {phase === "reflection" ? (
            <>
              {ROOM_COMPLETION_HEADER[roomId as VerifiedRoomId] ? (
                <Text style={styles.completionHeader}>
                  {ROOM_COMPLETION_HEADER[roomId as VerifiedRoomId]}
                </Text>
              ) : null}
              <Text style={styles.prompt}>{ROOM_GUIDED_COPY.reflectionPrompt}</Text>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.code}
                  style={[styles.option, opt.is_tell_mitra_bridge && styles.optionBridge]}
                  onPress={() => handleOption(opt.code, !!opt.is_tell_mitra_bridge)}
                  activeOpacity={0.85}
                  testID={`reflection_option_${opt.code}`}
                >
                  <Text style={[styles.optionText, opt.is_tell_mitra_bridge && styles.optionTextBridge]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              <Text style={styles.nextStepIntro}>
                You can stay, continue, or come back when you're ready.
              </Text>
              {[
                { key: "finish_here",  label: ROOM_GUIDED_COPY.nextStep.finishHere },
                { key: "tell_mitra",   label: ROOM_GUIDED_COPY.nextStep.tellMitraMore },
                { key: "return_home",  label: ROOM_GUIDED_COPY.nextStep.returnHome },
              ].map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={styles.option}
                  onPress={() => handleNextStep(key)}
                  activeOpacity={0.85}
                  testID={`next_step_${key}`}
                >
                  <Text style={styles.optionText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(30,20,10,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFF8EF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  completionHeader: {
    fontSize: 14,
    color: "#8A7968",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 10,
    fontStyle: "italic",
  },
  prompt: {
    fontSize: 16,
    fontWeight: "600",
    color: "#432104",
    textAlign: "center",
    marginBottom: 20,
  },
  nextStepIntro: {
    fontSize: 14,
    color: "#8A7968",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  option: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(200,180,154,0.5)",
    marginBottom: 10,
    backgroundColor: "rgba(255,251,244,0.8)",
  },
  optionBridge: { backgroundColor: "transparent" },
  optionText: { fontSize: 14, color: "#432104" },
  optionTextBridge: { color: "#8B6914", fontStyle: "italic" },
});

export default RoomReflectionSheet;
