import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useScreenStore } from '../engine/useScreenBridge';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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
  fullWidth?: boolean;
}

interface ChoiceCardBlockProps {
  block: {
    id?: string;
    type: 'choice_card' | 'choice_grid';
    options?: Option[];
    options_key?: string;
    selection_mode?: 'manual' | 'auto' | 'single_auto_advance';
    variant?: 'list' | 'grid' | 'grid_3' | 'premium-grid';
    target?: any;
    style?: any;
  };
}

// SVG paths from allContainers.js → Ionicons mapping (RN can't render SVGs without transformer)
const SVG_TO_IONICON: Record<string, string> = {
  // Discipline/Focus categories
  '/assets/career1.svg': 'briefcase-outline',
  '/assets/health.svg': 'heart-outline',
  '/assets/relationship.svg': 'people-outline',
  '/assets/spiritual-growth.svg': 'leaf-outline',
  // Quick check-in prana states
  '/assets/quick_1.svg': 'flash-outline',        // Energized
  '/assets/quick_2.svg': 'happy-outline',         // Balanced
  '/assets/quick_3.svg': 'battery-dead-outline',  // Drained
  '/assets/quick_4.svg': 'thunderstorm-outline',  // Agitated
  // Depth levels
  '/assets/beginner.svg': 'sunny-outline',
  '/assets/intermediate.svg': 'partly-sunny-outline',
  '/assets/advanced.svg': 'flame-outline',
  // Sub-focus: Career
  '/assets/wealth_1.svg': 'trending-up-outline',
  '/assets/wealth_2.svg': 'briefcase-outline',
  '/assets/wealth_3.svg': 'bulb-outline',
  '/assets/wealth_4.svg': 'compass-outline',
  // Sub-focus: Health
  '/assets/health_1.svg': 'fitness-outline',
  '/assets/health_2.svg': 'body-outline',
  '/assets/health_3.svg': 'bed-outline',
  '/assets/health_4.svg': 'nutrition-outline',
  '/assets/health_5.svg': 'medical-outline',
  // Sub-focus: Relationships
  '/assets/relation_1.svg': 'heart-outline',
  '/assets/relation_2.svg': 'chatbubbles-outline',
  '/assets/relation_3.svg': 'hand-left-outline',
  '/assets/relation_4.svg': 'people-outline',
  '/assets/relation_5.svg': 'home-outline',
  // Dosha/qualities
  '/assets/buddhi.svg': 'bulb-outline',
  '/assets/dharma.svg': 'shield-checkmark-outline',
  '/assets/shakthi.svg': 'flash-outline',
  '/assets/tejas.svg': 'sunny-outline',
  '/assets/viveka.svg': 'eye-outline',
  // Dashboard
  '/assets/dash_mantra.svg': 'musical-notes-outline',
  '/assets/dash_sankalp.svg': 'flag-outline',
  '/assets/dash_action.svg': 'walk-outline',
  '/assets/level_lotus.svg': 'flower-outline',
  '/assets/sankalp_centered.svg': 'locate-outline',
  '/assets/sankalp_inner_peace.svg': 'heart-circle-outline',
};

const FA_TO_IONICONS: Record<string, string> = {
  'spinner': 'sync',
  'heart-broken': 'heart-disliked',
  'user-slash': 'person-remove',
  'signs-post': 'map',
  'tachometer-alt': 'speedometer',
  'heart': 'heart',
  'fire': 'flame',
  'cloud': 'cloud',
  'link-slash': 'link-outline',
  'tint': 'water',
  'battery-quarter': 'battery-dead',
  'bed': 'bed',
  'compress-arrows-alt': 'contract',
  'walking': 'walk',
  'pills': 'medkit',
  'money-bill-wave': 'cash',
  'hand-holding-usd': 'wallet',
  'chart-line': 'trending-up',
  'piggy-bank': 'save',
  'coins': 'cash-outline',
};

/** Resolve an icon/image path to either an Ionicons name or null */
const resolveIconName = (path: string | any): string | null => {
  if (typeof path !== 'string') return null;
  // Check SVG mapping first
  if (SVG_TO_IONICON[path]) return SVG_TO_IONICON[path];
  // Check FontAwesome mapping
  const faName = path.replace('fas fa-', '');
  if (FA_TO_IONICONS[faName]) return FA_TO_IONICONS[faName];
  return null;
};

