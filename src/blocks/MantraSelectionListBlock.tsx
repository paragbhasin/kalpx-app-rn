import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';

interface MantraOption {
  id: string;
  title: string;
  subtitle?: string;
  sanskrit?: string;
}

interface MantraSelectionListBlockProps {
  block: {
    id?: string;
    label?: string;
    options: MantraOption[];
    style?: any;
  };
}

const MantraSelectionListBlock: React.FC<MantraSelectionListBlockProps> = ({ block }) => {
  const { screenData: screenState } = useScreenStore();
  const stateKey = block.id || 'selected_mantra';

  const [selectedId, setSelectedId] = useState<string | null>(
    (screenState[stateKey] as string) || null,
  );

  const selectMantra = (option: MantraOption) => {
    setSelectedId(option.id);

    const { screenActions } = require('../store/screenSlice');
    const { store } = require('../store');
    store.dispatch(screenActions.setScreenValue({ key: stateKey, value: option.id }));
  };

  return (
    <View style={[styles.container, block?.style]}>
      {Boolean(block.label) && <Text style={styles.sectionLabel}>{block.label}</Text>}

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {block.options?.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.mantraCard, isSelected && styles.mantraCardSelected]}
              onPress={() => selectMantra(option)}
              activeOpacity={0.7}
            >
              <View style={styles.radioOuter}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <View style={styles.mantraContent}>
                <Text style={[styles.mantraTitle, isSelected && styles.mantraTitleSelected]}>
                  {option.title}
                </Text>
                {Boolean(option.sanskrit) && (
                  <Text style={styles.sanskrit}>{option.sanskrit}</Text>
                )}
                {Boolean(option.subtitle) && (
                  <Text style={styles.subtitle}>{option.subtitle}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    marginVertical: 8,
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#bfa58a',
    fontFamily: Fonts.sans.bold,
    marginBottom: 12,
    textAlign: 'center',
  },
  list: {
    maxHeight: 400,
  },
  mantraCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 253, 249, 0.6)',
    gap: 12,
  },
  mantraCardSelected: {
    borderColor: '#C9A84C',
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(201, 168, 76, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C9A84C',
  },
  mantraContent: {
    flex: 1,
    gap: 4,
  },
  mantraTitle: {
    fontSize: 16,
    color: '#432104',
    fontFamily: Fonts.sans.medium,
    lineHeight: 22,
  },
  mantraTitleSelected: {
    color: '#C9A84C',
    fontFamily: Fonts.sans.semiBold,
  },
  sanskrit: {
    fontSize: 14,
    color: 'rgba(67, 33, 4, 0.6)',
    fontFamily: Fonts.serif.regular,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(67, 33, 4, 0.5)',
    fontFamily: Fonts.sans.regular,
    lineHeight: 18,
  },
});

export default MantraSelectionListBlock;
