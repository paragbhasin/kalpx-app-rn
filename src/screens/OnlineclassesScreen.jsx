import CheckBox from "@react-native-community/checkbox";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, MapPin } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import colors from "../theme/colors";



export default function OnlineclassesScreen() {
 const [selectedClasses, setSelectedClasses] = useState({
    yoga: false,
    dance: false,
    music: false,
  });

  const [classFormat, setClassFormat] = useState([]);
  const [experience, setExperience] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [city, setCity] = useState("");
  const [preferredTimes, setPreferredTimes] = useState([]);
  const [spiritualGoal, setSpiritualGoal] = useState("");

  const toggleSelection = (array, value) => {
    if (array.includes(value)) {
      return array.filter((item) => item !== value);
    } else {
      return [...array, value];
    }
  };

  const navigation = useNavigation();

  return (
      <ScrollView style={styles.container}>
              {/* Header */}
      <View style={{ position: "relative", width: "100%", height: 300 }}>
        <Image
          source={require("../../assets/onlineclass.png")}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        <View style={{ position: "absolute", top: 16, left: 16 }}>
          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate("HomePage")}>
            <ChevronLeft size={20} color={colors.primaryDark} />
          </Pressable>
        </View>
        <View style={{ position: "absolute", bottom: 16, left: 16 }}>
          <Text style={styles.headerTitle}>Online Classes</Text>
          <View style={styles.locationBadge}>
            <MapPin size={14} color={colors.subtext} />
            <Text style={styles.locationText}>Hyderabad</Text>
          </View>
        </View>
      </View>
      
      {/* Class Type */}
      <Text style={styles.sectionTitle}>Choose Your Classes</Text>
      <View style={styles.checkboxGroup}>
        <View style={styles.checkboxRow}>
          <CheckBox
            value={selectedClasses.yoga}
            onValueChange={(val) => setSelectedClasses({ ...selectedClasses, yoga: val })}
          />
          <Text style={styles.label}>Yoga</Text>
        </View>
        <View style={styles.checkboxRow}>
          <CheckBox
            value={selectedClasses.dance}
            onValueChange={(val) => setSelectedClasses({ ...selectedClasses, dance: val })}
          />
          <Text style={styles.label}>Indian Classical Dance</Text>
        </View>
        <View style={styles.checkboxRow}>
          <CheckBox
            value={selectedClasses.music}
            onValueChange={(val) => setSelectedClasses({ ...selectedClasses, music: val })}
          />
          <Text style={styles.label}>Indian Classical Music</Text>
        </View>
      </View>

      {/* Class Format */}
      <Text style={styles.sectionTitle}>What Kind of Class Format Do You Prefer?</Text>
      <View style={styles.buttonGroup}>
        {["One-on-One", "Small Group 2-6 people", "Larger Interactive Session", "Prerecorded", "Live Q&A"].map((format) => (
          <TouchableOpacity
            key={format}
            style={[
              styles.optionButton,
              classFormat.includes(format) && styles.selectedButton,
            ]}
            onPress={() => setClassFormat(toggleSelection(classFormat, format))}
          >
            <Text>{format}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Experience */}
      <Text style={styles.sectionTitle}>What Is Your Experience Level?</Text>
      <View style={styles.buttonGroup}>
        {[
          { label: "Beginner", value: "beginner" },
          { label: "Intermediate", value: "intermediate" },
          { label: "Advanced", value: "advanced" },
        ].map((exp) => (
          <TouchableOpacity
            key={exp.value}
            style={[styles.optionButton, experience === exp.value && styles.selectedButton]}
            onPress={() => setExperience(exp.value)}
          >
            <Text>{exp.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Age Group */}
      <Text style={styles.sectionTitle}>What Is Your Age Group? (Optional)</Text>
      <View style={styles.buttonGroup}>
        {["Child under 12", "Teen 13 to 17", "Adult 18 to 59", "Senior 60+"].map((group) => (
          <TouchableOpacity
            key={group}
            style={[styles.optionButton, ageGroup === group && styles.selectedButton]}
            onPress={() => setAgeGroup(group)}
          >
            <Text>{group}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* City */}
      <TextInput
        placeholder="Pick your city"
        style={styles.input}
        value={city}
        onChangeText={setCity}
      />

      {/* Time Preference */}
      <Text style={styles.sectionTitle}>Time you will prefer as per your location</Text>
      <View style={styles.buttonGroup}>
        {["Early Morning 5am-8am", "Morning 8am-12pm", "Afternoon 12pm-4pm", "Evening 4pm-8pm", "Night 9pm-10pm"].map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.optionButton,
              preferredTimes.includes(time) && styles.selectedButton,
            ]}
            onPress={() => setPreferredTimes(toggleSelection(preferredTimes, time))}
          >
            <Text>{time}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Spiritual Goal */}
      <Text style={styles.sectionTitle}>What Are You Spiritually Seeking Through These Classes?</Text>
      <TextInput
        placeholder="Type your answer"
        style={[styles.input, { height: 80 }]}
        value={spiritualGoal}
        onChangeText={setSpiritualGoal}
        multiline
      />

      {/* Submit */}
      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitText}>Take the Next Step</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}



  const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  checkboxGroup: {
    marginBottom: 15,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  label: {
    marginLeft: 8,
    fontSize: 15,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  optionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 20,
    margin: 5,
  },
  selectedButton: {
    backgroundColor: "#d4c2a6",
    borderColor: "#7a5a3a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#a67c52",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 30,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

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
    fontWeight: "600",
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
    fontWeight: "800",
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
    fontWeight: "600",
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
