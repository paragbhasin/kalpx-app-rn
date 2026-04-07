import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface DecisionItem {
  label: string;
  value: string;
  changed?: boolean;
}

interface CycleReflectionResultsBlockProps {
  block: {
    headline?: string;
    decisions?: DecisionItem[];
    summary?: string;
    style?: any;
  };
}

const CycleReflectionResultsBlock: React.FC<CycleReflectionResultsBlockProps> = ({ block }) => {
  return (
    <View style={[styles.container, block?.style]}>
      {Boolean(block.headline) && <Text style={styles.headline}>{block.headline}</Text>}

      {block.decisions && block.decisions.length > 0 && (
        <View style={styles.decisionsList}>
          {block.decisions.map((decision, index) => (
            <View key={index} style={[styles.decisionRow, index < block.decisions!.length - 1 && styles.rowBorder]}>
              <Text style={styles.decisionLabel}>{decision.label}</Text>
              <View style={styles.valueRow}>
                <Text style={[styles.decisionValue, decision.changed && styles.changedValue]}>
                  {decision.value}
                </Text>
                {decision.changed && <Text style={styles.changedBadge}>Updated</Text>}
              </View>
            </View>
          ))}
        </View>
      )}

      {Boolean(block.summary) && <Text style={styles.summary}>{block.summary}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    borderRadius: 20,
    padding: 24,
    marginVertical: 10,
    backgroundColor: 'rgba(255, 253, 249, 0.85)',
  },
  headline: {
    fontSize: 20,
    fontWeight: '700',
    color: '#432104',
    fontFamily: Fonts.serif.bold,
    textAlign: 'center',
    marginBottom: 16,
  },
  decisionsList: {
    gap: 0,
  },
  decisionRow: {
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 168, 76, 0.15)',
  },
  decisionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: 'rgba(67, 33, 4, 0.5)',
    fontFamily: Fonts.sans.regular,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  decisionValue: {
    fontSize: 16,
    color: '#432104',
    fontFamily: Fonts.sans.medium,
  },
  changedValue: {
    color: '#C9A84C',
    fontFamily: Fonts.sans.semiBold,
  },
  changedBadge: {
    fontSize: 10,
    color: '#C9A84C',
    fontFamily: Fonts.sans.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  summary: {
    fontSize: 14,
    color: 'rgba(67, 33, 4, 0.7)',
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default CycleReflectionResultsBlock;
