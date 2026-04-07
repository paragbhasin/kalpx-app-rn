import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';

interface ChipOption {
  id: string;
  label: string;
  selected?: boolean;
}

interface ChipListBlockProps {
  block: {
    id?: string;
    label?: string;
    options: ChipOption[];
    on_select?: any;
    style?: any;
  };
}

const ChipListBlock: React.FC<ChipListBlockProps> = ({ block }) => {
  const { screenData: screenState, loadScreen, goBack } = useScreenStore();

  const stateKey = block.id || block.label || '';
  const initialSelected = block.options.find((opt) => opt.selected);
  const [selectedId, setSelectedId] = useState<string | null>(
    (screenState[stateKey] as string) || initialSelected?.id || null,
  );

  // Seed initial value into screenState if pre-selected
  if (initialSelected && !screenState[stateKey]) {
    const { screenActions } = require('../store/screenSlice');
    const { store } = require('../store');
    store.dispatch(screenActions.setScreenValue({ key: stateKey, value: initialSelected.id }));
  }

  const selectChip = async (option: ChipOption) => {
    setSelectedId(option.id);

    // Update screenData
    const { screenActions } = require('../store/screenSlice');
    const { store } = require('../store');
    store.dispatch(screenActions.setScreenValue({ key: stateKey, value: option.id }));

    // Fire on_select action if defined
    if (block.on_select) {
      try {
        await executeAction(
          {
            ...block.on_select,
            payload: { ...block.on_select.payload, selection: option.id },
          },
          {
            loadScreen,
            goBack,
            setScreenValue: (value: any, key: string) => {
              store.dispatch(screenActions.setScreenValue({ key, value }));
            },
            screenState,
          },
        );
      } catch (err) {
        console.error('[ChipListBlock] Action failed:', err);
      }
    }
  };

  return (
    <View style={[styles.container, block.style]}>
      {Boolean(block.label) && <Text style={styles.sectionLabel}>{block.label}</Text>}
      <View style={styles.chipsWrapper}>
        {block.options.map((option) => {
          const isSelected = selectedId === option.id;
          return isSelected ? (
            <TouchableOpacity key={option.id} activeOpacity={0.8} onPress={() => selectChip(option)}>
              <LinearGradient
                colors={['#db9928', '#dfac3e']}
                style={styles.chipSelected}
              >
                <Text style={styles.chipSelectedText}>{option.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={option.id}
              style={styles.chip}
              activeOpacity={0.7}
              onPress={() => selectChip(option)}
            >
              <Text style={styles.chipText}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#bfa58a',
    marginBottom: 20,
    fontWeight: '700',
    fontFamily: Fonts.sans.bold,
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#d0902d',
  },
  chipText: {
    fontSize: 14,
    color: '#615247',
    fontFamily: Fonts.sans.regular,
  },
  chipSelected: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#C9A227',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  chipSelectedText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: Fonts.sans.regular,
  },
});

export default ChipListBlock;
