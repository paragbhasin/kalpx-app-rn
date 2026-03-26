import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';

interface GenericContainerProps {
  schema: {
    blocks: any[];
    tone?: {
      theme?: string;
      mood?: string;
    };
  };
}

const GenericContainer: React.FC<GenericContainerProps> = ({ schema }) => {
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {schema.blocks?.map((block: any, index: number) => (
        <BlockRenderer key={`${block.type}-${index}`} block={block} />
      ))}
      {/* Spacer at bottom */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A', // Default dark background
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
});

export default GenericContainer;
