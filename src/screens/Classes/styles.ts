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
    marginVertical: 8,
  },
  label: {
    fontSize: FontSize.CONSTS.FS_14
  },
  timeContainer: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#FAD38C",
    marginRight: 8,
    borderRadius: 4,
  },
  checkedBox: { backgroundColor: "#444" },
  input: {
    borderWidth: 1,
    borderColor: "##707070",
    borderRadius: 15,
    padding: 10,
    marginBottom: 12,
    height: 100,
    marginTop: 10
  },
});

export default styles;