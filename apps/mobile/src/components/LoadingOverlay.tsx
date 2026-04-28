import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, Image, Platform, StyleSheet, View } from "react-native";
import Modal from "react-native-modal";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
}

const { width, height } = Dimensions.get("window");

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  text = "Fetching Data...",
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [visible]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal
      isVisible={visible}
      backdropColor="rgba(247, 240, 221, 0.35)" // ✅ Transparent full-screen tint
      animationIn="fadeIn"
      animationOut="fadeOut"
      useNativeDriver
      style={styles.modalContainer}
    >
      <View style={styles.overlayContent}>
        <View style={styles.contentContainer}>
          {/* ✅ Splash Image with elevation */}
          <Image
            source={require("../../assets/images/splash-icon.png")}
            style={[styles.splashIcon, styles.elevated]}
            resizeMode="contain"
          />

          {/* ✅ Rotating Loader with elevation */}
          <Animated.Image
            source={require("../../assets/fetchLoading.png")}
            style={[
              styles.loadingIcon,
              { transform: [{ rotate: spin }] },
              styles.elevated,
            ]}
            resizeMode="contain"
          />

          <TextComponent type="headerBoldText" style={styles.headerText}>
            {text}
          </TextComponent>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingOverlay;

const styles = StyleSheet.create({
  modalContainer: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayContent: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFD8722B", // ✅ ~27% opacity (softer & cleaner)
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(247, 240, 221, 0.25)",
    borderRadius: 120,
    paddingVertical: 40,
    paddingHorizontal: 50,
  },
  splashIcon: {
    width: 140,
    height: 140,
    marginBottom: 15,
  },
  loadingIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  headerText: {
    textAlign: "center",
    color: Colors.Colors.App_theme,
    fontSize: 18,
    fontWeight: "600",
  },

  // ✅ Elevation / shadow for floating look
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 10,
      },
    }),
  },
});

// import React, { useEffect, useRef } from "react";
// import { Animated, Dimensions, Easing, Image, StyleSheet, View } from "react-native";
// import Modal from "react-native-modal";
// import Colors from "./Colors";
// import TextComponent from "./TextComponent";

// interface LoadingOverlayProps {
//   visible: boolean;
//   text?: string;
// }

// const { width, height } = Dimensions.get("window");

// const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
//   visible,
//   text = "Fetching Data...",
// }) => {
//   const rotateAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     if (visible) {
//       Animated.loop(
//         Animated.timing(rotateAnim, {
//           toValue: 1,
//           duration: 1500,
//           easing: Easing.linear,
//           useNativeDriver: true,
//         })
//       ).start();
//     } else {
//       rotateAnim.stopAnimation();
//       rotateAnim.setValue(0);
//     }
//   }, [visible]);

//   const spin = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ["0deg", "360deg"],
//   });

//   return (
//     <Modal
//       isVisible={visible}
//        backdropColor =  "rgba(247, 240, 221, 0.9)"
//       // backdropColor="rgba(0,0,0,0.45)" // ✅ Full-screen dim background
//       animationIn="fadeIn"
//       animationOut="fadeOut"
//       useNativeDriver
//       style={styles.modalContainer}
//     >
//       <View style={styles.overlayContent}>
//         {/* ✅ Just a faint light background behind content */}
//         <View style={styles.contentBackground}>
//           <Image
//             source={require("../../assets/images/splash-icon.png")}
//             style={styles.splashIcon}
//             resizeMode="contain"
//           />

//           <Animated.Image
//             source={require("../../assets/fetchLoading.png")}
//             style={[styles.loadingIcon, { transform: [{ rotate: spin }] }]}
//             resizeMode="contain"
//           />

//           <TextComponent type="headerBoldText" style={styles.headerText}>
//             {text}
//           </TextComponent>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default LoadingOverlay;

// const styles = StyleSheet.create({
//   modalContainer: {
//     margin: 0,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   overlayContent: {
//     width,
//     height,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   // ✅ subtle glow background under the content
//   contentBackground: {
//     // backgroundColor: "rgba(247, 240, 221, 0.7)", // light brand color, semi-transparent
//     borderRadius: 120, // rounded but not boxy
//     paddingVertical: 40,
//     paddingHorizontal: 50,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   splashIcon: {
//     width: 140,
//     height: 140,
//     marginBottom: 15,
//   },
//   loadingIcon: {
//     width: 50,
//     height: 50,
//     marginBottom: 10,
//   },
//   headerText: {
//     textAlign: "center",
//     color: Colors.Colors.App_theme,
//     fontSize: 18,
//     fontWeight: "600",
//   },
// });