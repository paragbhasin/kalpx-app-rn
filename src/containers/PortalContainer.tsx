import React from 'react';
import { View, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';

const { width, height } = Dimensions.get('window');

interface PortalContainerProps {
  schema: {
    blocks: any[];
    tone?: {
      theme?: string;
      mood?: string;
    };
  };
}

const PortalContainer: React.FC<PortalContainerProps> = ({ schema }) => {
  return (
    <ImageBackground 
      source={require('../../assets/companion.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.centeredContent}>
          {schema.blocks?.map((block: any, index: number) => (
            <BlockRenderer key={`${block.type}-${index}`} block={block} />
          ))}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContent: {
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
});

export default PortalContainer;
