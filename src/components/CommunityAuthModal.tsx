import React, { useState, useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import Modal from "react-native-modal";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import Colors from "./Colors";
import FontSize from "./FontSize";
import TextComponent from "./TextComponent";
import { socialLoginUser } from "../screens/Login/actions";
import { generateOtp, verifyOtp, signupUser } from "../screens/Signup/actions";
import { showSnackBar } from "../store/snackBarSlice";
import ReCaptchaRuntime from "../screens/Login/ReCaptchaRuntime";
import api from "../Networks/axios";

const { width: screenWidth } = Dimensions.get("window");

interface CommunityAuthModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    benefits?: string[];
    intent?: string;
}

const CommunityAuthModal: React.FC<CommunityAuthModalProps> = ({
    visible,
    onClose,
    title = "Join the Community",
    description = "Be part of meaningful conversations",
    benefits = [
        "Upvote posts you love",
        "Share your thoughts with comments",
        "Track your contributions",
    ],
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<any>();
    const navigation = useNavigation<any>();
    const recaptchaRef = useRef<any>(null);

    const [currentStep, setCurrentStep] = useState<"EMAIL_ENTRY" | "PASSWORD_ENTRY" | "OTP_ENTRY">("EMAIL_ENTRY");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [otpError, setOtpError] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const cooldownInterval = useRef<any>(null);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    useEffect(() => {
        if (!visible) {
            setCurrentStep("EMAIL_ENTRY");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setOtp("");
            setEmailError("");
            setPasswordError("");
            setOtpError("");
            setLoading(false);
        }
    }, [visible]);

    useEffect(() => {
        if (cooldown > 0) {
            cooldownInterval.current = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        } else {
            if (cooldownInterval.current) clearInterval(cooldownInterval.current);
        }
        return () => {
            if (cooldownInterval.current) clearInterval(cooldownInterval.current);
        };
    }, [cooldown]);

    const startCooldown = (seconds = 60) => {
        setCooldown(seconds);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens();

            dispatch(socialLoginUser({
                provider: "google",
                access_token: tokens.accessToken,
            }, (res: any) => {
                if (res.success) {
                    dispatch(showSnackBar("Login successful"));
                    onClose();
                } else {
                    setLoading(false);
                    dispatch(showSnackBar(res.error || "Google login failed"));
                }
            }));
        } catch (error: any) {
            console.error("Google Sign-In Error:", error);
            setLoading(false);
            dispatch(showSnackBar("Google login failed"));
        }
    };

    const handleContinue = () => {
        if (!email) {
            setEmailError("Email is required");
            return;
        }
        if (!emailRegex.test(email.trim())) {
            setEmailError("Please enter a valid email address");
            return;
        }
        setEmailError("");
        setCurrentStep("PASSWORD_ENTRY");
    };

    const handlePasswordContinue = async () => {
        if (!password) {
            setPasswordError("Password is required");
            return;
        }
        if (password.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }
        setPasswordError("");
        setLoading(true);

        // Trigger ReCaptcha
        recaptchaRef.current?.requestNewToken();
    };

    const onRecaptchaToken = (token: string) => {
        if (currentStep === "PASSWORD_ENTRY") {
            generateOtpForRegistration(token);
        } else if (currentStep === "OTP_ENTRY") {
            verifyOtpAndRegister(token);
        }
    };

    const generateOtpForRegistration = async (recaptchaToken: string) => {
        dispatch(generateOtp({
            email: email.trim().toLowerCase(),
            recaptcha_token: recaptchaToken,
            recaptcha_action: "generate_otp",
            context: "registration",
        }, (res: any) => {
            setLoading(false);
            if (res.success) {
                setCurrentStep("OTP_ENTRY");
                startCooldown();
            } else {
                setPasswordError(res.error || "Failed to send verification code");
            }
        }));
    };

    const handleVerifyOTP = () => {
        if (!otp || otp.length < 4) {
            setOtpError("Please enter the 6-digit code");
            return;
        }
        setOtpError("");
        setLoading(true);
        recaptchaRef.current?.requestNewToken();
    };

    const verifyOtpAndRegister = async (recaptchaToken: string) => {
        setLoading(true);
        // We call signupUser directly because it takes the 'otp' and handles 
        // both verification and registration in a single request.
        // This avoids reusing the same ReCAPTCHA token for two sequential API calls.
        dispatch(signupUser({
            email: email.trim().toLowerCase(),
            otp: otp.trim(),
            username: email.split("@")[0] + "_" + Math.floor(Math.random() * 1000),
            password1: password,
            password2: password,
            role: "user",
            recaptcha_token: recaptchaToken,
            recaptcha_action: "register",
        }, (regRes: any) => {
            setLoading(false);
            if (regRes.success) {
                dispatch(showSnackBar("Login successful"));
                onClose();
            } else {
                // If already exists, try to login or handle error
                if (regRes.error?.toLowerCase().includes("exists")) {
                    setOtpError("Account already exists. Please log in.");
                } else {
                    setOtpError(regRes.error || "Registration failed");
                }
            }
        }));
    };

    const handleResend = () => {
        if (cooldown > 0) return;
        setLoading(true);
        recaptchaRef.current?.requestNewToken();
    };

    const renderStep = () => {
        switch (currentStep) {
            case "EMAIL_ENTRY":
                return (
                    <View style={styles.stepContainer}>
                        <Image source={require("../../assets/lotus_icon.png")} style={styles.icon} resizeMode="contain" />
                        <TextComponent type="headerSubBoldText" style={styles.modalTitle}>{title}</TextComponent>
                        <TextComponent type="mediumText" style={styles.modalDescription}>{description}</TextComponent>

                        <View style={styles.benefitsContainer}>
                            {benefits.map((benefit, index) => (
                                <View key={index} style={styles.benefitRow}>
                                    <View style={styles.bullet} />
                                    <TextComponent type="mediumText" style={styles.benefitText}>{benefit}</TextComponent>
                                </View>
                            ))}
                        </View>

                        <View style={styles.inputGroup}>
                            <TextComponent type="semiBoldText" style={styles.label}>Email Address</TextComponent>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={[styles.input, emailError ? styles.inputError : null]}
                                placeholderTextColor="#999"
                                editable={!loading}
                            />
                            {emailError ? (
                                <TextComponent type="mediumText" style={styles.errorText}>
                                    ⚠️ {emailError}
                                </TextComponent>
                            ) : (
                                <TextComponent type="mediumText" style={styles.hintText}>
                                    We'll only use this to save your activity. No spam <TextComponent type="mediumText" style={{ color: '#E6B02E' }}>♡</TextComponent>
                                </TextComponent>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryButton, loading && styles.disabledButton]}
                            onPress={handleContinue}
                            disabled={loading}
                        >
                            <TextComponent type="boldText" style={styles.primaryButtonText}>
                                {loading ? "Verifying..." : "Continue with Email"}
                            </TextComponent>
                        </TouchableOpacity>

                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <TextComponent type="mediumText" style={styles.dividerText}>OR</TextComponent>
                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={handleGoogleLogin}
                            disabled={loading}
                        >
                            <Image source={require("../../assets/devicon_google.png")} style={styles.googleIcon} />
                            <TextComponent type="boldText" style={styles.googleButtonText}>Continue with Google</TextComponent>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.footerLink} onPress={() => {
                            onClose();
                            navigation.navigate("Login");
                        }}>
                            <TextComponent type="mediumText" style={styles.footerLinkText}>
                                Already have an account? <TextComponent type="boldText" style={{ color: Colors.Colors.App_theme }}>Log In</TextComponent>
                            </TextComponent>
                        </TouchableOpacity>

                        <TextComponent type="mediumText" style={styles.disclaimerText}>
                            By continuing, you agree to our <TextComponent type="mediumText" style={styles.underline}>Terms</TextComponent> & <TextComponent type="mediumText" style={styles.underline}>Privacy Policy</TextComponent>.
                        </TextComponent>
                    </View>
                );

            case "PASSWORD_ENTRY":
                return (
                    <View style={styles.stepContainer}>
                        <Image source={require("../../assets/lotus_icon.png")} style={styles.icon} resizeMode="contain" />
                        <TextComponent type="headerSubBoldText" style={styles.modalTitle}>Set Your Password</TextComponent>
                        <TextComponent type="mediumText" style={styles.modalDescription}>
                            Create a secure password to protect your account and save your progress.
                        </TextComponent>

                        <View style={styles.inputGroup}>
                            <TextComponent type="semiBoldText" style={styles.label}>Password</TextComponent>
                            <View style={styles.passwordWrapper}>
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter password"
                                    secureTextEntry={!showPassword}
                                    style={[styles.input, passwordError ? styles.inputError : null, { paddingRight: 50 }]}
                                    placeholderTextColor="#999"
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#999" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { marginTop: 15 }]}>
                            <TextComponent type="semiBoldText" style={styles.label}>Confirm Password</TextComponent>
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Re-enter password"
                                secureTextEntry={!showPassword}
                                style={[styles.input, passwordError ? styles.inputError : null]}
                                placeholderTextColor="#999"
                                editable={!loading}
                            />
                            {passwordError && (
                                <TextComponent type="mediumText" style={styles.errorText}>
                                    {passwordError}
                                </TextComponent>
                            )}
                        </View>

                        <View style={styles.passwordFooter}>
                            <TouchableOpacity onPress={() => setCurrentStep("EMAIL_ENTRY")}>
                                <TextComponent type="mediumText" style={styles.backToEmail}>Change Email</TextComponent>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                onClose();
                                navigation.navigate("ForgotPassword");
                            }}>
                                <TextComponent type="boldText" style={styles.forgotPassword}>Forgot Password?</TextComponent>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryButton, loading && styles.disabledButton]}
                            onPress={handlePasswordContinue}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <TextComponent type="boldText" style={styles.primaryButtonText}>Continue to OTP</TextComponent>}
                        </TouchableOpacity>
                    </View>
                );

            case "OTP_ENTRY":
                return (
                    <View style={styles.stepContainer}>
                        <View style={styles.otpIconCircle}>
                            <TextComponent type="boldText" style={{ fontSize: 40 }}>📧</TextComponent>
                        </View>
                        <TextComponent type="headerSubBoldText" style={styles.modalTitle}>Login Verification</TextComponent>
                        <TextComponent type="mediumText" style={styles.modalDescription}>
                            We've sent a 6-digit code to:
                        </TextComponent>

                        <View style={styles.emailBadge}>
                            <TextComponent type="boldText" style={styles.emailBadgeText} numberOfLines={1}>
                                {email}
                            </TextComponent>
                        </View>

                        <View style={styles.inputGroup}>
                            <TextInput
                                value={otp}
                                onChangeText={setOtp}
                                placeholder="Enter OTP"
                                keyboardType="number-pad"
                                maxLength={6}
                                style={[styles.otpInput, otpError ? styles.inputError : null]}
                                placeholderTextColor="#999"
                                editable={!loading}
                            />
                            {otpError && (
                                <TextComponent type="mediumText" style={[styles.errorText, { textAlign: 'center' }]}>
                                    {otpError}
                                </TextComponent>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryButton, (loading || otp.length < 4) && styles.disabledButton]}
                            onPress={handleVerifyOTP}
                            disabled={loading || otp.length < 4}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <TextComponent type="boldText" style={styles.primaryButtonText}>Verify & Continue</TextComponent>}
                        </TouchableOpacity>

                        <View style={styles.otpFooter}>
                            <TouchableOpacity onPress={handleResend} disabled={loading || cooldown > 0}>
                                <TextComponent type="mediumText" style={[styles.resendText, cooldown > 0 && { color: '#ccc' }]}>
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                                </TextComponent>
                            </TouchableOpacity>
                            <TextComponent type="mediumText" style={{ color: '#D4A017', marginHorizontal: 15 }}>|</TextComponent>
                            <TouchableOpacity onPress={() => setCurrentStep("PASSWORD_ENTRY")}>
                                <TextComponent type="mediumText" style={styles.resendText}>Back</TextComponent>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
        }
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            backdropOpacity={0.6}
            animationIn="fadeInUp"
            animationOut="fadeOutDown"
            useNativeDriver
            hideModalContentWhileAnimating
            style={styles.modal}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1, justifyContent: "center" }}
            >
                <View style={styles.modalContentWrapper}>
                    <LinearGradient
                        colors={["#FFFFFF", "#FFFDF9"]}
                        style={styles.gradient}
                    >
                        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} keyboardShouldPersistTaps="handled">
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <View style={styles.closeButtonCircle}>
                                    <Image source={require("../../assets/Cross.png")} style={styles.closeIcon} />
                                </View>
                            </TouchableOpacity>

                            {renderStep()}
                        </ScrollView>
                    </LinearGradient>
                    {/* Hidden ReCaptcha */}
                    <ReCaptchaRuntime ref={recaptchaRef} onToken={onRecaptchaToken} />
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 20,
        justifyContent: "center",
    },
    modalContentWrapper: {
        borderRadius: 32,
        overflow: "hidden",
        elevation: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.58,
        shadowRadius: 16.0,
    },
    gradient: {
        borderRadius: 32,
        width: "100%",
        maxHeight: screenWidth * 1.6,
    },
    scrollContent: {
        padding: 24,
        alignItems: "center",
    },
    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 10,
    },
    closeButtonCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#E6B02E",
        justifyContent: "center",
        alignItems: "center"
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: "#000",
    },
    stepContainer: {
        width: "100%",
        alignItems: "center",
        paddingTop: 10,
    },
    icon: {
        width: 64,
        height: 50,
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: FontSize.CONSTS.FS_22,
        color: "#2b2b2b",
        textAlign: "center",
        marginBottom: 8,
    },
    modalDescription: {
        fontSize: FontSize.CONSTS.FS_14,
        color: "#707070",
        textAlign: "center",
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    benefitsContainer: {
        width: "100%",
        marginBottom: 20,
        alignItems: "center"
    },
    benefitRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        width: "80%"
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#2b2b2b",
        marginRight: 10,
    },
    benefitText: {
        fontSize: FontSize.CONSTS.FS_13,
        color: "#2b2b2b",
    },
    inputGroup: {
        width: "100%",
        marginBottom: 20,
    },
    label: {
        fontSize: FontSize.CONSTS.FS_14,
        color: "#2b2b2b",
        marginBottom: 8,
        paddingLeft: 4,
    },
    input: {
        width: "100%",
        height: 50,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        paddingHorizontal: 16,
        fontSize: FontSize.CONSTS.FS_16,
        color: "#2b2b2b",
        backgroundColor: "#fff",
    },
    inputError: {
        borderColor: "#ff4444",
        backgroundColor: "#fff8f8",
    },
    errorText: {
        fontSize: FontSize.CONSTS.FS_13,
        color: "#ff4444",
        marginTop: 8,
        paddingLeft: 4,
    },
    hintText: {
        fontSize: FontSize.CONSTS.FS_13,
        color: "#707070",
        marginTop: 8,
        paddingLeft: 4,
    },
    primaryButton: {
        width: "100%",
        height: 54,
        backgroundColor: "#E6B02E",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#E6B02E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 10,
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: FontSize.CONSTS.FS_20,
    },
    disabledButton: {
        opacity: 0.6,
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
        width: "100%",
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#e0e0e0",
    },
    dividerText: {
        marginHorizontal: 15,
        color: "#999",
        fontSize: FontSize.CONSTS.FS_12,
    },
    googleButton: {
        width: "100%",
        height: 50,
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    googleButtonText: {
        color: "#444",
        fontSize: FontSize.CONSTS.FS_16,
    },
    footerLink: {
        marginTop: 20,
    },
    footerLinkText: {
        color: "#2b2b2b",
        fontSize: FontSize.CONSTS.FS_14,
    },
    disclaimerText: {
        marginTop: 15,
        fontSize: FontSize.CONSTS.FS_12,
        color: "#999",
        textAlign: "center",
        paddingHorizontal: 10,
    },
    underline: {
        textDecorationLine: "underline"
    },
    passwordWrapper: {
        position: "relative",
        width: "100%"
    },
    eyeButton: {
        position: "absolute",
        right: 16,
        top: 14,
    },
    passwordFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: -10,
        marginBottom: 20
    },
    backToEmail: {
        color: "#707070",
        textDecorationLine: "underline",
        fontSize: FontSize.CONSTS.FS_14
    },
    forgotPassword: {
        color: "#D4A017",
        fontSize: FontSize.CONSTS.FS_14
    },
    otpIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#EEF2FF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20
    },
    emailBadge: {
        backgroundColor: "#FDF8EE",
        borderColor: "#F5E6CC",
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: "100%",
        marginBottom: 25,
        alignItems: "center"
    },
    emailBadgeText: {
        fontSize: FontSize.CONSTS.FS_18,
        color: "#2b2b2b"
    },
    otpInput: {
        width: "100%",
        height: 60,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        textAlign: "center",
        fontSize: 28,
        fontWeight: "bold",
        letterSpacing: 8,
        color: "#2b2b2b",
        backgroundColor: "#fff",
    },
    otpFooter: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 25
    },
    resendText: {
        color: "#707070",
        fontSize: FontSize.CONSTS.FS_14,
        textDecorationLine: "underline",
        textDecorationColor: "#E6B02E"
    }
});

export default CommunityAuthModal;
