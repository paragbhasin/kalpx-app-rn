import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useScreenStore } from "../engine/useScreenBridge";
import { Fonts } from "../theme/fonts";

const { width } = Dimensions.get("window");

interface Option {
  id: string;
  title: string;
  description?: string;
  image?: any;
  icon?: string;
  label?: string;
  label_color?: string;
  tags?: string[];
  meta?: string;
  button_label?: string;
  button_style?: string;
  action?: any;
  selected?: boolean;
  fullWidth?: boolean;
}

interface ChoiceCardBlockProps {
  block: {
    id?: string;
    type: "choice_card" | "choice_grid";
    options?: Option[];
    options_key?: string;
    selection_mode?: "manual" | "auto" | "single_auto_advance";
    variant?: "list" | "grid" | "grid_3" | "premium-grid";
    target?: any;
    style?: any;
  };
}

// Local asset registry for schema-defined art paths from allContainers.js.
const SVG_ASSET_MAP: Record<string, any> = {
  "/assets/career1.svg": require("../../assets/career1.svg"),
  "/assets/health.svg": require("../../assets/health.svg"),
  "/assets/relationship.svg": require("../../assets/relationship.svg"),
  "/assets/spiritual-growth.svg": require("../../assets/spiritual_growth.png"),
  "/assets/spiritual_growth.png": require("../../assets/spiritual_growth.png"),
  "/assets/quick_1.svg": require("../../assets/quick_1.svg"),
  "/assets/quick_2.svg": require("../../assets/quick_2.svg"),
  "/assets/quick_3.svg": require("../../assets/quick_3.svg"),
  "/assets/quick_4.svg": require("../../assets/quick_4.svg"),
  "/assets/beginner.svg": require("../../assets/beginner.svg"),
  "/assets/intermediate.svg": require("../../assets/intermediate.svg"),
  "/assets/advanced.svg": require("../../assets/advanced.svg"),
  "/assets/wealth_1.svg": require("../../assets/wealth_1.svg"),
  "/assets/wealth_2.svg": require("../../assets/wealth_2.svg"),
  "/assets/wealth_3.svg": require("../../assets/wealth_3.svg"),
  "/assets/wealth_4.svg": require("../../assets/wealth_4.svg"),
  "/assets/health_1.svg": require("../../assets/health_1.svg"),
  "/assets/health_2.svg": require("../../assets/health_2.svg"),
  "/assets/health_3.svg": require("../../assets/health_3.svg"),
  "/assets/health_4.svg": require("../../assets/health_4.svg"),
  "/assets/health_5.svg": require("../../assets/health_5.svg"),
  "/assets/relation_1.svg": require("../../assets/relation_1.svg"),
  "/assets/relation_2.svg": require("../../assets/relation_2.svg"),
  "/assets/relation_3.svg": require("../../assets/relation_3.svg"),
  "/assets/relation_4.svg": require("../../assets/relation_4.svg"),
  "/assets/relation_5.svg": require("../../assets/relation_5.svg"),
  "/assets/buddhi.svg": require("../../assets/buddhi.svg"),
  "/assets/dharma.svg": require("../../assets/dharma.svg"),
  "/assets/shakthi.svg": require("../../assets/shakthi.svg"),
  "/assets/tejas.svg": require("../../assets/tejas.svg"),
  "/assets/viveka.svg": require("../../assets/viveka.svg"),
  "/assets/dash_mantra.svg": require("../../assets/dash_mantra.svg"),
  "/assets/dash_sankalp.svg": require("../../assets/dash_sankalp.svg"),
  "/assets/dash_action.svg": require("../../assets/dash_action.svg"),
  "/assets/level_lotus.svg": require("../../assets/level_lotus.svg"),
  "/assets/sankalp_centered.svg": require("../../assets/sankalp_centered.svg"),
  "/assets/sankalp_inner_peace.svg": require("../../assets/sankalp_inner_peace.svg"),
};

