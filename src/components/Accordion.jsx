// components/Accordion.js
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Accordion({ data = [] }) {
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
              <Text style={styles.title}>{item.title}</Text>
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
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

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
    fontSize: 16,
    fontFamily: "GelicaMedium",
    color: "#000",
    // lineHeight: 20,
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  description: {
    fontSize: 14,
    fontFamily: "GelicaRegular",
    color: "#444",
    // lineHeight: 20,
  },
});
