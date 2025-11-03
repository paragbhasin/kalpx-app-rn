import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  menu: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  menuText: {
    fontSize: 16,
    fontFamily: "GelicaRegular",
    color: "#333",
      // lineHeight: 20,
  },
  // 🔹 Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  headerText: {
    fontSize: 18,
    fontFamily: "GelicaMedium",
    color: "#000",
  },

  // 🔹 Labels & Inputs
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#FAD38C",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    backgroundColor: "#FFFFFF",
    color: "#000",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    marginTop: 4,
  },

  // 🔹 Dropdowns
  setupcontainer: {
    width: "100%",
    justifyContent: "center",
  },
  setupdropdown: {
    height: 45,
    borderColor: "#FAD38C",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  },
  selectedText: {
    color: "#000000",
    fontSize: 14,
  },
  placeholder: {
    color: "#96A0AD",
    fontSize: 14,
  },

  // 🔹 Option buttons (Categories & Languages)
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 12,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F2E3C7",
    backgroundColor: "#FFF7E8",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    margin:4
  },
  optionSelected: {
    backgroundColor: "#FAD38C",
    borderColor: "#E0A92F",
  },
  optionText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },

  // 🔹 Buttons
  submitButton: {
    marginTop: 20,
    borderRadius: 25,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
    footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },

});

export default styles;
