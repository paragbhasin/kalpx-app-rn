import React, { useEffect, useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import BlockRenderer from "../engine/BlockRenderer";
import { useScreenStore } from "../engine/useScreenBridge";
import { Fonts } from "../theme/fonts";

const { width, height } = Dimensions.get("window");

interface ChoiceStackContainerProps {
  schema: {
    id?: string;
    blocks: any[];
    tone?: {
      theme?: string;
      mood?: string;
      backgroundPosition?: string;
      backgroundSize?: string;
    };
    meta?: {
      section_label?: string;
    };
    dynamicMessages?: Record<string, any>;
  };
}

const ChoiceStackContainer: React.FC<ChoiceStackContainerProps> = ({
  schema,
}) => {
  const screenStateId = (schema as any).state_id;
  const updateBackground = useScreenStore(
    (state: any) => state.updateBackground,
  );
  const updateHeaderHidden = useScreenStore(
    (state: any) => state.updateHeaderHidden,
  );
  const screenData = useScreenStore((state: any) => state.screenData);

  useEffect(() => {
    updateBackground(require("../../assets/beige_bg.png"));
    updateHeaderHidden(false);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  // Dynamic blocks: applies dynamicMessages overrides based on scan_focus and prana_baseline_selection
  const dynamicBlocks = useMemo(() => {
    // Deep clone blocks to avoid mutating props
    const baseBlocks = (schema.blocks || []).map((b: any) =>
      JSON.parse(JSON.stringify(b)),
    );

    const dynamicMessages = schema.dynamicMessages;
    const disciplineStyle = schema.id === "discipline_select";
    if (!dynamicMessages) return baseBlocks;

    // 1. Get Focus/Category from screen state
    const focusRaw = screenData?.scan_focus || "default";
    const focus = Array.isArray(focusRaw) ? focusRaw[0] : focusRaw;

    // 2. Get Prana Baseline Selection (sub-category from previous screen)
    const pranaRaw = screenData?.prana_baseline_selection || "default";
    const prana = Array.isArray(pranaRaw) ? pranaRaw[0] : pranaRaw;

    const categoryMessages = dynamicMessages[focus] || dynamicMessages.default;
    const subCategoryMessages = categoryMessages?.[prana] || {};

    // Update Headline (Priority: Subcategory > Category > Default)
    const headlineBlock = baseBlocks.find(
      (b: any) => b.id === "depth_headline",
    );
    if (headlineBlock && categoryMessages) {
      headlineBlock.content =
        subCategoryMessages.headline ||
        categoryMessages.headline ||
        headlineBlock.content;
    }

    // Update Option Descriptions (text inside Gentle/Standard/Deep cards)
    const choiceCardBlock = baseBlocks.find(
      (b: any) => b.type === "choice_card",
    );
    if (choiceCardBlock && categoryMessages) {
      const descriptions =
        subCategoryMessages.option_descriptions ||
        categoryMessages.option_descriptions ||
        {};
      if (choiceCardBlock.options) {
        choiceCardBlock.options.forEach((opt: any) => {
          if (descriptions[opt.id]) {
            opt.description = descriptions[opt.id];
          }
        });
      }
    }

    return baseBlocks;
  }, [
    schema.blocks,
    schema.dynamicMessages,
    screenData?.scan_focus,
    screenData?.prana_baseline_selection,
  ]);

  const styledBlocks = useMemo(() => {
    const blocks = dynamicBlocks.map((b: any) => ({
      ...b,
      style: b.style ? { ...b.style } : undefined,
    }));

    if (schema.id !== "discipline_select") return blocks;

    blocks.forEach((block: any) => {
      if (block.type === "headline" && block.position === "header") {
        block.style = {
          ...(block.style || {}),
          fontSize: 30,
          lineHeight: 38,
          fontFamily: Fonts.serif.bold,
          textAlign: "center",
          color: "#432104",
          maxWidth: 520,
          marginBottom: 14,
        };
      }

      if (block.type === "subtext" && block.position === "header") {
        block.style = {
          ...(block.style || {}),
          fontSize: 16,
          lineHeight: 26,
          fontFamily: Fonts.serif.regular,
          textAlign: "center",
          color: "#4F331B",
          maxWidth: 560,
          marginBottom: 18,
        };
      }

      if (block.type === "primary_button" && block.position === "footer") {
        block.style = "discipline_gold";
      }

      if (
        block.type === "subtext" &&
        block.position === "footer" &&
        block.content === "Return to start"
      ) {
        block.style = {
          ...(block.style || {}),
          fontSize: 16,
          marginTop: 0,
          marginBottom: 6,
          color: "#5B3920",
          fontFamily: Fonts.serif.regular,
        };
      }

      if (
        block.type === "subtext" &&
        block.position === "footer" &&
        block.content !== "Return to start"
      ) {
        block.style = {
          ...(block.style || {}),
          fontSize: 16,
          lineHeight: 28,
          maxWidth: 560,
          color: "#4F331B",
          fontFamily: Fonts.serif.regular,
          textAlign: "center",
          marginTop: 2,
        };
      }
    });

    return blocks;
  }, [dynamicBlocks, schema.id]);

  // Filter blocks by position
  const headerBlocks = useMemo(
    () => styledBlocks.filter((b: any) => b.position === "header"),
    [styledBlocks],
  );
  const contentBlocks = useMemo(
    () =>
      styledBlocks.filter((b: any) => !b.position || b.position === "content"),
    [styledBlocks],
  );
  const footerBlocks = useMemo(
    () => styledBlocks.filter((b: any) => b.position === "footer"),
    [styledBlocks],
  );

  // Special UI flags
  const isDepthSelection =
    schema.id === "depth_selection" || screenStateId === "depth_selection";
  const isDisciplineSelect = schema.id === "discipline_select";

  return (
    <ScrollView
      style={[styles.scrollView, { paddingHorizontal: 6 }]}
      contentContainerStyle={[
        styles.scrollContent,
        isDepthSelection && styles.depthSelectionPadding,
        isDisciplineSelect && styles.disciplineScrollContent,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View
        style={[styles.header, isDisciplineSelect && styles.disciplineHeader]}
      >
        {headerBlocks.map((block: any, i: number) => (
          <BlockRenderer
            key={`header-${i}`}
            block={block}
            textColor="#432104"
          />
        ))}
      </View>

      {/* Depth Selection Divider */}
      {isDepthSelection && (
        <View style={styles.depthDivider}>
          <View style={styles.line} />
          <Text style={styles.microLabel}>
            {schema.meta?.section_label || "CHOOSE YOUR PRACTICE LEVEL"}
          </Text>
          <View style={styles.line} />
        </View>
      )}

      {/* Content Section */}
      <View
        style={[
          styles.content,
          isDepthSelection && styles.depthSelectionContent,
          isDisciplineSelect && styles.disciplineContent,
        ]}
      >
        {contentBlocks.map((block: any, i: number) => (
          <BlockRenderer
            key={`content-${i}`}
            block={block}
            textColor="#432104"
          />
        ))}
      </View>

      {/* Footer Section */}
      <View
        style={[styles.footer, isDisciplineSelect && styles.disciplineFooter]}
      >
        <View
          style={[
            styles.actions,
            isDepthSelection && styles.depthSelectionActions,
            isDisciplineSelect && styles.disciplineActions,
          ]}
        >
          {footerBlocks.map((block: any, i: number) => (
            <BlockRenderer
              key={`footer-${i}`}
              block={block}
              textColor="#432104"
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingBottom: 10,
    paddingTop: 10,
  },
  depthSelectionPadding: {
    paddingHorizontal: 4,
  },
  header: {
    marginTop: 10,
    marginBottom: 6,
    alignItems: "center",
  },
  disciplineHeader: {
    maxWidth: 560,
    alignSelf: "center",
    width: "100%",
    marginBottom: 1,
    paddingHorizontal: 24,
    paddingTop: 118,
  },
  content: {
    flex: 1,
    width: "100%",
  },
  depthSelectionContent: {
    width: "100%",
  },
  disciplineContent: {
    width: "100%",
    paddingHorizontal: 18,
    maxWidth: 640,
    alignSelf: "center",
  },
  footer: {
    alignItems: "center",
    flexDirection: "column",
    gap: 16,
  },
  actions: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  depthSelectionActions: {
    paddingHorizontal: 4,
    paddingTop: 2,
  },
  disciplineFooter: {
    width: "100%",
    paddingHorizontal: 20,
  },
  disciplineActions: {
    maxWidth: 640,
    paddingBottom: 120,
  },
  disciplineScrollContent: {
    paddingBottom: 140,
  },
  depthDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    // marginTop: 12,
    // marginBottom: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#D9A557",
  },
  microLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#CC9B2F",
    textTransform: "uppercase",
    fontFamily: Fonts.sans.bold,
  },
});

export default ChoiceStackContainer;
