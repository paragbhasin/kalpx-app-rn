/**
 * WhyThisL3Sheet — Moment 37 (Why-This Level 3 deeper sheet).
 *
 * Renders the source citation: Sanskrit (Noto Sans Devanagari), transliteration
 * (Inter italic), English translation (Inter), and attribution. Scrollable.
 *
 * Web parity:
 *   - Spec: docs/specs/mitra-v3-experience/screens/overlay_why_this_level_3.md
 *   - Data source: GET /api/mitra/principles/{id}/sources/
 *   - Devanagari rendering: font `NotoSansDevanagari_400Regular` loaded in App.jsx.
 *     Fallback: platform Devanagari system font — never tofu.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Fonts } from "../theme/fonts";
import { useScreenStore } from "../engine/useScreenBridge";

const WhyThisL3Sheet: React.FC<{ block?: any }> = () => {
  const { screenData, goBack } = useScreenStore();
  const src = (screenData as any).why_this_source;

  if (!src) {
    return (
      <View style={styles.sheet}>
        <Text style={styles.english}>
          The source text isn't available right now.
        </Text>
        <TouchableOpacity
          style={styles.dismissPill}
          onPress={() => goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.dismissText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <Text style={styles.label}>SOURCE</Text>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {src.sanskrit ? (
          <Text
            style={styles.sanskrit}
            accessibilityLabel="Sanskrit source"
            testID="why-this-l3-sanskrit"
          >
            {src.sanskrit}
          </Text>
        ) : null}

        {src.transliteration ? (
          <Text style={styles.translit}>{src.transliteration}</Text>
        ) : null}

        {src.translation || src.english ? (
          <Text style={styles.english}>{src.translation || src.english}</Text>
        ) : null}

        {src.attribution || src.source ? (
          <Text style={styles.attribution}>— {src.attribution || src.source}</Text>
        ) : null}
      </ScrollView>

      <TouchableOpacity
        style={styles.dismissPill}
        onPress={() => goBack()}
        accessibilityLabel="Back"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.dismissText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: "#fffdf9",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 22,
    paddingTop: 12,
    flex: 1,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d9cfb8",
    marginBottom: 16,
  },
  label: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: "#8b7a55",
    marginBottom: 12,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  sanskrit: {
    fontFamily: Fonts.devanagari.regular,
    fontSize: 22,
    lineHeight: 34,
    color: "#432104",
    marginBottom: 14,
  },
  translit: {
    fontFamily: Fonts.sans.regular,
    fontStyle: "italic",
    fontSize: 15,
    color: "#6a5830",
    lineHeight: 22,
    marginBottom: 14,
  },
  english: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#432104",
    lineHeight: 23,
    marginBottom: 16,
  },
  attribution: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#8b7a55",
    marginTop: 10,
  },
  dismissPill: {
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#d9cfb8",
    minWidth: 120,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  dismissText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#6b5a45",
  },
});

export default WhyThisL3Sheet;
