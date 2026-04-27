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
import { useContentSlots, readMomentSlot } from "../hooks/useContentSlots";
import { useScreenStore } from "../engine/useScreenBridge";

const MorningBriefingBlock: React.FC<{ block?: any }> = () => {
  const { screenData } = useScreenStore();
  const ss = screenData as Record<string, any>;
  const [expanded, setExpanded] = useState(false);

  useContentSlots({
    momentId: "M_morning_briefing",
    screenDataKey: "morning_briefing",
    buildCtx: (s) => ({
      path: s.journey_path === "growth" ? "growth" : "support",
      guidance_mode: s.guidance_mode || "hybrid",
      locale: s.locale || "en",
      user_attention_state: "scanning",
      emotional_weight: "light",
      cycle_day: Number(s.day_number) || 0,
      entered_via: "dashboard_embed",
      stage_signals: {},
      today_layer: {},
      life_layer: {
        cycle_id: s.journey_id || s.cycle_id || "",
        life_kosha: s.life_kosha || s.scan_focus || "",
        scan_focus: s.scan_focus || "",
      },
    }),
  });
  const slot = (name: string) => readMomentSlot(ss, "morning_briefing", name);

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
                {expanded ? slot("transcript_hide_label") : slot("transcript_show_label")}
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
    backgroundColor: "#fffdf9",
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
    color: "#432104",
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
    color: "#6b5a45",
    marginTop: 8,
    lineHeight: 19,
  },
  audioWrap: { marginTop: 10 },
});

export default MorningBriefingBlock;
