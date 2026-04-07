import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface SankalpDisplayBlockProps {
  block: {
    type: 'sankalp_display';
    text_key: string;
    variant?: 'static' | 'dynamic';
  };
}

const SankalpDisplayBlock: React.FC<SankalpDisplayBlockProps> = ({ block }) => {
  const { companion: companionData } = useSelector((state: RootState) => state.mitra);
  
  // Resolve sankalp text from companion data
  const sankalpText = companionData?.companion?.sankalp?.core?.line || "Let me be present with what is.";
  
  return (
    <View style={styles.container}>
      <Text style={styles.quoteMark}>“</Text>
      <Text style={styles.sankalpText}>{sankalpText}</Text>
      <Text style={styles.quoteMarkRight}>”</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 30,
    alignItems: 'center',
  },
  sankalpText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  quoteMark: {
    fontSize: 48,
    fontFamily: 'CormorantGaramond_700Bold',
    color: '#D9AD43',
    opacity: 0.3,
    marginBottom: -20,
  },
  quoteMarkRight: {
     fontSize: 48,
    fontFamily: 'CormorantGaramond_700Bold',
    color: '#D9AD43',
    opacity: 0.3,
    marginTop: -20,
    alignSelf: 'flex-end',
    marginRight: 20,
  }
});

export default SankalpDisplayBlock;
