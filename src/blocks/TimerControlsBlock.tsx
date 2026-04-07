import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';
import { executeAction } from '../engine/actionExecutor';
import { useScreenStore } from '../engine/useScreenBridge';

interface TimerControlsBlockProps {
  block: {
    is_playing?: boolean;
    on_play?: any;
    on_pause?: any;
    on_reset?: any;
    show_reset?: boolean;
    style?: any;
  };
}

const TimerControlsBlock: React.FC<TimerControlsBlockProps> = ({ block }) => {
  const { loadScreen, goBack, screenData: screenState } = useScreenStore();

  const fireAction = async (action: any) => {
    if (!action) return;
    try {
      await executeAction(action, {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => {
          const { screenActions } = require('../store/screenSlice');
          const { store } = require('../store');
          store.dispatch(screenActions.setScreenValue({ key, value }));
        },
        screenState,
      });
    } catch (err) {
      console.error('[TimerControlsBlock] Action failed:', err);
    }
  };

  const isPlaying = block.is_playing ?? false;

  return (
    <View style={[styles.container, block?.style]}>
      {/* Play / Pause */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => fireAction(isPlaying ? block.on_pause : block.on_play)}
        activeOpacity={0.7}
      >
        <Text style={styles.primaryIcon}>{isPlaying ? '\u23F8' : '\u25B6'}</Text>
      </TouchableOpacity>

      {/* Reset */}
      {block.show_reset !== false && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => fireAction(block.on_reset)}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryIcon}>{'\u21BB'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginVertical: 16,
  },
  primaryButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryIcon: {
    fontSize: 20,
    color: '#C9A84C',
  },
});

export default TimerControlsBlock;
