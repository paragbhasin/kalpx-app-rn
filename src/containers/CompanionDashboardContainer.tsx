import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useScreenStore } from '../engine/ScreenStore';
import BlockRenderer from '../engine/BlockRenderer';
import { CompanionDashboardContainer as DashboardSchema } from '../../allContainers.js';

const { width } = Dimensions.get('window');

const CompanionDashboardContainer: React.FC = () => {
  const { companion: companionData } = useSelector((state: RootState) => state.mitra);
  const setOverlayData = useScreenStore(state => state.setOverlayData);
  
  // Data for template substitution
  const dayNumber = companionData?.journey?.dayNumber || 1;
  const totalDays = 14; 
  
  const templateMap: Record<string, string> = {
    day_number: String(dayNumber),
    total_days: String(totalDays),
    identity_headline: "A new day of sadhana begins",
    identity_guidance: "A moment of grounding in your day.",
    mantra_text: companionData?.companion?.mantra?.core?.line || "",
    sankalp_text: companionData?.companion?.sankalp?.core?.line || "",
    practice_title: companionData?.companion?.practice?.core?.title || "",
    practice_meta: companionData?.companion?.practice?.core?.duration || "",
  };

  const resolveTemplate = (text: string) => {
    if (!text) return "";
    return text.replace(/\{\{(.*?)\}\}/g, (_, key) => templateMap[key.trim()] || "");
  };

  // Get blocks from the schema
  const stateSchema = DashboardSchema.states.day_active;
  const blocks = stateSchema.blocks || [];

  const renderProgressCircle = () => (
    <View style={styles.progressContainer}>
        <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
                <Text style={styles.dayLabel}>Day {dayNumber}</Text>
                <Image source={require('../../assets/lotus_icon.png')} style={styles.progressLotus} />
            </View>
            <View style={styles.progressDot} />
        </View>
    </View>
  );

  const renderPracticeCard = (block: any) => {
    let type: 'mantra' | 'sankalp' | 'practice' = 'practice';
    let data: any = null;

    if (block.id === 'practice_chant') {
        type = 'mantra';
        data = companionData?.companion?.mantra;
    } else if (block.id === 'practice_embody') {
        type = 'sankalp';
        data = companionData?.companion?.sankalp;
    } else if (block.id === 'practice_act') {
        type = 'practice';
        data = companionData?.companion?.practice;
    }

    if (!data) return null;

    const iconMap = {
        mantra: { name: 'flower-outline', color: '#D97D21' },
        sankalp: { name: 'flame', color: '#D97D21' },
        practice: { name: 'triangle', color: '#D9AD43' },
    };

    const icon = iconMap[type];

    return (
      <TouchableOpacity 
        key={block.id}
        style={styles.card} 
        activeOpacity={0.9}
        onPress={() => setOverlayData({ ...data.core, type })}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconCircle}>
            {type === 'mantra' ? (
                <Text style={styles.omText}>ॐ</Text>
            ) : (
                <Ionicons name={icon.name as any} size={30} color={icon.color} />
            )}
          </View>
          <View style={styles.cardTextWrap}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardLabel}>{block.title}</Text>
              <TouchableOpacity onPress={() => setOverlayData({ ...data.core, type })}>
                <Ionicons name="information-circle" size={20} color="#D9AD43" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardMainText} numberOfLines={1} ellipsizeMode="tail">
                {resolveTemplate(block.description)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <Header isTransparent />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Render Top Blocks using fixed layout for the circular progress */}
        <Text style={styles.topTitle}>{resolveTemplate(blocks.find((b: any) => b.type === 'headline')?.content)}</Text>
        
        {renderProgressCircle()}

        <View style={styles.introBox}>
            <Text style={styles.introSubtext}>{resolveTemplate(blocks.find((b: any) => b.type === 'subtext')?.content)}</Text>
            <Text style={styles.introMainText}>
                Day {dayNumber} of {totalDays} — same mantra, same practice, same intention. The repetition is the path.
            </Text>
        </View>

        <TouchableOpacity style={styles.beginBtn}>
            <Text style={styles.beginBtnText}>Begin Today's Practice →</Text>
        </TouchableOpacity>

        {/* Practice Access Cards */}
        <View style={styles.cardsStack}>
            {blocks.filter((b: any) => b.type === 'practice_card').map((block: any) => renderPracticeCard(block))}
        </View>

        <View style={styles.triggerSection}>
            <Text style={styles.triggerQuestion}>What is possible today?</Text>
            
            {/* Render footer actions using BlockRenderer for consistency */}
            {blocks.filter((b: any) => b.position === 'footer_actions').map((block: any, idx: number) => {
                const resolvedBlock = { ...block, content: resolveTemplate(block.content), label: resolveTemplate(block.label) };
                return <BlockRenderer key={idx} block={resolvedBlock} />;
            })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: '#FAF9F6', 
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      alignItems: 'center',
    },
    topTitle: {
      fontSize: 24,
      fontFamily: 'GelicaBold',
      color: '#432104',
      textAlign: 'center',
      marginTop: 10,
    },
    progressContainer: {
      marginVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outerCircle: {
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 10,
      borderColor: '#F2EDE4',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    innerCircle: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(242, 237, 228, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dayLabel: {
      fontSize: 32,
      fontFamily: 'GelicaBold',
      color: '#432104',
      marginBottom: 5,
    },
    progressLotus: {
      width: 50,
      height: 50,
      resizeMode: 'contain',
    },
    progressDot: {
      position: 'absolute',
      top: -10, 
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#B5945F',
    },
    introBox: {
      alignItems: 'center',
      marginBottom: 20,
    },
    introSubtext: {
      fontSize: 14,
      color: '#8c8881',
      fontFamily: 'GelicaRegular',
      marginBottom: 5,
    },
    introMainText: {
      fontSize: 15,
      color: '#432104',
      fontFamily: 'GelicaRegular',
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: 15,
    },
    beginBtn: {
      marginBottom: 25,
    },
    beginBtnText: {
      fontSize: 18,
      fontFamily: 'GelicaBold',
      color: '#432104',
      textDecorationLine: 'none',
    },
    cardsStack: {
      width: '100%',
      gap: 12,
      marginBottom: 30,
    },
    card: {
      width: '100%',
      backgroundColor: '#FFF',
      borderRadius: 24,
      padding: 16,
      borderWidth: 1.2,
      borderColor: 'rgba(217, 165, 87, 0.3)',
      shadowColor: '#d9a557',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 2,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 1,
    },
    omText: {
      fontSize: 28,
      color: '#D97D21',
    },
    cardTextWrap: {
      flex: 1,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 1,
    },
    cardLabel: {
      fontSize: 18,
      fontFamily: 'GelicaBold',
      color: '#432104',
    },
    cardMainText: {
      fontSize: 14,
      color: '#615247',
      fontFamily: 'GelicaRegular',
      opacity: 0.8,
    },
    triggerSection: {
      paddingHorizontal: 5,
      alignItems: 'center',
      width: '100%',
      marginTop: 10,
    },
    triggerQuestion: {
      fontSize: 16,
      color: '#8c8881',
      fontFamily: 'GelicaRegular',
      marginBottom: 15,
    }
  });

export default CompanionDashboardContainer;
