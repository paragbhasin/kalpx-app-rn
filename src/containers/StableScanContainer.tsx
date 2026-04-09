import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BaselineSliderBlock from "../blocks/BaselineSliderBlock";
import BlockRenderer from "../engine/BlockRenderer";
import { useScreenStore } from "../engine/useScreenBridge";
import { Fonts } from "../theme/fonts";

interface StableScanContainerProps {
  schema: any;
}

const FA_TO_IONICONS: Record<string, string> = {
  spinner: "sync",
  "heart-broken": "heart-dislike-outline",
  "user-slash": "person-remove",
  "signs-post": "map",
  "tachometer-alt": "speedometer",
  heart: "heart",
  fire: "flame",
  cloud: "cloud",
  "link-slash": "link-outline",
  tint: "water",
  "battery-quarter": "battery-dead",
  bed: "bed",
  "compress-arrows-alt": "contract",
  walking: "walk",
  pills: "medkit",
  "money-bill-wave": "cash",
  "hand-holding-usd": "wallet",
  "chart-line": "trending-up",
  "piggy-bank": "save",
  coins: "cash-outline",
  "user-secret": "person-outline",
  random: "shuffle-outline",
  "praying-hands": "hand-left-outline",
  "tint-slash": "water-outline",
  "hand-holding-heart": "heart-outline",
  "eye-slash": "eye-off-outline",
  om: "sparkles-outline",
  user: "person-outline",
  unlink: "unlink-outline",
};

const resolveIconName = (icon?: string) => {
  if (!icon) return "ellipse-outline";
  if (icon.startsWith("fas fa-")) {
    const faName = icon.replace("fas fa-", "");
    return FA_TO_IONICONS[faName] || "ellipse-outline";
  }
  return icon;
};

