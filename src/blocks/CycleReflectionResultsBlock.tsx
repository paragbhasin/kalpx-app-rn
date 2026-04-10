/**
 * CycleReflectionResultsBlock — rendered after checkpoint submission.
 *
 * Shows the acknowledgement message derived from the submitted feeling/decision,
 * plus next-step action buttons (deepen / refine / change focus / restart).
 */
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useScreenStore } from '../engine/useScreenBridge';
import { cleanupFlowState } from '../engine/cleanupFields';
import store from '../store';
import { loadScreenWithData, screenActions } from '../store/screenSlice';
import { Fonts } from '../theme/fonts';

interface ResultAction {
  id: string;
  label: string;
  target: { container_id: string; state_id: string };
  style?: 'primary' | 'outline';
}

interface CycleReflectionResultsBlockProps {
  block?: { style?: any };
}

const FEELING_MESSAGES: Record<string, string> = {
  strong:
    "You're finding real steadiness. That's not small. Let's honor it by either deepening or choosing a new focus.",
  slight:
    "Even a small shift matters. Let's continue the path so the change can root itself.",
  same:
    "Finding your way takes time. Stay with the rhythm — the next cycle will meet you where you are.",
  worse:
    "Heaviness isn't failure. Let's lighten the path so it can hold you better.",
};

const CycleReflectionResultsBlock: React.FC<CycleReflectionResultsBlockProps> = ({ block }) => {
  const screenData = useScreenStore((s) => s.screenData);

  const day = screenData.checkpoint_day || 7;
  const feeling = screenData.checkpoint_feeling || screenData.checkpoint_completed_decision || 'same';
  const decision = screenData.checkpoint_completed_decision || '';
  const daysEngaged = screenData.checkpoint_days_engaged || 0;
  const totalDays = screenData.checkpoint_total_days || day;

  const message = FEELING_MESSAGES[feeling] || FEELING_MESSAGES.same;

  // Decision tree — who gets which action buttons
  const actions: ResultAction[] = [];

  if (day === 7) {
    if (feeling === 'worse' || daysEngaged < 3) {
      actions.push({
        id: 'lighten',
        label: 'Lighten My Path',
        target: { container_id: 'companion_dashboard', state_id: 'day_active' },
        style: 'primary',
      });
      actions.push({
        id: 'restart',
        label: 'Start Fresh',
        target: { container_id: 'choice_stack', state_id: 'discipline_select' },
        style: 'outline',
      });
    } else {
      actions.push({
        id: 'continue',
        label: 'Continue My Path',
        target: { container_id: 'companion_dashboard', state_id: 'day_active' },
        style: 'primary',
      });
    }
  } else {
    // Day 14
    if (feeling === 'strong' && daysEngaged >= totalDays - 1) {
      actions.push({
        id: 'change_focus',
        label: 'Choose New Focus',
        target: { container_id: 'choice_stack', state_id: 'discipline_select' },
        style: 'primary',
      });
      actions.push({
        id: 'deepen',
        label: 'Deepen My Practice',
        target: { container_id: 'companion_dashboard', state_id: 'day_active' },
        style: 'outline',
      });
    } else if (daysEngaged < 5) {
      actions.push({
        id: 'restart',
        label: 'Restart Current Cycle',
        target: { container_id: 'companion_dashboard', state_id: 'day_active' },
        style: 'primary',
      });
      actions.push({
        id: 'change_focus',
        label: 'Choose New Focus',
        target: { container_id: 'choice_stack', state_id: 'discipline_select' },
        style: 'outline',
      });
    } else {
      actions.push({
        id: 'continue_same',
        label: 'Continue Current Path',
        target: { container_id: 'companion_dashboard', state_id: 'day_active' },
        style: 'primary',
      });
      actions.push({
        id: 'change_focus',
        label: 'Choose New Focus',
        target: { container_id: 'choice_stack', state_id: 'discipline_select' },
        style: 'outline',
      });
    }
  }

  const handleAction = (action: ResultAction) => {
    store.dispatch(
      screenActions.setScreenValue({ key: 'checkpoint_completed', value: true }),
    );
    // Rule 4 (STATE_OWNERSHIP_MATRIX §Cleanup): clear checkpoint flow-local
    // state on exit so it doesn't bleed into the next screen.
    const writeState = (value: any, key: string) => {
      store.dispatch(screenActions.setScreenValue({ key, value }));
    };
    cleanupFlowState('checkpoint', writeState);

    store.dispatch(
      loadScreenWithData({
        containerId: action.target.container_id,
        stateId: action.target.state_id,
      }),
    );
  };

  return (
    <View style={[styles.container, block?.style]}>
      <Text style={styles.eyebrow}>
        Day {day} {decision ? `· ${decision.replace('_', ' ')}` : ''}
      </Text>
      <Text style={styles.headline}>
        {feeling === 'strong'
          ? 'Your steadiness shows.'
          : feeling === 'slight'
          ? 'A shift is taking root.'
          : feeling === 'same'
          ? 'You are still finding your way.'
          : 'Let\u2019s make this lighter.'}
      </Text>

      <Text style={styles.message}>{message}</Text>

      {Boolean(screenData.milestone_reflection) && (
        <View style={styles.reflectionBox}>
          <Text style={styles.reflectionText}>
            {screenData.milestone_reflection}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionBtn,
              action.style === 'outline' && styles.actionOutline,
            ]}
            onPress={() => handleAction(action)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.actionText,
                action.style === 'outline' && styles.actionOutlineText,
              ]}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const GOLD = '#C9A84C';
const DARK = '#432104';

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    borderRadius: 20,
    padding: 24,
    marginVertical: 12,
    backgroundColor: 'rgba(255, 253, 249, 0.95)',
  },
  eyebrow: {
    fontSize: 11,
    color: GOLD,
    fontFamily: Fonts.sans.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  headline: {
    fontSize: 22,
    color: DARK,
    fontFamily: Fonts.serif.bold,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: 'rgba(67, 33, 4, 0.75)',
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  reflectionBox: {
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    paddingLeft: 14,
    paddingVertical: 10,
    marginVertical: 14,
    backgroundColor: 'rgba(201, 168, 76, 0.06)',
    borderRadius: 6,
  },
  reflectionText: {
    fontSize: 14,
    color: 'rgba(67, 33, 4, 0.85)',
    fontFamily: Fonts.sans.regular,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actions: {
    gap: 10,
    marginTop: 10,
  },
  actionBtn: {
    backgroundColor: GOLD,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: GOLD,
  },
  actionText: {
    fontSize: 15,
    color: '#ffffff',
    fontFamily: Fonts.sans.semiBold,
  },
  actionOutlineText: {
    color: GOLD,
  },
});

export default CycleReflectionResultsBlock;
