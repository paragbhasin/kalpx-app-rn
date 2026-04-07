import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';

interface CardItem {
  id?: string;
  title: string;
  description?: string;
  icon?: string;
  action?: any;
}

interface CardListBlockProps {
  block: {
    items_key?: string;
    options?: CardItem[];
    card_type?: string;
    variant?: string;
    style?: any;
  };
}

const CardListBlock: React.FC<CardListBlockProps> = ({ block }) => {
  const { screenData: screenState, loadScreen, goBack } = useScreenStore();

  const items: CardItem[] =
    (block.items_key ? (screenState[block.items_key] as CardItem[]) : null) ||
    block.options ||
    [];

  const handleCardPress = async (item: CardItem) => {
    const action = item.action || {
      type: 'select_trigger_mantra',
      payload: { id: item.id, title: item.title },
    };

    try {
      await executeAction(action, {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => {
          const { screenActions } = require('../store/screenSlice');
          const { store } = require('../store');
          store.dispatch(screenActions.setScreenValue({ key, value }));
        },
        screenState,
      });
    } catch (err) {
      console.error('[CardListBlock] Action failed:', err);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <View style={[styles.container, block?.style]}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.id || item.title || index}
          style={[styles.card, block.variant === 'minimal' && styles.cardMinimal]}
          activeOpacity={0.7}
          onPress={() => handleCardPress(item)}
        >
          {Boolean(item.icon) && (
            <View style={[styles.iconSection, block.variant === 'minimal' && styles.iconMinimal]}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
          )}
          <View style={styles.textSection}>
            <Text style={[styles.title, block.variant === 'minimal' && styles.titleMinimal]}>
              {item.title}
            </Text>
            {Boolean(item.description) && (
              <Text
                style={[styles.description, block.variant === 'minimal' && styles.descMinimal]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color="#B89450" style={styles.arrow} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(208, 144, 45, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    gap: 12,
  },
  cardMinimal: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  iconSection: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(184, 148, 80, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMinimal: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  iconText: {
    fontSize: 22,
  },
  textSection: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    color: '#432104',
    fontFamily: Fonts.serif.bold,
    fontWeight: '700',
  },
  titleMinimal: {
    fontSize: 15,
  },
  description: {
    fontSize: 13,
    color: '#432104',
    fontFamily: Fonts.sans.regular,
    lineHeight: 18,
    opacity: 0.8,
  },
  descMinimal: {
    fontSize: 12,
    opacity: 0.7,
  },
  arrow: {
    opacity: 0.5,
  },
});

export default CardListBlock;
