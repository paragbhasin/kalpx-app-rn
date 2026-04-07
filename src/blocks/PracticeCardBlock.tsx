import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useScreenStore } from '../engine/useScreenBridge';

interface PracticeCardBlockProps {
  block: {
    type: 'practice_card';
    label: string;
    title: string;
    description: string;
    meta?: string;
    icon?: string;
    id?: string;
    detailData?: any;
  };
}

const PracticeCardBlock: React.FC<PracticeCardBlockProps> = ({ block }) => {
  const setOverlayData = useScreenStore(state => state.setOverlayData);

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="light" style={styles.blurBuffer}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>{block.label}</Text>
            {/* The "i" icon mentioned in audio and seen in screenshot */}
            <TouchableOpacity 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => setOverlayData(block.detailData)}
            >
              <Ionicons name="information-circle" size={20} color="#D9AD43" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.title}>{block.title}</Text>
          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {block.description}
          </Text>

          {/* Optional meta info if needed (e.g. 1-2 minutes) */}
          {Boolean(block.meta) && (
            <Text style={styles.meta}>{block.meta}</Text>
          )}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  blurBuffer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(217, 165, 87, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  card: {
    padding: 18,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 18,
    color: '#8C8881',
    fontFamily: 'GelicaBold',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    color: '#432104',
    fontFamily: 'GelicaBold',
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    color: '#432104',
    fontFamily: 'GelicaRegular',
    lineHeight: 22,
    opacity: 0.9,
  },
  meta: {
    fontSize: 12,
    color: '#D9AD43',
    fontFamily: 'GelicaBold',
    marginTop: 8,
    textTransform: 'uppercase',
  }
});

export default PracticeCardBlock;
