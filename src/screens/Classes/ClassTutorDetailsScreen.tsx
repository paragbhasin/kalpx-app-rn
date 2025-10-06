import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ClassEventCard from "../../components/ClassEventCard";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import TextComponent from "../../components/TextComponent";
import styles from "./styles";

// Interfaces
interface ExploreClass {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  imageUrl: any;
  tutor?: string;
}

// Reusable ReadMore Component
const ReadMoreText = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);

  return (
    <Text
      style={{ color: Colors.Colors.Light_black, marginTop: 6 }}
      numberOfLines={expanded ? undefined : 2}
      onTextLayout={(e) => {
        // Check if more than 2 lines exist
        if (e.nativeEvent.lines.length > 2 && !showReadMore) {
          setShowReadMore(true);
        }
      }}
    >
      {text}
      {showReadMore ? (
        <Text
          style={{ color: Colors.Colors.App_theme, fontWeight: "600" }}
          onPress={() => setExpanded(!expanded)}
        >
          {expanded ? "  Read Less" : "  Read More"}
        </Text>
      ) : null}
    </Text>
  );
};

export default function ClassTutorDetailsScreen({ navigation }) {
  const { t } = useTranslation();

  const [exploreData, setExploreData] = useState<ExploreClass[]>([]);
  const [explorePage, setExplorePage] = useState(1);
  const [loadingExplore, setLoadingExplore] = useState(false);
  const [hasMoreExplore, setHasMoreExplore] = useState(true);

  const fetchExploreClasses = async (pageNum: number) => {
    if (loadingExplore || !hasMoreExplore) return;
    setLoadingExplore(true);

    setTimeout(() => {
      const newData: ExploreClass[] = Array.from({ length: 10 }, (_, i) => {
        const id = (pageNum - 1) * 10 + i + "";
        return {
          id,
          title: `Class ${id}`,
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur blandit tempus porttitor. Integer posuere erat a ante venenatis dapibus. Vestibulum id ligula porta felis euismod semper.",
          duration: "60 Minutes",
          price: "$5500",
          imageUrl: require("../../../assets/C_Sample.png"),
          tutor: "John Doe",
        };
      });

      setExploreData((prev) => [...prev, ...newData]);
      setHasMoreExplore(newData.length > 0);
      setLoadingExplore(false);
    }, 1000);
  };

  useEffect(() => {
    fetchExploreClasses(explorePage);
  }, [explorePage]);

  const loadMoreExplore = () => {
    if (!loadingExplore && hasMoreExplore) setExplorePage((prev) => prev + 1);
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={{
          marginTop: 60,
          marginHorizontal: 16,
        }}
        onPress={() => navigation.goBack()}
      >
        <View
          style={{
            backgroundColor: "#D9D9D9",
            alignSelf: "flex-start",
            padding: 10,
            borderRadius: 25,
          }}
        >
          <Image
            source={require("../../../assets/C_Arrow_back.png")}
            style={{ width: 20, height: 20 }}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>

      {/* Class Info Card */}
      <View
        style={{
          borderColor: Colors.Colors.Light_grey,
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginHorizontal: 16,
          marginTop: 15,
        }}
      >
        <Image
          source={require("../../../assets/Class_Video.png")}
          style={{ alignSelf: "center" }}
          resizeMode="contain"
        />
        <View style={styles.row}>
          <TextComponent type="headerText" style={styles.label}>
            Flute Series :
          </TextComponent>
          <TextComponent type="headerText" style={styles.label}>
            Absolute Beginner
          </TextComponent>
        </View>
        <View style={styles.row}>
          <TextComponent
            type="mediumText"
            style={{ ...styles.label, color: Colors.Colors.Light_grey }}
          >
            Duration :
          </TextComponent>
          <TextComponent type="mediumText" style={styles.label}>
            60 Minutes
          </TextComponent>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextComponent
              type="boldText"
              style={{ fontSize: FontSize.CONSTS.FS_20 }}
            >
              $ 3500{" "}
            </TextComponent>
            <TextComponent
              type="mediumText"
              style={{ fontSize: FontSize.CONSTS.FS_14 }}
            >
              / Per Person
            </TextComponent>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("ClassBookingScreen")}
            style={{
              backgroundColor: Colors.Colors.App_theme,
              padding: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <TextComponent
              type="semiBoldText"
              style={{ color: Colors.Colors.white }}
            >
              Book Now
            </TextComponent>
          </TouchableOpacity>
        </View>

        {/* Read More / Less */}
        <ReadMoreText text="Orttitor in ac libe. Mauris ut vulputate ante. Ut gravida turpis quis vestibulum cursus. Praesent commodo cursus magna, vel scelerisque nisl consectetur." />
      </View>

      {/* Tutor Section */}
      <TextComponent
        type="headerText"
        style={{
          fontSize: FontSize.CONSTS.FS_14,
          marginVertical: 12,
          marginHorizontal: 16,
        }}
      >
        About Tutor
      </TextComponent>
      <View
        style={{
          borderColor: Colors.Colors.Light_grey,
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginHorizontal: 16,
        }}
      >
        <Image
          source={require("../../../assets/Class_Video.png")}
          style={{ alignSelf: "center" }}
          resizeMode="contain"
        />
        <TextComponent
          type="headerText"
          style={{ ...styles.label, marginTop: 4 }}
        >
          Esther Howard
        </TextComponent>
        <View style={styles.row}>
          <TextComponent
            type="mediumText"
            style={{ ...styles.label, color: Colors.Colors.Light_grey }}
          >
            Experience :
          </TextComponent>
          <TextComponent type="mediumText" style={styles.label}>
            6 Years
          </TextComponent>
        </View>
        <View style={styles.row}>
          <TextComponent
            type="mediumText"
            style={{ ...styles.label, color: Colors.Colors.Light_grey }}
          >
            Languages :
          </TextComponent>
          <TextComponent type="mediumText" style={styles.label}>
            English, Hindi, Telugu, Bengali, Marathi.
          </TextComponent>
        </View>

        {/* Read More / Less */}
        <ReadMoreText text="Orttitor in ac libe. Mauris ut vulputate ante. Ut gravida turpis quis vestibulum cursus. Nulla vitae elit libero, a pharetra augue." />
      </View>

      {/* Explore Classes List */}
      <FlatList
        data={exploreData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ClassEventCard
            imageUrl={item.imageUrl}
            title={item.title}
            description={item.description}
            duration={item.duration}
            price={item.price}
            onViewDetails={() =>
              navigation.navigate("ClassTutorDetailsScreen")
            }
            onBookNow={() => console.log("Book Now", item.id)}
            tutor={item.tutor}
          />
        )}
        onEndReached={loadMoreExplore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingExplore ? <ActivityIndicator /> : null}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No classes available.
          </Text>
        }
        scrollEnabled={false} // disable FlatList scroll because ScrollView is parent
        contentContainerStyle={{ padding: 16 }}
      />
    </ScrollView>
  );
}