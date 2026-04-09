import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Image, Dimensions } from 'react-native';
import { useScreenStore } from '../engine/useScreenBridge';
import Header from '../components/Header';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { executeAction } from '../engine/actionExecutor';
import { getContainerSync } from '../engine/screenResolver';
import { Video, ResizeMode } from 'expo-av';
import { Fonts } from '../theme/fonts';
import SevenDaysLotus from '../../assets/7days_lotus.svg';
import { SvgUri } from 'react-native-svg';

import { useSelector } from 'react-redux';
import { RootState } from '../store/index';

const { width, height } = Dimensions.get('window');

const SCHEMA_ASSET_MAP: Record<string, any> = {
  '/assets/buddhi.svg': require('../../assets/buddhi.svg'),
  '/assets/viveka.svg': require('../../assets/viveka.svg'),
  '/assets/tejas.svg': require('../../assets/tejas.svg'),
  '/assets/shakthi.svg': require('../../assets/shakthi.svg'),
  '/assets/dharma.svg': require('../../assets/dharma.svg'),
  '/assets/health_1.svg': require('../../assets/health_1.svg'),
  '/assets/health_2.svg': require('../../assets/health_2.svg'),
  '/assets/health_3.svg': require('../../assets/health_3.svg'),
  '/assets/health_4.svg': require('../../assets/health_4.svg'),
  '/assets/health_5.svg': require('../../assets/health_5.svg'),
  '/assets/relation_1.svg': require('../../assets/relation_1.svg'),
  '/assets/relation_2.svg': require('../../assets/relation_2.svg'),
  '/assets/relation_3.svg': require('../../assets/relation_3.svg'),
  '/assets/relation_4.svg': require('../../assets/relation_4.svg'),
  '/assets/relation_5.svg': require('../../assets/relation_5.svg'),
  '/assets/wealth_1.svg': require('../../assets/wealth_1.svg'),
  '/assets/wealth_2.svg': require('../../assets/wealth_2.svg'),
  '/assets/wealth_3.svg': require('../../assets/wealth_3.svg'),
  '/assets/wealth_4.svg': require('../../assets/wealth_4.svg'),
  '/assets/spiritual_growth.png': require('../../assets/spiritual_growth.png'),
};

const SCHEMA_ICON_FALLBACKS: Record<string, keyof typeof Ionicons.glyphMap> = {
  '/assets/buddhi.svg': 'bulb-outline',
  '/assets/viveka.svg': 'eye-outline',
  '/assets/tejas.svg': 'sunny-outline',
  '/assets/shakthi.svg': 'flash-outline',
  '/assets/dharma.svg': 'shield-checkmark-outline',
  '/assets/health_1.svg': 'fitness-outline',
  '/assets/health_2.svg': 'body-outline',
  '/assets/health_3.svg': 'bed-outline',
  '/assets/health_4.svg': 'nutrition-outline',
  '/assets/health_5.svg': 'medical-outline',
  '/assets/relation_1.svg': 'heart-outline',
  '/assets/relation_2.svg': 'chatbubbles-outline',
  '/assets/relation_3.svg': 'hand-left-outline',
  '/assets/relation_4.svg': 'people-outline',
  '/assets/relation_5.svg': 'home-outline',
  '/assets/wealth_1.svg': 'sparkles-outline',
  '/assets/wealth_2.svg': 'leaf-outline',
  '/assets/wealth_3.svg': 'flower-outline',
  '/assets/wealth_4.svg': 'compass-outline',
};

interface InsightSummaryContainerProps {
  schema: any;
}

