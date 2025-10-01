import { Animated, StyleSheet, Text } from 'react-native';

const SnackBar = ({ visible, message }) => {
  if (!visible) return null;
  return (
    <Animated.View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#323232',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SnackBar;
