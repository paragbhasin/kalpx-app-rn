import * as React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-paper";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

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
  tutor?: string; // Added tutor property
}

const ClassEventCard: React.FC<ClassEventCardProps> = ({
  imageUrl,
  title,
  description,
  duration,
  price,
  onViewDetails,
  onBookNow,
  currency,
  trailenabled,
  trailAmt
}) => {
  const isRemote = typeof imageUrl === "string" && imageUrl.startsWith("http");
  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        {/* Left image */}
        <Image
          source={isRemote ? { uri: imageUrl } : imageUrl}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Right content */}
        <View style={styles.content}>
          <TextComponent type="headerText" style={styles.title}>
            {title}
          </TextComponent>
          <TextComponent
            type="subText"
            style={styles.description}
            numberOfLines={2}
          >
            {description}
          </TextComponent>
          {trailenabled &&
          <>
              <TextComponent type="mediumText" style={{color:Colors.Colors.blue_text}}>
            Trail :{" "}
            <TextComponent type="mediumText" style={{color:Colors.Colors.blue_text}}>
              {currency === "INR" ? "₹" :"$"} {trailAmt}
            </TextComponent>
          </TextComponent>
           </>
          }
          <TextComponent type="mediumText" >
            Duration :{" "}
            <TextComponent type="mediumText" style={styles.bold}>
              {duration}
            </TextComponent>
          </TextComponent>

          <TextComponent type="boldText" style={styles.price}>
            {currency === "INR" ? "₹" :"$"} {price}{" "}
            <TextComponent type="mediumText" style={styles.perPerson}>
              / Per Person
            </TextComponent>
          </TextComponent>

          {/* Buttons row */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onViewDetails}>
              <TextComponent type="semiBoldText">View Details</TextComponent>
            </TouchableOpacity>
              <TouchableOpacity onPress={onBookNow} style={{backgroundColor:Colors.Colors.App_theme,padding:8,borderRadius:6,marginLeft:10}}>
              <TextComponent type="semiBoldText" style={{color:Colors.Colors.white}}>Book Now</TextComponent>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );
};

export default ClassEventCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
    backgroundColor: Colors.Colors.white,
  },
  container: {
    flexDirection: "row",
  },
  image: {
    width: 120,
    height: "100%",
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 14,
    marginBottom: 2,
  },
  description: {
    marginBottom: 6,
  },
  bold: {
    color: Colors.Colors.BLACK,
  },
  price: {
    marginVertical: 4,
  },
  perPerson: {
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: "row",
   alignSelf:"flex-end",
    marginTop: 6,
    alignItems:"center"
  },
});
