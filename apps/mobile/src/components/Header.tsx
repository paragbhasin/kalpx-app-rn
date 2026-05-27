import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { ENABLED_LOCALES } from "../config/i18n";
import { mitraJourneyDailyView } from "../engine/mitraApi";
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
          style={styles.logo}
        />
      </TouchableOpacity>

      {/* Language Dropdown */}
      <View style={styles.dropdownContainer}>
        <Dropdown
          selectedTextProps={{ allowFontScaling: false }}
          data={languages}
          labelField="label"
          valueField="value"
          placeholder="Language"
          value={selectedLang}
          onChange={(val) => changeLanguage(val.value)}
          style={styles.dropdown}
          selectedTextStyle={styles.selectedText}
          placeholderStyle={styles.placeholder}
          itemTextStyle={styles.itemText}
          maxHeight={130}
          containerStyle={styles.dropdownListContainer}
        />
      </View>
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
    width: 120,
    justifyContent: "center",
  },
  dropdownListContainer: {
    width: 140,
    borderRadius: 8,
  },
  dropdown: {
    height: 30, // reduced from 32 ➜ smaller height
    borderColor: "#BDC4CD",
    borderWidth: 0.6,
    borderRadius: 6,
    paddingHorizontal: 6,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  selectedText: {
    color: "#000000",
    fontSize: 14, // smaller text for compact fit
  },
  placeholder: {
    color: "#96A0AD",
    fontSize: 14,
  },
  itemText: {
    fontSize: 14,
    color: "#000",
  },
  dropdownItemText: {
    color: "#000000", // color of list items
    fontSize: 16,
  },
});

export default Header;
