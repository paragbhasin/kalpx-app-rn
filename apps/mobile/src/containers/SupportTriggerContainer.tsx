/**
 * SupportTriggerContainer — Week 4 orchestrator for Moment 20 + 42.
 *
 * Web parity: kalpx-frontend/src/containers/AwarenessTriggerContainer.vue
 * (trigger flow). Spec: route_support_trigger.md §4 (state machine), §7
 * (entry/exit contracts).
 *
 * REG-020 enforced: active path is
 *   entry (TriggerEntryBlock on dashboard) → sound_bridge (SoundBridgeTransient)
 *     → mantra_runner_support (reuses PracticeRunnerContainer mantra state with
 *                              runner_source="support_trigger")
 *     → dashboard (via track_completion + explicit navigate)
 * No recheck screen on the active path.
 *
 * REG-002: trigger flow owns trigger_mantra_text — never touches core
 * mantra_text / companion_mantra_id fields.
 *
 * REG-015: on entry clears any leftover trigger_* state; on completion fires
 * track_completion with source='support_trigger' and explicit navigate home.
 *
 * This container is a thin wrapper — the actual screens under it are rendered
 * by the screenResolver from allContainers.js support_trigger states. Its
 * primary job is header-hiding + background and (for the sound_bridge state)
 * mounting the transient block directly.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';

interface Props {
  schema: any;
}

const SupportTriggerContainer: React.FC<Props> = ({ schema }) => {
  const { currentStateId } = useScreenStore();
  const isSoundBridge = currentStateId === 'sound_bridge';
  const blocks = schema?.blocks || [];

  return (
    <View style={[styles.root, isSoundBridge && styles.darkBg]}>
      {blocks.map((block: any, idx: number) => (
        <BlockRenderer key={idx} block={block} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF8EF',
  },
  darkBg: {
    backgroundColor: '#0a0a0a',
  },
});

export default SupportTriggerContainer;
