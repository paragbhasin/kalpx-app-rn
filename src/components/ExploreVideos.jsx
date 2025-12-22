// components/ExploreVideos.js
<<<<<<< HEAD
import React, { useCallback, useRef, useState } from "react";
import { View, Text, FlatList, StyleSheet, Platform } from "react-native";
=======
import { useCallback, useRef, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
import YoutubePlayer from "react-native-youtube-iframe";
import { saveUserAction } from "../utils/storage";

// ✅ Card Component (can use hooks safely here)
function VideoCard({ item }) {
  const playerRef = useRef(null);
  const [duration, setDuration] = useState(0);

  const trackEvent = async (eventType, data, options = {}) => {
    const action = {
      event_type: eventType,
      timestamp: Date.now(),
      event_data: data,
      immediate: options.immediate || false,
    };
    await saveUserAction(action);
  };

  const onReady = async () => {
    try {
      const videoDuration = await playerRef.current?.getDuration();
      setDuration(videoDuration || 0);
    } catch (e) {
      console.warn("Error fetching duration", e);
    }
  };

  const onChangeState = useCallback(
    async (state) => {
      if (state === "playing") {
        trackEvent("video_start", {
          video_id: item.youtubeId,
          title: item.title,
          source: "explore_video",
          device: Platform.OS === "ios" ? "mobile-ios" : "mobile-android",
        });
      }
      if (state === "paused") {
        try {
          const currentTime = await playerRef.current?.getCurrentTime();
          const percent = duration
            ? ((currentTime / duration) * 100).toFixed(2)
            : 0;
          trackEvent("video_progress", {
            video_id: item.youtubeId,
            title: item.title,
            source: "explore_video",
            device: Platform.OS === "ios" ? "mobile-ios" : "mobile-android",
            position_sec: Math.floor(currentTime || 0),
            percent,
          });
        } catch (e) {
          console.warn("Error tracking progress", e);
        }
      }
      if (state === "ended") {
        trackEvent(
          "video_complete",
          {
            video_id: item.youtubeId,
            duration_sec: duration,
            source: "explore_video",
            device: Platform.OS === "ios" ? "mobile-ios" : "mobile-android",
            title: item.title,
          },
          { immediate: true }
        );
      }
    },
    [duration]
  );

  return (
    <View style={styles.videoCard}>
      <View style={styles.thumbnailWrapper}>
        <YoutubePlayer
          ref={playerRef}
          height={140}
          play={false}
          videoId={item.youtubeId}
          onReady={onReady}
          onChangeState={onChangeState}
        />
      </View>
<<<<<<< HEAD
      <Text style={styles.videoTitle} numberOfLines={3}>
=======
      <Text  allowFontScaling={false} style={styles.videoTitle} numberOfLines={3}>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
        {item.title}
      </Text>
    </View>
  );
}

// ✅ Main Component
export default function ExploreVideos() {
  const videos = [
    {
      id: "1",
      title:
        "Sanskrit Showcase · Institutes of Eminence Offering Sanskrit Courses · MadrasSanskritCollege",
      youtubeId: "QFujtgh0tGo",
    },
    {
      id: "2",
      title:
        "Learn Sanskrit · Ancient Wisdom Modern Applications · Delhi University",
      youtubeId: "QFujtgh0tGo",
    },
    {
      id: "3",
      title: "Spiritual Journeys · Teachings in Himalayas · Yoga Vidya Peeth",
      youtubeId: "QFujtgh0tGo",
    },
  ];

  return (
    <View style={styles.videosContainer}>
<<<<<<< HEAD
      <Text style={styles.sectionHeading}>Explore Videos</Text>
=======
      <Text  allowFontScaling={false} style={styles.sectionHeading}>Explore Videos</Text>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
      <FlatList
        data={videos}
        renderItem={({ item }) => <VideoCard item={item} />}
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
<<<<<<< HEAD
    lineHeight: 20,
=======
    // lineHeight: 20,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    paddingLeft: 2,
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
    overflow: "hidden",
  },
  videoTitle: {
    fontSize: 14,
    fontFamily: "GelicaRegular",
    color: "#000",
    padding: 12,
<<<<<<< HEAD
    lineHeight: 18,
=======
    // lineHeight: 18,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  },
});
