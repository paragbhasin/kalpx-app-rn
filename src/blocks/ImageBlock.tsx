import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ImageBlockProps {
  block: {
    url: string;
    style?: any;
    position?: string;
  };
}

const ImageBlock: React.FC<ImageBlockProps> = ({ block }) => {
  if (!block.url) return null;

  // Resolve asset
  let source;
  if (block.url.startsWith('/assets/')) {
    // Basic mapping for known assets
    if (block.url.includes('lotus_glow')) source = require('../../assets/lotus_glow.png');
    else if (block.url.includes('level_lotus')) source = require('../../assets/lotus_glow.png'); // Default to glow
    else source = { uri: block.url };
  } else {
    source = { uri: block.url };
  }

  // Parse width/height from style if they are strings like "212px"
  const parsePx = (val: any) => {
    if (typeof val === 'string' && val.endsWith('px')) {
      return parseInt(val.replace('px', ''), 10);
    }
    return val;
  };

  const customStyle: any = block.style ? {
    width: parsePx(block.style.width),
    height: parsePx(block.style.height),
    marginTop: parsePx(block.style.margin?.split(' ')[0]),
    marginBottom: parsePx(block.style.margin?.split(' ')[2] || block.style.margin?.split(' ')[0]),
    alignSelf: block.style.display === 'block' ? 'center' : 'auto',
  } : {};

  return (
    <View style={[styles.container, block.position === 'header' && styles.headerContainer]}>
      <Image 
        source={source} 
        style={[styles.image, customStyle]} 
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  headerContainer: {
    marginTop: 0,
    marginBottom: 5,
  },
  image: {
    maxWidth: '100%',
  },
});

export default ImageBlock;
