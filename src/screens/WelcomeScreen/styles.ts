import { Platform, StyleSheet } from "react-native";

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

export default styles;
