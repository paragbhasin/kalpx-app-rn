import React from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";

const UserAgreements = ({ onScroll }: { onScroll?: (event: any) => void }) => {
  const { t } = useTranslation();
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 40, paddingTop: 80 }}
    >
      <View style={styles.contentWrapper}>
        {/* LEFT CONTENT */}
        <View style={styles.leftContent}>
          <Text style={styles.mainHeading}>{t("community.agreements.title")}</Text>

          <View style={styles.section}>
            <Text style={styles.title}>{t("community.agreements.section1.title")}</Text>
            <Text style={styles.text}>
              {t("community.agreements.section1.text")}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>{t("community.agreements.section2.title")}</Text>
            <Text style={styles.text}>
              {t("community.agreements.section2.text")}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>{t("community.agreements.section3.title")}</Text>
            <Text style={styles.text}>
              {t("community.agreements.section3.text")}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>{t("community.agreements.section4.title")}</Text>
            <Text style={styles.text}>
              {t("community.agreements.section4.text")}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>{t("community.agreements.section5.title")}</Text>
            <Text style={styles.text}>
              {t("community.agreements.section5.text")}
            </Text>
          </View>
        </View>

        {/* RIGHT IMAGE (shown at bottom in mobile) */}
        <View style={styles.imageWrapper}>
          <Image
            source={require("../../../assets/user-agreement.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default UserAgreements;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  contentWrapper: {
    padding: 20,
  },
  leftContent: {
    flex: 1,
  },
  mainHeading: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1b",
    marginBottom: 24,
    fontFamily: "Piazzolla",
  },
  section: {
    marginBottom: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1a1a1b",
    fontFamily: "Piazzolla",
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4a4a4a",
    fontFamily: "Inter",
  },
  imageWrapper: {
    marginTop: 40,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 220,
  },
});