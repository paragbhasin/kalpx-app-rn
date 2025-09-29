import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fefaf2",
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  brand: {
    fontSize: 38,
    textAlign: "center",
    fontWeight: "400",
    color: "#6c4b2f",
    marginBottom: 6,
    fontFamily: "GelicaBold",
    lineHeight: 40,
  },
  heading: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "400",
    marginBottom: 20,
    color: "#66605a",
    fontFamily: "GelicaRegular",
    lineHeight: 40,
  },
  card: {
    width: screenWidth * 0.85,
    backgroundColor: "#fefaf2",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 40,
  },
  cardTitleLine1: {
    fontSize: 32,
    color: "#000",
    fontFamily: "GelicaLight",
    fontWeight: "300",
    lineHeight: 40,
  },
  cardTitleLine2: {
    fontSize: 32,
    marginBottom: 8,
    color: "#000",
    fontFamily: "GelicaLight",
    fontWeight: "300",
    lineHeight: 40,
  },
  subTitle: {
    fontSize: 14,
    marginBottom: 20,
    color: "#666461",
    fontFamily: "GelicaLight",
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: "#9e9c98",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fefaf2",
    color: "#000",
    fontFamily: "GelicaRegular",
    fontSize: 14,
    lineHeight: 18,
  },
  button: {
    backgroundColor: "#ca8a04",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  verifyButton: {
    backgroundColor: "#ca8a04",
    // padding: 10,
    borderRadius: 25,
    alignItems: "center",
    // marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "GelicaMedium",
    lineHeight: 20,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  footer: {
    fontSize: 14,
    fontFamily: "GelicaRegular",
    color: "#666360",
    lineHeight: 18,
  },
  login: {
    fontSize: 14,
    fontFamily: "GelicaRegular",
    color: "#666360",
    lineHeight: 18,
  },
  error: {
    fontSize: 12,
    color: "red",
    marginBottom: 5,
    fontFamily: "GelicaRegular",
    lineHeight: 16,
  },
  verifyOtpContainer:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  }
});

export default styles;