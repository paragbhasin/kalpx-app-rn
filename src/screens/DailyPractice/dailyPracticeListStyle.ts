import { StyleSheet } from "react-native";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  card: {
    borderRadius: 14,
    elevation: 3,
    backgroundColor: Colors.Colors.header_bg,
    height: FontSize.CONSTS.DEVICE_HEIGHT * 0.65, 
    marginHorizontal: 18,
    alignItems: "center",
    padding: 12,
    justifyContent: "center",
    marginTop: 45,
  },

  innerScroll: {
    marginTop: 20,
  },

  subCard: {
    borderRadius: 6,
    padding: 12,
     marginVertical: 8,
    backgroundColor: Colors.Colors.white,
    marginHorizontal: 4,
    // width:FontSize.CONSTS.DEVICE_WIDTH*0.8,
    alignItems:"center",
  },
    arrowIcon: {
    width: 12,
    height: 12,
  },
});
