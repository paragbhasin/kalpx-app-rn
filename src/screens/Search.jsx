// screens/Search.js
<<<<<<< HEAD
import React from "react";
import { View, Text, StyleSheet } from "react-native";
=======
import { StyleSheet, Text, View } from "react-native";
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08

export default function Search() {
  return (
    <View style={styles.container}>
<<<<<<< HEAD
      <Text style={styles.text}>Search Screen</Text>
=======
      <Text  allowFontScaling={false} style={styles.text}>Search Screen</Text>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
