/**
 * CycleTransitionsContainer — Renders info screens, checkpoints, and reveal screens.
 * Maps to Vue CycleTransitionsContainer.vue.
 *
 * Two modes:
 *   1. INFO REVEAL MODE (info_reveal / offering_reveal):
 *      Custom detail layout for mantra, sankalp, or practice — shows title,
 *      devanagari, IAST, meaning, collapsible wisdom cards, deity/tradition
 *      metadata, and a Start button rendered via BlockRenderer footer blocks.
 *
 *   2. GENERIC TRANSITION MODE:
 *      Standard block layout for check-in, trigger advice, checkpoints, etc.
 *      Renders header / content / footer / page_bottom blocks.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';
import { Fonts } from '../theme/fonts';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CycleTransitionsContainerProps {
  schema: any;
}

type ActivityType = 'mantra' | 'sankalp' | 'practice' | null;

// ---------------------------------------------------------------------------
// Default fallback data (mirrors Vue version)
// ---------------------------------------------------------------------------

const defaultMantra = {
  title: 'Prithvi Gayatri',
  subtitle:
    '\u0913\u092E \u092A\u0943\u0925\u094D\u0935\u0940 \u0926\u0947\u0935\u094D\u092F\u0948 \u091A \u0935\u093F\u0926\u094D\u092E\u0939\u0947 \u0938\u0939\u0938\u094D\u0930\u092E\u0942\u0930\u094D\u0924\u094D\u092F\u0948 \u091A \u0927\u0940\u092E\u0939\u093F \u0924\u0928\u094D\u0928\u094B \u0927\u0930\u093E \u092A\u094D\u0930\u091A\u094B\u0926\u092F\u093E\u0924\u094D',
  english:
    'Om Prithvi Devyai Cha Vidmahe\nSahasramurtyai Cha Dhimahi\nTanno Dhara Prachodayat',
  meaning: 'Invokes the \u2018Earth\u2019 element for grounding and physical stability.',
  essence: 'Invokes the \u2018Earth\u2019 element for grounding and physical stability.',
  benefits: 'Promotes patience, stability, and deep connection with the nature.',
};

const defaultSankalp = {
  how_to_live:
    'I gently loosen the pace of my day, allowing my inner world to breathe freely again.',
  essence:
    'Slowing down reduces rajas and soothes prana. In yogic teachings, a calm heart reflects a calm mind. This sankalp invites rhythm, ease, and emotional softness.',
  benefits: ['Steadier emotions', 'Lower stress', 'Sense of inner rhythm'],
};

const defaultPractice = {
  why_works:
    'Mindful movement and focused breath transition the nervous system from a state of alertness to one of calm and restoration.',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hasContent = (val: any): boolean => {
  if (!val) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.some((item) => hasContent(item));
  if (typeof val === 'object') return Object.keys(val).length > 0;
  return true;
};

const formatShift = (shift: string | undefined): string => {
  if (!shift) return '';
  if (!shift.includes('\u2192') && !shift.includes('->')) return shift;
  const parts = shift.split(/\u2192|->/).map((s) => s.trim());
  if (parts.length === 2) {
    return `moving from ${parts[0]} toward ${parts[1]}`;
  }
  return shift;
};

// ---------------------------------------------------------------------------
// Collapsible Card sub-component
// ---------------------------------------------------------------------------

interface CollapsibleCardProps {
  label: string;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  label,
  children,
  expanded,
  onToggle,
}) => (
  <TouchableOpacity
    style={[styles.card, expanded && styles.cardExpanded]}
    onPress={() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onToggle();
    }}
    activeOpacity={0.8}
  >
    <View style={styles.cardHeader}>
      <View style={styles.dividerLeft} />
      <View style={styles.headerLabelGroup}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.toggleIcon}>{expanded ? '\u25B2' : '\u25BC'}</Text>
      </View>
      <View style={styles.dividerRight} />
    </View>
    {expanded && <View style={styles.cardContent}>{children}</View>}
  </TouchableOpacity>
);

// ---------------------------------------------------------------------------
// Section Header (non-collapsible) — e.g. "How To Live", "What this practice asks of you"
// ---------------------------------------------------------------------------

interface SectionHeaderProps {
  label: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ label }) => (
  <View style={styles.cardHeader}>
    <View style={styles.dividerLeft} />
    <Text style={styles.cardLabel}>{label}</Text>
    <View style={styles.dividerRight} />
  </View>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const CycleTransitionsContainer: React.FC<CycleTransitionsContainerProps> = ({ schema }) => {
  const { updateBackground, updateHeaderHidden, screenData, currentStateId } = useScreenStore();

  // Expand/collapse state
  const [isMantraExpanded, setIsMantraExpanded] = useState(false);
  const [meaningExpanded, setMeaningExpanded] = useState(false);
  const [essenceExpanded, setEssenceExpanded] = useState(false);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);

  React.useEffect(() => {
    updateBackground(null);
    updateHeaderHidden(false);
  }, []);

  // Reset expand state when info title changes
  const infoTitle = screenData?.info?.title;
  React.useEffect(() => {
    setIsMantraExpanded(false);
    setMeaningExpanded(false);
    setEssenceExpanded(false);
    setBenefitsExpanded(false);
  }, [infoTitle]);

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const info = useMemo(() => screenData?.info || {}, [screenData]);

  const stateId = currentStateId || '';

  const currentType: ActivityType = useMemo(() => {
    if (
      screenData?.info_is_mantra ||
      screenData?.activity_type === 'mantra' ||
      info.type === 'mantra'
    )
      return 'mantra';
    if (
      screenData?.info_is_sankalp ||
      screenData?.activity_type === 'sankalp' ||
      info.type === 'sankalp'
    )
      return 'sankalp';
    if (
      screenData?.info_is_practice ||
      screenData?.activity_type === 'practice' ||
      info.type === 'practice'
    )
      return 'practice';
    return null;
  }, [screenData, info]);

  const isInfoScreen = useMemo(
    () =>
      (stateId === 'info_reveal' || stateId === 'offering_reveal') &&
      currentType !== null,
    [stateId, currentType],
  );

  // Block buckets
  const blocks = schema?.blocks || [];
  const headerBlocks = useMemo(
    () => blocks.filter((b: any) => b.position === 'header'),
    [blocks],
  );
  const contentBlocks = useMemo(
    () => blocks.filter((b: any) => !b.position || b.position === 'content'),
    [blocks],
  );
  const footerBlocks = useMemo(
    () => blocks.filter((b: any) => b.position === 'footer' || b.position === 'footer_actions'),
    [blocks],
  );
  const pageBottomBlocks = useMemo(
    () => blocks.filter((b: any) => b.position === 'page_bottom'),
    [blocks],
  );

  // Mantra / Sanskrit text with fallbacks
  const mantraText = useMemo(() => {
    if (info.title) return info.title;
    return currentType === 'mantra' ? defaultMantra.english : null;
  }, [info, currentType]);

  const sanskritText = useMemo(() => {
    if (info.subtitle) return info.subtitle;
    return currentType === 'mantra' ? defaultMantra.subtitle : null;
  }, [info, currentType]);

  // Sankalp data with fallbacks
  const sankalpData = useMemo(
    () => ({
      how_to_live: hasContent(info.how_to_live)
        ? info.how_to_live
        : defaultSankalp.how_to_live,
      essence: hasContent(info.essence) ? info.essence : defaultSankalp.essence,
      benefits: hasContent(info.benefits) ? info.benefits : defaultSankalp.benefits,
      why_works: hasContent(info.why_works)
        ? info.why_works
        : defaultPractice.why_works,
    }),
    [info],
  );

  // Wisdom metadata
  const hasWisdom = useMemo(
    () =>
      !!(info.deityDisplay || info.tradition || info.shift || info.usage || info.grounding),
    [info],
  );

  // Tag interpolation (for generic transition mode)
  const interpolatedTag = useMemo(() => {
    if (!schema?.tag) return null;
    return schema.tag.replace(/\{\{(.*?)\}\}/g, (_match: string, p1: string) => {
      const keys = p1.trim().split('.');
      let v: any = screenData;
      for (const k of keys) {
        v = v?.[k];
      }
      return v !== undefined && v !== null ? String(v) : '';
    });
  }, [schema?.tag, screenData]);

  // ---------------------------------------------------------------------------
  // Toggle handlers
  // ---------------------------------------------------------------------------

  const toggle = useCallback(
    (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setter((prev) => !prev);
    },
    [],
  );

  if (!schema) return null;

  // =========================================================================
  // INFO REVEAL MODE
  // =========================================================================

  if (isInfoScreen) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.infoScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ---- Header: Title + Main Text ---- */}
          <View style={styles.infoHeader}>
            {/* Type-specific title (mantra / practice) */}
            {currentType !== 'sankalp' && info.title ? (
              <Text style={styles.deityTitle}>{info.title}</Text>
            ) : null}

            {/* Sanskrit / Devanagari subtitle */}
            {(sanskritText || info.subtitle) ? (
              <Text
                style={[
                  styles.sanskritText,
                  currentType !== 'mantra' && styles.serifSubtitle,
                ]}
              >
                {sanskritText || info.subtitle}
              </Text>
            ) : null}

            {/* IAST (mantra only) */}
            {currentType === 'mantra' && info.iast ? (
              <Text style={styles.englishMantra}>{info.iast}</Text>
            ) : null}

            {/* English fallback text */}
            {currentType === 'mantra' &&
            mantraText &&
            !info.iast &&
            mantraText.toLowerCase() !== (info.title || '').toLowerCase() ? (
              <Text
                style={styles.englishMantra}
                numberOfLines={isMantraExpanded ? undefined : 3}
              >
                {mantraText}
              </Text>
            ) : null}
          </View>

          {/* ---- Mantra expand toggle ---- */}
          {currentType === 'mantra' && (
            <View style={styles.mantraDividerZone}>
              <TouchableOpacity
                style={styles.mantraToggleBtn}
                onPress={toggle(setIsMantraExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.mantraToggleText}>
                  {isMantraExpanded
                    ? 'Tap to collapse \u2191'
                    : 'Tap to view full mantra \u2192'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ---- How To Live (Sankalp) ---- */}
          {currentType === 'sankalp' && (
            <View style={[styles.card, { marginTop: 8 }]}>
              <SectionHeader label="How To Live" />
              <View style={{ marginTop: 8 }}>
                {Array.isArray(sankalpData.how_to_live) ? (
                  sankalpData.how_to_live.map((item: string, idx: number) => (
                    <Text key={idx} style={styles.howToLiveText}>
                      {item}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.howToLiveText}>
                    &ldquo;{sankalpData.how_to_live}&rdquo;
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* ---- Practice Steps ---- */}
          {currentType === 'practice' && info.steps && info.steps.length > 0 && (
            <View style={[styles.card, { marginTop: 24 }]}>
              <SectionHeader label="What this practice asks of you" />
              <View style={styles.practiceStepsList}>
                {info.steps.map((step: string, i: number) => (
                  <View key={i} style={styles.practiceStep}>
                    <Text style={styles.stepNum}>{i + 1}.</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ---- Footer actions (Start button etc.) ---- */}
          {footerBlocks.length > 0 && (
            <View style={styles.infoActions}>
              {footerBlocks.map((block: any, i: number) => (
                <BlockRenderer key={`f-${i}`} block={block} />
              ))}
            </View>
          )}

          {/* ---- Collapsible Wisdom Cards ---- */}
          <View style={styles.collapsibleSections}>
            {/* Meaning */}
            {(currentType === 'sankalp' ||
              info.meaning ||
              info.essence ||
              defaultMantra.meaning) && (
              <CollapsibleCard
                label="Meaning"
                expanded={meaningExpanded}
                onToggle={toggle(setMeaningExpanded)}
              >
                <Text style={styles.cardText}>
                  {currentType === 'sankalp'
                    ? info.insight
                    : currentType === 'mantra'
                      ? info.meaning
                      : info.description}
                </Text>
              </CollapsibleCard>
            )}

            {/* Essence (mantra only) */}
            {currentType === 'mantra' &&
              (info.essence || defaultMantra.essence) && (
                <CollapsibleCard
                  label="Essence"
                  expanded={essenceExpanded}
                  onToggle={toggle(setEssenceExpanded)}
                >
                  <Text style={styles.cardText}>
                    {info.essence || defaultMantra.essence}
                  </Text>
                </CollapsibleCard>
              )}

            {/* Benefits */}
            {(currentType === 'sankalp' || hasContent(info.benefits)) && (
              <CollapsibleCard
                label={currentType === 'sankalp' ? 'Benefit' : 'Benefits'}
                expanded={benefitsExpanded}
                onToggle={toggle(setBenefitsExpanded)}
              >
                {currentType === 'sankalp' ? (
                  Array.isArray(sankalpData.benefits) ? (
                    <View style={styles.benefitList}>
                      {sankalpData.benefits.map((b: string, idx: number) => (
                        <Text key={idx} style={styles.benefitItem}>
                          {'\u2022'} {b}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.cardText}>{sankalpData.benefits}</Text>
                  )
                ) : Array.isArray(info.benefits) ? (
                  <View style={styles.benefitList}>
                    {info.benefits.map((b: string, idx: number) => (
                      <Text key={idx} style={styles.benefitItem}>
                        {'\u2022'} {b}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.cardText}>{info.benefits}</Text>
                )}
              </CollapsibleCard>
            )}

            {/* Why this works (practice only) */}
            {currentType === 'practice' && info.insight && (
              <CollapsibleCard
                label="Why this works"
                expanded={essenceExpanded}
                onToggle={toggle(setEssenceExpanded)}
              >
                <Text style={styles.cardText}>{info.insight}</Text>
              </CollapsibleCard>
            )}
          </View>

          {/* ---- Wisdom metadata ---- */}
          {hasWisdom && (
            <View style={styles.wisdomSection}>
              {info.deityDisplay && (
                <View style={styles.wisdomLine}>
                  <Text style={styles.wisdomLabel}>Deity:</Text>
                  <Text style={styles.wisdomText}>{info.deityDisplay}</Text>
                </View>
              )}
              {info.tradition && (
                <View style={styles.wisdomLine}>
                  <Text style={styles.wisdomLabel}>Tradition:</Text>
                  <Text style={styles.wisdomText}>{info.tradition}</Text>
                </View>
              )}
              {info.shift && (
                <View style={styles.wisdomLine}>
                  <Text style={styles.wisdomLabel}>Supports:</Text>
                  <Text style={styles.wisdomText}>{formatShift(info.shift)}</Text>
                </View>
              )}
              {info.usage && (
                <View style={styles.wisdomLine}>
                  <Text style={styles.wisdomText}>{info.usage}</Text>
                </View>
              )}
              {info.grounding && (
                <View style={styles.wisdomLine}>
                  <Text style={[styles.wisdomText, styles.wisdomGrounding]}>
                    {info.grounding}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ---- Page Bottom (e.g. Return Home link) ---- */}
          {pageBottomBlocks.length > 0 && (
            <View style={styles.pageBottom}>
              {pageBottomBlocks.map((block: any, i: number) => (
                <BlockRenderer key={`pb-${i}`} block={block} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // GENERIC TRANSITION MODE (check-in, trigger advice, checkpoints)
  // =========================================================================

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tag */}
        {(schema.tag || interpolatedTag) ? (
          <Text style={styles.tag}>{interpolatedTag || schema.tag}</Text>
        ) : null}

        {/* Header blocks */}
        {headerBlocks.length > 0 && (
          <View style={styles.header}>
            {headerBlocks.map((block: any, i: number) => (
              <BlockRenderer key={`h-${i}`} block={block} />
            ))}
          </View>
        )}

        {/* Content blocks */}
        <View style={styles.content}>
          {contentBlocks.map((block: any, i: number) => (
            <BlockRenderer key={`c-${i}`} block={block} />
          ))}
        </View>

        {/* Footer action buttons */}
        {footerBlocks.length > 0 && (
          <View style={styles.footer}>
            {footerBlocks.map((block: any, i: number) => (
              <BlockRenderer key={`f-${i}`} block={block} />
            ))}
          </View>
        )}

        {/* Page bottom blocks */}
        {pageBottomBlocks.length > 0 && (
          <View style={styles.pageBottom}>
            {pageBottomBlocks.map((block: any, i: number) => (
              <BlockRenderer key={`pb-${i}`} block={block} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const GOLD = '#c9a84c';
const GOLD_BORDER = '#d0902d';
const BROWN = '#432104';
const BG = '#fffdf9';

const styles = StyleSheet.create({
  // ---- Shared layout ----
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  infoScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
    alignItems: 'center',
  },

  // ---- Generic transition mode ----
  tag: {
    fontSize: 10,
    letterSpacing: 2.5,
    textAlign: 'center',
    color: '#bfa58a',
    marginBottom: 24,
    fontFamily: Fonts.sans.bold,
    textTransform: 'uppercase',
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  content: {
    marginBottom: 24,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
    gap: 12,
  },
  pageBottom: {
    marginTop: 24,
    alignItems: 'center',
    paddingBottom: 20,
  },

  // ---- Info reveal header ----
  infoHeader: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 500,
  },
  deityTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif.regular,
    fontWeight: '500',
    color: BROWN,
    textAlign: 'center',
  },
  sanskritText: {
    fontSize: 18,
    color: BROWN,
    textAlign: 'center',
    lineHeight: 26,
    // Devanagari font — falls back to system Devanagari on iOS/Android
    fontFamily: Platform.select({
      ios: 'Devanagari Sangam MN',
      android: 'NotoSansDevanagari-Regular',
      default: undefined,
    }),
  },
  serifSubtitle: {
    fontFamily: Fonts.serif.regular,
  },
  englishMantra: {
    fontSize: 18,
    color: BROWN,
    textAlign: 'center',
    fontFamily: Fonts.serif.regular,
    lineHeight: 27,
    opacity: 0.9,
  },

  // ---- Mantra toggle ----
  mantraDividerZone: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  mantraToggleBtn: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1.5,
    borderColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: GOLD,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mantraToggleText: {
    fontSize: 14,
    color: BROWN,
    fontFamily: Fonts.serif.regular,
    textAlign: 'center',
  },

  // ---- Card (collapsible + static) ----
  card: {
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.4)',
    width: '100%',
    maxWidth: 500,
    marginTop: 12,
  },
  cardExpanded: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dividerLeft: {
    flex: 1,
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.6,
  },
  dividerRight: {
    flex: 1,
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.6,
  },
  cardLabel: {
    fontSize: 20,
    fontWeight: '500',
    color: BROWN,
    fontFamily: Fonts.sans.medium,
  },
  toggleIcon: {
    fontSize: 12,
    color: GOLD_BORDER,
  },
  cardContent: {
    marginTop: 16,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: BROWN,
    fontFamily: Fonts.serif.regular,
    textAlign: 'center',
  },

  // ---- How to Live (Sankalp) ----
  howToLiveText: {
    fontSize: 17,
    lineHeight: 26,
    color: BROWN,
    opacity: 0.85,
    fontFamily: Fonts.serif.regular,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // ---- Practice Steps ----
  practiceStepsList: {
    gap: 12,
    marginTop: 16,
  },
  practiceStep: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  stepNum: {
    fontSize: 18,
    fontWeight: '600',
    color: BROWN,
    fontFamily: Fonts.sans.semiBold,
    minWidth: 24,
  },
  stepText: {
    fontSize: 18,
    color: BROWN,
    fontFamily: Fonts.sans.regular,
    lineHeight: 25,
    flex: 1,
  },

  // ---- Benefits list ----
  benefitList: {
    gap: 8,
  },
  benefitItem: {
    fontSize: 16,
    color: BROWN,
    fontFamily: Fonts.sans.regular,
    lineHeight: 22,
  },

  // ---- Footer actions in info mode ----
  infoActions: {
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    gap: 16,
  },

  // ---- Collapsible sections wrapper ----
  collapsibleSections: {
    width: '100%',
    maxWidth: 500,
    gap: 0,
  },

  // ---- Wisdom metadata ----
  wisdomSection: {
    marginTop: 8,
    paddingBottom: 8,
    width: '100%',
    maxWidth: 500,
    gap: 6,
  },
  wisdomLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingVertical: 2,
  },
  wisdomLabel: {
    fontSize: 14,
    color: BROWN,
    fontFamily: Fonts.sans.semiBold,
    opacity: 0.7,
  },
  wisdomText: {
    fontSize: 14,
    color: BROWN,
    fontFamily: Fonts.sans.regular,
    opacity: 0.7,
    flex: 1,
  },
  wisdomGrounding: {
    fontStyle: 'italic',
    opacity: 0.6,
  },
});

export default CycleTransitionsContainer;
