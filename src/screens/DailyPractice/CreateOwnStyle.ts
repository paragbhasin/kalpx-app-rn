import { StyleSheet } from "react-native";
import Colors from "../../components/Colors";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  innerScroll: {
    marginTop: 20,
    marginBottom:60
  },
sectionTitle:{
marginTop:15
},
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  pageTitle: {
    color: "#000",
    flex: 1,
    textAlign: "center",
    fontSize: 18,
  },

  label: {
    marginTop: 8,
    marginBottom: 6,
    color:Colors.Colors.BLACK
  },

  input: {
    borderWidth: 1,
    borderColor: "#CC9B2F",
    borderRadius: 5,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fff",
  },

  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  saveBtn: {
    backgroundColor: "#D4A017",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
    alignSelf:"center",
    paddingHorizontal:20
  },

  error: {
    fontSize: 12,
    color: "red",
    marginTop: 4,
    alignSelf: "flex-end",
  },
    dropdownText: {
  color: "#000000", // text color inside dropdown input
  fontSize: 16,
},

dropdownItemText: {
  color: "#000000", // color of list items
  fontSize: 16,
},
  setupdropdown: {
    height: 45,
    borderColor: "#CC9B2F",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  },
dropdownContainer: {
  backgroundColor: "#FFFFFF", // optional: makes list pop with contrast
  // borderRadius: 8,
},
});
