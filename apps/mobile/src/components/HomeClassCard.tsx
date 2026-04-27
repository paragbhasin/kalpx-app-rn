import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

interface Props {
  imageUrl: string | null;
  title: string;
  tutor?: any;
  price: string | number;
  currency: string;
  onViewDetails: () => void;
  onBookNow: () => void;
}

const HomeClassCard: React.FC<Props> = ({
  imageUrl,
  title,
  tutor,
  price,
  currency,
  onViewDetails,
  onBookNow,
}) => {
  return (
    <View style={styles.card}>
      <Image
        source={imageUrl ? { uri: imageUrl } : null}
        style={styles.image}
        resizeMode="cover"
      />

      <TextComponent type="headerSubBoldText" style={styles.title} numberOfLines={2}>
        {title}
      </TextComponent>

      {tutor?.full_name && (
        <TextComponent type="cardText" style={styles.tutor}>
          {tutor.full_name}
        </TextComponent>
      )}

      <TextComponent type="boldText" style={styles.price}>
        {currency === "INR" ? "₹" : "$"} {price}
      </TextComponent>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={onViewDetails}>
          <TextComponent type="mediumText" style={styles.viewBtn}>
            View
          </TextComponent>
        </TouchableOpacity>

        <TouchableOpacity onPress={onBookNow} style={styles.bookBtn}>
          <TextComponent type="mediumText" style={{ color: Colors.Colors.white }}>
            Book
          </TextComponent>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeClassCard;

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: "#FFF7E8",
    borderRadius: 12,
    padding: 10,
    marginRight: 16,
    borderColor: "#FFD6A5",
    borderWidth: 2,
  },
  image: {
    width: "100%",
    height: 110,
    borderRadius: 10,
  },
  title: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.Colors.BLACK,
  },
  tutor: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.Colors.Light_black,
  },
  price: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.Colors.BLACK,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
  },
  viewBtn: {
    color: Colors.Colors.App_theme,
  },
  bookBtn: {
    backgroundColor: Colors.Colors.App_theme,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
});
