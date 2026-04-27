import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "./Colors";
import FontSize from "./FontSize";
import TextComponent from "./TextComponent";

const DailyPracticeMantraCardSimple = ({
  item,
  tag,
  onPress,
  onRemove,
}: any) => {
  return (
    <View style={styles.wrapper}>
      {/* TAG */}
      <View style={styles.tag}>
        <TextComponent type="boldText" style={styles.tagText}>
          {tag}
        </TextComponent>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        {/* REMOVE BUTTON */}
        {onRemove && (
          <TouchableOpacity
            onPress={onRemove}
            style={styles.removeBtn}
          >
            <Ionicons name="close" size={14} color="#FFF" />
          </TouchableOpacity>
        )}

        {/* DAY + REPS */}
        {(item?.day || item?.reps) && (
          <View style={styles.pill}>
            <TextComponent
              type="boldText"
              style={{ color: Colors.Colors.white }}
            >
              {(item?.day ?? "Daily")} {item?.reps ? `${item.reps}X` : ""}
            </TextComponent>
          </View>
        )}

        {/* TITLE + DESCRIPTION */}
        <View style={{ marginTop: 6 }}>
          <TextComponent
            type="mediumText"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.title}
          >
            {item.name ||
              item.details?.name ||
              item.title ||
              item.iast ||
              item.short_text ||
              "Practice"}
          </TextComponent>

          <TextComponent
            type="subDailyText"
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.description}
          >
            {item.description ||
              item.summary ||
              item.meaning ||
              item.line ||
              ""}
          </TextComponent>
        </View>

        {/* INFO ICON */}
        <TouchableOpacity
          onPress={onPress}
          style={styles.infoIcon}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={Colors.Colors.Yellow}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DailyPracticeMantraCardSimple;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#F7F0DD",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: -8,
    zIndex: 10,
  },
  tagText: {
    color: "#000",
  },
  card: {
    backgroundColor: Colors.Colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D4A017",
    position: "relative",
  },
  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: Colors.Colors.Yellow,
    borderRadius: 4,
    padding: 2,
    zIndex: 10,
  },
  pill: {
    alignSelf: "center",
    backgroundColor: "#CC9B2F",
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  title: {
    fontSize: FontSize.CONSTS.FS_13,
    color: Colors.Colors.BLACK,
  },
  description: {
    marginTop: 4,
    color: Colors.Colors.BLACK,
  },
  infoIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
});