// SVG paths from allContainers.js → Ionicons fallback mapping.
const SVG_TO_IONICON: Record<string, string> = {
  // Discipline/Focus categories
  "/assets/career1.svg": "briefcase-outline",
  "/assets/health.svg": "heart-outline",
  "/assets/relationship.svg": "people-outline",
  "/assets/spiritual-growth.svg": "leaf-outline",
  // Quick check-in prana states
  "/assets/quick_1.svg": "flash-outline", // Energized
  "/assets/quick_2.svg": "happy-outline", // Balanced
  "/assets/quick_3.svg": "battery-dead-outline", // Drained
  "/assets/quick_4.svg": "thunderstorm-outline", // Agitated
  // Depth levels
  "/assets/beginner.svg": "sunny-outline",
  "/assets/intermediate.svg": "partly-sunny-outline",
  "/assets/advanced.svg": "flame-outline",
  // Sub-focus: Career
  "/assets/wealth_1.svg": "trending-up-outline",
  "/assets/wealth_2.svg": "briefcase-outline",
  "/assets/wealth_3.svg": "bulb-outline",
  "/assets/wealth_4.svg": "compass-outline",
  // Sub-focus: Health
  "/assets/health_1.svg": "fitness-outline",
  "/assets/health_2.svg": "body-outline",
  "/assets/health_3.svg": "bed-outline",
  "/assets/health_4.svg": "nutrition-outline",
  "/assets/health_5.svg": "medical-outline",
  // Sub-focus: Relationships
  "/assets/relation_1.svg": "heart-outline",
  "/assets/relation_2.svg": "chatbubbles-outline",
  "/assets/relation_3.svg": "hand-left-outline",
  "/assets/relation_4.svg": "people-outline",
  "/assets/relation_5.svg": "home-outline",
  // Dosha/qualities
  "/assets/buddhi.svg": "bulb-outline",
  "/assets/dharma.svg": "shield-checkmark-outline",
  "/assets/shakthi.svg": "flash-outline",
  "/assets/tejas.svg": "sunny-outline",
  "/assets/viveka.svg": "eye-outline",
  // Dashboard
  "/assets/dash_mantra.svg": "musical-notes-outline",
  "/assets/dash_sankalp.svg": "flag-outline",
  "/assets/dash_action.svg": "walk-outline",
  "/assets/level_lotus.svg": "flower-outline",
  "/assets/sankalp_centered.svg": "locate-outline",
  "/assets/sankalp_inner_peace.svg": "heart-circle-outline",
};

