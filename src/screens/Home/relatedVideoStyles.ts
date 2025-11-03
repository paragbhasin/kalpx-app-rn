import { Dimensions, StyleSheet } from "react-native";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";

const screenWidth = Dimensions.get("window").width;

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
    iconButton: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
    borderRadius: 20,
    // position: "absolute",
    // top: 36,
    // left: 16,
  },
  heading: {
    fontSize: 18,
    color: Colors.Colors.BLACK,
    marginLeft:15
  },
  footer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  loader: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  videoCard: {
    backgroundColor: "#FFF7E8",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFD6A5",
    padding: 12,
  },
  thumbnailWrapper: {
    width: "100%",
    height: 180,
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 50,
    height: 50,
    transform: [{ translateX: -25 }, { translateY: -25 }],
    opacity: 0.9,
  },
  videoTitle: {
    fontSize: FontSize.CONSTS.FS_14,
    color: "#000",
    marginTop: 10,
    lineHeight: 18,
    fontFamily: "GelicaRegular",
  },
});

export default styles