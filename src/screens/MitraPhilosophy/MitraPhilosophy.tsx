import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgUri } from "react-native-svg";
import MitraScreen1 from "../../../assets/mitra_screen_1.svg";
import MitraScreen3 from "../../../assets/mitra_screen_3.svg";

import MitraScreen2 from "../../../assets/mitra_screen_2.svg";
import MitraScreen4 from "../../../assets/mitra_screen_4.svg";

import MitraScreen5 from "../../../assets/mitra_screen_5.svg";
import { useScreenStore } from "../../engine/useScreenBridge";
import store from "../../store";
import { screenActions } from "../../store/screenSlice";
import { Fonts } from "../../theme/fonts";

const HOME_BACKGROUND = require("../../../assets/mitra_bg.png");
const TOP_MANDALA = require("../../../assets/mitra_top_mandala.png");
const BOTTOM_MANDALA = require("../../../assets/mitra_bottom_mandala.png");
const MITRA_LOTUS = require("../../../assets/mitra_lotus.png");

const steps = [
  {
    icon: MitraScreen5,
    title: "You tell Mitra where you are",
    description: "Share what you're feeling or seeking.",
  },
  {
    icon: MitraScreen4,
    title: "Mitra builds your 14-day path",
    description: "A guided flow of mantra, sankalp, and practice.",
  },
  {
    icon: MitraScreen1,
    title: "Follow a simple daily rhythm",
    description: "Small steps you can return to each day.",
  },
  {
    icon: MitraScreen2,
    title: "You get support when needed",
    description: "Check in, reset, or use trigger support anytime.",
  },
  {
    icon: MitraScreen3,
    title: "You reflect and continue",
    description: "Pause, review, and choose your next path.",
  },
];

const renderStepIcon = (icon: any) => {
  if (typeof icon === "number") {
    const source = Image.resolveAssetSource(icon);
    return <SvgUri uri={source?.uri ?? null} width={36} height={36} />;
  }

  const IconComponent = icon;
  return <IconComponent width={36} height={36} />;
};

export default function MitraPhilosophy() {
  const navigation: any = useNavigation();

  const handleBeginJourney = () => {
    // Mitra v3: "Begin Journey" enters welcome_onboarding Turn 1 conversation.
    // LEGACY (commented out):
    // store.dispatch(screenActions.loadScreen({
    //   containerId: "choice_stack",
    //   stateId: "discipline_select",
    // }));
    store.dispatch(
      screenActions.setScreenValue({ key: "onboarding_turn", value: 1 }),
    );
    store.dispatch(
      screenActions.setScreenValue({
        key: "onboarding_draft_state",
        value: { started_at: Date.now() },
      }),
    );
    store.dispatch(
      screenActions.loadScreen({
        containerId: "welcome_onboarding",
        stateId: "turn_1",
      }),
    );
    navigation.navigate("AppDrawer", {
      screen: "HomePage",
      params: {
        screen: "HomePage",
        params: {
          screen: "DynamicEngine",
        },
      },
    });
  };
  const updateBackground = useScreenStore((state) => state.updateBackground);

  useEffect(() => {
    updateBackground(HOME_BACKGROUND);
    return () => updateBackground(null);
  }, [updateBackground]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#432104" />
        </TouchableOpacity>
        <View style={styles.fullCard}>
          <View pointerEvents="none" style={styles.frameOverlay}>
            <Image
              source={MITRA_LOTUS}
              style={styles.mitraLotus}
              resizeMode="contain"
            />
            <View style={styles.frameTopRow}>
              <Image
                source={TOP_MANDALA}
                style={styles.topMandalaLeft}
                resizeMode="contain"
              />
              <View style={styles.topConnector} />
              <Image
                source={TOP_MANDALA}
                style={styles.topMandalaRight}
                resizeMode="contain"
              />
            </View>

            <View style={styles.frameSides}>
              <View style={styles.sideLine} />
              <View style={styles.sideLine} />
            </View>

            <View style={styles.frameBottomRow}>
              <Image
                source={BOTTOM_MANDALA}
                style={styles.bottomMandalaLeft}
                resizeMode="contain"
              />
              <View style={styles.bottomConnector} />
              <Image
                source={BOTTOM_MANDALA}
                style={styles.bottomMandalaRight}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.title}>How KalpX Mitra Works</Text>
            <Text style={styles.subtitle}>
              Rooted in Sanatan wisdom, each mantra, sankalp, and practice is
              chosen with intention.
            </Text>
          </View>

          {/* Steps */}
          <View style={styles.stepsContainer}>
            {steps.map((step, idx) => (
              <View key={idx} style={styles.stepCard}>
                <View style={styles.stepIconWrap}>
                  {renderStepIcon(step.icon)}
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerMantra}>
              Small daily steps create real change.
            </Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={handleBeginJourney}
            >
              <Text style={styles.ctaText}>Begin Your Journey →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 40,
  },
  backBtn: {
    marginTop: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    textAlign: "center",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: "#5C5648",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
    maxWidth: 320,
  },
  stepsContainer: {
    gap: 14,
    paddingHorizontal: 10,
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: "#FAEFED75",

    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 6,
  },
  stepIconWrap: {
    width: 48,
    height: 48,

    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  fullCard: {
    backgroundColor: "#FAEFED75",

    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 86,
    paddingBottom: 46,
    borderWidth: 1,
    borderColor: "rgba(219, 180, 124, 0.4)",
    overflow: "visible",
    position: "relative",
    marginTop: 20,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    marginBottom: 4,
    fontWeight: "600",
  },
  stepDesc: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: "#432104",
    lineHeight: 20,
  },
  footer: {
    alignItems: "center",
    marginTop: 34,
  },
  footerMantra: {
    fontSize: 18,
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    color: "#5C5648",
    textAlign: "center",
    marginBottom: 24,
  },
  mitraLotus: {
    position: "absolute",
    top: -50,
    zIndex: 10,
    alignSelf: "center",
    width: 200,
    height: 150,
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: "visible",
  },
  frameTopRow: {
    position: "absolute",
    top: 14,
    left: -2,
    right: -2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  frameBottomRow: {
    position: "absolute",
    bottom: 10,
    left: 1,
    right: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  frameSides: {
    ...StyleSheet.absoluteFillObject,
    top: 38,
    bottom: 42,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sideLine: {
    width: 1,
    backgroundColor: "rgba(198, 151, 84, 0.38)",
  },
  topConnector: {
    bottom: 16,
    flex: 1,
    marginHorizontal: -10,
    height: 1,
    backgroundColor: "rgba(198, 151, 84, 0.45)",
  },
  bottomConnector: {
    bottom: 8,
    flex: 1,
    marginHorizontal: -12,
    height: 1,
    backgroundColor: "rgba(198, 151, 84, 0.45)",
  },
  topMandalaLeft: {
    width: 58,
    height: 42,
  },
  topMandalaRight: {
    width: 58,
    height: 42,
    transform: [{ scaleX: -1 }],
  },
  bottomMandalaLeft: {
    width: 80,
    height: 70,
  },
  bottomMandalaRight: {
    width: 80,
    height: 70,
    transform: [{ scaleX: -1 }],
  },
  ctaBtn: {
    minWidth: 190,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B89A73",
    paddingVertical: 16,
    paddingHorizontal: 34,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(245, 231, 211, 0.8)",
    shadowColor: "#8C6A46",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: Fonts.sans.semiBold,
    letterSpacing: 0.5,
  },
});
