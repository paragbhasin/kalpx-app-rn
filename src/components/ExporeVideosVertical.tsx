import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "react-native-paper";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { getDailyDharmaTracker } from "../screens/Home/actions";
import { RootState } from "../store";
import Colors from "./Colors";
import TextComponent from "./TextComponent";
import YoutubeModal from "./youtubeModal";

// ✅ Extract YouTube video ID safely
const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const regex =
    /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const kalpxQuotes = [
  "KalpX – Sanatan is not a religion, it’s a way of life.",
  "KalpX – Let your roots guide your journey.",
  "KalpX – Stories that awaken the soul.",
  "KalpX – Dive into tradition, emerge with meaning.",
  "KalpX – Where culture meets curiosity.",
  "KalpX – Rekindling spiritual memories.",
  "KalpX – Echoes of dharma in every story.",
  "KalpX – Discover. Reflect. Reconnect.",
  "KalpX – Preserving ancient wisdom for today.",
  "KalpX – Rooted in Sanatan, reaching the world.",
];



// ✅ Video Card
const VideoCard = ({ item }: any) => {
  const [showVideo, setShowVideo] = useState(false);
  const youtubeId = useMemo(() => extractYoutubeId(item.youtube_url), [item.youtube_url]);
  const thumbnailUrl =
    item.thumbnail || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null);

  return (
    <Card style={styles.videoCard}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowVideo(true)}
        style={styles.thumbnailWrapper}
      >
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
        <Image
          source={require("../../assets/videopaly.png")}
          style={styles.playButton}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <TextComponent
        type="streakSadanaText"
        style={styles.videoTitle}
        numberOfLines={5}
      >
        {item.title}
      </TextComponent>

      <YoutubeModal
        visible={showVideo}
        onClose={() => setShowVideo(false)}
        youtubeUrl={item.youtube_url}
      />
    </Card>
  );
};

