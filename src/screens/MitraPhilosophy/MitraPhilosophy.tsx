import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import store from '../../store';
import { screenActions } from '../../store/screenSlice';
import { Fonts } from '../../theme/fonts';

const steps = [
  {
    icon: 'heart-outline',
    title: 'You tell Mitra where you are',
    description: 'Share what you\'re feeling or seeking.',
  },
  {
    icon: 'calendar-outline',
    title: 'Mitra builds your 14-day path',
    description: 'A guided flow of mantra, sankalp, and practice.',
  },
  {
    icon: 'sunny-outline',
    title: 'Follow a simple daily rhythm',
    description: 'Small steps you can return to each day.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'You get support when needed',
    description: 'Check in, reset, or use trigger support anytime.',
  },
  {
    icon: 'leaf-outline',
    title: 'You reflect and continue',
    description: 'Pause, review, and choose your next path.',
  },
];

export default function MitraPhilosophy() {
  const navigation: any = useNavigation();

  const handleBeginJourney = () => {
    store.dispatch(
      screenActions.loadScreen({
        containerId: 'choice_stack',
        stateId: 'discipline_select',
      }),
    );
    navigation.navigate('MitraEngine');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#432104" />
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.title}>How KalpX Mitra Works</Text>
          <Text style={styles.subtitle}>
            Rooted in Sanatan wisdom, each mantra, sankalp, and practice is chosen with intention.
          </Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, idx) => (
            <View key={idx} style={styles.stepCard}>
              <View style={styles.stepIconWrap}>
                <Ionicons name={step.icon as any} size={28} color="#D4A017" />
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerMantra}>Small daily steps create real change.</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={handleBeginJourney}>
            <Text style={styles.ctaText}>Begin Your Journey →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backBtn: {
    marginTop: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: '#5C5648',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    maxWidth: 320,
  },
  stepsContainer: {
    gap: 16,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stepIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 160, 23, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: Fonts.sans.semiBold,
    color: '#432104',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: '#5C5648',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerMantra: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    fontStyle: 'italic',
    color: '#5C5648',
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaBtn: {
    backgroundColor: '#D4A017',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 28,
    shadowColor: '#D4A017',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: Fonts.sans.semiBold,
    letterSpacing: 0.5,
  },
});
