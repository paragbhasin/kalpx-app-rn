<<<<<<< HEAD
import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors"; // adjust path if needed

export default function ExperienceCard({ label, active, onPress, blurb }) {
=======
import { Pressable, StyleSheet } from "react-native";
import colors from "../theme/colors"; // adjust path if needed
import TextComponent from "./TextComponent";

export default function ExperienceCard({ label, active, onPress, blurb ,icon}) {
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  return (
    <Pressable
      onPress={() => onPress(label)}
      style={[styles.card, active && styles.active]}
    >
<<<<<<< HEAD
      <View style={styles.row}>
        <Text style={styles.icon}>💎</Text>
        <Text style={styles.title}>{label}</Text>
      </View>
      <Text style={styles.blurb}>{blurb}</Text>
=======
      {/* <View style={styles.row}> */}
        <TextComponent type= "headerIncreaseText" style={styles.icon}>{icon}</TextComponent>
        <TextComponent type="headerText" style={styles.title}>{label}</TextComponent>
      {/* </View> */}
      <TextComponent type="mediumText" style={styles.blurb}>{blurb}</TextComponent>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
<<<<<<< HEAD
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginRight: 12,
=======
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginRight: 12,
    alignItems:"center"
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  },
  active: {
    borderColor: colors.primary,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
<<<<<<< HEAD
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  icon: { fontSize: 14 },
  title: { fontSize: 14,  color: colors.text, marginLeft: 6 },
  blurb: { fontSize: 12, color: colors.subtext, lineHeight: 16 },
=======
  row: { flexDirection: "row", alignItems: "center", marginBottom:4},
  icon: { 
    // fontSize: 18,
    alignSelf: 'center' },
  title: { 
    // fontSize: 16,fontWeight:"500",  
    color: colors.text},
  blurb: {alignSelf:"center", marginTop:12,
    // fontSize: 14,fontWeight:"400", 
    color: colors.subtext },
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
});
