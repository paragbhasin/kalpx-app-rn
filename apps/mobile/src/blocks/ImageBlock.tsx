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
    const assetPath = block.url.replace('/assets/', '');
    if (assetPath === 'lotus_glow.png' || assetPath === 'lotus_glow') source = require('../../assets/lotus_glow.png');
    else if (assetPath === 'lotus.png' || assetPath === 'lotus') source = require('../../assets/lotus.png');
    else if (assetPath === 'mitra.png' || assetPath === 'mitra') source = require('../../assets/mitra.png');
    else if (assetPath === 'mitra_lotus.png') source = require('../../assets/mitra_lotus.png');
    else if (assetPath === 'KalpXlogo.png') source = require('../../assets/KalpXlogo.png');
    else if (assetPath === 'logo.png') source = require('../../assets/logo.png');
    else if (assetPath === 'dash_mantra.png') source = require('../../assets/dash_mantra.png');
    else if (assetPath === 'dash_sankalp.png') source = require('../../assets/dash_sankalp.png');
    else if (assetPath === 'dash_action.png') source = require('../../assets/dash_action.png');
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
