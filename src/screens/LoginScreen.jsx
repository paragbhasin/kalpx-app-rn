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
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";

const screenWidth = Dimensions.get("window").width;

// Validation Schema
const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Required"),
  password: Yup.string().min(6, "Min 6 chars").required("Required"),
});

export default function LoginScreen({ navigation }) {
  const [otpSent, setOtpSent] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleSendOtp = (username) => {
    if (username) {
      console.log("OTP sent to:", username);
      setOtpSent(true);
    } else {
      console.log("Please enter username/email first!");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Keep content below status bar */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff2dd"
        translucent={false}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ImageBackground
          source={require("../../assets/hoomepagebg.jpg")}
          style={styles.background}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.brand}>KalpX</Text>
            <Text style={styles.heading}>Connect to Your Roots</Text>

            {/* Google Login Button */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => navigation.navigate("Travel")}
            >
              <Image
                source={require("../../assets/devicon_google.png")}
                style={styles.googleIcon}
              />
              <Text style={styles.googleText}>Login With Google</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.cardTitleLine1}>Login in Your</Text>
              <Text style={styles.cardTitleLine2}>Account</Text>
              <Text style={styles.subTitle}>To Explore Divine Journey</Text>

              <Formik
                initialValues={{ username: "", password: "" }}
                validationSchema={LoginSchema}
                onSubmit={(values) => {
                  console.log("Login Data:", values);
                  navigation.navigate("HomePage");
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
                      placeholder="Username"
                      placeholderTextColor="#9e9b97"
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                    />
                    {errors.username && touched.username && (
                      <Text style={styles.error}>{errors.username}</Text>
                    )}

                    {otpSent && <Text style={styles.success}>OTP Sent ✔</Text>}

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

                    <View style={styles.row}>
                      <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setKeepLoggedIn(!keepLoggedIn)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            keepLoggedIn && styles.checked,
                          ]}
                        >
                          {keepLoggedIn && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </View>
                        <Text style={styles.checkboxLabel}>
                          Keep me logged in
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity>
                        <Text style={styles.forgot}>Forgot password?</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleSubmit}
                    >
                      <Text style={styles.buttonText}>LOGIN</Text>
                    </TouchableOpacity>

                    <View style={styles.footerContainer}>
                      <Text style={styles.footer}>No account yet? </Text>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("Signup")}
                      >
                        <Text style={styles.login}>Register here</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </Formik>
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fefaf2", // matches card background
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
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffdeb6",
    marginBottom: 30,
    width: screenWidth * 0.85,
    justifyContent: "center",
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
    fontFamily: "GelicaMedium",
    lineHeight: 20,
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checked: {
    backgroundColor: "#000",
  },
  checkmark: {
    color: "#fff",
    fontSize: 10,
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#000",
    fontFamily: "GelicaRegular",
    lineHeight: 16,
  },
  forgot: {
    fontSize: 12,
    color: "black",
    fontFamily: "GelicaRegular",
    lineHeight: 16,
  },
});
