import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface LotusLogoBlockProps {
  block: any;
}

const LotusLogoBlock: React.FC<LotusLogoBlockProps> = () => {
  return (
    <View style={styles.container}>
      {/* Replace with your actual logo asset path */}
      <Image 
        source={require('../../assets/lotus-3d.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
});

export default LotusLogoBlock;
