import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ExploreVideos from "../components/ExploreVideos";

export default function Sankalp() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Top Image with curved bottom */}
      <ImageBackground
        source={require("../../assets/Sankalpbg.png")}
        style={styles.headerImage}
        imageStyle={styles.imageStyle}
      >
        {/* Top buttons */}
        <View style={styles.topButtons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-social-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Scrollable Body */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Title */}
        <Text style={styles.title}>Todays Sankalp</Text>

        {/* Sankalp Text */}
        <View style={styles.sankalpBox}>
          <Text style={styles.sankalpText}>
            I will feed a being today :person, bird, animal:.
          </Text>
        </View>

        {/* Why this matters */}
        <View style={styles.sectionBlue}>
          <Text style={styles.sectionTitle}>Why this matters</Text>
          <Text style={styles.sectionLink}>
            Feeding another, like Annapūrṇā’s grace, nourishes your soul.
          </Text>
        </View>
        <View style={styles.sectionBlue}>
          <Text style={styles.sectionTitle}>Suggested practice</Text>
          <Text style={styles.sectionLink}>
            Offer fruit or grain before sunset, chanting ‘Dayā’ softly.
          </Text>
        </View>

        {/* Root + Best Times */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Root:</Text>
            <Text style={styles.value}>🌱 Dāna • Dayā</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Best Times:</Text>
            <Text style={styles.value}>☀️ Day • Evening</Text>
          </View>
        </View>

        {/* Context Tags */}
        <View style={styles.section}>
          <Text style={styles.label}>Context Tags:</Text>
          <Text style={styles.value}>🏡 home 🎁 family</Text>
        </View>
        {/* Explore Videos */}
        <ExploreVideos />
      </ScrollView>

      {/* Bottom Button */}
      <TouchableOpacity style={styles.doneButton}>
        <Text style={styles.doneButtonText}>Mark as Done</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fffaf5" },
  headerImage: { height: 220, justifyContent: "space-between" },
  imageStyle: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  topButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 40,
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
    borderRadius: 20,
  },
  body: { paddingHorizontal: 16, marginTop: 10 },
  title: {
    fontSize: 26,
    fontFamily: "GelicaMedium",
    textAlign: "center",
    marginBottom: 14,
    color: "#000",
    lineHeight: 30,
  },
  sankalpBox: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    color: "#ac7f44",
  },
  sankalpText: {
    fontSize: 15,
    fontFamily: "GelicaMedium",
    color: "#6a4c2a",
    textAlign: "center",
    lineHeight: 20,
  },
  sectionBlue: {
    backgroundColor: "#feedd8",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "GelicaMedium",
    color: "#000",
    marginBottom: 6,
    lineHeight: 20,
  },
  sectionLink: {
    fontSize: 14,
    fontFamily: "GelicaRegular",
    color: "#000",
    lineHeight: 20,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: "GelicaRegular",
    color: "#444",
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    
  },
  col: { flex: 1 },
  label: {
    fontSize: 14,
    fontFamily: "GelicaMedium",
    color: "#000",
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontFamily: "GelicaRegular",
    color: "#333",
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: "#b17741",
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: "GelicaMedium",
    color: "#fff",
  },
});
