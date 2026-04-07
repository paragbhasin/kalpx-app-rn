import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';
import Header from '../components/Header';

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
  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore((state) => state.updateHeaderHidden);

  useEffect(() => {
    updateBackground(require('../../assets/companion.png'));
    updateHeaderHidden(true);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Header isTransparent={true} />
      <View style={styles.overlay}>
        <View style={styles.centeredContent}>
          {schema.blocks?.map((block: any, index: number) => (
            <BlockRenderer key={`${block.type}-${index}`} block={block} textColor="#FFFFFF" />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContent: {
    width: '100%',
    paddingHorizontal: 10, 
    alignItems: 'center',
    justifyContent:'center'
  },
});

export default PortalContainer;
