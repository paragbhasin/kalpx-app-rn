/**
 * TellMitraScreen — Screen wrapper around TellMitraContainer.
 *
 * Standalone screen for "I want to tell Mitra" CTA paths (e.g. from QuickReset).
 */

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TellMitraContainer from "../../containers/TellMitraContainer";
import { useScreenStore } from "../../engine/useScreenBridge";
import { Fonts } from "../../theme/fonts";
import { sfs } from "../../utils/responsive";

export default function TellMitraScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const updateHeaderHidden = useScreenStore(
    (state: any) => state.updateHeaderHidden,
  );
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);

  // When the keyboard is up, hide the app's KalpX top bar to reclaim space and
  // surface a compact back arrow next to the "Tell Mitra" title instead.
  React.useEffect(() => {
    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const onShow = Keyboard.addListener(showEvt, () => {
      setKeyboardOpen(true);
      updateHeaderHidden?.(true);
    });
    const onHide = Keyboard.addListener(hideEvt, () => {
      setKeyboardOpen(false);
      updateHeaderHidden?.(false);
    });
    return () => {
      onShow.remove();
      onHide.remove();
      updateHeaderHidden?.(false);
    };
  }, [updateHeaderHidden]);

  const handleBack = () => {
    Keyboard.dismiss();
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View style={[styles.root, { backgroundColor: "#FAF7F2" }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {keyboardOpen && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={24} color="#432104" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{t("tellMitraThread.title")}</Text>
        </View>
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backBtn: {
    marginLeft: -4,
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
    paddingBottom: 0,
    backgroundColor: "#FAF7F2",
  },
});
