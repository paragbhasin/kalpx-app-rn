import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

const ProductView = () => {
  const categories = [
    {
      id: "1",
      name: "Pooja Item",
      icon: require("../../../assets/image 230.png"),
    },
    {
      id: "2",
      name: "Oil & Essential",
      icon: require("../../../assets/image 230.png"),
    },
    {
      id: "3",
      name: "Pooja Kit",
      icon: require("../../../assets/image 230.png"),
    },
  ];

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Image source={item.icon} style={styles.image} />
        <Text style={styles.text}>{item.name}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },

  listContent: {
    paddingHorizontal: 16,
  },

  card: {
    alignItems: "center",
    marginRight: 16,
  },

  image: {
    width: 72,
    height: 72,
    borderRadius: 16,
    resizeMode: "contain",
  },

  text: {
    marginTop: 8,
    fontSize: 14,
    color: "#1a1a1b",
    textAlign: "center",
  },
});
export default ProductView;
