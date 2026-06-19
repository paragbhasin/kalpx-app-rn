/**
 * TellMitraScreen — Screen wrapper around TellMitraContainer.
 *
 * Standalone screen for "I want to tell Mitra" CTA paths (e.g. from QuickReset).
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import TellMitraContainer from "../../containers/TellMitraContainer";
import { Fonts } from "../../theme/fonts";
import { sfs } from "../../utils/responsive";

export default function TellMitraScreen() {
  const { t } = useTranslation();

  // Keyboard avoidance is handled inside TellMitraThreadView (self-correcting
  // inset), so this wrapper stays a plain View to avoid double-padding.
  return (
    <View style={[styles.root, { backgroundColor: '#FAF7F2' }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("tellMitraThread.title")}</Text>
      </View>
      <View style={styles.body}>
        <TellMitraContainer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
    fontSize: sfs(22),
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
