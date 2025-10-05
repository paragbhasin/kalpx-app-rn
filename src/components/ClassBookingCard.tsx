import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Card } from "react-native-paper";
import {
    Menu,
    MenuOption,
    MenuOptions,
    MenuTrigger,
} from "react-native-popup-menu";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

// Define interface for props
interface ClassEventCardProps {
  imageUrl: any;
  title: string;
  time: string;
  link: string;
  price: string;
  onReschedule?: () => void;
  onCancel?: () => void;
  onDetails?: () => void;
}

const ClassBookingCard: React.FC<ClassEventCardProps> = ({
  imageUrl,
  title,
  time,
  link,
  price,
  onReschedule,
  onCancel,
  onDetails,
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
          <TextComponent type="semiBoldText" style={styles.description}>
            {time}
          </TextComponent>
          <TextComponent type="semiBoldText" style={styles.description}>
            {link
              ? link
              : "The URL will be available 15 minutes before the class begins."}
          </TextComponent>
          <TextComponent type="boldText" style={{ marginVertical: 4 }}>
            <TextComponent
              type="semiBoldText"
              style={{ color: Colors.Colors.Light_black }}
            >
              Price :{" "}
            </TextComponent>
            {price}{" "}
            <TextComponent type="mediumText" style={styles.perPerson}>
              / Per Person
            </TextComponent>
          </TextComponent>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextComponent
                type="semiBoldText"
                style={{ color: Colors.Colors.Light_black }}
              >
                Status :
              </TextComponent>
              <View
                style={{
                  backgroundColor: Colors.Colors.blue_bg,
                  padding: 4,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 8,
                  paddingHorizontal: 10,
                }}
              >
                <TextComponent
                  type="boldText"
                  style={{ color: Colors.Colors.blue }}
                >
                  Requested
                </TextComponent>
              </View>
            </View>
            <Menu>
              <MenuTrigger>
                <Image
                  source={require("../../assets/C_menu_popup.png")}
                  style={{ width: 30, height: 30, marginRight: -10 }}
                  resizeMode="cover"
                />
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    borderRadius: 8,
                    padding: 4,
                    backgroundColor: Colors.Colors.white,
                    width: 120,
                    alignItems: "center",
                    marginTop: 15,
                  },
                }}
              >
                <MenuOption onSelect={onReschedule} style={{ marginTop: 10 }}>
                  <TextComponent
                    type="semiBoldText"
                    style={{ color: Colors.Colors.Light_black }}
                  >
                    Reschedule
                  </TextComponent>
                </MenuOption>
                <MenuOption onSelect={onDetails} style={{ marginTop: 10 }}>
                  <TextComponent
                    type="semiBoldText"
                    style={{ color: Colors.Colors.Light_black }}
                  >
                    Details
                  </TextComponent>
                </MenuOption>
                <MenuOption
                  onSelect={onCancel}
                  style={{ marginTop: 10, marginBottom: 10 }}
                >
                  <TextComponent type="semiBoldText" style={{ color: "red" }}>
                    Cancel
                  </TextComponent>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
          {/* Buttons row */}
          {/* <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onViewDetails}>
              <TextComponent type="semiBoldText">View Details</TextComponent>
            </TouchableOpacity>
              <TouchableOpacity onPress={onViewDetails} style={{backgroundColor:Colors.Colors.App_theme,padding:8,borderRadius:6,marginLeft:10}}>
              <TextComponent type="semiBoldText" style={{color:Colors.Colors.white}}>View Details</TextComponent>
            </TouchableOpacity>
          </View> */}
        </View>
      </View>
    </Card>
  );
};

export default ClassBookingCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
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
    fontSize: 12,
    marginBottom: 2,
  },
  description: {
    marginVertical: 6,
    fontSize: 10,
    color: Colors.Colors.Light_black,
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
    alignSelf: "flex-end",
    marginTop: 6,
    alignItems: "center",
  },
});
