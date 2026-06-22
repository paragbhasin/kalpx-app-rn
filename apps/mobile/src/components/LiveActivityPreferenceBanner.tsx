import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useHeaderRightSlot } from "../context/HeaderRightSlotContext";
import { useToast } from "../context/ToastContext";
import { Colors } from "../theme/colors";
import { Fonts } from "../theme/fonts";

const PREFERRED_LA_KEY = "kalpx:preferred_la";

export type LiveActivityType = "mantra" | "sankalp" | "practice";

interface PreferredLA {
  type: LiveActivityType;
  name: string;
}

interface Props {
  experienceType: LiveActivityType;
  experienceName: string;
  onActivate?: () => void;
  // 'completion' renders the calmer inline banner used on completion screens
  variant?: "default" | "completion";
}


export function LiveActivityPreferenceBanner(props: Props) {
  return <LiveActivityPreferenceBannerCore {...props} />;
}

function LiveActivityPreferenceBannerCore({
  experienceType,
  experienceName,
  onActivate,
  variant = "default",
}: Props) {
  const { setHeaderRight } = useHeaderRightSlot();
  const isIOS = Platform.OS === "ios";
  const [visible, setVisible] = useState(false);
  const [conflictModal, setConflictModal] = useState(false);
  const [currentLA, setCurrentLA] = useState<PreferredLA | null>(null);
  const [conflictChoice, setConflictChoice] = useState<"keep" | "switch">("keep");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { showToast } = useToast();

  const experienceKey = `${experienceType}:${experienceName}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const preferredRaw = await AsyncStorage.getItem(PREFERRED_LA_KEY);
      if (cancelled) return;
      const pref: PreferredLA | null = preferredRaw ? JSON.parse(preferredRaw) : null;
      if (pref && pref.type === experienceType && pref.name === experienceName) return;
      setCurrentLA(pref);
      setVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    })();
    return () => { cancelled = true; };
  }, [experienceKey]);

  const dismiss = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  }, [fadeAnim]);

  const handleYes = useCallback(() => {
    setConflictChoice("switch");
    setConflictModal(true);
  }, []);

  // Keep refs fresh so the header chip always calls the latest callbacks
  const handleYesRef = useRef(handleYes);
  const dismissRef = useRef(dismiss);
  handleYesRef.current = handleYes;
  dismissRef.current = dismiss;

  // Inject compact chip into the GlobalScrollLayout header row on both platforms.
  // iOS: full two-line chip. Android: single-line compact chip to fit the shorter header.
  useEffect(() => {
    if (!visible) {
      setHeaderRight(null);
      return;
    }
    if (isIOS) {
      setHeaderRight(
        <Animated.View style={[styles.chip, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.chipAddBtn}
            onPress={() => handleYesRef.current()}
            hitSlop={8}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={16} color={Colors.gold} />
          </TouchableOpacity>
          <View style={styles.chipMiddle}>
            <Ionicons name="lock-open-outline" size={11} color={Colors.gold} />
            <View style={styles.chipTexts}>
              <Text style={styles.chipTitle}>Keep on Lock Screen</Text>
              <Text style={styles.chipSub}>See today's practice anytime</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.chipCloseBtn}
            onPress={() => dismissRef.current()}
            hitSlop={8}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={14} color="#B09870" />
          </TouchableOpacity>
        </Animated.View>
      );
    } else {
      // Android: compact single-line chip — fits the shorter Android header (~34px)
      setHeaderRight(
        <Animated.View style={[styles.chipAndroid, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.chipAndroidAddBtn}
            onPress={() => handleYesRef.current()}
            hitSlop={8}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={14} color={Colors.gold} />
          </TouchableOpacity>
          <View style={styles.chipAndroidMiddle}>
            <Ionicons name="lock-open-outline" size={10} color={Colors.gold} />
            <Text style={styles.chipAndroidTitle}>Lock Screen</Text>
          </View>
          <TouchableOpacity
            style={styles.chipAndroidCloseBtn}
            onPress={() => dismissRef.current()}
            hitSlop={8}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={12} color="#B09870" />
          </TouchableOpacity>
        </Animated.View>
      );
    }
  }, [visible, isIOS]);

  // Clear header slot on unmount
  useEffect(() => {
    return () => { setHeaderRight(null); };
  }, []);

  const handleConflictConfirm = () => {
    if (conflictChoice === "switch") {
      AsyncStorage.setItem(
        PREFERRED_LA_KEY,
        JSON.stringify({ type: experienceType, name: experienceName }),
      ).catch(() => {});
      onActivate?.();
      showToast(
        currentLA ? "Live Activity Switched!" : "Live Activity Added!",
        3500,
        "la_added",
        "Lock your screen to see it",
      );
    }
    setConflictModal(false);
    dismiss();
  };

  const renderConflictModal = () => (
    <Modal
      visible={conflictModal}
      transparent
      animationType="fade"
      onRequestClose={() => setConflictModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalIconWrap}>
            <Ionicons name="phone-portrait-outline" size={28} color={Colors.gold} />
          </View>

          {currentLA ? (
            <>
              <Text style={styles.modalTitle}>
                You already have a preferred{"\n"}Live Activity selected.
              </Text>

              <Text style={styles.modalLabel}>Current</Text>
              <View style={styles.modalNameCard}>
                <Text style={styles.modalNameText}>{currentLA.name}</Text>
              </View>

              <Text style={styles.modalLabel}>New</Text>
              <View style={styles.modalNameCard}>
                <Text style={styles.modalNameText}>{experienceName}</Text>
              </View>

              <Text style={styles.modalQuestion}>
                Which would you like to display on your lock screen?
              </Text>

              <TouchableOpacity
                style={[styles.radioRow, conflictChoice === "keep" && styles.radioRowSelected]}
                onPress={() => setConflictChoice("keep")}
                activeOpacity={0.8}
              >
                <View style={styles.radioOuter}>
                  {conflictChoice === "keep" && <View style={styles.radioInner} />}
                </View>
                <View style={styles.radioTextBlock}>
                  <Text style={styles.radioTitle}>Keep Current</Text>
                  <Text style={styles.radioSub} numberOfLines={1}>{currentLA.name}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.radioRow, conflictChoice === "switch" && styles.radioRowSelected]}
                onPress={() => setConflictChoice("switch")}
                activeOpacity={0.8}
              >
                <View style={styles.radioOuter}>
                  {conflictChoice === "switch" && <View style={styles.radioInner} />}
                </View>
                <View style={styles.radioTextBlock}>
                  <Text style={styles.radioTitle}>Switch to New</Text>
                  <Text style={styles.radioSub} numberOfLines={1}>{experienceName}</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.modalTitle}>Add as your Live Activity?</Text>
              <View style={styles.modalNameCard}>
                <Text style={styles.modalNameText}>{experienceName}</Text>
              </View>
              <Text style={styles.modalQuestion}>
                This will show on your lock screen while you practice.
              </Text>
            </>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setConflictModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConflictConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>{currentLA ? "Confirm" : "Add"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!visible) return null;

  // Chip lives in the GlobalScrollLayout header for all platforms — only the modal renders here
  return renderConflictModal();
}

const styles = StyleSheet.create({
  // --- Default variant: chip injected into GlobalScrollLayout header row ---
  chip: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#FFF8ED",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    overflow: "hidden",
  },
  chipAddBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: "#E8D9B5",
    alignItems: "center",
    justifyContent: "center",
  },
  chipMiddle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 5,
    gap: 5,
  },
  chipTexts: {
    flexShrink: 1,
  },
  chipTitle: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 10,
    color: "#2E1A06",
    lineHeight: 13,
  },
  chipSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 8.5,
    color: "#9B7E5C",
    lineHeight: 12,
    marginTop: 1,
  },
  chipCloseBtn: {
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderLeftWidth: 1,
    borderLeftColor: "#E8D9B5",
    alignItems: "center",
    justifyContent: "center",
  },

  // --- Android compact chip — single-line, fits the shorter Android header (~34px) ---
  chipAndroid: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#FFF8ED",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    overflow: "hidden",
  },
  chipAndroidAddBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRightWidth: 1,
    borderRightColor: "#E8D9B5",
    alignItems: "center",
    justifyContent: "center",
  },
  chipAndroidMiddle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 4,
  },
  chipAndroidTitle: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 10,
    color: "#2E1A06",
  },
  chipAndroidCloseBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderLeftWidth: 1,
    borderLeftColor: "#E8D9B5",
    alignItems: "center",
    justifyContent: "center",
  },

  // --- Conflict / confirmation modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.38)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalIconWrap: {
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 17,
    color: Colors.brownDeep,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  modalLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: Colors.brownMuted,
    alignSelf: "flex-start",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalNameCard: {
    width: "100%",
    backgroundColor: Colors.goldPale,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    alignItems: "center",
  },
  modalNameText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: Colors.brownDeep,
    textAlign: "center",
  },
  modalQuestion: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: Colors.brownDeep,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  radioRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderCream,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  radioRowSelected: {
    borderColor: Colors.gold,
    backgroundColor: "#FDF8EE",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gold,
  },
  radioTextBlock: {
    flex: 1,
  },
  radioTitle: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 14,
    color: Colors.brownDeep,
  },
  radioSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: Colors.brownMuted,
    marginTop: 1,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderCream,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: Colors.brownMuted,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: "#fff",
  },
});
