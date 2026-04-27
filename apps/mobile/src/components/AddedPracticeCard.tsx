import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import TextComponent from "./TextComponent";

const AddedPracticeCard = ({ item,onRemove }) => {

  console.log("AddedPracticeCard item:", item);

  return (
    <Animated.View style={[styles.wrapper]}>
      <View style={styles.tag}>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            padding: 4,
            paddingHorizontal: 8,
            borderRadius: 16,
          }}
        >
          <Text style={styles.tagText}>{item?.day} - {item?.reps}</Text>
        </View>
        <View style={styles.tagSlant} />
      </View>

      <View style={styles.card} >
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
                    <TouchableOpacity onPress={() => onRemove(item.id)} style={{alignSelf:"flex-end",marginTop:-35,marginRight:-20}}>
           <Ionicons name="close-circle" size={20} color="#6E5C2E" />
         </TouchableOpacity>
            <TextComponent
              numberOfLines={1}
              ellipsizeMode="tail"
              type="streakSadanaText"
              style={styles.title}
            >
              {item?.name}
            </TextComponent>

            <TextComponent
              numberOfLines={1}
              ellipsizeMode="tail"
              type="subText"
              style={styles.subtitle}
            >
              {item?.description}
            </TextComponent>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default AddedPracticeCard;

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 20,
    width: "50%", 
  },
  tag: {
    position: "absolute",
    top: -10,
    left: 0,
    backgroundColor: "#F3E9D9",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
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
    backgroundColor: "#F3E9D9",
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
    borderTopColor: "#FFFFFF",
    borderLeftWidth: 20,
    borderLeftColor: "transparent",
    position: "absolute",
    right: -10,
    top: 0,
    backgroundColor: "#F3E9D9",
  },
});