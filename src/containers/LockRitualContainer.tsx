import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../Networks/axios';
import store from '../store';
import SigninPopup from '../components/SigninPopup';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';
import { screenActions } from '../store/screenSlice';
import Header from '../components/Header';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts } from '../theme/fonts';
import * as Haptics from 'expo-haptics';

import type { RootState, AppDispatch } from '../store';

const { width, height } = Dimensions.get('window');

interface LockRitualContainerProps {
  schema: {
    id?: string;
    blocks: any[];
    lock_action?: any;
    hint_text?: string;
    button_label?: string;
    meta?: {
      hold_duration_ms?: Record<string, number>;
      block_background_interaction?: boolean;
      cancel_on_release?: boolean;
      horizontal_padding?: number;
    };
  };
}

const LockRitualContainer: React.FC<LockRitualContainerProps> = ({ schema }) => {
  const dispatch = useDispatch<AppDispatch>();
  const screenState = useSelector((state: RootState) => state.screen);
  const {
    loadScreen,
    goBack,
    updateBackground,
    updateHeaderHidden,
    currentScreen,
  } = useScreenStore();

  const user = useSelector((state: RootState) => state.login?.user || state.socialLoginReducer?.user);

  // Derive login state directly from Redux — avoids AsyncStorage race condition
  // where social login updates the Redux user synchronously but the access_token
  // may not yet be written to AsyncStorage when the effect fires.
  const isLoggedIn = !!(user?.id || user?.email || user?.token || user?.profile);

  const [isSigninVisible, setIsSigninVisible] = useState(false);

  // Ref: did we show the SigninPopup to this guest session?
  const popupShownRef = React.useRef(false);
  // Ref: have we already fired the post-login flow? (prevents double-fire
  // if isLoggedIn and isSigninVisible toggle in rapid succession)
  const postLoginFiredRef = React.useRef(false);

  // Show the popup immediately when a guest user arrives
  useEffect(() => {
    if (!isLoggedIn) {
      setIsSigninVisible(true);
      popupShownRef.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only on mount

  /**
   * Post-login flow triggered when the user authenticates via the SigninPopup:
   *   1. Call Status API  → determine if an active journey exists
   *   2. Seed focus / day data from the status response
   *   3. Call generate_companion to populate companion screen state
   *   4. Route:
   *      • hasActiveJourney === true  → CompanionDashboard (day_active)
   *      • hasActiveJourney === false → InsightSummary step 0 (auto-navigated
   *                                     by generate_companion)
   */
  const handlePostLoginFlow = useCallback(async () => {
    try {
      // ── 1. Status API ──────────────────────────────────────────────────────
      const res = await api.get('mitra/journey/status/');
      const status = res.data;
      const hasActiveJourney = !!status?.hasActiveJourney;

      // ── 2. Seed status data into Redux screen state ─────────────────────────
      if (hasActiveJourney) {
        const updates: Record<string, any> = {
          journey_id: status.journeyId ?? null,
          day_number: status.dayNumber || 1,
          is_experienced: true,
        };
        const focus = status.focus || '';
        const subFocus = status.subfocus || status.sub_focus || '';
        if (focus) {
          updates.scan_focus = focus;
          updates.active_focus = focus;
          updates.suggested_focus = focus;
        }
        if (subFocus) {
          updates.prana_baseline_selection = subFocus;
        }
        Object.entries(updates).forEach(([key, value]) => {
          dispatch(screenActions.setScreenValue({ key, value }));
        });
      }

      // ── 3. Build action context with fresh Redux state after updates ────────
      const freshState = store.getState().screen.screenData;
      const actionCtx = {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => {
          dispatch(screenActions.setScreenValue({ key, value }));
        },
        screenState: freshState,
        startFlowInstance: (flowType: string) =>
          dispatch(screenActions.startFlowInstance(flowType)),
        endFlowInstance: () => dispatch(screenActions.endFlowInstance()),
      };

      // ── 4. Call generate_companion + route ─────────────────────────────────
      if (hasActiveJourney) {
        // skipReveal: true → stops generate_companion from auto-navigating
        // to insight_summary; we redirect to dashboard ourselves after.
        await executeAction(
          { type: 'generate_companion', payload: { skipReveal: true } },
          actionCtx,
        );
        loadScreen({ container_id: 'companion_dashboard', state_id: 'day_active' });
      } else {
        // No active journey: generate_companion auto-navigates to
        // insight_summary / path_reveal (step 0) — no extra loadScreen needed.
        await executeAction({ type: 'generate_companion' }, actionCtx);
      }
    } catch (e) {
      console.error('[LockRitual] Post-login flow failed:', e);
      // Fallback: show insight summary at step 0
      loadScreen({ container_id: 'insight_summary', state_id: 'path_reveal' });
    }
  }, [dispatch, loadScreen, goBack]);

  // Trigger the post-login flow as soon as isLoggedIn becomes true,
  // but only if this component previously showed the popup to a guest.
  // Using refs means we are not racing against isSigninVisible state.
  useEffect(() => {
    if (isLoggedIn && popupShownRef.current && !postLoginFiredRef.current) {
      postLoginFiredRef.current = true;
      setIsSigninVisible(false);
      handlePostLoginFlow();
    }
  }, [isLoggedIn, handlePostLoginFlow]);

  const [isHolding, setIsHolding] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasFiredMidHaptic, setHasFiredMidHaptic] = useState(false);

  const progress = useSharedValue(0);
  const scale = useSharedValue(0.95);

  // Staggered entrance animations (matching web CSS keyframes)
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.95);
  const hintOpacity = useSharedValue(0);
  const footerOpacity = useSharedValue(0);

  // Hold duration from schema meta (default ~1.25s matching web: 4% every 50ms = 25 ticks * 50ms)
  const holdDurationMs = useMemo(() => {
    if (schema.meta?.hold_duration_ms) {
      // Use 14_day as default if available, otherwise first value
      return schema.meta.hold_duration_ms['14_day'] || Object.values(schema.meta.hold_duration_ms)[0] || 1250;
    }
    return 1250; // Web default: 25 intervals * 50ms
  }, [schema.meta]);

  const horizontalPadding = schema.meta?.horizontal_padding ?? 24;

  useEffect(() => {
    // Immersion settings — dark background, hide header chrome
    updateBackground(null);
    updateHeaderHidden(true);

    // Staggered entrance animations matching web CSS:
    // header: 0.8s ease, delay 0.2s
    // hold button: 1s cubic-bezier(0.22,0.61,0.36,1), delay 0.4s
    // hint: 0.8s ease, delay 0.7s
    // footer: 0.8s ease, delay 0.9s
    const animEasing = Easing.bezier(0.22, 0.61, 0.36, 1);

    headerOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    headerTranslateY.value = withDelay(200, withTiming(0, { duration: 800 }));
    buttonOpacity.value = withDelay(400, withTiming(1, { duration: 1000, easing: animEasing }));
    buttonScale.value = withDelay(400, withTiming(1, { duration: 1000, easing: animEasing }));
    hintOpacity.value = withDelay(700, withTiming(1, { duration: 800 }));
    footerOpacity.value = withDelay(900, withTiming(1, { duration: 800 }));

    setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  // Build the context object for executeAction (matches PracticeRunnerContainer pattern)
  const buildActionContext = useCallback(() => ({
    loadScreen,
    goBack,
    setScreenValue: (value: any, key: string) => {
      dispatch(screenActions.setScreenValue({ key, value }));
    },
    screenState: { ...screenState },
    startFlowInstance: (flowType: string) =>
      dispatch(screenActions.startFlowInstance(flowType)),
    endFlowInstance: () => dispatch(screenActions.endFlowInstance()),
  }), [loadScreen, goBack, dispatch, screenState]);

  const onCommit = useCallback(async () => {
    // Haptic feedback on completion
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    if (!isLoggedIn) {
      // RED-012: Save induction state to AsyncStorage for recovery after login
      try {
        await AsyncStorage.setItem('kalpx_pending_induction', JSON.stringify(screenState.screenData));
      } catch (e) {
        console.error("Failed to save pending induction:", e);
      }
      setIsSigninVisible(true);
      return;
    }

    const holdButton = schema.blocks?.find((b: any) => b.type === 'hold_button');
    const lockAction = schema.lock_action || holdButton?.on_complete;

    if (lockAction) {
      // Use executeAction to properly handle all action types (especially generate_companion)
      executeAction(lockAction, buildActionContext());
    }
  }, [schema, buildActionContext, isLoggedIn, screenState.screenData]);

  // Interval-based progress matching web behavior (4% every 50ms)
  const holdIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = React.useRef(0);

  const startHold = useCallback(() => {
    setIsHolding(true);
    setHasFiredMidHaptic(false);
    scale.value = withTiming(0.98, { duration: 200 });
    progressRef.current = 0;

    // Interval approach matching web: increment progress in steps
    const stepMs = 50;
    const stepPercent = 100 / (holdDurationMs / stepMs);

    holdIntervalRef.current = setInterval(() => {
      progressRef.current += stepPercent;
      progress.value = withTiming(progressRef.current / 100, { duration: stepMs, easing: Easing.linear });

      // Mid-point haptic feedback (schema defines haptic_feedback.mid_point)
      if (progressRef.current >= 50 && !hasFiredMidHaptic) {
        setHasFiredMidHaptic(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }

      if (progressRef.current >= 100) {
        progressRef.current = 100;
        progress.value = withTiming(1, { duration: stepMs, easing: Easing.linear });
        if (holdIntervalRef.current) {
          clearInterval(holdIntervalRef.current);
          holdIntervalRef.current = null;
        }
        onCommit();
      }
    }, stepMs);
  }, [holdDurationMs, progress, scale, onCommit, hasFiredMidHaptic]);

  const stopHold = useCallback(() => {
    setIsHolding(false);
    scale.value = withTiming(1, { duration: 300 });
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    if (progressRef.current < 100) {
      progressRef.current = 0;
      progress.value = withTiming(0, { duration: 200 });
    }
  }, [progress, scale]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
    };
  }, []);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      startHold();
    },
    onPanResponderRelease: () => {
      stopHold();
    },
    onPanResponderTerminate: () => {
      stopHold();
    },
  }), [startHold, stopHold]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    height: `${progress.value * 100}%`,
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: buttonOpacity.value,
  }));

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedHintStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
  }));

  const animatedFooterStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  // Block partitioning (matches web template logic)
  const headerBlocks = (schema.blocks || []).filter((b: any) => b.position === 'header');
  const footerBlocks = (schema.blocks || []).filter((b: any) => b.position === 'footer');
  const contentBlocks = (schema.blocks || []).filter(
    (b: any) => !b.position || b.position === 'content'
  );
  const holdButton = schema.blocks?.find((b: any) => b.type === 'hold_button');
  const isHoldToLock = schema.id === 'hold_to_lock';

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Ambient glow — matches web radial gradient */}
      <View style={styles.ambientGlow} />

      <Header isTransparent={true} />

      <View style={[styles.contentWrap, { paddingHorizontal: horizontalPadding }]}>
        {/* Header blocks with staggered entrance */}
        <Animated.View style={[styles.header, animatedHeaderStyle]}>
          {headerBlocks.map((block: any, i: number) => (
            <BlockRenderer key={`header-${i}`} block={block} textColor="#FFFFFF" />
          ))}
        </Animated.View>

        <View style={styles.ritualCenter}>
          {isHoldToLock ? (
            <>
              {/* Hold-to-commit button */}
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.holdButtonWrap,
                  isHolding && styles.isHolding,
                  animatedButtonStyle,
                ]}
              >
                {/* Progress fill from bottom */}
                <Animated.View style={[styles.progressFill, animatedProgressStyle]}>
                  <LinearGradient
                    colors={['#f0c96b', '#d4a017']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>

                <View style={styles.buttonContent}>
                  {!isHolding && <Text style={styles.lockIcon}>🔒</Text>}
                  <Text style={[styles.lockBtn, isHolding && styles.lockBtnHolding]}>
                    {isHolding
                      ? (holdButton?.holding_label || 'Committing...')
                      : (holdButton?.label || schema.button_label || 'Hold to Commit')}
                  </Text>
                </View>
              </Animated.View>

              <Animated.Text style={[styles.hint, animatedHintStyle]}>
                {schema.hint_text || 'Consistency shapes who you become.'}
              </Animated.Text>
            </>
          ) : (
            /* Non-hold_to_lock states: render content blocks generically (matches web v-else) */
            <View style={styles.blocksContainer}>
              {contentBlocks.map((block: any, i: number) => (
                <BlockRenderer key={`content-${i}`} block={block} textColor="#FFFFFF" />
              ))}
            </View>
          )}
        </View>

        {/* Footer blocks with staggered entrance */}
        <Animated.View style={[styles.footer, animatedFooterStyle]}>
          {footerBlocks.map((block: any, i: number) => (
            <BlockRenderer key={`footer-${i}`} block={block} textColor="rgba(255,255,255,0.6)" />
          ))}
        </Animated.View>
      </View>

      <SigninPopup
        visible={isSigninVisible}
        onClose={() => setIsSigninVisible(false)}
        onConfirmCancel={() => {}}
        title="Commit to Your 14-Day Path"
        subTitle="Save Your Progress"
        subText="To lock in these practices and unlock your personalized daily journey, please sign in or create an account."
        infoTexts={[
          "Lock in your personalized daily mantras",
          "Unlock growth tracking and streaks",
          "Receive daily guidance for your specific path"
        ]}
        MantraButtonTitle="Sign In to Commit"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080a0c',
    width: width,
    height: height,
  },
  contentWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  ambientGlow: {
    position: 'absolute',
    top: height / 2 - 200,
    left: width / 2 - 200,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(212, 160, 23, 0.08)',
    transform: [{ scale: 1.5 }],
  },
  header: {
    marginBottom: 60,
    alignItems: 'center',
  },
  ritualCenter: {
    alignItems: 'center',
    gap: 24,
    width: '100%',
  },
  holdButtonWrap: {
    width: 280,
    height: 72,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  isHolding: {
    borderColor: 'rgba(212, 160, 23, 0.8)',
    shadowColor: 'rgba(212, 160, 23, 0.2)',
    shadowRadius: 30,
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 5,
  },
  lockIcon: {
    fontSize: 18,
  },
  lockBtn: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Fonts.sans.semiBold,
    letterSpacing: 0.5,
  },
  lockBtnHolding: {
    color: '#1a1d2e',
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    fontFamily: Fonts.serif.regular,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 10,
  },
  footer: {
    marginTop: 60,
    width: '100%',
    alignItems: 'center',
  },
  blocksContainer: {
    gap: 16,
    alignItems: 'center',
    width: '100%',
  },
});

export default LockRitualContainer;