// ✅ Daily Dharma Card
const DailyDharmaCard = ({ image, quote, onPress }: any) => {
  const { t } = useTranslation();

  return (
    <Card style={styles.dailyCard}>
      <Image source={{ uri: image }} style={styles.dailyImage} resizeMode="cover" />
      <View style={styles.dailyContent}>
        <TextComponent type="headerSubBoldText" style={styles.dailyTitle}>
          {t("DailyDharmaCard.dailyPracticeTitle")}
        </TextComponent>
        <TextComponent type="streakSubText" style={styles.dailyQuote} numberOfLines={3}>
          {quote}
        </TextComponent>
        <TouchableOpacity style={styles.dailyButton} onPress={onPress}>
          <TextComponent type="headerSubBoldText" style={styles.dailyButtonText}>
            {t("DailyDharmaCard.startButton", "Start Daily Practice")}
          </TextComponent>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

// ✅ ExploreVideosVertical (main)
const ExploreVideosVertical = ({
  videos = [],
  loading,
  totalPages = 1,
  currentPage = 1,
  onPrev,
  onNext,
}: any) => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const [trackerData, setTrackerData] = useState<any>(null);

  useEffect(() => {
    dispatch(
      getDailyDharmaTracker((res) => {
        if (res.success) {
          setTrackerData(res.data);
        }
      })
    );
  }, [dispatch]);

  const navigationTarget = useMemo(() => {
    return trackerData?.active_practices?.length > 0 ? "MySadana" : "Dharma";
  }, [trackerData]);

  // 🌞 Social proof
  const socialProofImages = [
    "https://dev.kalpx.com/images/social-proof/slide1.jpeg",
    "https://dev.kalpx.com/images/social-proof/slide2.jpeg",
    "https://dev.kalpx.com/images/social-proof/slide3.jpeg",
    "https://dev.kalpx.com/images/social-proof/slide4.jpeg",
    "https://dev.kalpx.com/images/social-proof/slide5.jpeg",
    "https://dev.kalpx.com/images/social-proof/slide6.jpeg",
  ];
  const socialProofQuotes = [
    t("DailyDharmaCard.socialProofQuote1"),
    t("DailyDharmaCard.socialProofQuote2"),
    t("DailyDharmaCard.socialProofQuote3"),
    t("DailyDharmaCard.socialProofQuote4"),
    t("DailyDharmaCard.socialProofQuote5"),
    t("DailyDharmaCard.socialProofQuote6"),
  ];
  const dayIndex = new Date().getDate() % socialProofImages.length;
  const dailyCardData = {
    image: socialProofImages[dayIndex],
    quote: socialProofQuotes[dayIndex],
  };

  // 🧩 Insert daily card after every 12 videos
  const combinedData = useMemo(() => {
    const data: any[] = [];
    videos.forEach((v: any, i: number) => {
      data.push(v);
      if ((i + 1) % 12 === 0) {
        data.push({ type: "dailyCard", ...dailyCardData });
      }
    });
    return data;
  }, [videos, dailyCardData]);

  const renderItem = useCallback(
    ({ item }) =>
      item.type === "dailyCard" ? (
        <DailyDharmaCard
          image={item.image}
          quote={item.quote}
          onPress={() => navigation.navigate(navigationTarget)}
        />
      ) : (
        <VideoCard item={item} />
      ),
    [navigationTarget]
  );

  return (
    <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
      <FlatList
        data={combinedData}
        renderItem={renderItem}
        keyExtractor={(item, idx) => item.id?.toString() || `daily-${idx}`}
        scrollEnabled={false}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <TextComponent type="headerText" style={{ color: "#999" }}>
                No videos found.
              </TextComponent>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          disabled={currentPage <= 1}
          onPress={() => {
            if (onPrev) onPrev();
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }}
          style={[
            styles.pageButton,
            { backgroundColor: currentPage <= 1 ? "#ddd" : "#b97f28" },
          ]}
        >
          <TextComponent type="headerText" style={styles.pageButtonText}>Prev</TextComponent>
        </TouchableOpacity>

        <TextComponent type="headerText" style={styles.pageLabel}>
          Page {currentPage} of {totalPages}
        </TextComponent>

        <TouchableOpacity
          disabled={currentPage >= totalPages}
          onPress={() => {
            if (onNext) onNext();
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }}
          style={[
            styles.pageButton,
            { backgroundColor: currentPage >= totalPages ? "#ddd" : "#b97f28" },
          ]}
        >
          <TextComponent type="headerText" style={styles.pageButtonText}>Next</TextComponent>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <ActivityIndicator color="#b97f28" />
        </View>
      )}
    </ScrollView>
  );
};

export default ExploreVideosVertical;

