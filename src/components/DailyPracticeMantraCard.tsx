import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TextComponent from "./TextComponent";

const DailyPracticeMantraCard = ({ data, tag, onChange, onPress, showIcons = true }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;   // 0 = current, 1 = new card

  const handleSwipe = () => {
    // Animate card OUT (slide left)
    Animated.timing(slideAnim, {
      toValue: -300,        // slide left out
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      onChange && onChange();   // change index AFTER card exits

      // Reset position off-screen right
      slideAnim.setValue(300);

      // Animate card IN (slide right → to center)
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.tag}>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            padding: 6,
            paddingHorizontal: 14,
            borderRadius: 16,
          }}
        >
          <Text style={styles.tagText}>{tag}</Text>
        </View>
        <View style={styles.tagSlant} />
      </View>

      <View style={styles.card} >
        <View style={styles.row}>
          {showIcons && (
            <TouchableOpacity onPress={handleSwipe}>
              <Ionicons
                name="repeat-outline"
                size={22}
                color="#6E5C2E"
                style={{ marginRight: 10 }}
                onPress={handleSwipe}
              />
            </TouchableOpacity>
          )}

          <View style={{ flex: 1 }}>
            <TextComponent
              numberOfLines={1}
              ellipsizeMode="tail"
              type="streakSadanaText"
              style={styles.title}
            >
              {data?.title}
            </TextComponent>

            <TextComponent
              numberOfLines={1}
              ellipsizeMode="tail"
              type="subText"
              style={styles.subtitle}
            >
              {data?.summary || data?.line || data?.meaning}
            </TextComponent>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {!showIcons && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#D4A017"
                style={{ marginRight: 8 }}
              />
            )}

            <TouchableOpacity onPress={onPress}>
              <Ionicons name="chevron-forward" size={22} color="#6E5C2E" />
            </TouchableOpacity>
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
    backgroundColor: "#F3E9D9",
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


// import { Ionicons } from "@expo/vector-icons";
// import React from "react";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import TextComponent from "./TextComponent";

// const DailyPracticeMantraCard = ({ data, tag, onChange,onPress,showIcons = true }) => {
//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.tag}>
//         <View style={{backgroundColor:"#FFFFFF",padding:6,paddingHorizontal:14,borderRadius:16}}>
//         <Text style={styles.tagText}>{tag}</Text>
//         </View>
//           <View style={styles.tagSlant} />
//       </View>
//      <TouchableOpacity style={styles.card} onPress={onChange}>
//         <View style={styles.row}>
//           {showIcons && (
//   <Ionicons name="repeat-outline" size={22} color="#6E5C2E" style={{ marginRight: 10 }}/>
// )}
//           {/* <Ionicons name="repeat-outline" size={22} color="#6E5C2E" style={{ marginRight: 10 }} /> */}
//           <View style={{ flex: 1 }}>
//      <TextComponent numberOfLines={1}
// ellipsizeMode="tail" type="streakSadanaText" style={styles.title}>{data?.title}</TextComponent>
//             <TextComponent numberOfLines={1}
// ellipsizeMode="tail" type="subText" style={styles.subtitle}>
//               {data?.summary || data?.line || data?.meaning}
//             </TextComponent>
//           </View>
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//   {/* SHOW CHECK ONLY IF LOCKED */}
//   { !showIcons && (
//     <Ionicons
//       name="checkmark-circle"
//       size={22}
//       color="#D4A017"
//       style={{ marginRight: 8 }}
//     />
//   )}

//   <TouchableOpacity onPress={onPress}>
//     <Ionicons name="chevron-forward" size={22} color="#6E5C2E" />
//   </TouchableOpacity>
// </View>

// {/* <TouchableOpacity onPress={onPress}>
//           <Ionicons name="chevron-forward" size={22} color="#6E5C2E" />
//           </TouchableOpacity> */}
//         </View>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default DailyPracticeMantraCard;

// const styles = StyleSheet.create({
//   wrapper: {
//     marginVertical: 20,
//   },
//   tag: {
//     position: "absolute",
//     top: -10,
//     left: 0,
//     backgroundColor: "#F3E9D9",
//     paddingVertical: 5,
//     paddingHorizontal: 16,
//     borderTopRightRadius:8,
//     borderTopLeftRadius:8,
//     zIndex: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//   },
//   tagText: {
//     fontSize: 16,
//     color: "#6E5C2E",
//     fontWeight: "600",
//   },
//   card: {
//     backgroundColor: "#F3E9D9", 
//     borderBottomRightRadius:16,
//     borderBottomLeftRadius:16,
//     borderTopRightRadius:16,
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//     paddingTop: 28,
//     marginTop: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   title: {
//     color: "#513B00",
//     marginBottom: 3,
//   },
//   subtitle: {
//     color: "#674B00",
//   },
//   tagSlant: {
//   width: 0,
//   height: 33,
//   borderTopWidth: 20,
//   borderTopColor: "#FFFFFF", 
//   borderLeftWidth: 20,
//   borderLeftColor: "transparent",
//   position: "absolute",
//   right: -10,
//   top: 0,
//   backgroundColor:"#F3E9D9"
// },

// });
