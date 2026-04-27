import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface PatternItem {
  trigger: string;
  frequency?: number;
  response?: string;
}

interface TriggerPatternBlockProps {
  block: {
    headline?: string;
    patterns?: PatternItem[];
    insight?: string;
    style?: any;
  };
}

const TriggerPatternBlock: React.FC<TriggerPatternBlockProps> = ({ block }) => {
  return (
    <View style={[styles.container, block?.style]}>
      {Boolean(block.headline) && <Text style={styles.headline}>{block.headline}</Text>}

      {block.patterns && block.patterns.length > 0 && (
        <View style={styles.patternsList}>
          {block.patterns.map((pattern, index) => (
            <View key={index} style={styles.patternCard}>
              <View style={styles.patternHeader}>
                <Text style={styles.triggerLabel}>{pattern.trigger}</Text>
                {pattern.frequency != null && (
                  <Text style={styles.frequency}>{pattern.frequency}x</Text>
                )}
              </View>
              {Boolean(pattern.response) && (
                <Text style={styles.response}>{pattern.response}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {Boolean(block.insight) && (
        <View style={styles.insightBox}>
          <Text style={styles.insightIcon}>{'\u2728'}</Text>
          <Text style={styles.insightText}>{block.insight}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    color: '#432104',
    fontFamily: Fonts.serif.bold,
    textAlign: 'center',
    marginBottom: 16,
  },
  patternsList: {
    gap: 10,
  },
  patternCard: {
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.25)',
    borderRadius: 14,
    padding: 16,
    backgroundColor: 'rgba(255, 253, 249, 0.8)',
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  triggerLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#432104',
    fontFamily: Fonts.sans.semiBold,
    flex: 1,
  },
  frequency: {
    fontSize: 14,
    color: '#C9A84C',
    fontFamily: Fonts.sans.semiBold,
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  response: {
    fontSize: 13,
    color: 'rgba(67, 33, 4, 0.6)',
    fontFamily: Fonts.sans.regular,
    lineHeight: 19,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
  },
  insightIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  insightText: {
    fontSize: 14,
    color: 'rgba(67, 33, 4, 0.7)',
    fontFamily: Fonts.sans.regular,
    lineHeight: 20,
    flex: 1,
    fontStyle: 'italic',
  },
});

export default TriggerPatternBlock;
