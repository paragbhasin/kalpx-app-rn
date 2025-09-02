import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, MapPin } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import colors from "../theme/colors";



const DURATION = [
  "3 Days – Weekend Devotion",
  "7 Days – Full Experience",
  "10+ Days – Soulful Immersion",
];

export default function PoojaScreen() {
     const [pooja, setPooja] = useState("Rudrabhishek");
  const [city, setCity] = useState("");
  const [instructions, setInstructions] = useState("");
  const [poojaNotListed, setPoojaNotListed] = useState(false);
  const [mode, setMode] = useState("Online");
  const [timing, setTiming] = useState("Urgent");




 const temples = [
  { label: "Vaishno Devi Temple - Devi, Katra, Jammu & Kashmir", value: "vaishno" },
  { label: "Amarnath Cave Temple - Shiva, Pahalgam, Jammu & Kashmir", value: "amarnath" },
  { label: "Kheer Bhawani Temple - Devi, Ganderbal, Jammu & Kashmir", value: "kheer" },
  { label: "Kedarnath Temple - Shiva, Kedarnath, Uttarakhand", value: "kedarnath" },
  { label: "Badrinath Temple - Vishnu, Badrinath, Uttarakhand", value: "badrinath" },
  { label: "Gangotri Temple - Devi, Gangotri, Uttarakhand", value: "gangotri" },
  { label: "Yamunotri Temple - Devi, Yamunotri, Uttarakhand", value: "yamunotri" },
  { label: "Kashi Vishwanath Temple - Shiva, Varanasi, Uttar Pradesh", value: "kashi" },
  { label: "Ram Janmabhoomi Temple - Vishnu, Ayodhya, Uttar Pradesh", value: "ram" },
  { label: "Krishna Janmabhoomi Temple - Vishnu, Mathura, Uttar Pradesh", value: "krishna" },
  { label: "Banke Bihari Temple - Vishnu, Vrindavan, Uttar Pradesh", value: "banke" },
  { label: "Prem Mandir - Vishnu, Vrindavan, Uttar Pradesh", value: "prem" },

  // 👉 you can add the **rest of your big list** here
];
const poojas = [
  { label: "Rudrabhishek", value: "rudrabhishek" },
  { label: "Maha Mrityunjaya Jaap", value: "mahamrityunjaya" },
  { label: "Shiva Lingam Abhishek", value: "shivlingam" },
  { label: "Panchamrit Abhishek", value: "panchamrit" },
  { label: "Kailash Yatra Pooja", value: "kailash" },
  { label: "Chandi Path", value: "chandi" },
  { label: "Devi Mahatmyam", value: "mahatmyam" },
  { label: "Kumari Pooja", value: "kumari_pooja" },
  { label: "Kamakhya Tantra Puja", value: "kamakhya" },
  { label: "Vaishno Devi Aarti", value: "vaishno_aarti" },
];
  const navigation = useNavigation();
  const [selectedTemple, setSelectedTemple] = useState(null);
    const [selectedPooja, setSelectedPooja] = useState(null);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.pageBg }}>
      {/* Header */}

      <View style={{ position: "relative", width: "100%", height: 300 }}>
        <Image
          source={require("../../assets/poojafl.png")}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        <View style={{ position: "absolute", top: 16, left: 16 }}>
          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate("HomePage")}>
            <ChevronLeft size={20} color={colors.primaryDark} />
          </Pressable>
        </View>
        <View style={{ position: "absolute", bottom: 16, left: 16 }}>
          <Text style={styles.headerTitle}>Temple Pooja</Text>
          <View style={styles.locationBadge}>
            <MapPin size={14} color={colors.subtext} />
            <Text style={styles.locationText}>Hyderabad</Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <View style={{ padding: 16 }}>
      <Text style={styles.title}>Book a Pooja</Text>

      <Text style={styles.label}>Select Temple and Pooja</Text>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        data={temples}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Select a Temple"
        searchPlaceholder="Search temples..."
        value={selectedTemple}
        onChange={(item) => setSelectedTemple(item.value)}
      />
       <Text style={styles.label}>Select Pooja</Text>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        data={poojas}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Select a Pooja"
        searchPlaceholder="Search poojas..."
        value={selectedPooja}
        onChange={(item) => setSelectedPooja(item.value)}
      />

    

      {/* Pooja Not Listed */}
      <Pressable
        style={styles.checkboxRow}
        onPress={() => setPoojaNotListed(!poojaNotListed)}
      >
        <View style={[styles.checkbox, poojaNotListed && styles.checkedBox]} />
        <Text style={styles.checkboxText}>
          Pooja not listed - mention in additional instructions
        </Text>
      </Pressable>

      {/* City */}
      <Text style={styles.label}>Pick your city</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your city"
        value={city}
        onChangeText={setCity}
      />

      {/* Participation Mode */}
      <Text style={styles.label}>Participation Mode</Text>
      <View style={styles.row}>
        {["Online", "In-Person"].map((item) => (
          <Pressable
            key={item}
            style={[
              styles.option,
              mode === item && styles.optionSelected,
            ]}
            onPress={() => setMode(item)}
          >
            <Text
              style={[
                styles.optionText,
                mode === item && styles.optionTextSelected,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Timing Preference */}
      <Text style={styles.label}>Timing Preference</Text>
      <View style={styles.row}>
        {["Urgent (Next 7 Days)", "Flexible (Next 30 Days)"].map((item) => (
          <Pressable
            key={item}
            style={[
              styles.option,
              timing === item && styles.optionSelected,
            ]}
            onPress={() => setTiming(item)}
          >
            <Text
              style={[
                styles.optionText,
                timing === item && styles.optionTextSelected,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Additional Instructions */}
      <Text style={styles.label}>Additional Instructions (Required)</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Please provide any special instructions..."
        multiline
        numberOfLines={4}
        value={instructions}
        onChangeText={setInstructions}
      />
</View>
      {/* Submit Button */}
      <Pressable style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Take the Next Step</Text>
      </Pressable>
    </ScrollView>
  );
}




const styles = StyleSheet.create({
  dropdown: {
    height: 55,
    borderColor: colors.border,  // purple border
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F9F9FF", // light bg
    marginBottom: 16,
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    fontFamily: "GelicaRegular",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#333",
    // fontWeight: "600",
    fontFamily: "GelicaMedium",
  },
  inputSearchStyle: {
    fontSize: 14,
    color: "#000",
    borderRadius: 8,
    borderColor: "color.border",
    borderWidth: 1,
    paddingHorizontal: 8,
    fontFamily: "GelicaRegular",
  },
  iconStyle: {
    width: 24,
    height: 24,
    tintColor: "#6C63FF", // changes dropdown arrow color
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.chipBg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    // fontWeight: "800",
    color: colors.bg,
    textShadowColor: "#000",
    textShadowRadius: 6,
    fontFamily: "GelicaBold",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    elevation: 2,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    fontFamily: "GelicaMedium",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  sectionSubtext: { color: colors.subtext, marginBottom: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    marginLeft: 4,
  },
  durationBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 8,
  },
  durationBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  durationText: { fontSize: 14, color: colors.text },
  note: { fontSize: 12, color: colors.subtext },
  textarea: {
    width: "100%",
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    textAlignVertical: "top",
    backgroundColor: colors.card,
    color: colors.text,
  },
  cta: {
    width: "100%",
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  ctaText: { color: colors.bg, fontWeight: "700", fontSize: 16 },
  container: { flex: 1, padding: 16, backgroundColor: "#FFF8EF" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  headerText: { fontSize: 18, fontWeight: "600", marginLeft: 8, fontFamily: "GelicaMedium" },
  topImage: { width: "100%", height: 200, borderRadius: 8, marginBottom: 16 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 16,
    fontFamily: "GelicaBold",
  },
  label: {
    fontSize: 16,
    // fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    fontFamily: "GelicaMedium",
  },


  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontFamily: "GelicaRegular",
  },
  textarea: { height: 100, textAlignVertical: "top" },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#aaa",
    marginRight: 8,
    borderRadius: 4,
  },
  checkedBox: { backgroundColor: "#444" },
  checkboxText: { flex: 1, fontFamily: "GelicaRegular" },
  row: { flexDirection: "row", marginBottom: 12 },
  option: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    marginRight: 8,
    alignItems: "center",
  },
  optionSelected: { backgroundColor: "color.chipBg",  },
  optionText: { color: "#333", fontFamily: "GelicaRegular" },
  optionTextSelected: { color: "#fff", fontFamily: "GelicaRegular" },
  submitButton: {
    backgroundColor: "#9C6B2F",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: { color: "#fff", fontWeight: "600", fontFamily: "GelicaMedium" },
});
