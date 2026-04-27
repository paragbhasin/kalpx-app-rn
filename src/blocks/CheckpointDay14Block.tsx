import React from 'react';
import { View, StyleSheet } from 'react-native';
import CycleReflectionBlock from './CycleReflectionBlock';

const CheckpointDay14Block: React.FC = () => {
  return (
    <View style={styles.container}>
      <CycleReflectionBlock />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CheckpointDay14Block;
