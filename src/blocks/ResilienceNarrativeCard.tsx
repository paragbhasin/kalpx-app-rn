/**
 * ResilienceNarrativeCard — Mitra v3 Moment 26 (embedded resilience card).
 *
 * Spec: /Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/embedded_resilience_narrative_card.md
 * Web parity: kalpx-frontend/src/blocks/InsightBoxBlock.vue (embedded card
 *   pattern) and route_reflection_weekly.md §10 <ResilienceNarrativeSection>.
 *
 * Shown on the dashboard's weekly-slot AND inline within WeeklyReflectionBlock.
 * Source: GET /api/mitra/resilience-narrative/ via `fetch_resilience_narrative`
 * action. If the API 404s or returns null, we render a local template fallback
 * ("This week you showed up. That's the practice.") — NO empty state, no crash.
 *
 * Tone lint enforced at render time:
 *   - strip exclamation marks from narrative
 *   - refuse to render if narrative contains "great", "amazing", a digit-run
 *     that looks like a streak ("3 days"), or "!" — fall back to local text
 *   - inline "What helped most?" chip dispatches `submit_what_helped` which
 *     posts to gratitude-ledger with signal_type=what_held.
 *   - "Thanks for noticing" chip dispatches `ack_resilience_narrative`.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

const FALLBACK = {
  headline: "This week you showed up.",
  carried_summary:
    "Some of it was hard. Some of it held. Both are true, and both are yours to keep.",
  closing_beat: "That's the practice. I'm keeping track so you don't have to.",
};

// Tone-lint predicate. Returns true if the narrative passes; false if we should
// substitute the local fallback. Mirrors the backend tone-lint contract.
function passesToneLint(text: string): boolean {
  if (!text) return false;
  if (text.includes("!")) return false;
  const lowered = text.toLowerCase();
  const banned = [
    "great work",
    "amazing",
    "crushed",
    "awesome",
    "you did it",
    "keep it up",
  ];
  if (banned.some((b) => lowered.includes(b))) return false;
  // Streak-like counters ("3 days in a row", "5-day streak")
  if (/\b\d+\s*(?:day|days)\s*(?:in a row|streak)/i.test(text)) return false;
  if (/\bstreak\b/i.test(text)) return false;
  return true;
}

// Light sanitizer: remove stray exclamations if they sneak in.
function sanitize(text: string): string {
  if (!text) return text;
  return text.replace(/!+/g, ".").trim();
}

interface Props {
  block?: any;
}

const ResilienceNarrativeCard: React.FC<Props> = ({ block }) => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const ss = screenData as Record<string, any>;
  const embedded = block?.embedded === true;

  const narrative = ss.resilience_narrative;
  const acked = ss.resilience_narrative_acked === true;

  const [helpedText, setHelpedText] = useState("");
  const [helpedOpen, setHelpedOpen] = useState(false);
  const [helpedSubmitted, setHelpedSubmitted] = useState(false);

  // Kick off the fetch once per mount. The action is 404-tolerant.
  useEffect(() => {
    if (narrative === undefined) {
      executeAction(
        { type: "fetch_resilience_narrative", currentScreen },
        {
          loadScreen,
          goBack,
          setScreenValue: (value: any, key: string) =>
            store.dispatch(screenActions.setScreenValue({ key, value })),
          screenState: store.getState().screen.screenData,
        },
      );
    }
    // Run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolved = useMemo(() => {
    if (narrative && typeof narrative === "object") {
      const headline = sanitize(narrative.headline || "");
      const summary = sanitize(
        narrative.carried_summary || narrative.body || "",
      );
      const thread = sanitize(narrative.ongoing_thread_ack || "");
      const closing = sanitize(
        narrative.closing_beat || narrative.closing || "",
      );
      const combined = [headline, summary, thread, closing]
        .filter(Boolean)
        .join(" ");
      if (!passesToneLint(combined)) return { ...FALLBACK, from: "fallback" };
      return { headline, summary, thread, closing, from: "api" };
    }
    return { ...FALLBACK, from: "fallback" };
  }, [narrative]);

  if (acked && !embedded) {
    // Once acknowledged on the dashboard, collapse to a minimal marker.
    return (
      <View style={styles.marker}>
        <Text style={styles.markerText}>Held.</Text>
      </View>
    );
  }

  const onAck = async () => {
    await executeAction(
      { type: "ack_resilience_narrative", currentScreen },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    );
  };

  const onSubmitHelped = async () => {
    if (!helpedText.trim()) return;
    setHelpedSubmitted(true);
    await executeAction(
      {
        type: "submit_what_helped",
        payload: { text: helpedText.trim() },
        currentScreen,
      },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    );
  };

  return (
    <View style={[styles.card, embedded && styles.cardEmbedded]}>
      <Text style={styles.label}>WHAT'S GROWING</Text>
      {"headline" in resolved && (resolved as any).headline ? (
        <Text style={styles.headline}>{(resolved as any).headline}</Text>
      ) : null}
      {"summary" in resolved && (resolved as any).summary ? (
        <Text style={styles.body}>{(resolved as any).summary}</Text>
      ) : (
        <Text style={styles.body}>{FALLBACK.carried_summary}</Text>
      )}
      {(resolved as any).thread ? (
        <Text style={styles.thread}>{(resolved as any).thread}</Text>
      ) : null}
      {(resolved as any).closing ? (
        <Text style={styles.closing}>{(resolved as any).closing}</Text>
      ) : (
        <Text style={styles.closing}>{FALLBACK.closing_beat}</Text>
      )}

      {!helpedSubmitted ? (
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={onAck}
            style={styles.primaryChip}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryChipText}>Thanks for noticing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setHelpedOpen((v) => !v)}
            style={styles.secondaryChip}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryChipText}>What helped most?</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.helperAck}>Held. I'll remember.</Text>
      )}

      {helpedOpen && !helpedSubmitted ? (
        <View style={styles.helpedBox}>
          <TextInput
            value={helpedText}
            onChangeText={(v) => setHelpedText(v.slice(0, 240))}
            placeholder="One thing that helped…"
            placeholderTextColor="rgba(88, 58, 24, 0.4)"
            style={styles.helpedInput}
            maxLength={240}
            multiline
          />
          <TouchableOpacity
            onPress={onSubmitHelped}
            disabled={!helpedText.trim()}
            style={[
              styles.helpedSubmit,
              !helpedText.trim() && { opacity: 0.4 },
            ]}
            activeOpacity={0.85}
          >
            <Text style={styles.helpedSubmitText}>Hold it</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fffdf9",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(199, 166, 75, 0.35)",
    padding: 16,
    marginVertical: 10,
  },
  cardEmbedded: {
    backgroundColor: "rgba(255, 253, 245, 0.9)",
  },
  label: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: "#c9a84c",
    marginBottom: 8,
  },
  headline: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#432104",
    marginBottom: 8,
  },
  body: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#432104",
    lineHeight: 24,
    marginBottom: 8,
  },
  thread: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#6b5a45",
    marginBottom: 8,
  },
  closing: {
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    fontSize: 14,
    color: "#6b5a45",
    marginBottom: 12,
  },
  actionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  primaryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#c9a84c",
    borderRadius: 20,
  },
  primaryChipText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#432104",
  },
  secondaryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#c9a84c",
    borderRadius: 20,
    backgroundColor: "#fffdf9",
  },
  secondaryChipText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#432104",
  },
  helperAck: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#6b5a45",
    marginTop: 6,
  },
  helpedBox: { marginTop: 12 },
  helpedInput: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: "rgba(199, 166, 75, 0.4)",
    borderRadius: 10,
    padding: 10,
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
    backgroundColor: "#FFF8EF",
    marginBottom: 8,
    textAlignVertical: "top",
  },
  helpedSubmit: {
    alignSelf: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#c9a84c",
    borderRadius: 18,
  },
  helpedSubmitText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#432104",
  },
  marker: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "rgba(212,160,23,0.12)",
    borderRadius: 18,
    alignSelf: "flex-start",
    marginVertical: 6,
  },
  markerText: {
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    fontSize: 13,
    color: "#6b5a45",
  },
});

export default ResilienceNarrativeCard;
