import { StyleSheet } from "react-native";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
   card: {
     borderRadius: 6,
    //  overflow: "hidden",
     elevation: 3,
     backgroundColor: "#FFFCF7",
    //  width: FontSize.CONSTS.DEVICE_WIDTH,
     borderWidth: 1,
     borderColor: Colors.Colors.App_theme,
     marginTop:30,
     alignSelf:"center",
     marginHorizontal:16,
     height:FontSize.CONSTS.DEVICE_HEIGHT*0.7
   },
    partialBgContainer: {
      alignSelf: "center",
      justifyContent: "center",
      // alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderTopRightRadius: 16,
      borderTopLeftRadius: 16,
      // marginTop: 8,
      width: FontSize.CONSTS.DEVICE_WIDTH,
    },
    partialBgImage: {
      borderTopRightRadius: 16,
      borderTopLeftRadius: 16,
      alignSelf: "center",
      justifyContent: "center",
      alignItems: "center",
      // resizeMode: "center",
      // opacity: 0.9, // optional: adjust background intensity
    },
  footer: { alignSelf: "center", alignItems: "center", flexDirection: "row" ,marginVertical:12},
});
