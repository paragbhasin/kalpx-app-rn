import { Dimensions, StyleSheet } from "react-native";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
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
    lineHeight: 22,
  },
  icon: { width: 28, height: 28,
     marginBottom: 6 
    },
  rightIcons: { flexDirection: "row", alignItems: "center" },
  iconButton: { marginLeft: 16 },
  card: {
    backgroundColor: "#fff",
    // width: 70,
    height: 59,
    marginRight: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",

  },
  cardText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "400",
    color: "#000",
    textAlign: "center",
    fontFamily: "GelicaRegular",
    // lineHeight: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
  optionIconWrapper: { marginRight: 12 },
  optionIcon: { width: 28, height: 28 },
  dailyContainer: {
    //  paddingHorizontal: 16, 
     marginTop: 10 },
  sectionHeading: {
  alignSelf:"center",
  marginVertical:14,
  color:Colors.Colors.BLACK,
  fontSize:FontSize.CONSTS.FS_16
  },
  optionTitle: {
    color:Colors.Colors.BLACK,
  },
  optionSubtitle: {
fontSize:FontSize.CONSTS.FS_10,
    color:Colors.Colors.Light_black,
  },
  kalpXContainer: { paddingHorizontal: 16, marginTop: 20 },
  kalpXCard: {
    width: 150,
    height: 145,
    backgroundColor: "#fff",
    borderColor: "#ffd6a5",
    borderWidth: 0.5,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    padding: 8,
  },
  kalpXImage: { width: "100%", height: 100, borderRadius: 8 },
  kalpXTitle: {
    fontSize: 12,
    fontFamily: "GelicaMedium",
    color: "#000",
    marginTop: 6,
    marginHorizontal: 8,
    textAlign: "left",
    lineHeight: 18,
  },
  streakCard:{
        borderRadius: 7,
        overflow: "hidden",
        elevation: 3,
        backgroundColor: Colors.Colors.white,
        borderColor:Colors.Colors.App_theme,
        borderWidth:1,
        marginHorizontal:20,
        padding:10
  },
  dailyCard:{
   borderRadius: 4,
        overflow: "hidden",
        elevation: 3,
        backgroundColor: "#F7F0DD",
        borderColor:Colors.Colors.App_theme,
        borderWidth:1,
        // marginHorizontal:16,
        padding:10,
        marginVertical:8,
        marginHorizontal: 16, 
  },
  count:{
        color: Colors.Colors.BLACK,
        fontSize: FontSize.CONSTS.FS_14,
        marginHorizontal:4
  },
  streakText:{
        color: Colors.Colors.BLACK,
        fontSize: FontSize.CONSTS.FS_12,
  },
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
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
    // alignItems:"center",
    margin:20,
    backgroundColor:Colors.Colors.white,
    padding:16
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
});

export default styles;