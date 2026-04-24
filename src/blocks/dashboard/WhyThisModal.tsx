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

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
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
                <Ionicons name="close" size={20} color={Colors.brownMuted} />
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
                <>
                  {hasItems && (
                    <Text style={styles.sectionLabel}>THE PRINCIPLE</Text>
                  )}
                  {!!level1 && <Text style={styles.l1}>{level1}</Text>}
                  {!!level2 && (
                    <Text style={[styles.l2, !!level1 && styles.mt14]}>
                      {level2}
                    </Text>
                  )}
                  {!!(level2 && level3) && <View style={styles.divider} />}
                  {!!level3 && <Text style={styles.l3}>{level3}</Text>}
                </>
              )}

              {/* ── Section separator ── */}
              {hasPrinciple && hasItems && (
                <View style={styles.sectionSeparator} />
              )}

              {/* ── Section 2: YOUR PATH ITEMS ── */}
              {hasItems && (
                <>
                  <Text style={styles.sectionLabel}>YOUR PATH ITEMS</Text>
                  {items.map((item, idx) => (
                    <View
                      key={item.id}
                      style={[styles.itemRow, idx > 0 && styles.itemRowTop]}
                    >
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
                  ))}
                </>
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
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 1.3,
    color: Colors.gold,
  },
  headerSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.goldHairline,
    marginHorizontal: 20,
  },
  body: {
    flexShrink: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  sectionLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.brownMuted,
    marginBottom: 12,
  },
  l1: {
    fontFamily: Fonts.serif.bold,
    fontSize: 17,
    color: Colors.brownDeep,
    lineHeight: 24,
  },
  l2: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: Colors.textSoft,
    lineHeight: 23,
  },
  mt14: {
    marginTop: 14,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.goldHairline,
    marginVertical: 18,
  },
  l3: {
    fontFamily: Fonts.serif.regular,
    fontSize: 13,
    color: Colors.brownMuted,
    lineHeight: 20,
  },
  sectionSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderCream,
    marginVertical: 24,
  },
  itemRow: {
    gap: 3,
  },
  itemRowTop: {
    marginTop: 18,
  },
  itemEyebrow: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    letterSpacing: 1.1,
    color: Colors.gold,
  },
  itemName: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: Colors.brownDeep,
  },
  itemLabel: {
    fontFamily: Fonts.serif.regular,
    fontSize: 13,
    color: Colors.textSoft,
    lineHeight: 19,
  },
});

export default WhyThisModal;
