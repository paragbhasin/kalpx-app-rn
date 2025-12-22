import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../components/Header";

const screenWidth = Dimensions.get("window").width;

export default function SocialPostDetailScreen() {
  const route: any = useRoute();
  const { post, allPosts } = route.params;
    const navigation: any = useNavigation();
  

  // Bring clicked one first
  const orderedPosts = [
    post,
    ...allPosts.filter((p) => p.id !== post.id),
  ];

  const [activeIndexMap, setActiveIndexMap] = useState({});
  const [expandedMap, setExpandedMap] = useState({});

  const toggleText = (index: number) => {
    setExpandedMap((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderFullPost = ({ item, index }) => {
    const slides = item.slides || [];
    const activeIndex = activeIndexMap[index] || 0;
    const isExpanded = expandedMap[index];

    return (
      <View style={{ marginBottom: 30, backgroundColor: "#fff" }}>
        {/* SLIDER */}
        <FlatList
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(s) => s.id.toString()}
          onScroll={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const newIndex = Math.round(x / screenWidth);
            setActiveIndexMap((prev) => ({
              ...prev,
              [index]: newIndex,
            }));
          }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item.image_url }}
              style={{
                width: screenWidth,
                height: screenWidth * 1.25,
              }}
              resizeMode="cover"
            />
          )}
        />

        {/* DOTS */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 8 }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: 8,
                height: 8,
                marginHorizontal: 4,
                borderRadius: 4,
                backgroundColor: activeIndex === i ? "#000" : "#bbb",
              }}
            />
          ))}
        </View>

        {/* LIKE-SHARE ROW */}
        <View style={{ flexDirection: "row", padding: 15 }}>
          <Text style={{ marginRight: 15 }}>❤️ 24</Text>
          <Text style={{ marginRight: 15 }}>💬 24</Text>
          <Text style={{ marginRight: 15 }}>🔗 Share</Text>
        </View>

        {/* CONTENT */}
        <View style={{ padding: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 6 }}>
            {item.title}
          </Text>

          {/* BASE TEXT WITH READ MORE */}
          <Text
            style={{ color: "#444", fontSize: 15, marginBottom: 6 }}
            numberOfLines={isExpanded ? undefined : 1}
          >
            {item.base_text}
          </Text>

          {/* READ MORE / LESS BUTTON */}
          {item.base_text?.length > 0 && (
            <TouchableOpacity onPress={() => toggleText(index)}>
              <Text style={{ color: "#007AFF", marginBottom: 10 }}>
                {isExpanded ? "Read less" : "...more"}
              </Text>
            </TouchableOpacity>
          )}

          {/* DATE */}
          <Text style={{ color: "#777", marginBottom: 20 }}>
            {new Date(item.created_at).toDateString()}
          </Text>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: "#eee",
              marginVertical: 10,
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
  <View style={{ flexDirection: "row", alignItems: "center", padding:6 }}>
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
            Posts
            </Text>
          </View>
      <FlatList
        data={orderedPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFullPost}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
