// components/Accordion.js
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View
} from "react-native";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

 const  Accordion = ({ data})  => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.item}>
          {/* Header */}
          <TouchableOpacity
            style={styles.header}
            onPress={() => toggleExpand(index)}
            activeOpacity={0.7}
          >
            <View style={styles.headerContent}>
              <TextComponent type="cardText" style={styles.title}>{item.title}</TextComponent>
              <Ionicons
                name={activeIndex === index ? "chevron-up" : "chevron-down"}
                size={20}
                color="#000"
              />
            </View>
          </TouchableOpacity>

          {/* Body */}
          {activeIndex === index && (
            <View style={styles.body}>
              <TextComponent type="subText" style={styles.description}>{item.description}</TextComponent>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

export default Accordion;

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  item: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "#e2e2e2",
    overflow: "hidden",
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    flex: 1, // ✅ ensures wrapping inside box
   color: Colors.Colors.BLACK,
    // fontSize: FontSize.CONSTS.FS_16,
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  description: {
 color: Colors.Colors.Light_grey,
    // fontSize: FontSize.CONSTS.FS_16,
  },
});
