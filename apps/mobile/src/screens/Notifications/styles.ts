import { StyleSheet } from "react-native";

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
    borderBottomColor: "#e8e0d4",
    backgroundColor: "#ffffff",
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
  },
  unread: {
    backgroundColor: "#FFF8EC",
    borderLeftWidth: 4,
    borderLeftColor: "#CA8A04",
  },
  dotWrapper: {
    width: 20,
    alignItems: "center",
    paddingTop: 5,
    marginRight: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CA8A04",
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
    color: "#1a1a1a",
    marginBottom: 2,
    flex: 1,
    marginRight: 8,
  },
  titleRead: {
    color: "#555",
    marginBottom: 2,
    flex: 1,
    marginRight: 8,
  },
  time: {
    color: "#aaa",
    fontSize: 11,
  },
  timeUnread: {
    color: "#9A6B04",
    fontSize: 11,
  },
  message: {
    color: "#888",
    marginTop: 1,
  },
  messageUnread: {
    color: "#555",
    marginTop: 1,
  },
});

export default styles;