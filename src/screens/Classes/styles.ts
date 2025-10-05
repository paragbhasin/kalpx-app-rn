import { StyleSheet } from "react-native";
import FontSize from "../../components/FontSize";


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { flex: 1 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "GelicaMedium",
    color: "#000",
    marginVertical: 12,
    lineHeight: 22,
  },
    row: {
      flexDirection: "row",
      marginVertical: 2,
    },
    label: {
    fontSize:FontSize.CONSTS.FS_14
    },
});

export default styles;