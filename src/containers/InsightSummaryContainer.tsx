import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useScreenStore } from '../engine/useScreenBridge';
import Header from '../components/Header';
import { LinearGradient } from 'expo-linear-gradient';
import BlockRenderer from '../engine/BlockRenderer';
import { getContainerSync } from '../engine/screenResolver';
import { Video, ResizeMode } from 'expo-av';
import { Fonts } from '../theme/fonts';

import { useDispatch, useSelector } from 'react-redux';
import { generateCompanion } from '../store/mitraSlice';
import { RootState, AppDispatch } from '../store/index';

const { width, height } = Dimensions.get('window');

interface InsightSummaryContainerProps {
  schema: any;
}

const InsightSummaryContainer: React.FC<InsightSummaryContainerProps> = ({ schema }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { companion: companionData, isLoading: isFetching, aiReasoning: globalAiReasoning } = useSelector((state: RootState) => state.mitra);

  const screenState = useScreenStore((state) => state.screenData);
  const updateScreenData = useScreenStore((state) => state.updateScreenData);
  const loadScreen = useScreenStore((state) => state.loadScreen);
  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore((state) => state.updateHeaderHidden);

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

  const fetchCompanionData = async () => {
    if (isFetching) return;

    const activeMetrics: any = {};
    const stableScan = getContainerSync('stable_scan');
    const metricsStates = ['baseline_vitals', 'baseline_metrics'];
    metricsStates.forEach(stateId => {
        const stateBlocks = stableScan?.states?.[stateId]?.blocks || [];
        stateBlocks.forEach((b: any) => {
            if (b.type === 'baseline_slider') {
                activeMetrics[b.label.toLowerCase()] = screenState[b.label] || 5;
            }
        });
    });

    const payload = {
      focus: activeFocus,
      subFocus: subCatData?.label || subFocus,
      baselineMetrics: activeMetrics,
      depth: screenState.routine_depth || 'intermediate',
      dayNumber: 1,
      locale: 'en',
      tz: 'Asia/Calcutta'
    };

    try {
      await dispatch(generateCompanion(payload)).unwrap();
    } catch (err) {
      console.warn('[InsightSummary] generateCompanion failed:', err);
    }
  };

  const currentConfig = schema.insight_config?.[`step${step}`] || {};

  const handleNext = () => {
    if (step === 0) {
      updateScreenData('insight_step', 1);
      fetchCompanionData();
    } else if (step === 2) {
      const target = schema.on_complete?.target || { container_id: 'companion_dashboard', state_id: 'day_active' };
      loadScreen(target.container_id, target.state_id);
    }
  };

  const renderStep0 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.lotusGlowWrap}>
          <LinearGradient
            colors={['rgba(217, 165, 87, 0.3)', 'transparent']}
            style={styles.glowBg}
          />
        <Image source={require('../../assets/lotus_icon.png')} style={styles.lotusHeader} />
      </View>
      
      <Text style={styles.headline}>{currentConfig.headline}</Text>
      <Text style={styles.subtext}>{currentConfig.subtext}</Text>

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
            <Text style={styles.introP}>{catData?.description}</Text>

            <View style={styles.breakdownList}>
              {catData?.breakdown?.map((item: any, idx: number) => (
                <View key={idx} style={styles.breakdownItem}>
                  <View style={styles.breakdownIconWrap}>
                    <Image
                      source={typeof item.icon === 'number' ? item.icon : require('../../assets/lotus_icon.png')}
                      style={styles.breakdownIcon}
                    />
                  </View>
                  <View style={styles.breakdownTextWrap}>
                    <Text style={styles.term}>{item.term}</Text>
                    <Text style={styles.definition}> - {item.definition}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.glassPathCard, styles.experienceCard]}>
            <View style={styles.experienceHeader}>
              <Text style={styles.label}>{currentConfig.experience_label}</Text>
              <Text style={styles.subCategoryName}>{subCatData?.label}</Text>
            </View>
            <Text style={styles.explanationText}>
                {subCatData?.explanation?.replace(/<b>|<\/b>/g, '')}
            </Text>
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
    const practices: any[] = [];
    if (companionData?.companion) {
        const { sankalp, practice, mantra } = companionData.companion;
        if (practice) {
            practices.push({
                type: 'practice_card',
                label: 'Practice',
                title: practice.core.title,
                description: practice.core.summary,
                meta: practice.ui.card_meta,
                detailData: { ...practice.core, type: 'practice' }
            });
        }
        if (sankalp) {
            practices.push({
                type: 'practice_card',
                label: 'Sankalp',
                title: sankalp.core.title,
                description: sankalp.core.line,
                detailData: { ...sankalp.core, type: 'sankalp' }
            });
        }
        if (mantra) {
            practices.push({
                type: 'practice_card',
                label: 'Mantra',
                title: mantra.core.title,
                description: mantra.core.line,
                detailData: { ...mantra.core, type: 'mantra' }
            });
        }
    } else {
        practices.push(...(schema.blocks || []).filter((b: any) => b.type === 'practice_card'));
    }

    return (
        <View style={styles.stepContainer}>
            <View style={styles.step2Header}>
                <View style={styles.lineSmall} />
                <Image source={require('../../assets/lotus_icon.png')} style={styles.lotusSmall} />
                <View style={styles.lineSmall} />
            </View>

            <Text style={styles.headlineStep2}>{currentConfig.headline}</Text>
            <Text style={styles.introSubtextStep2}>{currentConfig.subtext}</Text>
            
            {Boolean(globalAiReasoning || screenState.ai_reasoning) && (
                <Text style={styles.whyPathWhisper}>{globalAiReasoning || screenState.ai_reasoning}</Text>
            )}

            <View style={styles.cardsStack}>
                {isFetching && practices.length === 0 ? (
                    <Text style={styles.loadingText}>Tailoring your path...</Text>
                ) : (
                    practices.map((block: any, i: number) => (
                        <BlockRenderer key={i} block={block} />
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
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Header isTransparent />
      {step === 0 && renderStep0()}
      {step === 2 && renderStep2()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  lotusGlowWrap: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  glowBg: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.5,
  },
  lotusHeader: {
    height: 80,
    width: 80,
    resizeMode: 'contain',
    zIndex: 1,
  },
  headline: {
    fontSize: 26,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  ornamentalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 15,
    width: 200,
  },
  ornamentalLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(217, 165, 87, 0.3)',
  },
  ornamentalDiamond: {
    width: 10,
    height: 10,
    backgroundColor: '#d9a557',
    transform: [{ rotate: '45deg' }],
  },
  understandingContent: {
    width: '100%',
    gap: 20,
    marginTop: 10,
  },
  glassPathCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 204, 102, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    marginBottom: 4,
  },
  highlight: {
    color: '#d9a557',
  },
  introP: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: '#432104',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  breakdownList: {
    gap: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4,
  },
  breakdownIconWrap: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  breakdownTextWrap: {
    flex: 1,
    paddingTop: 4,
  },
  term: {
    fontSize: 15,
    fontFamily: Fonts.sans.bold,
    color: '#432104',
  },
  definition: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: '#432104',
  },
  experienceCard: {
    marginTop: 10,
  },
  experienceHeader: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#432104',
    fontFamily: Fonts.sans.regular,
  },
  subCategoryName: {
    fontSize: 20,
    fontFamily: Fonts.serif.bold,
    color: '#cc9b2f',
  },
  explanationText: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    lineHeight: 22,
    color: '#432104',
  },
  footerArea: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  primaryActionBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#d9a557',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 12,
  },
  buttonGradientFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontFamily: Fonts.sans.semiBold,
  },
  footerNote: {
    fontSize: 13,
    fontFamily: Fonts.sans.regular,
    color: '#432104',
    fontStyle: 'italic',
    textAlign: 'center',
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
  step2Header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
    width: '100%',
  },
  lineSmall: {
    flex: 1,
    height: 1,
    backgroundColor: '#D9A557',
  },
  lotusSmall: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
    resizeMode: 'contain',
  },
  headlineStep2: {
    fontSize: 28,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    textAlign: 'center',
  },
  introSubtextStep2: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: '#432104',
    textAlign: 'center',
    marginTop: 4,
  },
  whyPathWhisper: {
    fontSize: 16,
    color: '#615247',
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 12,
    paddingHorizontal: 8,
    fontFamily: Fonts.serif.regular,
  },
  cardsStack: {
    width: '100%',
    gap: 12,
    marginTop: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#D9A557',
    fontFamily: Fonts.sans.semiBold,
    textAlign: 'center',
    paddingVertical: 40,
  },
  footerNoteKalpx: {
    fontSize: 14,
    color: '#8c8881',
    fontFamily: Fonts.sans.medium,
    textAlign: 'center',
  }
});

export default InsightSummaryContainer;
