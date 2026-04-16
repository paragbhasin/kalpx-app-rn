/**
 * CrisisRoomContainer — Phase T3A-3 safety surface.
 *
 * Renders the /api/mitra/crisis/ response payload. Always displays a
 * real crisis response (opening line, grounding anchor, breath pattern,
 * reach-out lines, regional hotlines). Read from Redux
 * screenData.crisis_payload populated by the open_crisis action in
 * actionExecutor.
 *
 * Design rules:
 *   - No questions. No probes. No "how does this feel?"
 *   - Hotline numbers are tap-to-dial (Linking).
 *   - If screenData.crisis_payload is null (e.g., server unreachable),
 *     render a local emergency fallback (call-112 / call-911) — the
 *     ONE place in the app where English hardcoded content is
 *     REQUIRED for safety. Sovereignty rule is explicitly waived here.
 */

import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useScreenStore } from '../engine/useScreenBridge';

type Hotline = {
  region: string;
  name: string;
  number: string;
  hours: string;
};

interface CrisisPayload {
  is_crisis?: boolean;
  tier?: string;
  severity?: number;
  opening_line?: string;
  grounding_anchor?: string;
  grounding_breath?: {
    title?: string;
    duration_min?: number;
    pattern?: { inhale?: number; hold?: number; exhale?: number };
  };
  reach_out?: string[];
  hotlines?: Hotline[];
  signals?: string[];
}

const LOCAL_FALLBACK: CrisisPayload = {
  opening_line: "I hear this is hard right now. Stay here.",
  grounding_anchor:
    "Feel your feet on the ground. Notice one thing you can see, one thing you can hear.",
  grounding_breath: {
    title: "Slow breath right now",
    duration_min: 1,
    pattern: { inhale: 4, hold: 7, exhale: 8 },
  },
  reach_out: [
    "Reach out to someone who is physically present — a family member, a neighbor, a friend.",
    "If you are in danger or thinking of harming yourself, call emergency services (112 in India, 911 in US).",
  ],
  hotlines: [
    { region: 'IN', name: 'iCall India', number: '+91-9152987821',
      hours: 'Mon-Sat 8am-10pm IST' },
    { region: 'IN', name: 'Vandrevala Foundation', number: '1860-2662-345',
      hours: '24/7' },
    { region: 'US', name: '988 Suicide & Crisis Lifeline', number: '988',
      hours: '24/7' },
    { region: 'UK', name: 'Samaritans', number: '116 123',
      hours: '24/7' },
  ],
};

const CrisisRoomContainer: React.FC = () => {
  const screenData = useScreenStore((s: any) => s.screen?.screenData) || {};
  const payloadFromRedux = screenData.crisis_payload as
    | CrisisPayload
    | null
    | undefined;

  // Sovereignty exemption — this is the single safety-critical surface
  // where blank UI is unacceptable. Local fallback copy is authored
  // above and audited via CrisisRoomContainer.
  const payload: CrisisPayload = payloadFromRedux || LOCAL_FALLBACK;

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number.replace(/[^0-9+]/g, '')}`);
  };

  const breath = payload.grounding_breath?.pattern;
  const breathStr = breath
    ? `${breath.inhale ?? 4} in · ${breath.hold ?? 7} hold · ${breath.exhale ?? 8} out`
    : '4 in · 7 hold · 8 out';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {payload.opening_line ? (
        <Text style={styles.opening}>{payload.opening_line}</Text>
      ) : null}

      {payload.grounding_anchor ? (
        <Text style={styles.anchor}>{payload.grounding_anchor}</Text>
      ) : null}

      <View style={styles.breathCard}>
        <Text style={styles.breathTitle}>
          {payload.grounding_breath?.title || 'Slow breath right now'}
        </Text>
        <Text style={styles.breathPattern}>{breathStr}</Text>
        <Text style={styles.breathDuration}>
          {(payload.grounding_breath?.duration_min ?? 1)} minute
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reach out</Text>
        {(payload.reach_out || []).map((line, i) => (
          <Text key={i} style={styles.reachOutLine}>
            • {line}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Crisis lines</Text>
        {(payload.hotlines || []).map((h) => (
          <TouchableOpacity
            key={`${h.region}-${h.number}`}
            style={styles.hotlineCard}
            onPress={() => handleCall(h.number)}
            accessibilityRole="button"
            accessibilityLabel={`Call ${h.name} at ${h.number}`}
          >
            <Text style={styles.hotlineName}>{h.name}</Text>
            <Text style={styles.hotlineNumber}>{h.number}</Text>
            <Text style={styles.hotlineHours}>{h.hours}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FDF8F4' },
  content: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 80 },
  opening: {
    fontSize: 22,
    lineHeight: 30,
    color: '#2C2419',
    marginBottom: 24,
    fontWeight: '500',
  },
  anchor: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5A4E3D',
    marginBottom: 28,
  },
  breathCard: {
    backgroundColor: '#F5EEE6',
    borderRadius: 14,
    padding: 20,
    marginBottom: 28,
  },
  breathTitle: { fontSize: 16, fontWeight: '600', color: '#2C2419', marginBottom: 6 },
  breathPattern: { fontSize: 20, color: '#2C2419', marginBottom: 4 },
  breathDuration: { fontSize: 13, color: '#8A7A62' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A7A62',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  reachOutLine: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3F3524',
    marginBottom: 10,
  },
  hotlineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EBE2D4',
  },
  hotlineName: { fontSize: 14, color: '#8A7A62', marginBottom: 4 },
  hotlineNumber: { fontSize: 18, color: '#2C2419', fontWeight: '600' },
  hotlineHours: { fontSize: 12, color: '#A39681', marginTop: 2 },
});

export default CrisisRoomContainer;
