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

export default function SocialExplore({ showHeader = true }) {
  const navigation: any = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchExplore = async (pageNo = 1) => {
    try {
      if (pageNo === 1) {
        setLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      // construct URL with pagination
      const res = await api.get(`/public/explore-posts/?paginate=true&page=${pageNo}&page_size=10`);
      let result = res.data || [];

      // Handle paginated response or wrapped data
      if (!Array.isArray(result)) {
        if (result.results && Array.isArray(result.results)) {
          result = result.results;
        } else if (result.data && Array.isArray(result.data)) {
          result = result.data;
        } else {
          console.warn("Unexpected API response structure:", result);
          result = [];
        }
      }

      if (result.length < 10) {
        setHasMore(false);
      }

      // Preload image sizes to create masonry layout
      const mapped = await Promise.all(
        result.map(
          (item) =>
            new Promise((resolve) => {
              if (item.hook_image) {
                Image.getSize(
                  item.hook_image,
                  (w, h) => resolve({ ...item, aspect: w / h }),
                  () => resolve({ ...item, aspect: 1 }) // fallback
                );
              } else {
                resolve({ ...item, aspect: 1 });
              }
            })
        )
      );

      setItems(prev => pageNo === 1 ? mapped : [...prev, ...mapped]);
    } catch (e) {
      console.log("❌ Fetch Explore Error:", e);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     fetchExplore();
  //   }, [])
  // );

  useEffect(() => {
    fetchExplore(1);
  }, []);

  const handleLoadMore = () => {
    if (!loading && !isFetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchExplore(nextPage);
    }
  };


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
      {showHeader && <Header />}


      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]} // 0 = Explore block, 1 = like/share bar
        onScroll={({ nativeEvent }) => {
          const paddingToBottom = 20;
          const isCloseToBottom =
            nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - paddingToBottom;

          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >


        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 15,
            paddingTop: 10,
            paddingBottom: 10,
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
      {isFetchingMore && (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <LoadingOverlay visible={false} text="" />

          <Text>Loading more...</Text>
        </View>
      )}
    </View>
  );
}
