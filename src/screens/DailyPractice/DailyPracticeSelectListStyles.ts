import { StyleSheet } from "react-native";
import Colors from "../../components/Colors";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  card2: {
    borderRadius: 14,
    elevation: 3,
    backgroundColor: Colors.Colors.white,
    // height: FontSize.CONSTS.DEVICE_HEIGHT * 0.65, 
    marginHorizontal: 18,
    alignItems: "center",
    padding: 12,
    justifyContent: "center",
    marginTop: 20,
    borderColor:Colors.Colors.App_theme,
    borderWidth:1,
  },
    card: {
    borderRadius: 14,
    elevation: 3,
    backgroundColor: Colors.Colors.white,
    // height: FontSize.CONSTS.DEVICE_HEIGHT * 0.65, 
    marginHorizontal: 18,
    alignItems: "center",
    padding: 12,
    justifyContent: "center",
    marginTop: 20,
    borderColor:Colors.Colors.App_theme,
    borderWidth:1
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
    backIcon: {
    width: 28,
    height: 28,
    marginTop:20,
  },
    container2: {
    backgroundColor: "#F3E9D9", // same beige color
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  tag: {
    backgroundColor: "#FFF", 
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  tagText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6E5C2E",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6E5C2E",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 14,
    color: "#816C3C",
  },
    button: {
    backgroundColor: "#ca8a04",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
    width:"45%",
    alignSelf:"center"
  },
    buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "GelicaMedium",
      // lineHeight: 20,
  },
  
});
