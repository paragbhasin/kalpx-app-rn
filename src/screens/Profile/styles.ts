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
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 16,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#cce0ff",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007bff",
    borderRadius: 12,
    padding: 4,
  },
  name: {
    fontSize: 16,
    fontFamily: "GelicaMedium",
    color: "#000",
    marginTop: 10,
  },
  level: {
    fontSize: 13,
    fontFamily: "GelicaRegular",
    color: "#666",
    marginTop: 2,
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
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    fontFamily: "GelicaRegular",
    color: "#333",
      // lineHeight: 18,
  },
});

export default styles;