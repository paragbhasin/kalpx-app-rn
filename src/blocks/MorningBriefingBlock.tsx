/**
 * MorningBriefingBlock — Mitra v3 Dashboard (Moments 8-11, 40, 41, 43)
 *
 * Renders the morning briefing card: gold play button + Mitra's opening line
 * (Cormorant serif, max 2 lines) with a "Show transcript" expand.
 * Returns null if no briefing is available for today.
 *
 * Web parity:
 *   - Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_dashboard_day_active.md §1, §2 "Briefing card"
 *   - Data source: GET /api/mitra/briefing/today/ (fields: audio_url, script, voice_preset, duration_ms)
 *   - Dashboard slot: kalpx-frontend/src/mock/mock/allContainers.js line 201 (day_active blocks)
 *
 * Reads from screenData:
 *   briefing_available:boolean, briefing_audio_url:string,
 *   briefing_transcript:string, briefing_summary:string, briefing_voice_preset:string
 */

import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AudioPlayerBlock from "./AudioPlayerBlock";
import { Fonts } from "../theme/fonts";
import { useScreenStore } from "../engine/useScreenBridge";

const MorningBriefingBlock: React.FC<{ block?: any }> = () => {
  const { screenData } = useScreenStore();
  const ss = screenData as Record<string, any>;
  const [expanded, setExpanded] = useState(false);

  const available = !!ss.briefing_available;
  const audioUrl = ss.briefing_audio_url || "";
  const transcript = ss.briefing_transcript || "";
  const summary = ss.briefing_summary || ss.briefing_opening_line || "";

  if (!available && !audioUrl && !summary) return null;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.textWrap}>
          {!!summary && (
            <Text style={styles.line} numberOfLines={expanded ? undefined : 2}>
              {summary}
            </Text>
          )}
          {!!transcript && (
            <TouchableOpacity onPress={() => setExpanded((v) => !v)}>
              <Text style={styles.link}>
                {expanded ? "Hide transcript" : "Show transcript"}
              </Text>
            </TouchableOpacity>
          )}
          {expanded && !!transcript && (
            <Text style={styles.transcript}>{transcript}</Text>
          )}
        </View>
      </View>
      {!!audioUrl && (
        <View style={styles.audioWrap}>
          <AudioPlayerBlock block={{ audio_url: audioUrl, label: "Play briefing" }} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fffdf5",
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#eddeb4",
    padding: 14,
    marginVertical: 10,
  },
  row: { flexDirection: "row", alignItems: "flex-start" },
  textWrap: { flex: 1 },
  line: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    lineHeight: 24,
    color: "#3a2b12",
  },
  link: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#8b6914",
    marginTop: 6,
  },
  transcript: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#5a4a2a",
    marginTop: 8,
    lineHeight: 19,
  },
  audioWrap: { marginTop: 10 },
});

export default MorningBriefingBlock;
