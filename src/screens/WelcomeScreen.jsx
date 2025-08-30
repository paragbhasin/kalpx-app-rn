import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Platform,
  StatusBar
} from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content" // dark icons/text
        backgroundColor="#f1ebdf" // background color for Android
      />
      <ImageBackground
        source={require("../../assets/kalpx-Recovered.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>GET STARTED FREE</Text>
      </TouchableOpacity>

      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1ebdf",
    alignItems: "center",
  },
  image: {
    flex: 1,
    width: "100%",
    height: Platform.OS === "ios" ? 600 : 650, // Adjust height per platform
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#ac8a5d",
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: Platform.OS === "ios" ? 80 : 100,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "GelicaMedium",
    lineHeight: 20,
  },
  skipContainer: {
    width: "100%",
    alignItems: "flex-end",
    paddingRight: 20,
    marginBottom: Platform.OS === "ios" ? 40 : 50,
  },
  skipText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "GelicaRegular", // custom font
    lineHeight: 18, // prevent clipping
  },
});
