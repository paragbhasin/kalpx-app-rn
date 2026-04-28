import React from "react";
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

import type { DimensionValue } from "react-native";

type LoadingButtonProps = {
  loading: boolean;
  text: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loaderColor?: string;
  width?: number | `${number}%`;
  [key: string]: any;
};

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  text,
  onPress,
  disabled = false,
  style,
  textStyle,
  loaderColor = "#000",
  width,
  ...props
}) => {
  return (
    <TouchableOpacity
  style={[styles.button, width !== undefined ? { width: width as DimensionValue } : {}, style]}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator color={loaderColor} />
        ) : (
          <Text style={[styles.text, textStyle]} numberOfLines={1} ellipsizeMode="tail">{text}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default LoadingButton;

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    maxWidth: '100%',
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flexShrink: 1,
    textAlign: 'center',
  },
});
