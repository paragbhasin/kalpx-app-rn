import { StyleSheet } from "react-native";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";


const styles = StyleSheet.create({
  count:{
        color: Colors.Colors.BLACK,
  },
  streakText:{
        color: Colors.Colors.BLACK,
        fontSize: FontSize.CONSTS.FS_12,
  },
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginVertical: 10,
    backgroundColor: Colors.Colors.white 
  },
  tab: {
    marginRight: 20,
    paddingBottom: 6, // space for underline
  },
  background: { flex: 1},

});

export default styles;