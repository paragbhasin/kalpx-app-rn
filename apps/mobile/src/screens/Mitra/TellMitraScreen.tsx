/**
 * TellMitraScreen — Screen wrapper around TellMitraContainer.
 *
 * Standalone screen for "I want to tell Mitra" CTA paths (e.g. from QuickReset).
 */

import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import TellMitraContainer from "../../containers/TellMitraContainer";
import { Fonts } from "../../theme/fonts";

export default function TellMitraScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tell Mitra</Text>
      </View>
      <View style={styles.body}>
        <TellMitraContainer />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#DAC28E",
    backgroundColor: "#FAF7F2",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    fontWeight: "700",
  },
  body: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FAF7F2",
  },
});
