// components/ExploreVideos.js
import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function ExploreVideos() {
  // ✅ Videos live here
  const videos = [
    {
      id: "1",
      title:
        "Sanskrit Showcase · Institutes of Eminence Offering Sanskrit Courses · MadrasSanskritCollege",
      thumbnail: require("../../assets/v1.png"),
    },
    {
      id: "2",
      title:
        "Learn Sanskrit · Ancient Wisdom Modern Applications · Delhi University",
      thumbnail: require("../../assets/v1.png"),
    },
    {
      id: "3",
      title: "Spiritual Journeys · Teachings in Himalayas · Yoga Vidya Peeth",
      thumbnail: require("../../assets/v1.png"),
    },
  ];

  const renderVideo = ({ item }) => (
    <TouchableOpacity style={styles.videoCard}>
      <View style={styles.thumbnailWrapper}>
        <Image source={item.thumbnail} style={styles.videoThumbnail} />
        <View style={styles.playOverlay}>
          <MaterialCommunityIcons name="play-circle-outline" size={40} color="#fff" />
        </View>
      </View>
      <Text style={styles.videoTitle} numberOfLines={3}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.videosContainer}>
      <Text style={styles.sectionHeading}>Explore Videos</Text>
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  videosContainer: {
    marginTop: 20,
    paddingLeft: 2,
  },
  sectionHeading: {
    fontSize: 18,
    fontFamily: "GelicaMedium",
    color: "#444",
    marginBottom: 12,
    paddingHorizontal: 4,
    lineHeight: 20,
    paddingLeft: 12,
  },
  videoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 16,
    width: 250,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFD6A5",
    padding: 12,
  },
  thumbnailWrapper: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  playOverlay: {
    position: "absolute",
    top: "40%",
    left: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  videoTitle: {
    fontSize: 14,
    fontFamily: "GelicaRegular",
    color: "#000",
    padding: 10,
    lineHeight: 18,
  },
});
