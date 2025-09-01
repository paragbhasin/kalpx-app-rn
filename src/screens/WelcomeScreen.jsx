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
import { useTranslation } from "react-i18next";

export default function WelcomeScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f1ebdf"
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
        <Text style={styles.buttonText}>{t("welcome.getStarted")}</Text>
      </TouchableOpacity>

      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.skipText}>{t("welcome.skip")}</Text>
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
    height: Platform.OS === "ios" ? 600 : 650,
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
    fontFamily: "GelicaRegular",
    lineHeight: 18,
  },
});