const StableScanContainer: React.FC<StableScanContainerProps> = ({ schema }) => {
  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore((state) => state.updateHeaderHidden);
  const screenState = useScreenStore((state) => state.screenData);
  const updateScreenData = useScreenStore((state) => state.updateScreenData);

  useEffect(() => {
    updateBackground(require("../../assets/beige_bg.png"));
    updateHeaderHidden(false);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  const selectionBlock = useMemo(
    () => (schema.blocks || []).find((b: any) => b.id === "prana_baseline_selection"),
    [schema.blocks],
  );
  const headerBlocks = useMemo(
    () => (schema.blocks || []).filter((b: any) => b.position === "header"),
    [schema.blocks],
  );
  const helperBlock = useMemo(
    () =>
      (schema.blocks || []).find(
        (b: any) => !b.position && b.type === "subtext" && b.content?.includes("adjust the sliders"),
      ),
    [schema.blocks],
  );
  const footerBlocks = useMemo(
    () => (schema.blocks || []).filter((b: any) => b.position === "footer"),
    [schema.blocks],
  );

  const focus = useMemo(() => {
    const raw = screenState.scan_focus || "default";
    return Array.isArray(raw) ? raw[0] : raw;
  }, [screenState.scan_focus]);

  const options = useMemo(() => {
    const focusOptions = schema.optionsMap?.[focus] || [];
    return focusOptions.map((opt: any, idx: number) => ({
      ...opt,
      fullWidth: opt.fullWidth || (idx === focusOptions.length - 1 && focusOptions.length % 2 === 1),
    }));
  }, [schema.optionsMap, focus]);

  const selectedId = useMemo(() => {
    const raw = screenState.prana_baseline_selection;
    if (raw) return raw;
    return options[0]?.id || null;
  }, [screenState.prana_baseline_selection, options]);

  useEffect(() => {
    if (!screenState.prana_baseline_selection && options[0]?.id) {
      updateScreenData("prana_baseline_selection", options[0].id);
    }
  }, [options, screenState.prana_baseline_selection, updateScreenData]);

  const sliderDefs = useMemo(() => {
    if (!selectedId) return [];
    return schema.subCategorySliders?.[selectedId] || [];
  }, [schema.subCategorySliders, selectedId]);

  const messageObj = useMemo(() => {
    const dynamicMessages = schema.dynamicMessages || {};
    return dynamicMessages[focus] || dynamicMessages.default || {};
  }, [schema.dynamicMessages, focus]);

  const decoratedHeaderBlocks = useMemo(
    () =>
      headerBlocks.map((block: any) => {
        if (block.id === "dynamic_prana_text") {
          return { ...block, content: messageObj.headline || block.content };
        }
        if (block.id === "dynamic_prana_subtext") {
          return { ...block, content: messageObj.subtext || block.content };
        }
        return block;
      }),
    [headerBlocks, messageObj],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        {decoratedHeaderBlocks.map((block: any, i: number) => (
          <BlockRenderer key={`header-${i}`} block={block} textColor="#432104" />
        ))}
      </View>

      <View style={styles.sectionDivider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>{selectionBlock?.section_title || "YOUR CURRENT STATE"}</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.cardsWrap}>
        {options.map((option: any) => {
          const isSelected = selectedId === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.85}
              onPress={() => updateScreenData("prana_baseline_selection", option.id)}
              style={[
                styles.optionCard,
                option.fullWidth && styles.optionCardFull,
                isSelected && styles.optionCardSelected,
              ]}
            >
              <View style={[styles.optionInner, option.fullWidth && styles.optionInnerFull]}>
                <Ionicons
                  name={resolveIconName(option.icon) as any}
                  size={option.fullWidth ? 34 : 38}
                  color="#BF8A4A"
                  style={styles.optionIcon}
                />
                <Text style={[styles.optionLabel, option.fullWidth && styles.optionLabelFull]}>
                  {option.label || option.title}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {helperBlock ? (
        <Text style={styles.helperText}>{helperBlock.content}</Text>
      ) : null}

      <View style={styles.slidersSection}>
        {sliderDefs.map((slider: any) => (
          <BaselineSliderBlock
            key={`${selectedId}-${slider.label}`}
            block={{
              id: `slider-${slider.label}`,
              label: slider.label,
              value: screenState[slider.label] ?? slider.value,
              min: 1,
              max: 10,
            }}
            textColor="#432104"
          />
        ))}
      </View>

      <View style={styles.footerSection}>
        {footerBlocks.map((block: any, i: number) => (
          <BlockRenderer key={`footer-${i}`} block={block} textColor="#432104" />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingTop: 72,
    paddingBottom: 120,
    paddingHorizontal: 18,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 10,
  },
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
    marginBottom: 18,
  },
  dividerText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    letterSpacing: 2.4,
    color: "#D4A017",
    textTransform: "uppercase",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(212, 160, 23, 0.22)",
  },
  cardsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  optionCard: {
    width: "48.2%",
    minHeight: 120,
    borderRadius: 22,
    borderWidth: 1.25,
    borderColor: "rgba(212, 160, 23, 0.55)",
    backgroundColor: "rgba(255, 253, 249, 0.96)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: "#C9A84C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  optionCardSelected: {
    borderColor: "#D4A017",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 7,
  },
  optionCardFull: {
    width: "100%",
    minHeight: 74,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  optionInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  optionInnerFull: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  optionIcon: {
    marginBottom: 0,
  },
  optionLabel: {
    fontFamily: Fonts.serif.bold,
    fontSize: 17,
    lineHeight: 22,
    color: "#5B4636",
    textAlign: "center",
  },
  optionLabelFull: {
    textAlign: "center",
  },
  helperText: {
    marginTop: 14,
    marginBottom: 6,
    textAlign: "center",
    color: "#8C8881",
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
    fontFamily: Fonts.serif.regular,
  },
  slidersSection: {
    marginTop: 4,
    gap: 8,
  },
  footerSection: {
    marginTop: 12,
    alignItems: "center",
  },
});

export default StableScanContainer;
