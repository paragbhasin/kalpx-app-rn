import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../components/Header";
import LoadingOverlay from "../../components/LoadingOverlay";
import api from "../../Networks/axios";
import styles from "./SocialExplorestyles";

const screenWidth = Dimensions.get("window").width;
const COLUMN_WIDTH = screenWidth / 2 - 20;

export default function SocialExplore() {
  const navigation: any = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchExplore = async () => {
    try {
      setLoading(true);

      const res = await api.get("/public/explore-posts/");
      const result = res.data || [];

      // Preload image sizes to create masonry layout
      const mapped = await Promise.all(
        result.map(
          (item) =>
            new Promise((resolve) => {
              Image.getSize(
                item.hook_image,
                (w, h) => resolve({ ...item, aspect: w / h }),
                () => resolve({ ...item, aspect: 1 }) // fallback
              );
            })
        )
      );

      setItems(mapped);
    } catch (e) {
      console.log("❌ Fetch Explore Error:", e);
    } finally {
      setLoading(false);
    }
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     fetchExplore();
  //   }, [])
  // );

  useEffect(() => {
  fetchExplore();
}, []);


  // Split into two columns (masonry)
  const leftColumn: any[] = [];
  const rightColumn: any[] = [];
  let leftHeight = 0;
  let rightHeight = 0;

  items.forEach((item: any) => {
    const height = COLUMN_WIDTH / (item.aspect || 1);

    if (leftHeight <= rightHeight) {
      leftColumn.push({ ...item, height });
      leftHeight += height;
    } else {
      rightColumn.push({ ...item, height });
      rightHeight += height;
    }
  });

  const renderItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={{
        marginBottom: 12,
        borderRadius: 12,
        overflow: "hidden",
      }}
      onPress={() =>
        navigation.navigate("SocialPostDetailScreen", {
          post: item, // clicked post
          allPosts: items,
        })
      }
    >
      <Image
        source={{ uri: item.hook_image }}
        style={{
          width: COLUMN_WIDTH,
          height: item.height,
          borderRadius: 12,
        }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />

      {/* 👇 Everything inside this ScrollView scrolls,
          but child index 1 (like/share row) stays sticky */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]} // 0 = Explore block, 1 = like/share bar
      >
        {/* 0️⃣ EXPLORE TITLE + SUBTITLE (scrolls away) */}
        <View style={{ padding: 16, paddingBottom: 8, backgroundColor: "#fff" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                marginLeft: 6,
              }}
            >
              Explore Posts
            </Text>
          </View>

          <Text
            style={{
              color: "#555",
              marginTop: 6,
              fontSize: 15,
            }}
          >
            Dive into Sanatan-rooted insights, stories, and timeless wisdom.
          </Text>
        </View>

        {/* 1️⃣ LIKE / SHARE / COMMENT / ASK – STICKY BELOW HEADER */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: "#fff",
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Text>👉 Like</Text>
            <Text style={{ marginHorizontal: 6 }}>•</Text>
            <Text>👉 Share</Text>
            <Text style={{ marginHorizontal: 6 }}>•</Text>
            <Text>👉 Comment</Text>
            <Text style={{ marginHorizontal: 6 }}>•</Text>
            <Text>👉 Ask Question</Text>
          </View>
        </View>

        {/* 2️⃣ GRID CONTENT (scrolls under sticky row) */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 10,
            paddingTop: 10,
            paddingBottom: 20,
          }}
        >
          <View style={{ width: COLUMN_WIDTH }}>
            {leftColumn.map(renderItem)}
          </View>

          <View style={{ width: COLUMN_WIDTH }}>
            {rightColumn.map(renderItem)}
          </View>
        </View>
      </ScrollView>

      {loading && <LoadingOverlay visible={true} text="Loading Explore..." />}
    </View>
  );
}