const ChoiceCardBlock: React.FC<ChoiceCardBlockProps> = ({ block }) => {
  const { loadScreen, goBack, screenData: screenState, updateScreenData, currentScreen } = useScreenStore();
  
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

  const handleSelect = async (option: Option) => {
    setSelectedId(option.id);
    updateScreenData(block.id || 'current_choice', option.id);

    const isAuto = block.selection_mode === 'auto' || block.selection_mode === 'single_auto_advance';

    if (isAuto) {
      const { executeAction } = require('../engine/actionExecutor');
      const setScreenValue = (value: any, key: string) => {
        const { screenActions } = require('../store/screenSlice');
        const { store } = require('../store');
        store.dispatch(screenActions.setScreenValue({ key, value }));
      };
      const ctx = { loadScreen, goBack, setScreenValue, screenState: { ...screenState } };

      // 1. Check for on_select map from current screen schema (dynamic routing)
      const onSelectMap = currentScreen?.on_select;
      if (onSelectMap) {
        const targetAction = onSelectMap[option.id] || onSelectMap['default'];
        if (targetAction) {
          await executeAction(targetAction, ctx);
          return;
        }
      }

      // 2. Check for action on the option itself
      if (option.action) {
        await executeAction(option.action, ctx);
        return;
      }

      // 3. Handle block level target
      if (block.target) {
        await executeAction({ type: 'navigate', target: block.target }, ctx);
      }
    }
  };

  const isGrid = block.type === 'choice_grid' || block.variant?.includes('grid');
  const isGrid3 = block.variant === 'grid_3';
  const isPremiumGrid = block.type === 'choice_grid' || block.variant === 'premium-grid';
  const numColumns = isGrid3 ? 3 : isGrid ? 2 : 1;

  return (
    <View style={[styles.container, isGrid && styles.gridContainer]}>
      {options.map((option, idx) => {
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
              isPremiumGrid && isSelected && styles.premiumSelectedCard,
              { 
                width: isGrid ? 
                  ((option.fullWidth || (idx === options.length - 1 && options.length % numColumns !== 0)) ? '100%' : `${100 / numColumns - 3}%`) 
                  : '100%', 
                marginBottom: isGrid ? 12 : 0 
              }
            ]}
          >
            {/* Gold Accent Line for List View */}
            {!isGrid && isSelected && (
              <LinearGradient
                colors={['#db9928', '#dfac3e']}
                style={styles.goldLine}
              />
            )}

            <View style={[
              styles.cardContent, 
              isGrid && styles.gridCardContent, 
              isPremiumGrid && styles.premiumGridContent,
              isGrid && option.fullWidth && styles.gridFullWidthContent
            ]}>
              <View style={[
                styles.leftPart, 
                isGrid && styles.gridLeftPart, 
                isPremiumGrid && styles.premiumGridLeftPart,
                isGrid && option.fullWidth && styles.gridFullWidthLeftPart
              ]}>
                {option.image || option.icon ? (
                  <View style={[styles.imageContainer, isPremiumGrid && styles.premiumImageContainer]}>
                    {(() => {
                      const iconName = resolveIconName(option.icon || option.image);
                      if (iconName) {
                        return (
                          <Ionicons
                            name={iconName as any}
                            size={isPremiumGrid ? 32 : 24}
                            color={isSelected ? '#D4A017' : '#432104'}
                          />
                        );
                      }
                      // Fallback: generic icon
                      return (
                        <Ionicons name="flower-outline" size={isPremiumGrid ? 32 : 24} color="#432104" />
                      );
                    })()}
                  </View>
                ) : null}
                
                <View style={[styles.details, isPremiumGrid && styles.premiumDetails]}>
                  <View style={[styles.titleRow, isGrid && styles.gridTitleRow, isPremiumGrid && styles.premiumTitleRow]}>
                    <Text style={[styles.title, isPremiumGrid && styles.premiumTitle]}>{option.title || option.label}</Text>
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
                    <Text style={[styles.description, (isGrid || isPremiumGrid) && styles.gridDescription]}>
                      {option.description}
                    </Text>
                  )}
                </View>
              </View>

              {/* Selection Indicator (Radio circle for list, hidden for premium grid) */}
              {!isPremiumGrid && (
                <View style={styles.indicatorContainer}>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
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
    borderColor: 'rgba(212, 160, 23, 0.3)',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFDF9', // Explicit background for that premium look
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
    minHeight: 145,
    alignItems: 'center',
    justifyContent: 'center',
  },
premiumGridCard: {
  borderRadius: 24,
  minHeight: 120,
  padding: 16,
  borderWidth: 1.5, 
  borderColor: 'rgba(212, 160, 23, 0.3)',
  backgroundColor: '#FFFDF9', 
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
},
  selectedCard: {
    borderColor: '#C9A84C',
    borderWidth: 2,
    backgroundColor: '#FFFAF0',
    transform: [{ translateY: -2 }],
  },
  premiumSelectedCard: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#D9B44A',
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
  gridFullWidthContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  leftPart: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gridLeftPart: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'center',
  },
  premiumGridLeftPart: {
    gap: 12,
  },
  gridFullWidthLeftPart: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  imageContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16, // Spacing for icons
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
    fontSize: 20,
    color: '#432104',
    fontFamily: 'CormorantGaramond_700Bold',
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
    fontFamily: 'Inter_400Regular',
  },
  premiumTagText: {
    fontSize: 14,
    color: '#432104',
    opacity: 0.6,
  },
  description: {
    fontSize: 15,
    color: '#432104',
    opacity: 0.8,
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  gridDescription: {
    textAlign: 'center',
  },
  indicatorContainer: {
    marginLeft: 8,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#D4CFC7',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radioOuterSelected: {
    borderColor: '#C9A84C',
    backgroundColor: '#FFFFFF',
  },
  radioInner: {
    width: 14,
    height: 14,
    backgroundColor: '#C9A84C',
    borderRadius: 7,
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
