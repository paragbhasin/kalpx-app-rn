import { Dimensions, StyleSheet } from "react-native";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
    pageTitle: {
    color: "#000",
    flex: 1,
    textAlign: "center",
    fontSize: 18,
  },
  background: { flex: 1, resizeMode: "cover" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: { flexDirection: "row", alignItems: "center" },
  greeting: {
    fontSize: 18,
    fontWeight: "400",
    color: "#000",
    marginLeft: 10,
    fontFamily: "GelicaMedium",
    // lineHeight: 22,
  },
  icon: { width: 28, height: 28,
     marginBottom: 2
    },
  rightIcons: { flexDirection: "row", alignItems: "center" },
  iconButton: { marginLeft: 16 },
  card: {
    backgroundColor: "#fff",
    // width: 70,
    height: 80,
    marginRight: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",

  },
    classescard: {
      elevation: 3,
      backgroundColor: Colors.Colors.white,
      padding: 20,
      width: "96%",
      alignSelf: "center",
      borderRadius: 10,
    },
  cardText: {
    marginTop: 4,
    // fontSize: 12,
    // fontWeight: "400",
    color: "#1C1B1F",
    textAlign: "center",
    // fontFamily: "GelicaRegular",
    // lineHeight: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
  optionIconWrapper: { marginRight: 12 },
  optionIcon: { width: 32, height: 32 },
  dailyContainer: {
    //  paddingHorizontal: 16, 
    //  marginTop: 10 
    },
  sectionHeading: {
  alignSelf:"center",
  marginTop:14,
  color:Colors.Colors.BLACK,
  fontSize:FontSize.CONSTS.FS_16
  },
  optionTitle: {
    color:Colors.Colors.BLACK,
  },
  optionSubtitle: {
  marginTop:4,
fontSize:FontSize.CONSTS.FS_10,
    color:Colors.Colors.Light_black,
  },
  // kalpXContainer: { paddingHorizontal: 16, marginTop: 20 },
  // kalpXCard: {
  //   width: 150,
  //   height: 145,
  //   backgroundColor: "#fff",
  //   borderColor: "#ffd6a5",
  //   borderWidth: 0.5,
  //   borderRadius: 12,
  //   overflow: "hidden",
  //   marginBottom: 12,
  //   padding: 8,
  // },
  // kalpXImage: { width: "100%", height: 100, borderRadius: 8 },
  // kalpXTitle: {
  //   fontSize: 12,
  //   fontFamily: "GelicaMedium",
  //   color: "#000",
  //   marginTop: 6,
  //   marginHorizontal: 8,
  //   textAlign: "left",
  //   lineHeight: 18,
  // },
  // streakCard:{
  //       borderRadius: 7,
  //       overflow: "hidden",
  //       elevation: 3,
  //       backgroundColor: Colors.Colors.white,
  //       borderColor:Colors.Colors.App_theme,
  //       borderWidth:1,
  //       marginHorizontal:16,
  //       padding:10
  // },
 dailyCard: {
  borderRadius: 8,
  backgroundColor: "#FFFFFF",
  borderColor: Colors.Colors.App_theme,
  borderWidth: 1.25,
  marginVertical: 8,
  marginHorizontal: 16,
  padding: 10,
  minHeight: 60,
  justifyContent: "center",

  // --- Android Elevation ---
  elevation: 4,

  // --- iOS Shadow ---
  shadowColor: "#000",
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
},

  // count:{
  //       // color: Colors.Colors.BLACK,
  //       // fontSize: FontSize.CONSTS.FS_12,
  //       marginHorizontal:4
  // },
  // streakText:{
  //       // color: Colors.Colors.BLACK,
  //       // fontSize: FontSize.CONSTS.FS_12,
  // },
  cardContent: {
  flexDirection: "row",
  alignItems: "center", // vertically center
},
textWrapper: {
  flex: 1, // takes all available space between icon and arrow
  justifyContent: "center",
  marginHorizontal: 10, // space between icon and text
  maxWidth:"80%"
},
arrowIcon: {
  width: 10,
  height: 10,
},
sadanaCard:{
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
    alignItems:"center",
    justifyContent:"center",
  },
    checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#000000",
    marginRight: 8,
    borderRadius: 4,
    marginTop:8
  },
  checkedBox: { backgroundColor: "#444" ,  marginTop:8},
  itemCard:{
    borderRadius: 5,
    marginBottom: 4,
    margin:16,
    backgroundColor:Colors.Colors.white,
    borderColor:Colors.Colors.Yellow,
    borderWidth:1,
    padding:6
  },
  container: { width: "90%", margin:20,justifyContent:"center",},
   setupcontainer: { width: "90%",justifyContent:"center",marginTop:4},
    setupdropdown: {
    height: 40,
    borderColor: "#BDC4CD",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dropdown: {
    height: 50,
    borderColor: "#BDC4CD",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  selectedText: { color: "#000000" },
    placeholder: { color: "#96A0AD" },
  input: {
    marginTop: 4,
    borderWidth: 1,
  borderColor: "#BDC4CD",
  height:80,
    borderRadius: 6,
    padding: 10,
    marginBottom: 25,
  },
    playButton: {
    position: "absolute",
    top: "40%",
    left: "42%",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 50,
    padding: 8,
  },
  kalpXContainer: {
  paddingHorizontal: 16,
  marginTop: 20,
},

kalpXCard: {
  // backgroundColor: "#FFF7E8",
  borderColor: "#D4A017",
  borderWidth: 1,
  borderRadius: 14,
  // overflow: "hidden",
  padding:6,
  // height: 158,
  alignItems: "center",
  justifyContent: "flex-start",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 3,
},

kalpXImage: {
  width: "100%",
  height: 100,
  borderRadius: 5,
},

kalpXTitle: {
 color: "#000000",
    // fontSize: FontSize.CONSTS.FS_12,
  // marginTop: 2,
  textAlign: "left",
  alignSelf: "flex-start",
  // lineHeight: 18,
},
dropdownItemText: {
  color: "#000000", // color of list items
  fontSize: 16,
},

dropdownContainer: {
  backgroundColor: "#FFFFFF", // optional: makes list pop with contrast
  // borderRadius: 8,
},
streakCard: {
  borderRadius: 7,
  overflow: "hidden",
  elevation: 3,
  backgroundColor: Colors.Colors.white,
  borderColor: Colors.Colors.App_theme,
  borderWidth: 1,
  marginHorizontal: 16,
  paddingVertical: 10,
  paddingHorizontal: 8,
},

streakScrollContainer: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  paddingRight: 10,
},

streakItem: {
  flexDirection: "row",
  alignItems: "center",
  // marginRight: 12,
    borderRadius: 7,
  overflow: "hidden",
  elevation: 3,
  backgroundColor: Colors.Colors.white,
  borderColor: Colors.Colors.App_theme,
  borderWidth: 1,
  marginHorizontal: 6,
  paddingVertical: 10,
  paddingHorizontal: 8,
},

streakIcon: {
  height: 20,
  width: 20,
  marginRight: 6,
},

count: {
  marginRight: 4,
},

streakText: {
  flexShrink: 0,
},
  partialBgContainer: {
    width: FontSize.CONSTS.DEVICE_WIDTH,
    maxHeight:200
  },
  partialBgImage: {
      width: FontSize.CONSTS.DEVICE_WIDTH,
    maxHeight:200
    // resizeMode: "center",
    // opacity: 0.9, // optional: adjust background intensity
  },
  image: {
    height: 220,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    position: "absolute",
    textAlign: "center",
    color: "#000000",
    // fontSize: 16,
    // fontWeight: "600",
  },

  leftLabel: {
    left: 30,
    top: 100,
  },

  centerLabel: {
    top: 90,
  },

  rightLabel: {
    right: 20,
    top: 100,
  },
    circleButton: {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: "#C59A2D",   // golden color
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
marginLeft:12,
    // Outer glow like your image
    borderWidth: 8,
    borderColor: "#F7EED1",
  },
});

export default styles;