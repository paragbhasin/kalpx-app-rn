import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ClassEventCard from "../../components/ClassEventCard";
import Colors from "../../components/Colors";
import TextComponent from "../../components/TextComponent";
import styles from "./styles";

// Interfaces for each type of card
interface ExploreClass {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  imageUrl: any;
  tutor?: string; // additional prop for explore classes
}

interface BookingClass {
  id: string;
  title: string;
  time: string;
  link: string;
  price: string;
  imageUrl: any;
}

export default function ClassesScreen({ navigation }) {
  const { t } = useTranslation();

  // State for both tabs
  const [exploreData, setExploreData] = useState<ExploreClass[]>([]);
  const [explorePage, setExplorePage] = useState(1);
  const [loadingExplore, setLoadingExplore] = useState(false);
  const [hasMoreExplore, setHasMoreExplore] = useState(true);

  // Fetch Explore Classes with pagination
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
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          duration: "60 Minutes",
          price: "$5500",
          imageUrl: require("../../../assets/C_Sample.png"),
          tutor: "John Doe", // example extra prop
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
    <View style={styles.container}>
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
      <View style={{borderColor:Colors.Colors.Light_grey,borderWidth:1,borderRadius:10,padding:12 ,marginHorizontal:16}}>
   <Image
            source={require("../../../assets/Class_Video.png")}
           style={{alignSelf:"center"}}
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
          <TextComponent type="mediumText" style={{...styles.label,color:Colors.Colors.Light_grey}} >
            Duration :
          </TextComponent>
          <TextComponent type="mediumText"style={styles.label} >
             60 Minutes 
          </TextComponent>
        </View>
      </View>
      <FlatList
        data={exploreData as Array<ExploreClass>}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ClassEventCard
            imageUrl={item.imageUrl}
            title={item.title}
            description={(item as ExploreClass).description}
            duration={(item as ExploreClass).duration}
            price={item.price}
            onViewDetails={() => navigation.navigate("ClassTutorDetailsScreen")}
            onBookNow={() => console.log("Book Now", item.id)}
            tutor={(item as ExploreClass).tutor}
          />
        )}
        onEndReached={loadMoreExplore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={<ActivityIndicator />}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            "No classes available.
          </Text>
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
