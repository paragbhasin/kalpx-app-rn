import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";

const screenWidth = Dimensions.get("window").width;

// Validation Schema
const SignupSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  username: Yup.string().min(3, "Too Short!").required("Required"),
  password: Yup.string().min(6, "Min 6 chars").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
  otp: Yup.string().required("OTP is required"),
});

export default function SignupScreen({ navigation }) {
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = (email) => {
    if (email) {
      console.log("OTP sent to:", email);
      setOtpSent(true);
    } else {
      console.log("Please enter email first!");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fefaf2"
        translucent={false}
      />

      <ImageBackground
        source={require("../../assets/hoomepagebg.jpg")}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.brand}>KalpX</Text>
          <Text style={styles.heading}>Lets Get Started</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitleLine1}>Create Your</Text>
            <Text style={styles.cardTitleLine2}>Account</Text>
            <Text style={styles.subTitle}>To Connect With KalpX</Text>

            <Formik
              initialValues={{
                email: "",
                username: "",
                password: "",
                confirmPassword: "",
                otp: "",
              }}
              validationSchema={SignupSchema}
              onSubmit={(values) => {
                console.log("Signup Data:", values);
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#9e9b97"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                  />
                  {errors.email && touched.email && (
                    <Text style={styles.error}>{errors.email}</Text>
                  )}

                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#9e9b97"
                    value={values.username}
                    onChangeText={handleChange("username")}
                    onBlur={handleBlur("username")}
                  />
                  {errors.username && touched.username && (
                    <Text style={styles.error}>{errors.username}</Text>
                  )}

                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#9e9b97"
                    secureTextEntry
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                  />
                  {errors.password && touched.password && (
                    <Text style={styles.error}>{errors.password}</Text>
                  )}

                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#9e9b97"
                    secureTextEntry
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <Text style={styles.error}>{errors.confirmPassword}</Text>
                  )}

                  <TextInput
                    style={styles.input}
                    placeholder="Enter OTP"
                    placeholderTextColor="#9e9b97"
                    value={values.otp}
                    onChangeText={handleChange("otp")}
                    onBlur={handleBlur("otp")}
                  />
                  {errors.otp && touched.otp && (
                    <Text style={styles.error}>{errors.otp}</Text>
                  )}

                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.buttonText}>SIGN UP</Text>
                  </TouchableOpacity>

                  <View style={styles.footerContainer}>
                    <Text style={styles.footer}>Already Member? </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Login")}
                    >
                      <Text style={styles.login}>Login here</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Formik>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fefaf2", // matches card bg so safeArea blends in
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
  success: {
    fontSize: 12,
    color: "green",
    marginBottom: 10,
    fontFamily: "GelicaRegular",
    lineHeight: 16,
  },
  verifyLink: {
    fontSize: 13,
    color: "#000",
    marginBottom: 10,
    textDecorationLine: "underline",
    fontFamily: "GelicaRegular",
  },
});
