/**
 * DevToolsScreen — dev-only utility screen for setting X-Test-Now and other
 * test helpers. Add it to the drawer/nav only when __DEV__ is true.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../../theme/fonts";

const TEST_NOW_KEY = "@kalpx_test_now";

const PRESETS: { label: string; offsetDays: number }[] = [
  { label: "Now (clear)", offsetDays: 0 },
  { label: "+1 day", offsetDays: 1 },
  { label: "+3 days", offsetDays: 3 },
  { label: "+6 days", offsetDays: 6 },
  { label: "+7 days (Day 7 checkpoint)", offsetDays: 7 },
  { label: "+13 days", offsetDays: 13 },
  { label: "+14 days (Day 14 checkpoint)", offsetDays: 14 },
  { label: "+30 days (welcome back)", offsetDays: 30 },
];

export default function DevToolsScreen() {
  const [current, setCurrent] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");

  const refresh = async () => {
    const v = await AsyncStorage.getItem(TEST_NOW_KEY);
    setCurrent(v);
  };

  useEffect(() => {
    refresh();
  }, []);

  const setTo = async (iso: string | null) => {
    if (iso) {
      await AsyncStorage.setItem(TEST_NOW_KEY, iso);
    } else {
      await AsyncStorage.removeItem(TEST_NOW_KEY);
    }
    setCurrent(iso);
    Alert.alert(
      "X-Test-Now",
      iso ? `Set to ${iso}` : "Cleared (using real time)",
    );
  };

  const applyPreset = (offsetDays: number) => {
    if (offsetDays === 0) {
      setTo(null);
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setTo(d.toISOString());
  };

  const applyManual = () => {
    if (!manualInput.trim()) {
      setTo(null);
      return;
    }
    // Accept ISO strings or dates like "2026-05-15"
    let iso = manualInput.trim();
    if (!iso.includes("T")) iso = `${iso}T10:00:00Z`;
    const d = new Date(iso);
    if (isNaN(d.getTime())) {
      Alert.alert("Invalid date", "Use ISO format like 2026-05-15T10:00:00Z");
      return;
    }
    setTo(d.toISOString());
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dev Tools</Text>
      <Text style={styles.subtitle}>X-Test-Now header (time travel)</Text>

      <View style={styles.statusBox}>
        <Text style={styles.statusLabel}>Current:</Text>
        <Text style={styles.statusValue}>{current || "(real time)"}</Text>
      </View>

      <Text style={styles.sectionLabel}>Presets (offset from real now)</Text>
      <View style={styles.presetGrid}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.label}
            style={styles.presetBtn}
            onPress={() => applyPreset(p.offsetDays)}
          >
            <Text style={styles.presetText}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Manual (ISO date)</Text>
      <TextInput
        style={styles.input}
        placeholder="2026-05-15T10:00:00Z"
        value={manualInput}
        onChangeText={setManualInput}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity style={styles.applyBtn} onPress={applyManual}>
        <Text style={styles.applyText}>Apply</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearBtn} onPress={() => setTo(null)}>
        <Text style={styles.clearText}>Clear (use real time)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const GOLD = "#C9A84C";
const DARK = "#432104";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF7F2" },
  content: { padding: 24 },
  title: {
    fontSize: 26,
    fontFamily: Fonts.serif.bold,
    color: DARK,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: "#888",
    marginBottom: 18,
  },
  statusBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 22,
  },
  statusLabel: {
    fontSize: 12,
    color: "#888",
    fontFamily: Fonts.sans.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusValue: {
    fontSize: 14,
    color: DARK,
    fontFamily: Fonts.sans.regular,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 12,
    color: "#888",
    fontFamily: Fonts.sans.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 6,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22,
  },
  presetBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  presetText: {
    fontSize: 13,
    color: GOLD,
    fontFamily: Fonts.sans.semiBold,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    backgroundColor: "#fff",
    fontFamily: Fonts.sans.regular,
    marginBottom: 10,
  },
  applyBtn: {
    backgroundColor: GOLD,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 18,
  },
  applyText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: Fonts.sans.semiBold,
  },
  clearBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  clearText: {
    color: "#888",
    fontSize: 13,
    fontFamily: Fonts.sans.regular,
  },
});
