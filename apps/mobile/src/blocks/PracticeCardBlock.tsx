import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import { Fonts } from "../theme/fonts";

interface PracticeCardBlockProps {
  block: {
    type: "practice_card";
    label?: string;
    title?: string;
    description?: string;
    meta?: string;
    icon?: string;
    id?: string;
    detailData?: any;
    info_action?: any;
    action?: any;
    start_action?: any;
    is_complete?: boolean;
  };
}

const PRACTICE_ICON_MAP: Record<string, any> = {
  practice_chant: require("../../assets/dash_mantra.png"),
  practice_embody: require("../../assets/dash_sankalp.png"),
  practice_act: require("../../assets/dash_action.png"),
};

const PracticeCardBlock: React.FC<PracticeCardBlockProps> = ({ block }) => {
  const {
    loadScreen,
    goBack,
    screenData: screenState,
    currentScreen,
  } = useScreenStore();

  const handleCardPress = async () => {
    const action = block.info_action || block.action;
    if (!action) return;
    try {
      await executeAction(
        { ...action, currentScreen },
        {
          loadScreen,
          goBack,
          setScreenValue: (value: any, key: string) => {
            const { screenActions } = require("../store/screenSlice");
            const { store } = require("../store");
            store.dispatch(screenActions.setScreenValue({ key, value }));
          },
          screenState: { ...screenState },
        },
      );
    } catch (err) {
      console.error("[PracticeCardBlock] Action failed:", err);
    }
  };

  const practiceIcon = block.id ? PRACTICE_ICON_MAP[block.id] : null;
  const isComplete = block.is_complete;

  return (
    <TouchableOpacity
      style={[styles.card, isComplete && styles.cardComplete]}
      onPress={handleCardPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconWrap}>
        {practiceIcon ? (
          <Image source={practiceIcon} style={styles.practiceIcon} />
        ) : (
          <Ionicons
            name="flower-outline"
            size={24}
            color={isComplete ? "#10b981" : "#D4A017"}
          />
        )}
      </View>
      <View style={styles.textWrap}>
        {block.label && <Text style={styles.label}>{block.label}</Text>}
        <Text style={[styles.title, isComplete && styles.titleComplete]}>
          {block.title}
        </Text>
        {block.description && (
          <Text style={styles.description} numberOfLines={2}>
            {block.description}
          </Text>
        )}
        {block.meta && <Text style={styles.meta}>{block.meta}</Text>}
      </View>
      <View style={styles.arrowWrap}>
        {isComplete ? (
          <Ionicons name="checkmark-circle" size={22} color="#10b981" />
        ) : (
          <Ionicons name="chevron-forward" size={18} color="#bfa58a" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: '#FFFFFF',

    marginVertical: 6,

    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#d0902d",
    borderRadius: 20,
    padding: 10,

    // Outer shadow approximation
    shadowColor: "#d0902d",
    shadowOffset: {
      width: 2,
      height: 2,
    },
  },

  cardComplete: {
    borderColor: "rgba(16, 185, 129, 0.3)",
    backgroundColor: "rgba(16, 185, 129, 0.03)",
  },
  iconWrap: {
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  practiceIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#bfa58a",
    fontFamily: Fonts.sans.medium,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    color: "#432104",
    fontFamily: Fonts.sans.semiBold,
    marginBottom: 2,
  },
  titleComplete: {
    color: "#10b981",
  },
  description: {
    fontSize: 13,
    color: "#5C5648",
    fontFamily: Fonts.sans.regular,
    lineHeight: 18,
  },
  meta: {
    fontSize: 12,
    color: "#8A7D6B",
    fontFamily: Fonts.sans.regular,
    marginTop: 4,
  },
  arrowWrap: {
    marginLeft: 8,
  },
});

export default PracticeCardBlock;
