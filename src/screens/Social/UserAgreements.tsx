import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";

const UserAgreements = ({ onScroll }: { onScroll?: (event: any) => void }) => {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 40, paddingTop: 110 }}
    >
      <View style={styles.contentWrapper}>
        {/* LEFT CONTENT */}
        <View style={styles.leftContent}>
          <Text style={styles.mainHeading}>User Agreements</Text>

          <View style={styles.section}>
            <Text style={styles.title}>1. Acceptance of Terms</Text>
            <Text style={styles.text}>
              By accessing and using KalpX, you agree to abide by our specific
              Terms of Service and Community Rules. Participation in this
              platform implies a commitment to the Dharmic values we uphold.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>2. Content Ownership & License</Text>
            <Text style={styles.text}>
              You retain ownership of the content you post on KalpX. However, by
              posting, you grant KalpX a non-exclusive, royalty-free license to
              display, distribute, and promote your content within the platform
              and its related services.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>3. Moderation & Adharmic Content</Text>
            <Text style={styles.text}>
              KalpX reserves the right to review and remove any content that
              violates our Community Rules or is deemed Adharmic (against the
              principles of righteousness and truth). We strive to maintain a
              pure and positive environment.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>4. Termination</Text>
            <Text style={styles.text}>
              We reserve the right to suspend or terminate accounts that
              repeatedly violate these agreements or engage in harmful behavior.
              This is to protect the sanctity of the community.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>5. Changes to Agreements</Text>
            <Text style={styles.text}>
              These agreements may be updated to reflect the evolving needs of
              our growing spiritual community. Continued use of the platform
              after changes implies acceptance of the new terms.
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