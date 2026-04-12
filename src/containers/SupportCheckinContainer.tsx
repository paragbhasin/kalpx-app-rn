/**
 * SupportCheckinContainer — Week 4 orchestrator for Moment 21 + 22.
 *
 * Web parity: kalpx-frontend/src/containers/AwarenessTriggerContainer.vue
 * (checkin_breath_reset). Spec: route_support_checkin_regulation.md §4 and
 * overlay_checkin_balanced_ack.md.
 *
 * 3-step regulation state machine, driven by screenData.checkin_step:
 *   notice → name → settle → balanced_ack → dashboard
 *
 * The step states render CheckInRegulationBlock (which reads checkin_step
 * itself), and the terminal balanced_ack state renders BalancedAckOverlay.
 *
 * REG-015: on every exit clears checkin_step + checkin_draft without
 * touching runner_* fields. This is handled by submit_checkin in the
 * actionExecutor; the container only renders the schema.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';

interface Props {
  schema: any;
}

const SupportCheckinContainer: React.FC<Props> = ({ schema }) => {
  const blocks = schema?.blocks || [];
  return (
    <View style={styles.root}>
      {blocks.map((block: any, idx: number) => (
        <BlockRenderer key={idx} block={block} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});

export default SupportCheckinContainer;
