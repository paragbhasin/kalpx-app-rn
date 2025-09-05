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
import { useTranslation } from "react-i18next";
import uuid from "react-native-uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const [otpSent, setOtpSent] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  // ✅ Validation with i18n error messages
  const LoginSchema = Yup.object().shape({
    username: Yup.string().required(t("login.errors.usernameRequired")),
    password: Yup.string()
      .min(6, t("login.errors.passwordMin"))
      .required(t("login.errors.passwordRequired")),
  });

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
            <Text style={styles.brand}>{t("login.brand")}</Text>
            <Text style={styles.heading}>{t("login.heading")}</Text>

            {/* Google Login Button */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={async () => {
                try {
                  let userId = await AsyncStorage.getItem("userId");
            
                  if (!userId) {
                    userId = uuid.v4();
                    await AsyncStorage.setItem("uuid", userId);
                    console.log("New UUID stored:", userId);
                  } else {
                    console.log("Existing UUID:", userId);
                  }
            
                  navigation.navigate("HomePage");
                } catch (error) {
                  console.error("Error handling UUID:", error);
                }
              }}
            >
              <Image
                source={require("../../assets/devicon_google.png")}
                style={styles.googleIcon}
              />
              <Text style={styles.googleText}>{t("login.google")}</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.cardTitleLine1}>
                {t("login.cardTitleLine1")}
              </Text>
              <Text style={styles.cardTitleLine2}>
                {t("login.cardTitleLine2")}
              </Text>
              <Text style={styles.subTitle}>{t("login.subTitle")}</Text>

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
                      placeholder={t("login.username")}
                      placeholderTextColor="#9e9b97"
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                    />
                    {errors.username && touched.username && (
                      <Text style={styles.error}>{errors.username}</Text>
                    )}

                    {otpSent && (
                      <Text style={styles.success}>{t("login.otpSent")}</Text>
                    )}

                    <TextInput
                      style={styles.input}
                      placeholder={t("login.password")}
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
                          {t("login.keepLoggedIn")}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity>
                        <Text style={styles.forgot}>
                          {t("login.forgotPassword")}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleSubmit}
                    >
                      <Text style={styles.buttonText}>
                        {t("login.loginBtn")}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.footerContainer}>
                      <Text style={styles.footer}>{t("login.footer")} </Text>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("Signup")}
                      >
                        <Text style={styles.login}>{t("login.register")}</Text>
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
