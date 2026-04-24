/**
 * WhyThisModal — bottom sheet surfacing why today's triad was chosen.
 *
 * Two sections:
 *   1. THE PRINCIPLE — principle L1/L2/L3 from screenData.why_this
 *   2. YOUR PATH ITEMS — item name + per-item L1 from why_this_l1_items
 *      (per-item L2/L3 not yet available — requires future BE work)
 *
 * Source of truth: screenData.why_this + screenData.why_this_l1_items
 * No resolver calls — all content pre-populated by daily-view endpoint.
 * Sovereignty: each text node renders only when non-empty.
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";
import { extractWhyThis } from "./whyThisUtils";

const BeigeBg = require("../../../assets/beige_bg.png");

type Props = {
  visible: boolean;
  onClose: () => void;
  screenData?: Record<string, any>;
};

const WhyThisModal: React.FC<Props> = ({ visible, onClose, screenData }) => {
  const { level1, level2, level3 } = extractWhyThis(screenData);
  const hasPrinciple = !!(level1 || level2 || level3);

  const rawItems: { id: string; label: string }[] = Array.isArray(
    screenData?.why_this_l1_items,
  )
    ? screenData.why_this_l1_items
    : [];
  // Exclude the "principle" synthetic item — that content is the principle section above.
  const items = rawItems.filter((i) => i?.id !== "principle" && !!i?.label);
  const itemNameMap: Record<string, string> = {
    mantra: screenData?.card_mantra_title || "",
    sankalp: screenData?.card_sankalpa_title || "",
    practice: screenData?.card_ritual_title || "",
  };
  const hasItems = items.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <ImageBackground
            source={BeigeBg}
            style={styles.sheetBackground}
            imageStyle={styles.sheetImage}
          >
            {/* Drag handle */}
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>

            {/* Pinned header */}
            <View style={styles.header}>
              <Text style={styles.eyebrow}>WHY THIS WAS CHOSEN</Text>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="close_why_this"
              >
                <Ionicons name="close" size={22} color={Colors.brownMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.headerSeparator} />

            {/* Scrollable body */}
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}
            >
              {/* ── Section 1: THE PRINCIPLE ── */}
              {hasPrinciple && (
                <View style={styles.principleSection}>
                  <Text style={styles.sectionLabel}>THE PRINCIPLE</Text>
                  {!!level1 && <Text style={styles.l1}>{level1}</Text>}
                  {!!level2 && <Text style={styles.l2}>{level2}</Text>}

                  {/* Lotus Divider */}
                  <View style={styles.lotusDivider}>
                    <View style={styles.dividerLine} />
                    <Image
                      source={require("../../../assets/lotus_icon.png")}
                      style={styles.lotusIcon}
                    />
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Level 3 Quote Block */}
                  {!!level3 && (
                    <View style={styles.quoteBlock}>
                      <View style={styles.quoteIndicator} />
                      <View style={styles.quoteContent}>
                        <MaterialCommunityIcons
                          name="format-quote-open"
                          size={24}
                          color="#D4B68C"
                          style={styles.quoteIcon}
                        />
                        <Text style={styles.l3}>{level3}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* ── Section 2: YOUR PATH ITEMS ── */}
              {hasItems && (
                <View style={styles.itemsSection}>
                  <Text style={styles.sectionLabel}>YOUR PATH ITEMS</Text>
                  {items.map((item, idx) => {
                    const type = item.id.toLowerCase();
                    return (
                      <View key={item.id} style={styles.itemRow}>
                        <View style={styles.itemIconContainer}>
                          {type === "mantra" && (
                            <MaterialCommunityIcons
                              name="om"
                              size={20}
                              color="#9A7548"
                            />
                          )}
                          {type === "sankalp" && (
                            <Ionicons
                              name="heart-outline"
                              size={20}
                              color="#9A7548"
                            />
                          )}
                          {type === "practice" && (
                            <Ionicons
                              name="leaf-outline"
                              size={20}
                              color="#9A7548"
                            />
                          )}
                        </View>
                        <View style={styles.itemContent}>
                          <Text style={styles.itemEyebrow}>
                            {item.id.toUpperCase()}
                          </Text>
                          {!!itemNameMap[item.id] && (
                            <Text style={styles.itemName}>
                              {itemNameMap[item.id]}
                            </Text>
                          )}
                          <Text style={styles.itemLabel}>{item.label}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: "90%",
  },
  sheetBackground: {
    width: "100%",
  },
  sheetImage: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderCream,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  eyebrow: {
    fontFamily: Fonts.cinzel.bold,
    fontSize: 12,
    letterSpacing: 1.5,
    color: Colors.gold,
  },
  headerSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.goldHairline,
    marginHorizontal: 24,
    opacity: 0.5,
  },
  body: {
    flexShrink: 1,
  },
  bodyContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  mandalaWrapper: {
    position: "absolute",
    bottom: -50,
    right: -50,
    opacity: 0.15,
  },
  mandalaImage: {
    width: 300,
    height: 300,
  },
  sectionLabel: {
    marginTop: -10,
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.brownMuted,
    marginBottom: 15,
    opacity: 0.8,
  },
  principleSection: {
    marginBottom: 32,
  },
  l1: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: Colors.brownDeep,
    lineHeight: 28,
    marginBottom: 12,
  },
  l2: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#564B42",
    lineHeight: 24,
  },
  lotusDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.goldHairline,
    opacity: 0.4,
  },
  lotusIcon: {
    width: 20,
    height: 16,
    marginHorizontal: 12,
    tintColor: Colors.gold,
    opacity: 0.6,
  },
  quoteBlock: {
    flexDirection: "row",
    paddingLeft: 4,
  },
  quoteIndicator: {
    width: 2,
    backgroundColor: "#D4B68C",
    borderRadius: 1,
  },
  quoteContent: {
    flex: 1,
    paddingLeft: 16,
  },
  quoteIcon: {
    marginBottom: 4,
    marginLeft: -4,
  },
  l3: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#564B42",
    lineHeight: 24,
    fontStyle: "italic",
  },
  itemsSection: {
    // marginBottom: 4,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  itemIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(154, 117, 72, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(154, 117, 72, 0.15)",
  },
  itemContent: {
    flex: 1,
    justifyContent: "center",
  },
  itemEyebrow: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    letterSpacing: 1.1,
    color: Colors.gold,
    marginBottom: 2,
  },
  itemName: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: Colors.brownDeep,
    marginBottom: 2,
  },
  itemLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: Colors.textSoft,
    lineHeight: 18,
  },
});

export default WhyThisModal;
