import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useScreenStore } from '../engine/ScreenStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Option {
  id: string;
  title: string;
  description?: string;
  image?: any;
  icon?: string;
  label?: string;
  label_color?: string;
  tags?: string[];
  meta?: string;
  button_label?: string;
  button_style?: string;
  action?: any;
  selected?: boolean;
}

interface ChoiceCardBlockProps {
  block: {
    id?: string;
    type: 'choice_card';
    options?: Option[];
    options_key?: string;
    selection_mode?: 'manual' | 'auto' | 'single_auto_advance';
    variant?: 'list' | 'grid' | 'grid_3' | 'premium-grid';
    target?: any;
    style?: any;
  };
}

const assetMap: Record<string, any> = {
  '/assets/career1.png': require('../../assets/career1.png'),
  '/assets/relationship.png': require('../../assets/relationship.png'),
  '/assets/health.png': require('../../assets/health.png'),
  '/assets/wealth.png': require('../../assets/wealth.png'),
};

const resolveAsset = (path: string | any) => {
  if (typeof path !== 'string') return path;
  return assetMap[path] || { uri: path };
};

const ChoiceCardBlock: React.FC<ChoiceCardBlockProps> = ({ block }) => {
  const loadScreen = useScreenStore((state) => state.loadScreen);
  const screenState = useScreenStore((state) => state.screenData);
  const updateScreenData = useScreenStore((state) => state.updateScreenData);
  
  const options = useMemo(() => {
    if (block.options) return block.options;
    if (block.options_key && screenState[block.options_key]) {
      return screenState[block.options_key] as Option[];
    }
    return [];
  }, [block.options, block.options_key, screenState]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Initialize selection
  useEffect(() => {
    const initialSelected = options.find((opt) => opt.selected);
    if (initialSelected) {
      setSelectedId(initialSelected.id);
      updateScreenData(block.id || 'current_choice', initialSelected.id);
    }
  }, []);

  const handleSelect = (option: Option) => {
    setSelectedId(option.id);
    updateScreenData(block.id || 'current_choice', option.id);

    const isAuto = block.selection_mode === 'auto' || block.selection_mode === 'single_auto_advance';
    
    if (isAuto) {
      // 1. Check for action on the option itself
      if (option.action) {
        if (option.action.type === 'navigate' && option.action.target) {
          loadScreen(option.action.target.container_id, option.action.target.state_id);
        }
        return;
      }

      // 2. Handle block level target
      if (block.target) {
        loadScreen(block.target.container_id, block.target.state_id);
      }
    }
  };

  const isGrid = block.variant?.includes('grid');
  const isGrid3 = block.variant === 'grid_3';
  const isPremiumGrid = block.variant === 'premium-grid';
  const numColumns = isGrid3 ? 3 : isGrid ? 2 : 1;

  return (
    <View style={[styles.container, isGrid && styles.gridContainer]}>
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        
        return (
          <TouchableOpacity
            key={option.id}
            activeOpacity={0.8}
            onPress={() => handleSelect(option)}
            style={[
              styles.card,
              isGrid && styles.gridCard,
              isPremiumGrid && styles.premiumGridCard,
              isSelected && styles.selectedCard,
              { width: isGrid ? '47%' : '100%', marginBottom: isGrid ? 10 : 0 }
            ]}
          >
            {/* Gold Accent Line for List View */}
            {!isGrid && isSelected && (
              <LinearGradient
                colors={['#db9928', '#dfac3e']}
                style={styles.goldLine}
              />
            )}

            <View style={[styles.cardContent, isGrid && styles.gridCardContent, isPremiumGrid && styles.premiumGridContent]}>
              <View style={[styles.leftPart, isGrid && styles.gridLeftPart, isPremiumGrid && styles.premiumGridLeftPart]}>
                {option.image || option.icon ? (
                  <View style={[styles.imageContainer, isPremiumGrid && styles.premiumImageContainer]}>
                    <Image 
                      source={
                        option.image ? resolveAsset(option.image) : resolveAsset(option.icon)
                      } 
                      style={[styles.image, isPremiumGrid && styles.premiumImage]} 
                      resizeMode="contain" 
                    />
                  </View>
                ) : null}
                
                <View style={[styles.details, isPremiumGrid && styles.premiumDetails]}>
                  <View style={[styles.titleRow, isGrid && styles.gridTitleRow, isPremiumGrid && styles.premiumTitleRow]}>
                    <Text style={[styles.title, isPremiumGrid && styles.premiumTitle]} numberOfLines={2}>{option.title}</Text>
                    {option.label && !isGrid && (
                      <View style={[styles.labelBadge, { backgroundColor: option.label_color || '#C59B63' }]}>
                        <Text style={styles.labelText}>{option.label}</Text>
                      </View>
                    )}
                  </View>

                  {option.tags && (
                    <View style={[styles.tagsRow, isGrid && styles.gridTagsRow, isPremiumGrid && styles.premiumTagsRow]}>
                      {option.tags.map((tag, idx) => (
                        <Text key={idx} style={[styles.tagText, isPremiumGrid && styles.premiumTagText]}>
                          {tag}{idx < option.tags!.length - 1 ? ' • ' : ''}
                        </Text>
                      ))}
                    </View>
                  )}

                  {option.description && !option.tags && (
                    <Text style={[styles.description, (isGrid || isPremiumGrid) && styles.gridDescription]} numberOfLines={2}>
                      {option.description}
                    </Text>
                  )}
                </View>
              </View>

              {/* Selection Indicator */}
              {!isPremiumGrid && (
                <View style={styles.indicatorContainer}>
                  {isSelected ? (
                    <View style={styles.radioOuterSelected}>
                      <View style={styles.radioInner} />
                    </View>
                  ) : (
                    !isGrid && <View style={styles.radioOuterEmpty} />
                  )}
                </View>
              )}
            </View>

            {option.button_label && (
              <View style={styles.cardAction}>
                <LinearGradient
                  colors={option.button_style === 'outline' ? ['transparent', 'transparent'] : ['#db9928', '#dfac3e']}
                  style={[styles.miniBtn, option.button_style === 'outline' && styles.miniBtnOutline]}
                >
                  <Text style={[styles.miniBtnText, option.button_style === 'outline' && styles.miniBtnTextOutline]}>
                    {option.button_label}
                  </Text>
                </LinearGradient>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
    gap: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
  },
  card: {

    borderWidth: 1.5,
    borderColor: 'rgba(212, 160, 23, 0.2)',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gridCard: {
    padding: 12,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
premiumGridCard: {
  borderRadius: 24,
  minHeight: 156,
  padding: 20,
  borderWidth: 1.5,
  borderColor: '#C7A64B',
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 }, // NOT 2,2 ❌
  shadowOpacity: 0.15,
  shadowRadius: 12,
 elevation: 8, // Android
},
  selectedCard: {
    borderColor: '#C9A84C',
    borderWidth: 2,
    backgroundColor: '#FFFAF0',
    transform: [{ translateY: -2 }],
  },
  goldLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  gridCardContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumGridContent: {
    justifyContent: 'center',
  },
  leftPart: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  gridLeftPart: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'center',
  },
  premiumGridLeftPart: {
    gap: 12,
  },
  imageContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumImageContainer: {
    width: 64,
    height: 64,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  premiumImage: {
    width: '100%',
    height: '100%',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  premiumDetails: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  gridTitleRow: {
    justifyContent: 'center',
  },
  premiumTitleRow: {
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#432104',
    fontFamily: 'GelicaBold',
    flex: 1,
  },
  premiumTitle: {
    fontSize: 20,
    textAlign: 'center',
  },
  labelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  gridTagsRow: {
    justifyContent: 'center',
  },
  premiumTagsRow: {
    marginTop: 0,
  },
  tagText: {
    fontSize: 13,
    color: '#616161',
    fontFamily: 'GelicaRegular',
  },
  premiumTagText: {
    fontSize: 14,
    color: '#432104',
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    color: '#432104',
    opacity: 0.8,
    marginTop: 2,
    fontFamily: 'GelicaRegular',
  },
  gridDescription: {
    textAlign: 'center',
  },
  indicatorContainer: {
    marginLeft: 8,
  },
  radioOuterEmpty: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#D4CFC7',
    borderRadius: 10,
  },
  radioOuterSelected: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#C9A84C',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioInner: {
    width: 12,
    height: 12,
    backgroundColor: '#C9A84C',
    borderRadius: 6,
  },
  cardAction: {
    marginTop: 12,
    width: '100%',
  },
  miniBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniBtnOutline: {
    borderWidth: 1,
    borderColor: '#C9A84C',
  },
  miniBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  miniBtnTextOutline: {
    color: '#C9A84C',
  },
});

export default ChoiceCardBlock;
