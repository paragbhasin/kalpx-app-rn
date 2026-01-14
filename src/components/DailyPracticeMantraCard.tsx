import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Colors from "./Colors";
import TextComponent from "./TextComponent";
import { getTranslatedPractice } from "../utils/getTranslatedPractice";



const DailyPracticeMantraCard = ({
  data,
  tag,
  onChange,
  onPress,
  showIcons = true,
  isedit = false,
  // ✅ NEW PROPS
  isSelected = true,
  onToggleSelect = () => { },
}) => {
  const { t } = useTranslation();
  const translated = getTranslatedPractice(data, t);
  const slideAnim = useRef(new Animated.Value(0)).current;

  console.log("data >>>>", data);

  const handleSwipe = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      onChange && onChange();
      slideAnim.setValue(300);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  const getDynamicDescription = () => {
    const categoryKey = data?.category || data?.key || null;  // same key you used earlier

    if (!categoryKey) return "";

    const tagKey = tag?.toLowerCase();
    if (tagKey === "mantra" || tagKey === "sankalp" || tagKey === "practice") {
      return t(`dailyPracticeMantraCard.descriptions.${categoryKey}.${tagKey}`);
    }

    return "";
  };

  const getCardDescription = () => {
    const categoryKey = data?.category || data?.key || null;

    // 1️⃣ FIRST: category-based helper text
    if (categoryKey) {
      const tagKey = tag?.toLowerCase();

      if (tagKey === "mantra" || tagKey === "sankalp" || tagKey === "practice") {
        const desc = t(`dailyPracticeMantraCard.descriptions.${categoryKey}.${tagKey}`, { defaultValue: "" });
        if (desc) return desc;
      }
    }

    // 2️⃣ FALLBACK: real data description
    return (
      translated.desc ||
      translated.meaning ||
      data?.description ||
      data?.meaning ||
      data?.essence?.text ||
      data?.summary ||
      ""
    );
  };



  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ translateX: slideAnim }] }]}
    >
      <View style={styles.tag}>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            padding: 6,
            paddingHorizontal: 14,
            borderRadius: 10,
          }}
        >
          <Text style={styles.tagText}>{t(`sadanaTracker.${tag.toLowerCase()}Title`)}</Text>
        </View>
        <View style={styles.tagSlant} />
      </View>
      {/* ⭐ Frequency & Reps Pills */}
      {(data?.day || data?.reps) && (
        <View style={styles.pillRow}>
          {data?.day && !showIcons && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {t(`confirmDailyPractices.days.${data.day}`, { defaultValue: data.day })}
              </Text>
            </View>
          )}

          {(data?.reps || data?.reps === 0) && !showIcons && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{data.reps}X</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.row}>

          {/* ✅ NEW CHECKBOX HERE */}


          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {showIcons &&
                <TouchableOpacity onPress={onToggleSelect} style={{ marginRight: 8 }}>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: isSelected ? "#D4A017" : "#000",
                      backgroundColor: isSelected ? "#D4A017" : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="#000" />
                    )}
                  </View>
                </TouchableOpacity>
              }
              {showIcons && (
                <TouchableOpacity onPress={handleSwipe}>
                  <Ionicons
                    name="repeat-outline"
                    size={22}
                    color="#000000"
                    style={{ marginRight: 10 }}
                  />
                </TouchableOpacity>
              )}
              <TextComponent
                numberOfLines={0}
                ellipsizeMode="tail"
                type="streakSadanaText"
                style={styles.title}
              >
                {translated.name || data?.title || data?.name}
              </TextComponent>
            </View>

            <TextComponent
              numberOfLines={0}
              ellipsizeMode="tail"
              type="subText"
              style={styles.subtitle}
            >
              {/* {getDynamicDescription()} */}
              {getCardDescription()}
              {/* {data?.summary || data?.line || data?.meaning} */}
            </TextComponent>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {!showIcons && isSelected && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#D4A017"
                style={{ marginRight: 8 }}
              />
            )}
            {isedit ?
              <TouchableOpacity onPress={onPress}>
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={Colors.Colors.Yellow}
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
              :
              <TouchableOpacity onPress={onPress}>
                <Ionicons name="chevron-forward" size={22} color="#000000" />
              </TouchableOpacity>
            }
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default DailyPracticeMantraCard;

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 20,
  },
  tag: {
    position: "absolute",
    top: -10,
    left: 0,
    backgroundColor: "#F7F0DD",
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tagText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#F7F0DD",
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingTop: 28,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "#000000",
    marginBottom: 3,
  },
  subtitle: {
    color: "#282828",
  },
  tagSlant: {
    width: 0,
    height: 33,
    borderTopWidth: 20,
    borderTopColor: "#FFFFFF",
    borderLeftWidth: 20,
    borderLeftColor: "transparent",
    position: "absolute",
    right: -10,
    top: 0,
    backgroundColor: "#F7F0DD",
  },
  pillRow: {
    position: "absolute",
    top: -18,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 20,
  },

  pill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D4A017",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  pillText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
  },

});