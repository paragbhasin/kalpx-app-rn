import { Dimensions, StyleSheet } from "react-native";
import Colors from "../../components/Colors";

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.Colors.white,
  },

  /* ---------- TOP TABS (My Routine / Progress / Edit Routine) ---------- */
  topTabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E0B8",
    backgroundColor: "#FFF9EC",
  },
  topTabItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  /* ---------- COMMON ---------- */
  backArrow: {
    marginTop: 16,
    marginLeft: 16,
  },

  searchInput: {
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E0C58C",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.Colors.BLACK,
    backgroundColor: "#F7F0DD",
  },

  /* ---------- CATEGORY CHIPS ---------- */
  categoryList: {
    paddingHorizontal: 16,
    paddingTop: 6,
    // paddingBottom: 4,
  },
  categoryChip: {
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#F4E6C3",
    borderColor:Colors.Colors.Yellow,
    borderWidth:1
  },
  categoryChipSelected: {
    backgroundColor: "#D4A017",
  },
  categoryChipText: {
    color: "#6E5C2E",
  },
  categoryChipTextSelected: {
    color: "#FFFFFF",
  },

  /* ---------- TYPE TABS (MANTRA / SANKALP / PRACTICE) ---------- */
  typeTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E0B8",
  },
  typeTab: {
    paddingVertical: 2,
    paddingHorizontal: 18,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  typeTabSelected: {
    borderBottomColor: "#D4A017",
  },
  typeTabText: {
    color: "#6E5C2E",
  },
  typeTabTextSelected: {
    color: "#D4A017",
    fontWeight: "600",
  },

  /* ---------- LIST ITEMS (ADD MORE SCREEN) ---------- */
  itemsContainer: {
    marginTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  simpleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#D4A017",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    color: Colors.Colors.BLACK,
    // fontSize: 14,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#6E5C2E",
  },
  cardRightIcons: {
    // flexDirection: "row",
    // alignItems: "center",
    // marginLeft: 10,
  },

  /* ---------- MAIN SCREEN (CURRENT PRACTICES) ---------- */
  cartBadge: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginRight: 20,
    backgroundColor: "#1877F2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  selectedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  selectedCard: {
    width: "48%",
    backgroundColor: "#F7F0DD",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D4A017",
    alignItems: "center",
    position: "relative",
  },
  removeBtn: {
    position: "absolute",
    top: -10,
    right: -10,
  },

  addMoreBtn: {
    marginTop: 24,
    alignSelf: "center",
    backgroundColor: "#D4A017",
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 30,
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "flex-end",
  margin:-20
},
bottomSheet: {
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 20,
  paddingBottom: 30,
  maxHeight: "70%",
  backgroundColor:"#FFFFFF",
  overflow: "hidden",  // IMPORTANT for rounded corners
},


dragIndicator: {
  width: 40,
  height: 5,
  backgroundColor: "#ccc",
  borderRadius: 100,
  alignSelf: "center",
  marginBottom: 12,
},

modalHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
},

sectionHeader: {
  color: "#000000",
  marginTop: 20,
  marginBottom: 8,
},

itemRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderColor: "#EFE5CC",
  backgroundColor:"#F7F0DD",
  marginTop:10,
  padding:12,
  marginHorizontal:6
},

itemType: {
  fontSize: 12,
  color: "#6E5C2E",
  marginTop: 2,
},
modalBGImage: {
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
},
divider: {
  borderBottomColor: "#D4A017",
  borderBottomWidth: 1,
  marginTop: 20,
  marginHorizontal: -20,
},
  button: {
    backgroundColor: "#D4A017",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    // marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "GelicaMedium",
      // lineHeight: 20,
  },
  bottomButtonContainer: {
  // position: "absolute",
  // bottom: 0,
  // left: 0,
  // right: 0,
  padding: 10,
  // marginTop:12
  // backgroundColor: "#FFFFFF",
  // borderTopColor: "#EEE4C6",
  // borderTopWidth: 1,
},

});

export default styles;