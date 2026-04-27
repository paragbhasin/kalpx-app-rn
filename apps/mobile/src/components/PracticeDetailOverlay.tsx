import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface ExpandableSectionProps {
  title: string;
  content: string | string[];
  isExpanded: boolean;
  onToggle: () => void;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({ title, content, isExpanded, onToggle }) => {
  if (!content || (Array.isArray(content) && content.length === 0)) return null;

  return (
    <View style={styles.expandableContainer}>
      <TouchableOpacity style={styles.expandableHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.dividerLine} />
        <View style={styles.headerTextWrap}>
          <Text style={styles.expandableTitle}>{title}</Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={18} 
            color="#D9AD43" 
          />
        </View>
        <View style={styles.dividerLine} />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.expandableContent}>
          {Array.isArray(content) ? (
            content.map((item, idx) => (
              <View key={idx} style={styles.benefitItem}>
                <View style={styles.bullet} />
                <Text style={styles.contentText}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.contentText}>{content}</Text>
          )}
        </View>
      )}
    </View>
  );
};

interface PracticeDetailOverlayProps {
  data: any;
  onClose: () => void;
}

const PracticeDetailOverlay: React.FC<PracticeDetailOverlayProps> = ({ data, onClose }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('meaning'); // Default one open
  const [isMantraExpanded, setIsMantraExpanded] = useState(false);

  if (!data) return null;

  const type = data.type || 'practice';

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const renderPracticeContent = () => (
    <>
      <Text style={styles.mainTitle}>{data.title}</Text>
      <View style={styles.stepsCard}>
        <View style={styles.stepsHeader}>
            <View style={styles.smallDash} />
            <Text style={styles.stepsHeaderText}>What this practice asks of you</Text>
            <View style={styles.smallDash} />
        </View>
        
        <View style={styles.stepsList}>
            {(data.steps || []).map((step: string, idx: number) => (
            <View key={idx} style={styles.stepItem}>
                <Text style={styles.stepNumber}>{idx + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
            </View>
            ))}
        </View>
      </View>
      
      <View style={styles.expandablesArea}>
        <ExpandableSection 
            title="Meaning" 
            content={data.summary || ""} 
            isExpanded={expandedSection === 'meaning'}
            onToggle={() => toggleSection('meaning')}
        />
        <ExpandableSection 
            title="Benefits" 
            content={data.benefits || []} 
            isExpanded={expandedSection === 'benefits'}
            onToggle={() => toggleSection('benefits')}
        />
        <ExpandableSection 
            title="Why this works" 
            content={data.insight || ""} 
            isExpanded={expandedSection === 'why'}
            onToggle={() => toggleSection('why')}
        />
      </View>
    </>
  );

  const renderSankalpContent = () => (
    <>
      <Text style={[styles.mainTitle, { fontSize: 24 }]}>{data.title}</Text>
      <Text style={styles.sankalpLineText}>"{data.line}"</Text>
      
      <View style={styles.stepsCard}>
        <View style={styles.stepsHeader}>
            <View style={styles.smallDash} />
            <Text style={styles.stepsHeaderText}>How To Live</Text>
            <View style={styles.smallDash} />
        </View>
        <View style={styles.stepsList}>
            {(Array.isArray(data.how_to_live) ? data.how_to_live : [data.how_to_live]).map((item: string, idx: number) => (
                <Text key={idx} style={styles.sankalpActionText}>• {item}</Text>
            ))}
        </View>
      </View>
      
      <View style={styles.expandablesArea}>
        <ExpandableSection 
            title="Meaning" 
            content={data.insight || ""} 
            isExpanded={expandedSection === 'meaning'}
            onToggle={() => toggleSection('meaning')}
        />
        <ExpandableSection 
            title="Benefits" 
            content={data.benefits || []} 
            isExpanded={expandedSection === 'benefits'}
            onToggle={() => toggleSection('benefits')}
        />
      </View>
    </>
  );

  const renderMantraContent = () => (
    <>
       <View style={styles.mantraMainBox}>
         <Text style={styles.transliterationTitle}>{data.iast || data.line}</Text>
         <Text style={styles.devanagariText}>{data.devanagari}</Text>

         <TouchableOpacity 
            style={styles.mantraViewButton} 
            onPress={() => setIsMantraExpanded(!isMantraExpanded)}
         >
            <Text style={styles.mantraBtnText}>
                {isMantraExpanded ? "Tap to collapse ↑" : "Tap to view full mantra →"}
            </Text>
         </TouchableOpacity>

         {isMantraExpanded && (
             <Text style={styles.fullMantraText}>{data.full_text || data.iast || data.line}</Text>
         )}
       </View>

      <View style={styles.expandablesArea}>
        <ExpandableSection 
            title="Meaning" 
            content={data.meaning || ""} 
            isExpanded={expandedSection === 'meaning'}
            onToggle={() => toggleSection('meaning')}
        />
        <ExpandableSection 
            title="Essence" 
            content={data.essence || ""} 
            isExpanded={expandedSection === 'essence'}
            onToggle={() => toggleSection('essence')}
        />
      </View>
    </>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#432104" />
          </TouchableOpacity>
          <Image source={require('../../assets/lotus_icon.png')} style={styles.headerLotus} />
          <View style={{ width: 44 }} /> {/* Spacer */}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {type === 'practice' && renderPracticeContent()}
            {type === 'sankalp' && renderSankalpContent()}
            {type === 'mantra' && renderMantraContent()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FAF9F6', 
    zIndex: 1000,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerLotus: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 26,
    fontFamily: 'GelicaBold',
    color: '#432104',
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 32,
  },
  sankalpLineText: {
    fontSize: 16,
    fontFamily: 'GelicaRegular',
    color: '#615247',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
    lineHeight: 24,
  },
  stepsCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(217, 165, 87, 0.4)',
    shadowColor: '#d9a557',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 24,
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  smallDash: {
    width: 10,
    height: 1,
    backgroundColor: 'rgba(217, 165, 87, 0.5)',
  },
  stepsHeaderText: {
    fontSize: 18,
    color: '#432104',
    fontFamily: 'GelicaRegular',
    opacity: 0.8,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    fontSize: 18,
    fontFamily: 'GelicaBold',
    color: '#432104',
    width: 24,
  },
  stepText: {
    fontSize: 16,
    fontFamily: 'GelicaRegular',
    color: '#432104',
    flex: 1,
    lineHeight: 24,
  },
  expandablesArea: {
    width: '100%',
    gap: 4,
  },
  expandableContainer: {
    width: '100%',
    marginBottom: 8,
  },
  expandableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(217, 165, 87, 0.3)',
  },
  headerTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 12,
  },
  expandableTitle: {
    fontSize: 20,
    fontFamily: 'GelicaBold',
    color: '#432104',
  },
  expandableContent: {
    paddingTop: 12,
    paddingHorizontal: 10,
    gap: 8,
  },
  contentText: {
    fontSize: 15,
    fontFamily: 'GelicaRegular',
    color: '#432104',
    lineHeight: 22,
    opacity: 0.8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D9AD43',
    marginTop: 8,
  },
  sankalpActionText: {
    fontSize: 16,
    fontFamily: 'GelicaRegular',
    color: '#432104',
    lineHeight: 24,
    marginBottom: 4,
  },
  mantraMainBox: {
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  transliterationTitle: {
    fontSize: 22,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 30,
    fontFamily: 'GelicaBold',
    marginBottom: 16,
  },
  devanagariText: {
    fontSize: 24,
    color: '#432104',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 34,
  },
  mantraViewButton: {
    borderWidth: 1,
    borderColor: '#D9A557',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  mantraBtnText: {
    fontSize: 16,
    fontFamily: 'GelicaBold',
    color: '#432104',
  },
  fullMantraText: {
    fontSize: 16,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: 'GelicaRegular',
    backgroundColor: 'rgba(217, 165, 87, 0.05)',
    padding: 16,
    borderRadius: 16,
  }
});

export default PracticeDetailOverlay;
