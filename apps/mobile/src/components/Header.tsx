import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { ENABLED_LOCALES } from "../config/i18n";
import { mitraJourneyDailyView, mitraJourneyHomeV3, invalidateHomeV3Cache } from "../engine/mitraApi";
import { ingestDailyView } from "../engine/v3Ingest";
import { screenActions } from "../store/screenSlice";
import Colors from "./Colors";
interface HeaderProps {
  isTransparent?: boolean;
  backgroundColor?: string;
}

const Header: React.FC<HeaderProps> = ({ isTransparent, backgroundColor }) => {
  const navigation = useNavigation<any>();
  const { i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const dispatch = useDispatch<any>();
  const runnerActiveItem = useSelector((state: RootState) => (state.screen as any).screenData?.runner_active_item ?? null);
  const [selectedLang, setSelectedLang] = useState(i18n.language);

  const ALL_LANGUAGES = [
    { label: "English", value: "en" },
    { label: "हिन्दी", value: "hi" },
    { label: "ગુજરાતી", value: "gu" },
    { label: "मराठी", value: "mr" },
    { label: "বাংলা", value: "bn" },
    { label: "ಕನ್ನಡ", value: "kn" },
    { label: "മലയാളം", value: "ml" },
    { label: "தமிழ்", value: "ta" },
    { label: "తెలుగు", value: "te" },
  ];

  const languages = ALL_LANGUAGES.filter((l) => ENABLED_LOCALES.includes(l.value));

  const changeLanguage = (code: string) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
    AsyncStorage.setItem("kalpx_locale", code).catch(() => {});
    invalidateHomeV3Cache();
    mitraJourneyHomeV3({ forceFresh: true, locale: code }).catch(() => {});
    // Re-fetch daily-view content with new locale so runner_active_item
    // and triad data reflect the selected language immediately.
    mitraJourneyDailyView(null, code).then((result) => {
      if (!result?.envelope) return;
      const flat = ingestDailyView(result.envelope);
      for (const [k, v] of Object.entries(flat)) {
        if (v !== undefined) {
          dispatch(screenActions.setScreenValue({ key: k, value: v }));
        }
      }
      // If a runner item is active, refresh it with new-locale data from triad
      const triad: any[] = (result.envelope as any)?.today?.triad || [];
      if (runnerActiveItem?.item_id && triad.length > 0) {
        const match = triad.find((t: any) => t.item_id === runnerActiveItem.item_id);
        if (match) {
          dispatch(screenActions.setScreenValue({
            key: "runner_active_item",
            value: { ...runnerActiveItem, ...match },
          }));
        }
      }
    }).catch(() => {});
  };

  useEffect(() => {
    setSelectedLang(i18n.language);
  }, [i18n.language]);

  const goHome = () => {
    navigation.navigate("AppDrawer", {
      screen: "HomePage",
      params: {
        screen: "HomePage",
        params: {
          screen: "Home",
        },
      },
    });
  };

  return (
    <View
      style={[
        styles.sectionWrap,
        backgroundColor ? { backgroundColor } : null,
        isTransparent && { backgroundColor: "transparent" },
      ]}
    >
      {/* Left logo */}
      <TouchableOpacity
        onPress={goHome}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Go to Home"
      >
        <Image
          source={require("../../assets/KalpXlogo.png")}
          resizeMode="contain"
          style={[styles.logo, isTablet && { width: 148, height: 54 }]}
        />
      </TouchableOpacity>

      {/* Language Dropdown — hidden for now */}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionWrap: {
    backgroundColor: Colors.Colors.header_bg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  logo: {
    width: 100,
    height: 38,
  },
  dropdownContainer: {
    width: 110,
    justifyContent: "center",
  },
  dropdownListContainer: {
    width: 130,
    borderRadius: 8,
    borderColor: "#CA8A04",
    borderWidth: 0.8,
    backgroundColor: "#FDF8EE",
  },
  dropdown: {
    height: 28,
    borderColor: "#CA8A04",
    borderWidth: 0.8,
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: "transparent",
  },
  selectedText: {
    color: "#7A5C1E",
    fontSize: 13,
    fontWeight: "500",
  },
  placeholder: {
    color: "#CA8A04",
    fontSize: 13,
  },
  itemText: {
    fontSize: 14,
    color: "#7A5C1E",
  },
  dropdownItemText: {
    color: "#7A5C1E",
    fontSize: 14,
  },
});

export default Header;
