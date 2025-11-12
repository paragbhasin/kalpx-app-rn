import { Pressable, StyleSheet } from "react-native";
import colors from "../theme/colors"; // adjust path if needed
import TextComponent from "./TextComponent";

export default function ExperienceCard({ label, active, onPress, blurb ,icon}) {
  return (
    <Pressable
      onPress={() => onPress(label)}
      style={[styles.card, active && styles.active]}
    >
      {/* <View style={styles.row}> */}
        <TextComponent type= "headerIncreaseText" style={styles.icon}>{icon}</TextComponent>
        <TextComponent type="headerText" style={styles.title}>{label}</TextComponent>
      {/* </View> */}
      <TextComponent type="mediumText" style={styles.blurb}>{blurb}</TextComponent>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginRight: 12,
    alignItems:"center"
  },
  active: {
    borderColor: colors.primary,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
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
});
