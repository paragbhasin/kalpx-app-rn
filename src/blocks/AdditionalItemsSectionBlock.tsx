import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';

interface AdditionalItem {
  id?: string;
  title: string;
  description?: string;
  icon?: string;
  type?: string;
}

interface AdditionalItemsSectionBlockProps {
  block: {
    items_key?: string;
    label?: string;
    style?: any;
  };
}

const AdditionalItemsSectionBlock: React.FC<AdditionalItemsSectionBlockProps> = ({ block }) => {
  const { screenData: screenState } = useScreenStore();

  const items: AdditionalItem[] =
    (screenState[block.items_key || 'additional_items'] as AdditionalItem[]) || [];

  if (!items || items.length === 0) return null;

  return (
    <View style={[styles.container, block?.style]}>
      {Boolean(block.label) && <Text style={styles.sectionLabel}>{block.label}</Text>}

      {items.map((item, index) => (
        <View key={item.id || index} style={styles.itemCard}>
          {Boolean(item.icon) && <Text style={styles.icon}>{item.icon}</Text>}
          <View style={styles.textSection}>
            <Text style={styles.title}>{item.title}</Text>
            {Boolean(item.description) && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#bfa58a',
    fontWeight: '700',
    fontFamily: Fonts.sans.bold,
    marginBottom: 6,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(201, 168, 76, 0.25)',
    backgroundColor: 'rgba(255, 253, 249, 0.6)',
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  textSection: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    color: '#432104',
    fontFamily: Fonts.serif.bold,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: '#432104',
    fontFamily: Fonts.sans.regular,
    lineHeight: 18,
    opacity: 0.7,
  },
});

export default AdditionalItemsSectionBlock;
