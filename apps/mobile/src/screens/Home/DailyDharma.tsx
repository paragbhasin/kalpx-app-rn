import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import TextComponent from "../../components/TextComponent";

const { width } = Dimensions.get("window");

const faqData = [
  { id: "1", titleKey: "dailyDharma.faq1Title", descriptionKey: "dailyDharma.faq1Desc" },
  { id: "2", titleKey: "dailyDharma.faq2Title", descriptionKey: "dailyDharma.faq2Desc" },
  { id: "3", titleKey: "dailyDharma.faq3Title", descriptionKey: "dailyDharma.faq3Desc" },
  { id: "4", titleKey: "dailyDharma.faq4Title", descriptionKey: "dailyDharma.faq4Desc" },
  { id: "5", titleKey: "dailyDharma.faq5Title", descriptionKey: "dailyDharma.faq5Desc" },
];


const Dharma = () => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();

  if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const renderItem = ({ item }: any) => {
    const isExpanded = expandedId === item.id;

    return (
      <View style={{ marginBottom: 12 }}>
        {/* Header */}
        <TouchableOpacity
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.8}
          style={{
            borderColor: "#707070",
            borderWidth: 1,
            borderRadius: 10,
            padding: 15,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextComponent type="cardText" style={{ color: Colors.Colors.BLACK }}>
            {t(item.titleKey)}
          </TextComponent>
          <Image
            source={require("../../../assets/card_arrow.png")}
            style={{
              width: 10,
              height: 10,
              transform: [{ rotate: isExpanded ? "90deg" : "0deg" }],
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Description */}
        {isExpanded && (
          <View
            style={{
              borderColor: "#707070",
              borderWidth: 1,
              borderRadius: 10,
              padding: 15,
              marginTop: 8,
            }}
          >
            <TextComponent type="mediumText" style={{ fontSize: FontSize.CONSTS.FS_14 }}>
              {t(item.descriptionKey)}
            </TextComponent>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.Colors.header_bg}
        translucent={false}
      />
      <Header />

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {/* Heading Section */}
        <TextComponent
          type="cardText"
          style={{
            textAlign: "center",
            marginTop: 15,
            fontSize: FontSize.CONSTS.FS_16,
            color: Colors.Colors.BLACK,
          }}
        >
          {t("dailyDharma.heading")}
        </TextComponent>

        <TextComponent
          type="mediumText"
          style={{
            fontSize: FontSize.CONSTS.FS_14,
            textAlign: "center",
            marginTop: 7,
            marginHorizontal: 30,
          }}
        >
          {t("dailyDharma.subHeading")}
        </TextComponent>

        <Image
          source={require("../../../assets/Daily_Darma2.png")}
          style={{
            width: width * 0.85,
            height: 200,
            alignSelf: "center",
            marginVertical: 12,
            borderRadius: 8,
          }}
          resizeMode="cover"
        />

        <View style={{ marginHorizontal: 20 }}>
          <TextComponent
            type="boldText"
            style={{
              marginTop: 20,
              color: Colors.Colors.BLACK,
              fontSize: FontSize.CONSTS.FS_16,
            }}
          >
            {t("dailyDharma.findPeaceTitle")}
          </TextComponent>

          <TextComponent
            type="mediumText"
            style={{ marginTop: 10, fontSize: FontSize.CONSTS.FS_14 }}
          >
            {t("dailyDharma.findPeaceSubtitle1")}
          </TextComponent>

          <TextComponent
            type="mediumText"
            style={{ marginTop: 10, fontSize: FontSize.CONSTS.FS_14 }}
          >
            {t("dailyDharma.findPeaceSubtitle2")}
          </TextComponent>

          <TouchableOpacity
            onPress={() => navigation.navigate("MySadana")}
            style={{
              backgroundColor: "#D4A017",
              padding: 16,
              alignSelf: "flex-start",
              marginVertical: 12,
              borderRadius: 4,
            }}
          >
            <TextComponent type="cardText">{t("dailyDharma.startPractice")}</TextComponent>
          </TouchableOpacity>

          {/* Daily Practice Steps */}
          <View style={{ alignItems: "center" }}>
            <TextComponent
              type="boldText"
              style={{
                color: Colors.Colors.BLACK,
                fontSize: FontSize.CONSTS.FS_16,
                marginTop: 12,
              }}
            >
              {t("dailyDharma.yourPathTitle")}
            </TextComponent>

            <TextComponent
              type="mediumText"
              style={{
                fontSize: FontSize.CONSTS.FS_14,
                textAlign: "center",
                marginHorizontal: 20,
                marginTop: 12,
              }}
            >
              {t("dailyDharma.yourPathSubtitle")}
            </TextComponent>

            {/* Step 1 */}
            <View
              style={{
                backgroundColor: "#D4A017",
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 6,
                marginTop: 25,
              }}
            >
              <TextComponent
                type="boldText"
                style={{
                  color: Colors.Colors.BLACK,
                  fontSize: FontSize.CONSTS.FS_24,
                }}
              >
                1
              </TextComponent>
            </View>

            <TextComponent
              type="boldText"
              style={{
                color: Colors.Colors.BLACK,
                fontSize: FontSize.CONSTS.FS_16,
                marginTop: 12,
              }}
            >
              {t("dailyDharma.step1Title")}
            </TextComponent>

            <TextComponent
              type="mediumText"
              style={{
                fontSize: FontSize.CONSTS.FS_14,
                textAlign: "center",
                marginHorizontal: 20,
                marginTop: 12,
              }}
            >
              {t("dailyDharma.step1Subtitle")}
            </TextComponent>
          </View>

          {/* Step 2 */}
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                backgroundColor: "#D4A017",
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 6,
                marginTop: 25,
              }}
            >
              <TextComponent
                type="boldText"
                style={{
                  color: Colors.Colors.BLACK,
                  fontSize: FontSize.CONSTS.FS_24,
                }}
              >
                2
              </TextComponent>
            </View>

            <TextComponent
              type="boldText"
              style={{
                color: Colors.Colors.BLACK,
                fontSize: FontSize.CONSTS.FS_16,
                marginTop: 12,
              }}
            >
              {t("dailyDharma.step2Title")}
            </TextComponent>

            <TextComponent
              type="mediumText"
              style={{
                fontSize: FontSize.CONSTS.FS_14,
                textAlign: "center",
                marginHorizontal: 20,
                marginTop: 12,
              }}
            >
              {t("dailyDharma.step2Subtitle")}
            </TextComponent>
          </View>

          {/* Step 3 */}
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                backgroundColor: "#D4A017",
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 6,
                marginTop: 25,
              }}
            >
              <TextComponent
                type="boldText"
                style={{
                  color: Colors.Colors.BLACK,
                  fontSize: FontSize.CONSTS.FS_24,
                }}
              >
                3
              </TextComponent>
            </View>

            <TextComponent
              type="boldText"
              style={{
                color: Colors.Colors.BLACK,
                fontSize: FontSize.CONSTS.FS_16,
                marginTop: 12,
              }}
            >
              {t("dailyDharma.step3Title")}
            </TextComponent>

            <TextComponent
              type="mediumText"
              style={{
                fontSize: FontSize.CONSTS.FS_14,
                textAlign: "center",
                marginHorizontal: 20,
                marginTop: 12,
              }}
            >
              {t("dailyDharma.step3Subtitle")}
            </TextComponent>
          </View>

          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("MySadana")}
              style={{
                backgroundColor: "#D4A017",
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 6,
                marginTop: 35,
              }}
            >
              <TextComponent type="boldText" style={{ color: Colors.Colors.BLACK, fontSize: FontSize.CONSTS.FS_16 }}>
                {t("dailyDharma.startPractice")}
              </TextComponent>
            </TouchableOpacity>

            <TextComponent
              type="boldText"
              style={{
                color: Colors.Colors.BLACK,
                fontSize: FontSize.CONSTS.FS_16,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              {t("dailyDharma.signInTitle")}
            </TextComponent>

            <TextComponent
              type="mediumText"
              style={{
                fontSize: FontSize.CONSTS.FS_14,
                textAlign: "center",
                marginHorizontal: 20,
                marginVertical: 12,
              }}
            >
              {t("dailyDharma.quote")}
            </TextComponent>
          </View>

          {/* FAQ Section */}
          <FlatList
            data={faqData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
          />

          <TextComponent
            type="cardText"
            style={{
              textAlign: "center",
              marginTop: 15,
              fontSize: FontSize.CONSTS.FS_16,
              color: Colors.Colors.BLACK,
            }}
          >
            {t("dailyDharma.faqHeading")}
          </TextComponent>

          <TextComponent
            type="mediumText"
            style={{
              fontSize: FontSize.CONSTS.FS_14,
              textAlign: "center",
              marginTop: 7,
              marginHorizontal: 30,
            }}
          >
            {t("dailyDharma.faqSubHeading")}
          </TextComponent>

          <TextComponent
            type="mediumText"
            style={{
              fontSize: FontSize.CONSTS.FS_14,
              textAlign: "center",
              marginTop: 7,
              marginHorizontal: 30,
            }}
          >
            {t("dailyDharma.faqDescription")}
          </TextComponent>

          <Image
            source={require("../../../assets/Daily_Darma1.png")}
            style={{
              width: width * 0.85,
              height: 200,
              alignSelf: "center",
              marginVertical: 12,
              borderRadius: 8,
            }}
            resizeMode="cover"
          />

          <TextComponent
            type="boldText"
            style={{ marginTop: 20, color: Colors.Colors.BLACK, fontSize: FontSize.CONSTS.FS_16 }}
          >
            {t("dailyDharma.familyTitle")}
          </TextComponent>

          <TextComponent
            type="mediumText"
            style={{ marginTop: 10, fontSize: FontSize.CONSTS.FS_14 }}
          >
            {t("dailyDharma.familySubtitle1")}
          </TextComponent>

          <TextComponent
            type="mediumText"
            style={{ marginTop: 10, fontSize: FontSize.CONSTS.FS_14 }}
          >
            {t("dailyDharma.familySubtitle2")}
          </TextComponent>

          <TouchableOpacity
            onPress={() => navigation.navigate("MySadana")}
            style={{
              backgroundColor: "#D4A017",
              padding: 16,
              alignSelf: "flex-start",
              marginVertical: 12,
              borderRadius: 4,
            }}
          >
            <TextComponent type="cardText">{t("dailyDharma.familyButton")}</TextComponent>
          </TouchableOpacity>

          <TextComponent
            type="mediumText"
            style={{
              textAlign: "center",
              marginTop: 10,
              fontSize: FontSize.CONSTS.FS_14,
              paddingVertical: 30,
            }}
          >
            {t("dailyDharma.familyFooter")}
          </TextComponent>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dharma;





// import { useNavigation } from "@react-navigation/native";
// import React, { useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   Dimensions,
//   FlatList,
//   Image,
//   LayoutAnimation,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   TouchableOpacity,
//   UIManager,
//   View
// } from "react-native";
// import Colors from "../../components/Colors";
// import FontSize from "../../components/FontSize";
// import Header from "../../components/Header";
// import TextComponent from "../../components/TextComponent";

// const { width } = Dimensions.get("window");

// const faqData = [
//   {
//     id: "1",
//     title: "Why build a daily spiritual practice?",
//     description:
//       "In a world of constant noise, daily spiritual practice is a quiet anchor. It grounds your energy, purifies your intent, and gently brings you back to what matters. KalpX offers simple, accessible practices — from morning chants and breathwork to evening reflection and gratitude — so that spirituality becomes not a task, but a rhythm.\n\nWhether you light a diya before work, repeat a mantra on your commute, or take 2 minutes to sit in silence before sleep — these small rituals create big shifts over time. Consistency becomes connection. Repetition becomes realization.\n\nLet KalpX help you infuse your everyday with purpose, presence, and peace.",
//   },
//   {
//     id: "2",
//     title: "What you’ll find in Daily Practice",
//     description:
//       "✔ Morning invocations, chants, and affirmations to start the day\n✔ Guided meditations for clarity, energy, and calm\n✔ Breathwork and grounding techniques based in yogic science\n✔ Short reflections on dharma, gratitude, and intention-setting\n✔ Evening wind-down rituals and sacred closing prayers\n✔ Bite-sized stories and teachings for daily inspiration\n✔ Practices designed for all ages, including children and elders",
//   },
//   {
//     id: "3",
//     title: "Who is Daily Practice for?",
//     description:
//       "✔ Anyone looking to cultivate inner calm and consistency\n✔ Beginners unsure where to start with spiritual habits\n✔ Parents wanting simple rituals to share with their kids\n✔ Professionals needing short, grounding pauses in their day\n✔ Seekers seeking structure without pressure\n✔ Elders returning to daily devotion",
//   },
//   {
//     id: "4",
//     title: "How to integrate Daily Practice",
//     description:
//       "🪔 Choose one simple practice to begin with — and stay consistent\n⏰ Set a regular time (sunrise, lunch break, before bed)\n📿 Use malas, bells, or incense to engage the senses\n📱 Bookmark your favorite KalpX routines for easy access\n👨‍👩‍👧 Create a shared family ritual to build cultural memory",
//   },
//   {
//     id: "5",
//     title: "What makes KalpX Daily Practice different?",
//     description:
//       "✔ Spiritually potent, yet simple and practical\n✔ Crafted for modern life — short formats, flexible timing\n✔ Deeply rooted in Sanatan Dharma’s daily rhythm\n✔ Accessible to all — no prior knowledge required\n✔ A blend of devotion, discipline, and discovery",
//   },
// ];



// const Dharma = () => {
//   const navigation: any = useNavigation();
//   const { t } = useTranslation();

//   if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   const toggleExpand = (id: string) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setExpandedId(expandedId === id ? null : id);
//   };

//   const renderItem = ({ item }: any) => {
//     const isExpanded = expandedId === item.id;

//     return (
//       <View style={{ marginBottom: 12 }}>
//         {/* Header */}
//         <TouchableOpacity
//           onPress={() => toggleExpand(item.id)}
//           activeOpacity={0.8}
//           style={{
//             borderColor: "#707070",
//             borderWidth: 1,
//             borderRadius: 10,
//             padding: 15,
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <TextComponent type="cardText" style={{ color: Colors.Colors.BLACK }}>
//             {item.title}
//           </TextComponent>
//           <Image
//             source={require("../../../assets/card_arrow.png")}
//             style={{
//               width: 10,
//               height: 10,
//               transform: [{ rotate: isExpanded ? "90deg" : "0deg" }],
//             }}
//             resizeMode="contain"
//           />
//         </TouchableOpacity>

//         {/* Description */}
//         {isExpanded && (
//           <View
//             style={{
//               borderColor: "#707070",
//               borderWidth: 1,
//               borderRadius: 10,
//               padding: 15,
//               marginTop: 8,
//             }}
//           >
//             <TextComponent type="mediumText" style={{ fontSize: FontSize.CONSTS.FS_14 }}>
//               {item.description}
//             </TextComponent>
//           </View>
//         )}
//       </View>
//     );
//   };


//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor={Colors.Colors.header_bg}
//         translucent={false}
//       />
//       <Header />
//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 30 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Heading Section */}
//         <TextComponent
//           type="cardText"
//           style={{
//             textAlign: "center",
//             marginTop: 15,
//             fontSize: FontSize.CONSTS.FS_16,
//             color: Colors.Colors.BLACK,
//           }}
//         >
//      Begin Your Journey to Inner Peace
//         </TextComponent>

//         <TextComponent
//           type="mediumText"
//           style={{
//             fontSize: FontSize.CONSTS.FS_14,
//             textAlign: "center",
//             marginTop: 7,
//             marginHorizontal: 30,
//           }}
//         >
//      Discover daily practices crafted to nurture your mind and spirit.
//         </TextComponent>
//    <Image
//       source={require("../../../assets/Daily_Darma2.png")}
//       style={{width:width*0.85,height:200,alignSelf:"center",marginVertical:12,borderRadius:8}}
//       resizeMode="cover"
//     />
//     <View style={{marginHorizontal:20}}>
//     <TextComponent type="boldText" style={{ marginTop:20,color: Colors.Colors.BLACK,fontSize: FontSize.CONSTS.FS_16}}>Find Peace and Clarity with Daily Practices</TextComponent>
//     <TextComponent type="mediumText" style={{marginTop:10,fontSize: FontSize.CONSTS.FS_14}}>Simple routines to support your well-being, tailored for you.</TextComponent>
//     <TextComponent type="mediumText" style={{marginTop:10,fontSize: FontSize.CONSTS.FS_14}}>Make dharma a part of your daily rhythm. This space offers bite-sized practices — chants, affirmations, reflections, and mindful rituals — designed to ground you in inner peace and purpose. Start your day with spiritual clarity and return whenever your soul needs a reset.</TextComponent>
//     <TouchableOpacity  onPress={() => navigation.navigate("MySadana")}
//     style={{backgroundColor:"#D4A017",padding:16,alignSelf:"flex-start",marginVertical:12,borderRadius:4}}>
//     <TextComponent type="cardText" >Start Daily Practice</TextComponent>
//     </TouchableOpacity>
//      <View style={{alignItems:"center"}}>
//                 <TextComponent type="boldText" style={{ color: Colors.Colors.BLACK,fontSize: FontSize.CONSTS.FS_16,marginTop:12}}>Your Daily Practice Path</TextComponent>
//         <TextComponent type="mediumText" style={{ fontSize: FontSize.CONSTS.FS_14,textAlign:"center",marginHorizontal:20,marginTop:12}}>Take the first step toward a calmer, healthier life.</TextComponent>
//         <View style={{backgroundColor:"#D4A017",paddingHorizontal:18,paddingVertical:12,borderRadius:6,marginTop:25}}>
//             <TextComponent type="boldText" style={{ color: Colors.Colors.BLACK,fontSize: FontSize.CONSTS.FS_24}}>1</TextComponent>
//         </View>
//         <TextComponent type="boldText" style={{ color: Colors.Colors.BLACK,fontSize: FontSize.CONSTS.FS_16,marginTop:12}}>Choose Your Practice</TextComponent>
//         <TextComponent type="mediumText" style={{ fontSize: FontSize.CONSTS.FS_14,textAlign:"center",marginHorizontal:20,marginTop:12}}>Select practices that align with your spiritual goals, based on your experience level.</TextComponent>
//     </View>
//         <View style={{alignItems:"center"}}>
//         <View style={{backgroundColor:"#D4A017",paddingHorizontal:18,paddingVertical:12,borderRadius:6,marginTop:25}}>
//             <TextComponent type="boldText" style={{ color: Colors.Colors.BLACK,fontSize: FontSize.CONSTS.FS_24}}>2</TextComponent>
//         </View>
//         <TextComponent type="boldText" style={{ color: Colors.Colors.BLACK,fontSize: FontSize.CONSTS.FS_16,marginTop:12}}>Create Your Daily Routine</TextComponent>
//         <TextComponent type="mediumText" style={{ fontSize: FontSize.CONSTS.FS_14,textAlign:"center",marginHorizontal:20,marginTop:12}}>Pick 1–3 daily rituals to build a simple practice that fits your life.</TextComponent>
//     </View>
//         <View style={{alignItems:"center"}}>
//         <View style={{backgroundColor:"#D4A017",paddingHorizontal:18,paddingVertical:12,borderRadius:6,marginTop:25}}>
//             <TextComponent type="boldText" style={{ color: Colors.Colors.BLACK,fontSize: FontSize.CONSTS.FS_24}}>3</TextComponent>
//         </View>
//         <TextComponent type="boldText" style={{ color: Colors.Colors.BLACK,fontSize: FontSize.CONSTS.FS_16,marginTop:12}}>Track Your Journey</TextComponent>
//         <TextComponent type="mediumText" style={{ fontSize: FontSize.CONSTS.FS_14,textAlign:"center",marginHorizontal:20,marginTop:12}}>Stay consistent and reflect on your growth through gentle daily tracking.</TextComponent>
//     </View>
//     <View style={{alignItems:"center"}}>
//         <TouchableOpacity onPress={() => navigation.navigate("MySadana")} style={{backgroundColor:"#D4A017",paddingHorizontal:18,paddingVertical:12,borderRadius:6,marginTop:35}}>
//             <TextComponent type="boldText" style={{ color: Colors.Colors.BLACK,fontSize: FontSize.CONSTS.FS_16}}>Start Daily Practice</TextComponent>
//         </TouchableOpacity>
//         <TextComponent type="boldText" style={{ color: Colors.Colors.BLACK,fontSize: FontSize.CONSTS.FS_16,marginTop:12,textAlign:"center"}}>Sign in to KalpX to personalize your daily practice.</TextComponent>
//         <TextComponent type="mediumText" style={{ fontSize: FontSize.CONSTS.FS_14,textAlign:"center",marginHorizontal:20,marginVertical:12}}>“With a pure heart, every moment becomes a sacred practice.”</TextComponent>
//     </View>
//  <FlatList
//       data={faqData}
//       renderItem={renderItem}
//       keyExtractor={(item) => item.id}
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={{ paddingVertical: 10 }}
//     />
//     <TextComponent
//           type="cardText"
//           style={{
//             textAlign: "center",
//             marginTop: 15,
//             fontSize: FontSize.CONSTS.FS_16,
//             color: Colors.Colors.BLACK,
//           }}
//         >
//   Daily Practice
//         </TextComponent>

//         <TextComponent
//           type="mediumText"
//           style={{
//             fontSize: FontSize.CONSTS.FS_14,
//             textAlign: "center",
//             marginTop: 7,
//             marginHorizontal: 30,
//           }}
//         >
//     Simple moments. Sacred meaning.
//         </TextComponent>
//          <TextComponent
//           type="mediumText"
//           style={{
//             fontSize: FontSize.CONSTS.FS_14,
//             textAlign: "center",
//             marginTop: 7,
//             marginHorizontal: 30,
//           }}
//         >KalpX Daily Practice. Show up every day — and watch the shift begin.
//             </TextComponent> 
//             <Image 
//       source={require("../../../assets/Daily_Darma1.png")}
//       style={{width:width*0.85,height:200,alignSelf:"center",marginVertical:12,borderRadius:8}}
//       resizeMode="cover"
//     />
//     <TextComponent type="boldText" style={{ marginTop:20,color: Colors.Colors.BLACK,fontSize: FontSize.CONSTS.FS_16}}>A Family Practice</TextComponent>
//     <TextComponent type="mediumText" style={{marginTop:10,fontSize: FontSize.CONSTS.FS_14}}>Come together in devotion before meals, growing in spirit as a family.</TextComponent>
//     <TextComponent type="mediumText" style={{marginTop:10,fontSize: FontSize.CONSTS.FS_14}}>Strengthen family bonds through shared rituals that connect you to Sanatan Dharma, fostering love, gratitude, and cultural heritage in every meal.</TextComponent>
//     <TouchableOpacity onPress={() => navigation.navigate("MySadana")} style={{backgroundColor:"#D4A017",padding:16,alignSelf:"flex-start",marginVertical:12,borderRadius:4}}>
//     <TextComponent type="cardText" >Start Our Family Practice</TextComponent>
//     </TouchableOpacity>
//    <TextComponent type="mediumText" style={{textAlign:"center",marginTop:10,fontSize: FontSize.CONSTS.FS_14,paddingVertical:30}}>Create a shared journey for peace and connection!</TextComponent> 
//     </View>
   
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default Dharma;