const InsightSummaryContainer: React.FC<InsightSummaryContainerProps> = ({ schema }) => {
  const { isLoading: isFetching, aiReasoning: globalAiReasoning } = useSelector((state: RootState) => state.mitra);

  const screenState = useScreenStore((state) => state.screenData);
  const updateScreenData = useScreenStore((state) => state.updateScreenData);
  const loadScreen = useScreenStore((state) => state.loadScreen);
  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore((state) => state.updateHeaderHidden);
  const currentStateId = useScreenStore((state) => state.currentStateId);

  const videoRef = useRef<Video>(null);
  const step = screenState.insight_step || 0;

  useEffect(() => {
    updateBackground(require('../../assets/beige_bg.png'));
    updateHeaderHidden(true);
    return () => {
      updateHeaderHidden(false);
      if (videoRef.current) {
        videoRef.current.stopAsync().catch(() => {});
      }
    };
  }, []);

  const activeFocus = screenState.active_focus || screenState.scan_focus || 'career';
  const subFocus = screenState.prana_baseline_selection || 'default';

  const getCategoryData = (focus: string) => {
      // Read from allContainers discipline_select, matching the web version
      const container = getContainerSync('choice_stack');
      const disciplineState = container?.states?.discipline_select;
      if (disciplineState) {
          const choiceBlock = (disciplineState.blocks || []).find((b: any) => b.type === 'choice_card');
          if (choiceBlock?.options) {
              const match = choiceBlock.options.find((o: any) => o.id === focus);
              if (match) return match;
          }
      }
      // Fallback for safety
      return {
          title: "Your Path",
          description: "",
          breakdown: [],
      };
  };

  const getSubCategoryData = (focus: string, selection: string) => {
      const stableScan = getContainerSync('stable_scan');
      const optionsMap = stableScan?.states?.prana_baseline?.optionsMap || {};
      const list = optionsMap[focus] || [];
      return list.find((o: any) => o.id === selection) || list[0] || {};
  };

  const catData = useMemo(() => getCategoryData(activeFocus), [activeFocus]);
  const subCatData = useMemo(() => getSubCategoryData(activeFocus, subFocus), [activeFocus, subFocus]);

  const currentConfig = schema.insight_config?.[`step${step}`] || {};

  const topDescription = currentConfig.subtext || catData?.description || '';
  const experienceLabel = currentConfig.experience_label || 'WITHIN THIS, YOU\'RE EXPERIENCING:';
  const experienceExplanation = (subCatData?.explanation || '').replace(/<b>|<\/b>/g, '');

  const resolveTemplate = (value: any) => {
    if (typeof value !== 'string') return value;
    return value.replace(/\{\{([^}]+)\}\}/g, (_, rawKey) => {
      const key = String(rawKey || '').trim();
      const resolved = screenState[key];
      return resolved === undefined || resolved === null ? '' : String(resolved);
    });
  };

  const handleInfoAction = async (action?: any) => {
    if (!action) return;
    try {
      await executeAction({ ...action, currentScreen: { container_id: 'insight_summary', state_id: currentStateId } }, {
        loadScreen,
        goBack: () => {},
        setScreenValue: (value: any, key: string) => {
          updateScreenData(key, value);
        },
        screenState: { ...screenState },
      });
    } catch (err) {
      console.error('[InsightSummary] info action failed:', err);
    }
  };

  const renderBreakdownIcon = (icon: any) => {
    if (typeof icon === 'number') {
      return <Image source={icon} style={styles.breakdownIcon} />;
    }

    if (typeof icon === 'string') {
      const asset = SCHEMA_ASSET_MAP[icon];
      if (asset) {
        if (typeof asset === 'number') {
          return <Image source={asset} style={styles.breakdownIcon} />;
        }

        if (typeof asset === 'function' || (typeof asset === 'object' && asset !== null)) {
          const SVGComp = (asset as any).default || asset;
          if (typeof SVGComp === 'function' || (typeof SVGComp === 'object' && SVGComp !== null)) {
            const Component = SVGComp as any;
            return <Component width="100%" height="100%" />;
          }
        }
      }

      const fallbackName = SCHEMA_ICON_FALLBACKS[icon];
      if (fallbackName) {
        return <Ionicons name={fallbackName} size={24} color="#d9a557" />;
      }
    }

    return (
      <Image
        source={require('../../assets/lotus_icon.png')}
        style={styles.breakdownIcon}
      />
    );
  };

  const handleNext = () => {
    if (step === 0) {
      updateScreenData('insight_step', 1);
    } else if (step === 2) {
      const target = schema.on_complete?.target || { container_id: 'companion_dashboard', state_id: 'day_active' };
      loadScreen(target);
    }
  };

  const renderStep0 = () => (
    <View style={styles.stepContainer}>
      {(() => {
        if (typeof SevenDaysLotus === 'number') {
          return (
            <SvgUri
              uri={Image.resolveAssetSource(SevenDaysLotus)?.uri ?? null}
              width={width - 40}
              height={86}
              style={styles.topOrnament}
            />
          );
        }
        if (typeof SevenDaysLotus === 'function' || (typeof SevenDaysLotus === 'object' && SevenDaysLotus !== null)) {
          const SVGComp = (SevenDaysLotus as any).default || SevenDaysLotus;
          if (typeof SVGComp === 'function' || (typeof SVGComp === 'object' && SVGComp !== null)) {
            const Component = SVGComp as any;
            return <Component width={width - 40} height={86} style={styles.topOrnament} />;
          }
        }
        return null;
      })()}

      <Text style={styles.headline}>{currentConfig.headline}</Text>

      <View style={styles.ornamentalDivider}>
        <View style={styles.ornamentalLine} />
        <View style={styles.ornamentalDiamond} />
        <View style={styles.ornamentalLine} />
      </View>

      <View style={styles.understandingContent}>
          <View style={styles.glassPathCard}>
            <Text style={styles.sectionTitle}>
              {currentConfig.chosen_label} <Text style={styles.highlight}>{catData?.title}</Text>.
            </Text>
            {!!topDescription && <Text style={styles.introP}>{topDescription}</Text>}

            <View style={styles.breakdownList}>
              {catData?.breakdown?.map((item: any, idx: number) => (
                <View key={idx} style={styles.breakdownItem}>
                  <View style={styles.breakdownIconWrap}>
                    {renderBreakdownIcon(item.icon)}
                  </View>
                  <View style={styles.breakdownTextWrap}>
                    <Text style={styles.breakdownCopy}>
                      <Text style={styles.term}>{item.term}</Text>
                      <Text style={styles.definition}> - {item.definition}</Text>
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Image
              source={require('../../assets/half-mandala-removebg-preview.png')}
              style={styles.cardGlowMark}
            />
          </View>

          <View style={[styles.glassPathCard, styles.experienceCard]}>
            <View style={styles.experienceHeader}>
              <Text style={styles.label}>{experienceLabel}</Text>
              <Text style={styles.subCategoryName}>{subCatData?.label}</Text>
            </View>
            <Text style={styles.explanationText}>{experienceExplanation}</Text>
            <Image
              source={require('../../assets/half-mandala-removebg-preview.png')}
              style={styles.experienceMandala}
            />
          </View>
      </View>

      <View style={styles.footerArea}>
        <TouchableOpacity style={styles.primaryActionBtn} onPress={handleNext}>
            <LinearGradient
                colors={['#db9928', '#dfac3e']}
                style={styles.buttonGradientFill}
            >
                <Text style={styles.buttonText}>{currentConfig.button_label}</Text>
            </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.footerNote}>{currentConfig.footer_note}</Text>
      </View>
    </View>
  );

  const renderStep2 = () => {
    const practiceBlocks = (schema.blocks || []).filter((b: any) => b.type === 'practice_card');
    const summaryText = resolveTemplate(screenState.analysis_insight)
      || globalAiReasoning
      || screenState.ai_reasoning
      || 'This combination was selected to support your current state with practices rooted in Sanatan wisdom.';

    const cards = practiceBlocks
      .map((block: any) => ({
        ...block,
        purpose: resolveTemplate(block.purpose || block.label || ''),
        title: resolveTemplate(block.title || ''),
        description: resolveTemplate(block.description || ''),
      }))
      .filter((card: any) => card.title || card.description);

    return (
        <View style={styles.stepContainer}>
            <Text style={styles.headlineStep2}>{currentConfig.headline}</Text>
            <Text style={styles.introSubtextStep2}>{currentConfig.subtext}</Text>

            <View style={styles.step2Divider}>
              <View style={styles.step2DividerLine} />
              <Image source={require('../../assets/lotus_icon.png')} style={styles.step2DividerLotus} />
              <View style={styles.step2DividerLine} />
            </View>

            <Text style={styles.step2SummaryText}>{summaryText}</Text>

            <View style={styles.cardsStack}>
                {isFetching && cards.length === 0 ? (
                    <Text style={styles.loadingText}>Tailoring your path...</Text>
                ) : (
                    cards.map((card: any, i: number) => (
                        <Pressable
                          key={i}
                          style={styles.step2Card}
                          onPress={() => handleInfoAction(card.info_action)}
                          disabled={!card.info_action}
                        >
                          <Text style={styles.step2CardLabel}>{card.purpose}</Text>
                          <View style={styles.step2CardTitleRow}>
                            <Text style={styles.step2CardTitle}>{card.title}</Text>
                            {!!card.info_action && (
                              <TouchableOpacity
                                style={styles.step2InfoButton}
                                activeOpacity={0.8}
                                onPress={() => handleInfoAction(card.info_action)}
                              >
                                <Ionicons name="information" size={14} color="#ffffff" />
                              </TouchableOpacity>
                            )}
                          </View>
                          {!!card.description && (
                            <Text style={styles.step2CardDescription} numberOfLines={3}>
                              {card.description}
                            </Text>
                          )}
                          {i === cards.length - 1 && (
                            <Image
                              source={require('../../assets/half-mandala-removebg-preview.png')}
                              style={styles.step2CardMandala}
                            />
                          )}
                        </Pressable>
                    ))
                )}
            </View>

            <View style={styles.footerArea}>
                <TouchableOpacity style={styles.primaryActionBtn} onPress={handleNext}>
                    <LinearGradient
                        colors={['#db9928', '#dfac3e']}
                        style={styles.buttonGradientFill}
                    >
                        <Text style={styles.buttonText}>{currentConfig.button_label}</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.footerNoteKalpx}>{currentConfig.footer_note}</Text>
            </View>
        </View>
    );
  };

  if (step === 1) {
    return (
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={require('../../assets/videos/kalpx_way.mp4')}
          style={styles.fullVideo}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          onPlaybackStatusUpdate={(status: any) => {
            if (status.isLoaded && status.didJustFinish) {
                updateScreenData('insight_step', 2);
            }
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Image source={require('../../assets/beige_bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header isTransparent />
        {step === 0 && renderStep0()}
        {step === 2 && renderStep2()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fffdf9',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  topOrnament: {
    width: width - 40,
    height: 86,
    resizeMode: 'contain',
    marginTop: 16,
    marginBottom: 8,
  },
  headline: {
    fontSize: 28,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 36,
  },
  ornamentalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    marginBottom: 18,
    width: 180,
  },
  ornamentalLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(217, 165, 87, 0.35)',
  },
  ornamentalDiamond: {
    width: 14,
    height: 14,
    backgroundColor: '#d9a557',
    transform: [{ rotate: '45deg' }],
  },
  understandingContent: {
    width: '100%',
    gap: 20,
  },
  glassPathCard: {
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingVertical: 28,
    borderWidth: 1.5,
    borderColor: '#f3c24f',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 5,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 19,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    textAlign: 'center',
    marginBottom: 6,
  },
  highlight: {
    color: '#d9a557',
  },
  introP: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 18,
  },
  breakdownList: {
    gap: 14,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  breakdownIconWrap: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  breakdownIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  breakdownTextWrap: {
    flex: 1,
    paddingTop: 2,
  },
  breakdownCopy: {
    fontSize: 16,
    lineHeight: 22,
    color: '#432104',
    fontFamily: Fonts.sans.regular,
  },
  term: {
    fontSize: 16,
    fontFamily: Fonts.sans.bold,
    color: '#432104',
  },
  definition: {
    fontSize: 16,
    fontFamily: Fonts.sans.regular,
    color: '#432104',
  },
  experienceCard: {
    minHeight: 210,
  },
  experienceHeader: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    color: '#432104',
    fontFamily: Fonts.serif.regular,
    marginBottom: 8,
  },
  subCategoryName: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: '#cc9b2f',
  },
  explanationText: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    lineHeight: 24,
    color: '#432104',
    maxWidth: '88%',
  },
  footerArea: {
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
  },
  primaryActionBtn: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#d9a557',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 8,
  },
  buttonGradientFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
  },
  footerNote: {
    fontSize: 13,
    fontFamily: Fonts.sans.regular,
    color: '#432104',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  cardGlowMark: {
    position: 'absolute',
    right: -20,
    bottom: -22,
    width: 170,
    height: 170,
    resizeMode: 'contain',
    opacity: 0.18,
  },
  experienceMandala: {
    position: 'absolute',
    right: -18,
    bottom: -8,
    width: 150,
    height: 150,
    resizeMode: 'contain',
    opacity: 0.18,
  },
  videoContainer: {
    flex: 1,
    height: height,
    width: width,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: '#000',
  },
  fullVideo: {
    width: width,
    height: height,
  },
  headlineStep2: {
    fontSize: 32,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    textAlign: 'center',
    marginTop: 28,
  },
  introSubtextStep2: {
    fontSize: 18,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 28,
    paddingHorizontal: 20,
  },
  step2Divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 28,
    marginBottom: 20,
  },
  step2DividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: 'rgba(217, 165, 87, 0.45)',
  },
  step2DividerLotus: {
    width: 32,
    height: 32,
    marginHorizontal: 16,
    resizeMode: 'contain',
  },
  step2SummaryText: {
    fontSize: 18,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
    paddingHorizontal: 18,
  },
  cardsStack: {
    width: '100%',
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#D9A557',
    fontFamily: Fonts.sans.semiBold,
    textAlign: 'center',
    paddingVertical: 40,
  },
  step2Card: {
    width: '100%',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 2,
    borderColor: '#E8C587',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#d7a64a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  step2CardLabel: {
    fontSize: 15,
    fontFamily: Fonts.serif.bold,
    color: '#c4a27a',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  step2CardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  step2CardTitle: {
    flex: 1,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
  },
  step2InfoButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#d9a012',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step2CardDescription: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    paddingRight: 12,
  },
  step2CardMandala: {
    position: 'absolute',
    right: -30,
    bottom: -30,
    width: 144,
    height: 144,
    resizeMode: 'contain',
    opacity: 0.1,
  },
  footerNoteKalpx: {
    fontSize: 14,
    color: '#8c8881',
    fontFamily: Fonts.sans.medium,
    textAlign: 'center',
    marginTop: 4,
  }
});

export default InsightSummaryContainer;
