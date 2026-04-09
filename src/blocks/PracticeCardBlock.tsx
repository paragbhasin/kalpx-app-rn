import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';
import { Fonts } from '../theme/fonts';

interface PracticeCardBlockProps {
  block: {
    type: 'practice_card';
    label?: string;
    title?: string;
    description?: string;
    meta?: string;
    icon?: string;
    id?: string;
    detailData?: any;
    info_action?: any;
    action?: any;
    start_action?: any;
    is_complete?: boolean;
  };
}

// Map FontAwesome icon names to Ionicons
const FA_TO_IONICONS: Record<string, string> = {
  'fas fa-om': 'musical-notes-outline',
  'fas fa-lungs': 'fitness-outline',
  'fas fa-leaf': 'leaf-outline',
  'fas fa-praying-hands': 'hand-left-outline',
  'fas fa-brain': 'bulb-outline',
};

const PracticeCardBlock: React.FC<PracticeCardBlockProps> = ({ block }) => {
  const { loadScreen, goBack, screenData: screenState } = useScreenStore();

  const handleCardPress = async () => {
    const action = block.info_action || block.action;
    if (!action) return;
    try {
      await executeAction(action, {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => {
          const { screenActions } = require('../store/screenSlice');
          const { store } = require('../store');
          store.dispatch(screenActions.setScreenValue({ key, value }));
        },
        screenState: { ...screenState },
      });
    } catch (err) {
      console.error('[PracticeCardBlock] Action failed:', err);
    }
  };

  const iconName = FA_TO_IONICONS[block.icon || ''] || 'flower-outline';
  const isComplete = block.is_complete;

  return (
    <TouchableOpacity
      style={[styles.card, isComplete && styles.cardComplete]}
      onPress={handleCardPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={iconName as any} size={24} color={isComplete ? '#10b981' : '#D4A017'} />
      </View>
      <View style={styles.textWrap}>
        {block.label && <Text style={styles.label}>{block.label}</Text>}
        <Text style={[styles.title, isComplete && styles.titleComplete]}>{block.title}</Text>
        {block.description && (
          <Text style={styles.description} numberOfLines={2}>{block.description}</Text>
        )}
        {block.meta && <Text style={styles.meta}>{block.meta}</Text>}
      </View>
      <View style={styles.arrowWrap}>
        {isComplete ? (
          <Ionicons name="checkmark-circle" size={22} color="#10b981" />
        ) : (
          <Ionicons name="chevron-forward" size={18} color="#bfa58a" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.15)',
  },
  cardComplete: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 160, 23, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#bfa58a',
    fontFamily: Fonts.sans.medium,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    color: '#432104',
    fontFamily: Fonts.sans.semiBold,
    marginBottom: 2,
  },
  titleComplete: {
    color: '#10b981',
  },
  description: {
    fontSize: 13,
    color: '#5C5648',
    fontFamily: Fonts.sans.regular,
    lineHeight: 18,
  },
  meta: {
    fontSize: 12,
    color: '#8A7D6B',
    fontFamily: Fonts.sans.regular,
    marginTop: 4,
  },
  arrowWrap: {
    marginLeft: 8,
  },
});

export default PracticeCardBlock;
