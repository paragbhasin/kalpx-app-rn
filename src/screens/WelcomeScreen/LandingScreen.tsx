import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import styles from "./styles";

export default function LandingScreen({ navigation }) {
  const { t } = useTranslation();
  const { width: deviceWidth } = Dimensions.get("window");

  const features = [
    "Practice Daily Dharma with guided checklists and streak tracking.",
    "Mark your SankalpX (intentions), journal progress, and revisit past vows.",
    "Keep a history of videos watched, resume anytime, and get personalized recommendations.",
    "Join live and recorded classes — Dance, Music, Yoga, Ayurveda, and Sanatan Teachings.",
    "Book spiritual retreats and yatras with clear itineraries and reminders.",
    "Schedule Mandir Poojas and Seva; receive updates and digital receipts.",
    "Explore sacred travel options and access Live Darshan from holy temples.",
    "Grow with a rich library of mantras, bhajans, and videos — from Gita to Upanishads.",
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1ebdf" />
      <ImageBackground
        source={require("../../../assets/hoomepagebg.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View>
            <Image
              source={require("../../../assets/LandingImage.png")}
              style={{ width: deviceWidth, height: 200, marginTop: -20 }}
              resizeMode="contain"
            />
            <Text style={styles.welcome}>Welcome To</Text>
            <Text style={styles.kalpText}>{t("login.brand")}</Text>
            <Text style={styles.heading2}>{t("login.heading")}</Text>

            <TouchableOpacity
              style={{
                backgroundColor: "#ac8a5d",
                margin: 20,
                paddingVertical: Platform.OS === "ios" ? 16 : 14,
                paddingHorizontal: 40,
                borderRadius: 30,
              }}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.8}
            >
              <Text style={{ ...styles.buttonText, alignSelf: "center" }}>
                {t("welcome.getStarted")}
              </Text>
            </TouchableOpacity>

            <Text style={styles.joinText}>Join KalpX</Text>
            <Text style={styles.joinSubText}>
              Create your account to practice Daily Dharma, track SankalpX, learn
              through classes, and explore sacred journeys.
            </Text>

            <FlatList
              data={features}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    marginVertical: 8,
                    marginHorizontal: 16,
                    padding: 12,
                    borderRadius: 15,
                  }}
                >
                  <Text style={styles.flatText}>{item}</Text>
                </View>
              )}
            />
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