const FA_TO_IONICONS: Record<string, string> = {
  spinner: "sync",
  "heart-broken": "heart-disliked",
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

/** Resolve an icon/image path to either an Ionicons name or null */
const resolveIconName = (path: string | any): string | null => {
  if (typeof path !== "string") return null;
  // Check SVG mapping first
  if (SVG_TO_IONICON[path]) return SVG_TO_IONICON[path];
  // Check FontAwesome mapping
  const faName = path.replace("fas fa-", "");
  if (FA_TO_IONICONS[faName]) return FA_TO_IONICONS[faName];
  return null;
};

const resolveAsset = (path: string | any) => {
  if (typeof path !== "string") return null;
  return SVG_ASSET_MAP[path] || null;
};

const usesImageAsset = (path: string | any) =>
  path === "/assets/spiritual-growth.svg" ||
  path === "/assets/spiritual_growth.png";

const ChoiceCardBlock: React.FC<ChoiceCardBlockProps> = ({ block }) => {
  const {
    loadScreen,
    goBack,
    screenData: screenState,
    updateScreenData,
    currentScreen,
  } = useScreenStore();

  const options = useMemo(() => {
    if (block.options) return block.options;
    if (block.options_key && screenState[block.options_key]) {
      return screenState[block.options_key] as Option[];
    }
    return [];
  }, [block.options, block.options_key, screenState]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Initialize selection
  useEffect(() => {
    const initialSelected = options.find((opt) => opt.selected);
    if (initialSelected) {
      setSelectedId(initialSelected.id);
      updateScreenData(block.id || "current_choice", initialSelected.id);
    }
  }, []);

  const handleSelect = async (option: Option) => {
    setSelectedId(option.id);
    updateScreenData(block.id || "current_choice", option.id);

    const isAuto =
      block.selection_mode === "auto" ||
      block.selection_mode === "single_auto_advance";

    if (isAuto) {
      const { executeAction } = require("../engine/actionExecutor");
      const setScreenValue = (value: any, key: string) => {
        const { screenActions } = require("../store/screenSlice");
        const { store } = require("../store");
        store.dispatch(screenActions.setScreenValue({ key, value }));
      };
      const ctx = {
        loadScreen,
        goBack,
        setScreenValue,
        screenState: { ...screenState },
      };

      // 1. Check for on_select map from current screen schema (dynamic routing)
      const onSelectMap = currentScreen?.on_select;
      if (onSelectMap) {
        const targetAction = onSelectMap[option.id] || onSelectMap["default"];
        if (targetAction) {
          await executeAction(targetAction, ctx);
          return;
        }
      }

      // 2. Check for action on the option itself
      if (option.action) {
        await executeAction(option.action, ctx);
        return;
      }

      // 3. Handle block level target
      if (block.target) {
        await executeAction({ type: "navigate", target: block.target }, ctx);
      }
    }
  };

  const variant = typeof block.variant === "string" ? block.variant : "";
  const variantTokens = variant.split(/\s+/).filter(Boolean);
  const isGrid =
    block.type === "choice_grid" ||
    variantTokens.some((token) => token.includes("grid"));
  const isGrid3 = variantTokens.includes("grid_3");
  const isPremiumGrid =
    block.type === "choice_grid" || variantTokens.includes("premium-grid");
  const isDisciplineGrid =
    variantTokens.includes("discipline-grid") || block.id === "scan_focus";
  const numColumns = isGrid3 ? 3 : isGrid ? 2 : 1;

  return (
    <View style={[styles.container, isGrid && styles.gridContainer]}>
      {options.map((option, idx) => {
        const isSelected = selectedId === option.id;

        return (
          <TouchableOpacity
            key={option.id}
            activeOpacity={0.8}
            onPress={() => handleSelect(option)}
            style={[
              styles.card,
              !isGrid && styles.listCard,
              isGrid && styles.gridCard,
              isPremiumGrid && styles.premiumGridCard,
              isDisciplineGrid && styles.disciplineCard,
              isSelected && styles.selectedCard,
              isPremiumGrid && isSelected && styles.premiumSelectedCard,
              isDisciplineGrid && isSelected && styles.disciplineSelectedCard,
              {
                width: isGrid
                  ? option.fullWidth ||
                    (idx === options.length - 1 &&
                      options.length % numColumns !== 0)
                    ? "100%"
                    : `${100 / numColumns - 3}%`
                  : "100%",
                marginBottom: isGrid ? 12 : 0,
              },
            ]}
          >
            {/* Gold Accent Line for List View */}
            {!isGrid && isSelected && (
              <LinearGradient
                colors={["#db9928", "#dfac3e"]}
                style={styles.goldLine}
              />
            )}

            <View
              style={[
                styles.cardContent,
                isGrid && styles.gridCardContent,
                isPremiumGrid && styles.premiumGridContent,
                isDisciplineGrid && styles.disciplineGridContent,
                isGrid && option.fullWidth && styles.gridFullWidthContent,
              ]}
            >
              <View
                style={[
                  styles.leftPart,
                  isGrid && styles.gridLeftPart,
                  isPremiumGrid && styles.premiumGridLeftPart,
                  isDisciplineGrid && styles.disciplineGridLeftPart,
                  isGrid && option.fullWidth && styles.gridFullWidthLeftPart,
                ]}
              >
                {option.image || option.icon ? (
                  <View
                    style={[
                      styles.imageContainer,
                      isGrid && styles.gridImageContainer,
                      isPremiumGrid && styles.premiumImageContainer,
                      isDisciplineGrid && styles.disciplineImageContainer,
                    ]}
                  >
                    {(() => {
                      const iconPath = option.icon || option.image;
                      const assetSource = resolveAsset(iconPath);
                      const iconSize = isDisciplineGrid
                        ? usesImageAsset(iconPath)
                          ? 52
                          : 44
                        : isGrid && !isPremiumGrid
                          ? 36
                          : isPremiumGrid
                            ? 60
                            : 24;
                      if (assetSource) {
                        if (
                          usesImageAsset(iconPath) ||
                          typeof assetSource === "number"
                        ) {
                          return (
                            <Image
                              source={assetSource}
                              style={{ width: iconSize, height: iconSize }}
                              resizeMode="contain"
                            />
                          );
                        }

                        if (
                          typeof assetSource === "function" ||
                          (typeof assetSource === "object" &&
                            assetSource !== null)
                        ) {
                          const SVGComp =
                            (assetSource as any).default || assetSource;
                          if (
                            typeof SVGComp === "function" ||
                            (typeof SVGComp === "object" && SVGComp !== null)
                          ) {
                            const Component = SVGComp as any;
                            return (
                              <Component width={iconSize} height={iconSize} />
                            );
                          }
                        }
                      }
                      const iconName = resolveIconName(iconPath);
                      if (iconName) {
                        return (
                          <Ionicons
                            name={iconName as any}
                            size={iconSize}
                            color={isSelected ? "#D4A017" : "#432104"}
                          />
                        );
                      }
                      // Fallback: generic icon
                      return (
                        <Ionicons
                          name="flower-outline"
                          size={isPremiumGrid ? 32 : 24}
                          color="#432104"
                        />
                      );
                    })()}
                  </View>
                ) : null}

                <View
                  style={[
                    styles.details,
                    isPremiumGrid && styles.premiumDetails,
                  ]}
                >
                  <View
                    style={[
                      styles.titleRow,
                      isGrid && styles.gridTitleRow,
                      isPremiumGrid && styles.premiumTitleRow,
                    ]}
                  >
                    <Text
                      style={[
                        styles.title,
                        isGrid && styles.gridTitle,
                        isPremiumGrid && styles.premiumTitle,
                        isDisciplineGrid && styles.disciplineTitle,
                      ]}
                    >
                      {option.title || option.label}
                    </Text>
                    {option.label && !isGrid && (
                      <View
                        style={[
                          styles.labelBadge,
                          { backgroundColor: option.label_color || "#C59B63" },
                        ]}
                      >
                        <Text style={styles.labelText}>{option.label}</Text>
                      </View>
                    )}
                  </View>

                  {option.tags && (
                    <View
                      style={[
                        styles.tagsRow,
                        isGrid && styles.gridTagsRow,
                        isPremiumGrid && styles.premiumTagsRow,
                      ]}
                    >
                      {option.tags.map((tag, idx) => (
                        <Text
                          key={idx}
                          style={[
                            styles.tagText,
                            isPremiumGrid && styles.premiumTagText,
                            isDisciplineGrid && styles.disciplineTagText,
                          ]}
                        >
                          {tag}
                          {idx < option.tags!.length - 1 ? " • " : ""}
                        </Text>
                      ))}
                    </View>
                  )}

                  {option.description && !option.tags && (
                    <Text
                      style={[
                        styles.description,
                        (isGrid || isPremiumGrid) && styles.gridDescription,
                      ]}
                    >
                      {option.description}
                    </Text>
                  )}
                </View>
              </View>

              {/* Selection Indicator (Radio circle for list, hidden for premium grid) */}
              {!isPremiumGrid && (
                <View style={styles.indicatorContainer}>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
              )}
            </View>

            {option.button_label && (
              <View style={styles.cardAction}>
                <LinearGradient
                  colors={
                    option.button_style === "outline"
                      ? ["transparent", "transparent"]
                      : ["#db9928", "#dfac3e"]
                  }
                  style={[
                    styles.miniBtn,
                    option.button_style === "outline" && styles.miniBtnOutline,
                  ]}
                >
                  <Text
                    style={[
                      styles.miniBtnText,
                      option.button_style === "outline" &&
                        styles.miniBtnTextOutline,
                    ]}
                  >
                    {option.button_label}
                  </Text>
                </LinearGradient>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 10,
    gap: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
  },
  card: {
    borderWidth: 1.5,
    borderColor: "rgba(212, 160, 23, 0.3)",
    borderRadius: 16,
    backgroundColor: "#FFFDF9", // Explicit background for that premium look
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listCard: {
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 14,
  },
  gridCard: {
    paddingVertical: 10,
    // paddingHorizontal: 8,
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumGridCard: {
    borderRadius: 24,
    // minHeight: 100,
    // padding: 10,
    borderWidth: 1.5,
    borderColor: "rgba(212, 160, 23, 0.3)",
    backgroundColor: "#FFFDF9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedCard: {
    borderColor: "#C9A84C",
    borderWidth: 2,
    backgroundColor: "#FFFAF0",
    transform: [{ translateY: -2 }],
  },
  disciplineCard: {
    // minHeight: 160,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(229, 196, 127, 0.75)",
    backgroundColor: "rgba(255, 252, 247, 0.97)",
    shadowColor: "#B78A2E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
  },
  quickCheckinCard: {
    // minHeight: 178,
    // paddingVertical: 18,
    // paddingHorizontal: 12,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(229, 196, 127, 0.72)",
    backgroundColor: "rgba(255, 252, 247, 0.97)",
    shadowColor: "#B78A2E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  premiumSelectedCard: {
    shadowColor: "#C9A84C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#D9B44A",
  },
  disciplineSelectedCard: {
    borderColor: "#D6A82F",
    backgroundColor: "#FFFFFF",
    transform: [{ translateY: -1 }],
    shadowOpacity: 0.22,
  },
  quickCheckinSelectedCard: {
    borderColor: "#D6A82F",
    backgroundColor: "#FFFFFF",
    shadowOpacity: 0.2,
    transform: [{ translateY: -1 }],
  },
  goldLine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  gridCardContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumGridContent: {
    justifyContent: "center",
  },
  disciplineGridContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  quickCheckinGridContent: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  gridFullWidthContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  leftPart: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  gridLeftPart: {
    flexDirection: "column",
    gap: 6,
    alignItems: "center",
  },
  premiumGridLeftPart: {
    // gap: 12,
  },
  disciplineGridLeftPart: {
    gap: 10,
  },
  quickCheckinLeftPart: {
    gap: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  gridFullWidthLeftPart: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  imageContainer: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  gridImageContainer: {
    width: 40,
    height: 40,
    marginRight: 0,
  },
  premiumImageContainer: {
    width: 64,
    height: 64,
  },
  disciplineImageContainer: {
    width: 30,
    height: 30,
    marginRight: 0,
    marginBottom: 2,
  },
  quickCheckinImageContainer: {
    width: 64,
    height: 64,
    marginRight: 0,
    marginBottom: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  premiumImage: {
    width: "100%",
    height: "100%",
  },
  details: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  premiumDetails: {
    alignItems: "center",
  },
  quickCheckinDetails: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 4,
  },
  gridTitleRow: {
    justifyContent: "center",
  },
  premiumTitleRow: {
    marginBottom: 2,
  },
  quickCheckinTitleRow: {
    justifyContent: "center",
    marginBottom: 0,
  },
  title: {
    fontSize: 16,
    color: "#432104",
    fontFamily: Fonts.serif.bold,
    flex: 1,
    fontWeight: "600",
    textAlign: "center",
  },
  premiumTitle: {
    fontSize: 16,
    textAlign: "center",
  },
  gridTitle: {
    textAlign: "center",
  },
  disciplineTitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    flexShrink: 1,
  },
  quickCheckinTitle: {
    fontSize: 17,
    // lineHeight: 24,
    color: "#432104",
    textAlign: "center",
    flex: 0,
    alignSelf: "center",
    alignItems: "center",
  },
  labelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  labelText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
  },
  gridTagsRow: {
    justifyContent: "center",
  },
  premiumTagsRow: {
    marginTop: 0,
  },
  tagText: {
    fontSize: 13,
    color: "#616161",
    fontFamily: "Inter_400Regular",
  },
  premiumTagText: {
    fontSize: 14,
    color: "#432104",
    opacity: 0.6,
  },
  disciplineTagText: {
    fontSize: 14,
    lineHeight: 18,
    color: "#4B2B12",
    opacity: 0.9,
    fontFamily: "CormorantGaramond_400Regular",
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#432104",
    opacity: 0.8,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  gridDescription: {
    textAlign: "center",
  },
  indicatorContainer: {
    marginLeft: 8,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: "#D4CFC7",
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  radioOuterSelected: {
    borderColor: "#C9A84C",
    backgroundColor: "#FFFFFF",
  },
  radioInner: {
    width: 14,
    height: 14,
    backgroundColor: "#C9A84C",
    borderRadius: 7,
  },
  cardAction: {
    marginTop: 12,
    width: "100%",
  },
  miniBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  miniBtnOutline: {
    borderWidth: 1,
    borderColor: "#C9A84C",
  },
  miniBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  miniBtnTextOutline: {
    color: "#C9A84C",
  },
});

export default ChoiceCardBlock;
