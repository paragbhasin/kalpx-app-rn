import { Dimensions, StyleSheet } from "react-native";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  headerImage: { height: 220, justifyContent: "space-between" },
  imageStyle: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  topButtons: {
    flexDirection: "row",
    justifyContent: "flex-start",
    // paddingHorizontal: 15,
    // paddingTop: 20,
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
    borderRadius: 20,
  },
  content: { flex: 1, padding: 16 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  row: { flexDirection: "row", alignItems: "center" },
  title: {
     color: Colors.Colors.BLACK,
     fontSize: FontSize.CONSTS.FS_18,
    marginLeft:12
  },
  kidsText: {
    marginRight: 8,
    color: Colors.Colors.BLACK,
     fontSize: FontSize.CONSTS.FS_14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    color: "#000",
    fontFamily: "GelicaRegular",
    fontSize: 14,
    // lineHeight: 18,
    height:30
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbeedc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  filterText: {
    color: Colors.Colors.black_edge,
    fontSize: FontSize.CONSTS.FS_16,
    marginRight: 4,
  },
  subtitle: {
        // color: Colors.Colors.BLACK,
        // fontSize: FontSize.CONSTS.FS_16,
    // fontSize: 18,
    // fontFamily: "GelicaRegular",
    // color: "#000000",
    // marginTop: 8,
       color: Colors.Colors.BLACK,
        fontSize: FontSize.CONSTS.FS_16,
    textAlign: "center",
  },
  subtitleTwo: {
   color: Colors.Colors.BLACK,
        fontSize: FontSize.CONSTS.FS_18,
    marginTop: 26,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontFamily: "GelicaMedium", lineHeight: 22 },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  radioText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: "GelicaRegular",
    color: "#000",
    lineHeight: 18,
  },
activeFilterTag: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: Colors.Colors.App_theme,
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderRadius: 20,
  marginRight: 8,
  marginTop: 6,
},
activeFilterText: {
color: "#fff",
//   fontSize: 14,
//   fontWeight: "500",
  marginRight: 6,
},


});

export default styles;
