import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerText: {
    fontSize: 16,
    fontFamily: "GelicaMedium",
    color: "#000",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.7,
    borderBottomColor: "#ddd",
  },
  unread: {
    backgroundColor: "#FFF3D6",      // gold-light highlight
    borderLeftWidth: 4,
    borderLeftColor: "#CA8A04",      // brand gold
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 12,
    marginTop: 4,
    resizeMode: "contain",
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    color: "#000",
    marginBottom: 2,
  },
  time: {
    color: "#888",
  },
  message: {
    color: "#444",
  },
});


export default styles;