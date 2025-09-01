// components/ExploreVideos.js
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { useTranslation } from "react-i18next";

export default function ExploreVideos() {
  const { t } = useTranslation();

  const videos = [
    { id: "1", title: t("exploreVideos.video1"), youtubeId: "QFujtgh0tGo" },
    { id: "2", title: t("exploreVideos.video2"), youtubeId: "QFujtgh0tGo" },
    { id: "3", title: t("exploreVideos.video3"), youtubeId: "QFujtgh0tGo" }
  ];

  const renderVideo = ({ item }) => (
    <View style={styles.videoCard}>
      <View style={styles.thumbnailWrapper}>
        <YoutubePlayer height={140} play={false} videoId={item.youtubeId} />
      </View>
      <Text style={styles.videoTitle} numberOfLines={3}>
        {item.title}
      </Text>
    </View>
  );

  return (
    <View style={styles.videosContainer}>
      <Text style={styles.sectionHeading}>{t("exploreVideos.heading")}</Text>
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
    paddingLeft: 2
  },
  sectionHeading: {
    fontSize: 18,
    fontFamily: "GelicaMedium",
    color: "#444",
    marginBottom: 12,
    paddingHorizontal: 4,
    lineHeight: 20,
    paddingLeft: 12
  },
  videoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 16,
    width: 250,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFD6A5",
    padding: 12
  },
  thumbnailWrapper: {
    width: "100%",
    height: 140,
    overflow: "hidden"
  },
  videoTitle: {
    fontSize: 14,
    fontFamily: "GelicaRegular",
    color: "#000",
    padding: 10,
    lineHeight: 18
  }
});
