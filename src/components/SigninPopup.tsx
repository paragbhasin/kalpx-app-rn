import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState, useRef } from "react";
import {
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
    TextInput,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { RootState } from "../store";

import Colors from "./Colors";
import FontSize from "./FontSize";
import TextComponent from "./TextComponent";
import { socialLoginUser } from "../screens/Login/actions";
import { generateOtp, signupUser } from "../screens/Signup/actions";
import { showSnackBar } from "../store/snackBarSlice";
import ReCaptchaRuntime from "../screens/Login/ReCaptchaRuntime";

const { width: screenWidth } = Dimensions.get("window");

interface SigninPopupProps {
    visible: boolean;
    onClose: () => void;
    onConfirmCancel: (practice: any) => void;
    onSadhanPress?: () => void;
    /** 🔹 Text values (to customize for each use case) */
    title: string;
    subText: string;
    subTitle?: string;
    MantraButtonTitle?: string;
    infoTexts: string[]; // e.g. ["Get daily reminders", "Track your streak", ...]
    bottomText?: string; // last line like "Want a gentle reminder..."
}

const SigninPopup: React.FC<SigninPopupProps> = ({
    visible,
    onConfirmCancel,
    onClose,
    title,
    subText,
    infoTexts,
    bottomText,
    subTitle,
    MantraButtonTitle,
    onSadhanPress
}) => {
    const dispatch = useDispatch<any>();
    const navigation: any = useNavigation();
    const recaptchaRef = useRef<any>(null);

    const user = useSelector((state: RootState) => state.login?.user || state.socialLoginReducer?.user);
    const isLoggedIn = !!user;
    const [currentStep, setCurrentStep] = useState<"GUEST_VIEW" | "PASSWORD_ENTRY" | "OTP_ENTRY">("GUEST_VIEW");

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Error state
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [otpError, setOtpError] = useState("");

    const [cooldown, setCooldown] = useState(0);
    const cooldownInterval = useRef<any>(null);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


    useEffect(() => {
        if (!visible) {
            setCurrentStep("GUEST_VIEW");
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

    const handleClose = () => {
        onClose();
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
            setOtpError("Please enter the code");
            return;
        }
        setOtpError("");
        setLoading(true);
        recaptchaRef.current?.requestNewToken();
    };

    const verifyOtpAndRegister = async (recaptchaToken: string) => {
        setLoading(true);
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
        if (isLoggedIn) {
            return (
                <View style={styles.modalContent}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Image source={require("../../assets/Cross.png")} style={styles.closeIcon} />
                    </TouchableOpacity>
                    <Image source={require("../../assets/lotus_icon.png")} style={styles.lotusIcon} resizeMode="contain" />
                    <TextComponent type="headerSubBoldText" style={styles.title}>{title}</TextComponent>
                    {subTitle && (
                        <TextComponent type="headerSubBoldText" style={[styles.title, { marginVertical: 4 }]}>{subTitle}</TextComponent>
                    )}
                    <View style={styles.headerBox}>
                        <TextComponent type="semiBoldText" style={styles.subText}>{subText}</TextComponent>
                    </View>
                    {infoTexts.map((text, index) => (
                        <TextComponent key={index} type="mediumText" style={styles.layerText}>{text}</TextComponent>
                    ))}
                    {bottomText && (
                        <TextComponent type="boldText" style={[styles.layerText, { marginTop: 8, color: Colors.Colors.Light_black }]}>
                            {bottomText}
                        </TextComponent>
                    )}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.fullButton} onPress={() => { onClose(); onSadhanPress?.(); }}>
                            <TextComponent type="headerSubBoldText" style={styles.buttonTitle}>{MantraButtonTitle || "Continue"}</TextComponent>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        switch (currentStep) {
            case "GUEST_VIEW":
                return (
                    <View style={styles.modalContent}>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Image source={require("../../assets/Cross.png")} style={styles.closeIcon} />
                        </TouchableOpacity>
                        <Image source={require("../../assets/lotus_icon.png")} style={styles.lotusIcon} resizeMode="contain" />
                        <TextComponent type="headerSubBoldText" style={styles.title}>{title}</TextComponent>

                        <View style={styles.headerBox}>
                            <TextComponent type="semiBoldText" style={styles.subText}>{subText}</TextComponent>
                        </View>

                        <View style={styles.benefitsList}>
                            {infoTexts.map((text, index) => (
                                <View key={index} style={styles.benefitRow}>
                                    <View style={styles.bullet} />
                                    <TextComponent type="mediumText" style={styles.benefitText}>{text}</TextComponent>
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
                            {emailError && <TextComponent type="mediumText" style={styles.errorText}>⚠️ {emailError}</TextComponent>}
                        </View>

                        <TouchableOpacity style={[styles.primaryButton, loading && styles.disabledButton]} onPress={handleContinue} disabled={loading}>
                            <TextComponent type="boldText" style={styles.primaryButtonText}>Continue with Email</TextComponent>
                        </TouchableOpacity>

                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <TextComponent type="mediumText" style={styles.dividerText}>OR</TextComponent>
                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} disabled={loading}>
                            <Image source={require("../../assets/devicon_google.png")} style={styles.googleIcon} />
                            <TextComponent type="boldText" style={styles.googleButtonText}>Continue with Google</TextComponent>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.footerLink} onPress={() => { onClose(); navigation.navigate("Login"); }}>
                            <TextComponent type="mediumText" style={styles.footerLinkText}>
                                Already have an account? <TextComponent type="boldText" style={{ color: Colors.Colors.App_theme }}>Log In</TextComponent>
                            </TextComponent>
                        </TouchableOpacity>
                    </View>
                );

            case "PASSWORD_ENTRY":
                return (
                    <View style={styles.modalContent}>
                        <TouchableOpacity onPress={() => setCurrentStep("GUEST_VIEW")} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#666" />
                        </TouchableOpacity>
                        <Image source={require("../../assets/lotus_icon.png")} style={styles.lotusIcon} resizeMode="contain" />
                        <TextComponent type="headerSubBoldText" style={styles.title}>Set Password</TextComponent>
                        <TextComponent type="mediumText" style={styles.modalDescription}>Create a password to save your progress.</TextComponent>

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
                                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#999" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
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
                            {passwordError && <TextComponent type="mediumText" style={styles.errorText}>{passwordError}</TextComponent>}
                        </View>

                        <TouchableOpacity style={[styles.primaryButton, loading && styles.disabledButton]} onPress={handlePasswordContinue} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <TextComponent type="boldText" style={styles.primaryButtonText}>Continue to OTP</TextComponent>}
                        </TouchableOpacity>
                    </View>
                );

            case "OTP_ENTRY":
                return (
                    <View style={styles.modalContent}>
                        <TouchableOpacity onPress={() => setCurrentStep("PASSWORD_ENTRY")} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#666" />
                        </TouchableOpacity>
                        <View style={styles.otpIconCircle}>
                            <TextComponent type="boldText" style={{ fontSize: 32 }}>📧</TextComponent>
                        </View>
                        <TextComponent type="headerSubBoldText" style={styles.title}>Verify Email</TextComponent>
                        <TextComponent type="mediumText" style={styles.modalDescription}>We've sent a code to: {email}</TextComponent>

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
                            {otpError && <TextComponent type="mediumText" style={[styles.errorText, { textAlign: 'center' }]}>{otpError}</TextComponent>}
                        </View>

                        <TouchableOpacity style={[styles.primaryButton, (loading || otp.length < 4) && styles.disabledButton]} onPress={handleVerifyOTP} disabled={loading || otp.length < 4}>
                            {loading ? <ActivityIndicator color="#fff" /> : <TextComponent type="boldText" style={styles.primaryButtonText}>Verify & Complete</TextComponent>}
                        </TouchableOpacity>

                        <View style={styles.otpFooter}>
                            <TouchableOpacity onPress={handleResend} disabled={loading || cooldown > 0}>
                                <TextComponent type="mediumText" style={[styles.resendText, cooldown > 0 && { color: '#ccc' }]}>
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                                </TextComponent>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
        }
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={handleClose}
            onBackButtonPress={handleClose}
            backdropOpacity={0.6}
            animationIn="zoomIn"
            animationOut="zoomOut"
            useNativeDriver
            hideModalContentWhileAnimating
        >
            <LinearGradient colors={["#FFFFFF", "#FFFFFF"]} style={styles.gradientBox}>
                <View style={styles.innerBox}>
                    {renderStep()}
                </View>
                <ReCaptchaRuntime ref={recaptchaRef} onToken={onRecaptchaToken} />
            </LinearGradient>
        </Modal>
    );
};

const styles = StyleSheet.create({
    gradientBox: {
        borderRadius: 24,
        overflow: "hidden",
    },
    innerBox: {
        backgroundColor: "white",
        borderRadius: 24,
        width: "100%",
    },
    modalContent: {
        padding: 24,
        alignItems: "center",
    },
    closeButton: {
        backgroundColor: Colors.Colors.App_theme,
        alignSelf: "flex-end",
        padding: 8,
        borderRadius: 20,
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
    },
    backButton: {
        alignSelf: "flex-start",
        padding: 8,
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
    },
    closeIcon: {
        width: 12,
        height: 12,
        tintColor: "#000",
    },
    lotusIcon: {
        height: 50,
        width: 50,
        alignSelf: "center",
        marginBottom: 10,
    },
    title: {
        fontSize: FontSize.CONSTS.FS_20,
        textAlign: "center",
        color: "#2b2b2b",
    },
    headerBox: {
        backgroundColor: "#FFF7E8",
        padding: 12,
        alignItems: "center",
        marginVertical: 10,
        borderRadius: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: '100%',
    },
    subText: {
        fontSize: FontSize.CONSTS.FS_14,
        color: Colors.Colors.blue_text,
        textAlign: "center",
    },
    benefitsList: {
        width: '100%',
        marginVertical: 10,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.Colors.App_theme,
        marginRight: 10,
    },
    benefitText: {
        fontSize: FontSize.CONSTS.FS_13,
        color: "#444",
    },
    layerText: {
        color: "#444",
        fontSize: FontSize.CONSTS.FS_13,
        textAlign: "center",
        marginTop: 4,
    },
    buttonRow: {
        width: '100%',
        marginTop: 20,
    },
    fullButton: {
        backgroundColor: "#D4A017",
        borderRadius: 12,
        width: "100%",
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonTitle: {
        color: Colors.Colors.white,
        fontSize: FontSize.CONSTS.FS_18,
    },
    inputGroup: {
        width: "100%",
        marginBottom: 16,
    },
    label: {
        fontSize: FontSize.CONSTS.FS_13,
        color: "#444",
        marginBottom: 6,
    },
    input: {
        width: "100%",
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        paddingHorizontal: 16,
        fontSize: FontSize.CONSTS.FS_14,
        color: "#2b2b2b",
        backgroundColor: "#f9f9f9",
    },
    inputError: {
        borderColor: "#ff4444",
    },
    errorText: {
        fontSize: FontSize.CONSTS.FS_12,
        color: "#ff4444",
        marginTop: 4,
    },
    primaryButton: {
        width: "100%",
        height: 50,
        backgroundColor: "#E6B02E",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: FontSize.CONSTS.FS_16,
    },
    disabledButton: {
        opacity: 0.6,
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 16,
        width: "100%",
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#eee",
    },
    dividerText: {
        marginHorizontal: 10,
        color: "#999",
        fontSize: FontSize.CONSTS.FS_12,
    },
    googleButton: {
        width: "100%",
        height: 48,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    googleIcon: {
        width: 18,
        height: 18,
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
        color: "#666",
        fontSize: FontSize.CONSTS.FS_13,
    },
    modalDescription: {
        fontSize: FontSize.CONSTS.FS_13,
        color: "#777",
        textAlign: "center",
        marginBottom: 20,
    },
    passwordWrapper: {
        position: "relative",
        width: "100%"
    },
    eyeButton: {
        position: "absolute",
        right: 12,
        top: 12,
    },
    otpIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16
    },
    otpInput: {
        width: "100%",
        height: 54,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        textAlign: "center",
        fontSize: 24,
        fontWeight: "bold",
        letterSpacing: 4,
        color: "#2b2b2b",
        backgroundColor: "#fff",
    },
    otpFooter: {
        marginTop: 20,
    },
    resendText: {
        color: "#D4A017",
        fontSize: FontSize.CONSTS.FS_14,
        textDecorationLine: "underline",
    }
});

export default SigninPopup;
