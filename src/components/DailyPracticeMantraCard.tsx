import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TextComponent from "./TextComponent";

const DailyPracticeMantraCard = ({ data, tag, onChange }) => {
  return (
    <View style={styles.wrapper}>
      {/* Floating Tag */}
      <View style={styles.tag}>
        <View style={{backgroundColor:"#FFFFFF",padding:6,paddingHorizontal:14,borderRadius:16}}>
        <Text style={styles.tagText}>{tag}</Text>
        </View>
          <View style={styles.tagSlant} />
      </View>

      {/* Card with the curved top-left corner */}
     <TouchableOpacity style={styles.card} onPress={onChange}>
        <View style={styles.row}>
          <Ionicons name="repeat-outline" size={22} color="#6E5C2E" style={{ marginRight: 10 }} />

          <View style={{ flex: 1 }}>
     <TextComponent numberOfLines={1}
ellipsizeMode="tail" type="streakSadanaText" style={styles.title}>{data?.title}</TextComponent>
            <TextComponent numberOfLines={1}
ellipsizeMode="tail" type="subText" style={styles.subtitle}>
              {data?.summary || data?.line || data?.meaning}
            </TextComponent>
          </View>

          <Ionicons name="chevron-forward" size={22} color="#6E5C2E" />
        </View>
      </TouchableOpacity>
    </View>
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
    backgroundColor: "#F3E9D9",
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderTopRightRadius:8,
    borderTopLeftRadius:8,
    // borderRadius: 20,
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,

  },

  tagText: {
    fontSize: 16,
    color: "#6E5C2E",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#F3E9D9", // beige
    // borderRadius: 16,
    borderBottomRightRadius:16,
    borderBottomLeftRadius:16,
    borderTopRightRadius:16,
    paddingVertical: 20,
    paddingHorizontal: 16,

    // this makes the curved cutout effect
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
    color: "#513B00",
    marginBottom: 3,
  },

  subtitle: {
    color: "#674B00",
  },
  tagSlant: {
  width: 0,
  height: 33,
  borderTopWidth: 20,
  borderTopColor: "#FFFFFF",   // same as tag background
  borderLeftWidth: 20,
  borderLeftColor: "transparent",
  position: "absolute",
  right: -10,
  top: 0,
  backgroundColor:"#F3E9D9"
},

});
