import * as React from "react";
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-paper";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

// Screen width
const SCREEN_WIDTH = Dimensions.get("window").width;

// Define interface for props
interface ClassEventCardProps {
  imageUrl: any;
  title: string;
  description: string;
  duration: string;
  price: string;
  currency: string;
  trailenabled: string;
  trailAmt: string;
  onViewDetails?: () => void;
  onBookNow?: () => void;
  tutor?: string;
  fromHome?: boolean;
}

const ClassHomeCard: React.FC<ClassEventCardProps> = ({
  imageUrl,
  title,
  description,
  duration,
  price,
  onViewDetails,
  onBookNow,
  currency,
  trailenabled,
  trailAmt,
  fromHome = false,
}) => {
// Check if URL
const isRemote =
  typeof imageUrl === "string" &&
  (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"));

// Final image source
const finalSource = isRemote
  ? { uri: imageUrl }
  : require("../../assets/class_default.png");

  // const isRemote = typeof imageUrl === "string" && imageUrl.startsWith("http");

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        {/* Left image */}
        <Image
          source={finalSource}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Right content */}
        <View style={styles.content}>
          <View style={styles.textBlock}>
            <TextComponent
              type="boldText"
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </TextComponent>

            <TextComponent
              type="mediumText"
              style={styles.description}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {description}
            </TextComponent>

            <TextComponent
              type="smalltext"
              style={styles.description}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {currency === "INR" ? "₹" :"$"} {price}{" "}/- per person
            </TextComponent>

            {  trailenabled && (
              <TextComponent
                type="smalltext"
                style={[styles.description,{
          color: '#1877F2',

                }]}
                numberOfLines={1}
                ellipsizeMode="tail"
                >
                (Trial - {currency === "INR" ? "₹" :"$"}{trailAmt})
              </TextComponent>
            )}
          </View>
          <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={onViewDetails}
            style={styles.detailsButton}
          >
            <TextComponent type="semiBoldBlackText" >View Details</TextComponent>
          </TouchableOpacity>
             <TouchableOpacity
            onPress={onBookNow}
            style={styles.booknowButton}
          >
            <TextComponent type="semiBoldBlackText">Book now</TextComponent>
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </Card>
  );
};

export default ClassHomeCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
    backgroundColor: Colors.Colors.white,
    marginRight: 16,
    marginLeft: 2,
    minHeight: 160,
  },
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    padding: 8,
  },
  image: {
    width: 120,
    height: 140,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  content: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
      width: SCREEN_WIDTH * 0.65,
    justifyContent: "flex-start",
  },
  title: {
    marginBottom: 4,
    color: Colors.Colors.BLACK,
  },
  description: {
    marginBottom: 4,
  },
  textBlock: {
    flexGrow: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
  },
  detailsButton: {
    borderColor: "#E6E6E6",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  booknowButton: {
    backgroundColor: "#F3E1BF",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
  }
});