const styles: any = StyleSheet.create({
  videoCard: {
    // backgroundColor: "#FFF7E8",
     borderRadius: 12,
    marginBottom: 18,
    width: "100%",
    overflow: "hidden",
    // borderWidth: 2,
    // borderColor: "#FFD6A5",
    padding: 12,
      elevation: 3,
        backgroundColor: Colors.Colors.white,
  },
  thumbnailWrapper: { width: "100%", height: 200, borderRadius: 10, backgroundColor: "#eee" },
  thumbnailImage: { width: "100%", height: "100%", borderRadius: 10 },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 50,
    height: 50,
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  videoTitle: { 
    // fontSize: 14,
     marginTop: 10, color: Colors.Colors.BLACK },
  dailyCard: {
    width: "100%",
    borderRadius: 16,
    // backgroundColor: "#FFF8E7",
    // borderWidth: 2,
    // borderColor: "#E8C27E",
    marginBottom: 20,
    overflow: "hidden",
       elevation: 3,
        backgroundColor: Colors.Colors.white,
  },
  dailyImage: { margin: 10, width: "94%", height: 180, borderRadius: 14 },
  dailyContent: { padding: 12, alignItems: "center" },
  dailyTitle: {
    color: Colors.Colors.BLACK,
    // fontSize: FontSize.CONSTS.FS_16,
    marginBottom: 6,
  },
  dailyQuote: { textAlign: "center", marginBottom: 10 },
  dailyButton: {
    backgroundColor: Colors.Colors.App_theme,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dailyButtonText: { color: Colors.Colors.white, 
    // fontSize: 14
   },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  pageButtonText: { color: "#fff", fontSize: 14 },
  pageLabel: { color: "#000", fontSize: 14 },
});













// import { useNavigation } from "@react-navigation/native";
// import { AnyAction } from "@reduxjs/toolkit";
// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   ActivityIndicator,
//   FlatList,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   View
// } from "react-native";
// import { Card } from "react-native-paper";
// import { useDispatch } from "react-redux";
// import { ThunkDispatch } from "redux-thunk";
// import { getDailyDharmaTracker } from "../screens/Home/actions";
// import { RootState } from "../store";
// import Colors from "./Colors";
// import FontSize from "./FontSize";
// import TextComponent from "./TextComponent";
// import YoutubeModal from "./youtubeModal";

// // ✅ Extract YouTube video ID safely
// const extractYoutubeId = (url: string): string | null => {
//   if (!url) return null;
//   const regex =
//     /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
//   const match = url.match(regex);
//   return match ? match[1] : null;
// };

// // ✅ Video Card
// const VideoCard = ({ item }: any) => {
//   const [showVideo, setShowVideo] = useState(false);
//   const youtubeId = useMemo(() => extractYoutubeId(item.youtube_url), [item.youtube_url]);
//   const thumbnailUrl =
//     item.thumbnail || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null);

//   return (
//     <View style={styles.videoCard}>
//       <TouchableOpacity activeOpacity={0.8} onPress={() => setShowVideo(true)} style={styles.thumbnailWrapper}>
//         <Image source={{ uri: thumbnailUrl }} style={{ width: "100%", height: "100%", borderRadius: 10 }} resizeMode="cover" />
//         <Image source={require("../../assets/videopaly.png")} style={styles.playButton} resizeMode="contain" />
//       </TouchableOpacity>

//       <TextComponent type="headerText" style={styles.videoTitle} numberOfLines={5}>{item.title}</TextComponent>

//       <YoutubeModal visible={showVideo} onClose={() => setShowVideo(false)} youtubeUrl={item.youtube_url} />
//     </View>
//   );
// };

// // ✅ Daily Dharma Card
// // ✅ Daily Dharma Card
// const DailyDharmaCard = ({ image, quote, onPress }: any) => {
//   const { t } = useTranslation();

//   return (
//     <View style={styles.dailyCard}>
//       {/* 🌸 Image on Top */}
//       <Image source={{ uri: image }} style={styles.dailyImage} resizeMode="cover" />

//       <View style={styles.dailyContent}>
//         <TextComponent type="headerBoldText" style={styles.dailyTitle}>
//           {t("DailyDharmaCard.dailyPracticeTitle")}
//         </TextComponent>

//         <TextComponent type="cardText" style={styles.dailyQuote} numberOfLines={3}>
//           {quote}
//         </TextComponent>

//         <TouchableOpacity style={styles.dailyButton} onPress={onPress}>
//           <TextComponent type="headerBoldText" style={styles.dailyButtonText}>
//             {t("DailyDharmaCard.startButton", "Start Daily Practice")}
//           </TextComponent>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };


// // ✅ ExploreVideos (main component)
// const ExploreVideosVertical = ({ videos = [], onLoadMore, loading, home }: any) => {
//   const navigation: any = useNavigation();
//   const { t } = useTranslation();
//  const [trackerData, setTrackerData] = useState<any>(null);

//  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

//    useEffect(() => {
//      dispatch(
//        getDailyDharmaTracker((res) => {
//          if (res.success) {
//            setTrackerData(res.data);
//            console.log("✅ Daily Dharma Tracker Data::::::::::", res.data);
//          } else {
//            console.error("❌ Failed to fetch tracker:", res.error);
//          }
//        })
//      );
//    }, [dispatch]);

// const navigationTarget = useMemo(() => {
//   if (trackerData?.active_practices?.length > 0) {
//     return "MySadana";
//   }
//   return "Dharma";
// }, [trackerData]);
 
   
//   // 🌞 Social proof data
//   const socialProofImages = [
//     "https://dev.kalpx.com/images/social-proof/slide1.jpeg",
//     "https://dev.kalpx.com/images/social-proof/slide2.jpeg",
//     "https://dev.kalpx.com/images/social-proof/slide3.jpeg",
//     "https://dev.kalpx.com/images/social-proof/slide4.jpeg",
//     "https://dev.kalpx.com/images/social-proof/slide5.jpeg",
//     "https://dev.kalpx.com/images/social-proof/slide6.jpeg",
//   ];

//   const socialProofQuotes = [
//     t("DailyDharmaCard.socialProofQuote1"),
//     t("DailyDharmaCard.socialProofQuote2"),
//     t("DailyDharmaCard.socialProofQuote3"),
//     t("DailyDharmaCard.socialProofQuote4"),
//     t("DailyDharmaCard.socialProofQuote5"),
//     t("DailyDharmaCard.socialProofQuote6"),
//     t("DailyDharmaCard.socialProofQuote7"),
//     t("DailyDharmaCard.socialProofQuote8"),
//     t("DailyDharmaCard.socialProofQuote9"),
//     t("DailyDharmaCard.socialProofQuote10"),
//   ];

//   // 🎡 Rotate daily
//   const dayIndex = new Date().getDate() % socialProofImages.length;
//   const dailyCardData = {
//     image: socialProofImages[dayIndex],
//     quote: socialProofQuotes[dayIndex],
//   };

//   // 🧩 Combine videos + daily card (insert after every 5 videos)
// // 🧩 Combine videos + daily card (insert once after 15 videos)
// const combinedData = useMemo(() => {
//   const data: any[] = [];
//   videos.forEach((v: any, i: number) => {
//     data.push(v);
//     // insert daily card only once after 15th video
//     if ((i + 1) === 15) {
//       data.push({ type: "dailyCard", ...dailyCardData });
//     }
//   });
//   return data;
// }, [videos, dailyCardData]);



//   const renderItem = useCallback(({ item }) => {
//     if (item.type === "dailyCard") {
//       return (
//         <DailyDharmaCard
//           image={item.image}
//           quote={item.quote}
//            onPress={() => navigation.navigate(navigationTarget)}
//         />
//       );
//     }
//     return <VideoCard item={item} />;
//   }, []);

//   const renderFooter = useCallback(
//     () =>
//       loading ? (
//         <View style={{ alignItems: "center", justifyContent: "center", padding: 12 }}>
//           <ActivityIndicator color="#b97f28" />
//           <TextComponent type="headerText" style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Loading more...</TextComponent>
//         </View>
//       ) : null,
//     [loading]
//   );

//   const renderEmpty = useCallback(
//     () =>
//       !loading ? (
//         <View style={{ alignItems: "center", marginTop: 20 }}>
//           <TextComponent type="headerText" style={{ color: "#999" }}>No videos found.</TextComponent>
//         </View>
//       ) : null,
//     [loading]
//   );

//   return (
//     <>
//       {home ? (
//         <Card style={styles.card}>
//           <View style={styles.headerRow}>
//             <TextComponent type="mediumText" style={styles.sectionHeading}>
//               {t("cards.explore")}
//             </TextComponent>
//             <TouchableOpacity onPress={() => navigation.navigate("Explore")}>
//               <TextComponent type="mediumText" style={styles.sectionHeadingRow}>
//                 {t("cards.show")}
//               </TextComponent>
//             </TouchableOpacity>
//           </View>

//           <FlatList
//             data={combinedData}
//             renderItem={renderItem}
//             keyExtractor={(item, idx) => item.id?.toString() || `daily-${idx}`}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             onEndReached={onLoadMore}
//             onEndReachedThreshold={0.5}
//             ListFooterComponent={renderFooter}
//             ListEmptyComponent={renderEmpty}
//             contentContainerStyle={{ paddingHorizontal: 16 }}
//           />
//         </Card>
//       ) : (
//         <FlatList
//           data={combinedData}
//           renderItem={renderItem}
//           keyExtractor={(item, idx) => item.id?.toString() || `daily-${idx}`}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           onEndReached={onLoadMore}
//           onEndReachedThreshold={0.5}
//           ListFooterComponent={renderFooter}
//           ListEmptyComponent={renderEmpty}
//           contentContainerStyle={{ paddingHorizontal: 16 }}
//         />
//       )}
//     </>
//   );
// };

// export default ExploreVideosVertical;

// const styles : any= StyleSheet.create({
//   card: {
//     elevation: 3,
//     backgroundColor: Colors.Colors.white,
//     padding: 20,
//     width: "96%",
//     alignSelf: "center",
//     borderRadius: 10,
//   },
//   headerRow: {
//     marginBottom: 12,
//     paddingHorizontal: 4,
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   sectionHeading: {
//     color: Colors.Colors.BLACK,
//     fontSize: FontSize.CONSTS.FS_18,
//   },
//   sectionHeadingRow: {
//     color: "green",
//     fontSize: FontSize.CONSTS.FS_14,
//     textDecorationLine: "underline",
//   },
//   videoCard: {
//     backgroundColor: "#FFF7E8",
//     borderRadius: 12,
//     marginRight: 16,
//     width: 250,
//     overflow: "hidden",
//     borderWidth: 2,
//     borderColor: "#FFD6A5",
//     padding: 12,
//   },
//   thumbnailWrapper: {
//     width: "100%",
//     height: 140,
//     overflow: "hidden",
//     borderRadius: 10,
//     backgroundColor: "#eee",
//   },
//   playButton: {
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     width: 50,
//     height: 50,
//     transform: [{ translateX: -25 }, { translateY: -25 }],
//     opacity: 0.9,
//   },
//   videoTitle: {
//     fontSize: 14,
//     // fontFamily: "GelicaRegular",
//     // color: "#000",
//     padding: 12,
//   },
//   dailyOverlay: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 12,
//     backgroundColor: "rgba(0,0,0,0.4)",
//   },
//   // 🌿 Daily Dharma Card Styles
// dailyCard: {
//   width: 250,
//   borderRadius: 16,
//   backgroundColor: "#FFF8E7", // soft cream tone
//   borderWidth: 2,
//   borderColor: "#E8C27E",
//   marginRight: 16,
//   overflow: "hidden",
//   shadowColor: "#000",
//   shadowOpacity: 0.1,
//   shadowRadius: 6,
//   shadowOffset: { width: 0, height: 3 },
//   elevation: 3,
// },

// dailyImage: {
//   margin:10,
//   width: "92%",
//   height: 140,
//  borderRadius:14
// },

// dailyContent: {
//   padding: 12,
//   alignItems: "center",
//   justifyContent: "center",
// },
// dailyTitle: {
//     color: Colors.Colors.BLACK,
//    fontSize: FontSize.CONSTS.FS_16,
//   textAlign: "center",
//   marginBottom: 6,
// },

// dailyQuote: {
//   // color: Colors.Colors.BLACK,
//   // fontSize: 14,
//   textAlign: "center",
//   // fontStyle: "italic",
//   marginBottom: 10,
// },

// dailyButton: {
//   backgroundColor: Colors.Colors.App_theme,
//   paddingVertical: 6,
//   paddingHorizontal: 16,
//   borderRadius: 8,
// },

// dailyButtonText: {
//   color: Colors.Colors.white,
//   // fontWeight: "700",
//   fontSize: 14,
// },

// });