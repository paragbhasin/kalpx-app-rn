import { useNavigation } from "@react-navigation/native";
import { MapPin, X } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";

export default function PoojaScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const temples = [
    { label: "Vaishno Devi Temple - Devi, Katra, Jammu & Kashmir", value: "vaishno" },
    { label: "Amarnath Cave Temple - Shiva, Pahalgam, Jammu & Kashmir", value: "amarnath" },
    { label: "Kheer Bhawani Temple - Devi, Ganderbal, Jammu & Kashmir", value: "kheer" },
    { label: "Kedarnath Temple - Shiva, Kedarnath, Uttarakhand", value: "kedarnath" },
    { label: "Badrinath Temple - Vishnu, Badrinath, Uttarakhand", value: "badrinath" },
  ];

  const poojas = [
    { label: "Rudrabhishek", value: "rudrabhishek" },
    { label: "Maha Mrityunjaya Jaap", value: "mahamrityunjaya" },
    { label: "Shiva Lingam Abhishek", value: "shivlingam" },
    { label: "Chandi Path", value: "chandi" },
    { label: "Vaishno Devi Aarti", value: "vaishno_aarti" },
  ];

  const [selectedTemple, setSelectedTemple] = useState(null);
  const [selectedPooja, setSelectedPooja] = useState(null);
  const [templeModalVisible, setTempleModalVisible] = useState(false);
  const [poojaModalVisible, setPoojaModalVisible] = useState(false);

  const [city, setCity] = useState("");
  const [instructions, setInstructions] = useState("");
  const [poojaNotListed, setPoojaNotListed] = useState(false);
  const [mode, setMode] = useState("Online");
  const [timing, setTiming] = useState("Urgent");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header Banner */}
      <ImageBackground
        source={require("../../assets/poojafl.png")}
        style={styles.headerImage}
        imageStyle={styles.imageStyle}
      >
        <Pressable
          style={styles.iconButton}
          onPress={() => navigation.navigate("HomePage")}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerBottom}>
          <Text style={styles.headerTitle}>{t("pooja.header")}</Text>
          <View style={styles.locationBadge}>
            <MapPin size={14} color="#444" />
            <Text style={styles.locationText}>{t("pooja.location")}</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Scrollable Body */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t("pooja.bookPooja")}</Text>

        {/* Temple Picker */}
        <Text style={styles.label}>{t("pooja.selectTemple")}</Text>
        <Pressable style={styles.selector} onPress={() => setTempleModalVisible(true)}>
          <Text style={styles.selectorText}>
            {selectedTemple
              ? temples.find((t) => t.value === selectedTemple)?.label
              : t("pooja.chooseTemple")}
          </Text>
        </Pressable>

        {/* Pooja Picker */}
        <Text style={styles.label}>{t("pooja.selectPooja")}</Text>
        <Pressable style={styles.selector} onPress={() => setPoojaModalVisible(true)}>
          <Text style={styles.selectorText}>
            {selectedPooja
              ? poojas.find((p) => p.value === selectedPooja)?.label
              : t("pooja.choosePooja")}
          </Text>
        </Pressable>

        {/* Pooja Not Listed */}
        <Pressable
          style={styles.checkboxRow}
          onPress={() => setPoojaNotListed(!poojaNotListed)}
        >
          <View style={[styles.checkbox, poojaNotListed && styles.checkedBox]} />
          <Text style={styles.checkboxText}>{t("pooja.poojaNotListed")}</Text>
        </Pressable>

        {/* City */}
        <Text style={styles.label}>{t("pooja.city")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("pooja.enterCity")}
          value={city}
          onChangeText={setCity}
        />

        {/* Participation Mode */}
        <Text style={styles.label}>{t("pooja.participationMode")}</Text>
        <View style={styles.row}>
          {[t("pooja.online", "Online"), t("pooja.inperson", "In-Person")].map((item) => (
            <Pressable
              key={item}
              style={[styles.option, mode === item && styles.optionSelected]}
              onPress={() => setMode(item)}
            >
              <Text
                style={[styles.optionText, mode === item && styles.optionTextSelected]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Timing Preference */}
        <Text style={styles.label}>{t("pooja.timingPreference")}</Text>
        <View style={styles.row}>
          {[t("pooja.urgent"), t("pooja.flexible")].map((item) => (
            <Pressable
              key={item}
              style={[styles.option, timing === item && styles.optionSelected]}
              onPress={() => setTiming(item)}
            >
              <Text
                style={[styles.optionText, timing === item && styles.optionTextSelected]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Additional Instructions */}
        <Text style={styles.label}>{t("pooja.instructions")}</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder={t("pooja.instructionsPlaceholder")}
          multiline
          numberOfLines={4}
          value={instructions}
          onChangeText={setInstructions}
        />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.footer}>
        <Pressable style={styles.submitButton}>
          <Text style={styles.submitButtonText}>{t("pooja.submit")}</Text>
        </Pressable>
      </View>

      {/* Temple Modal */}
      <Modal
        visible={templeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTempleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("pooja.templeModalTitle")}</Text>
              <Pressable onPress={() => setTempleModalVisible(false)}>
                <X size={20} color="#333" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {temples.map((t) => (
                <Pressable
                  key={t.value}
                  style={styles.radioRow}
                  onPress={() => {
                    setSelectedTemple(t.value);
                    setTempleModalVisible(false);
                  }}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedTemple === t.value && styles.radioSelected,
                    ]}
                  />
                  <Text style={styles.radioText}>{t.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Pooja Modal */}
      <Modal
        visible={poojaModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPoojaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("pooja.poojaModalTitle")}</Text>
              <Pressable onPress={() => setPoojaModalVisible(false)}>
                <X size={20} color="#333" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {poojas.map((p) => (
                <Pressable
                  key={p.value}
                  style={styles.radioRow}
                  onPress={() => {
                    setSelectedPooja(p.value);
                    setPoojaModalVisible(false);
                  }}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedPooja === p.value && styles.radioSelected,
                    ]}
                  />
                  <Text style={styles.radioText}>{p.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerImage: { width: "100%", height: 260, justifyContent: "space-between" },
  imageStyle: { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  iconButton: {
    marginTop: 40,
    marginLeft: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBottom: { padding: 16 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#fff" },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  locationText: { marginLeft: 4, fontSize: 12, fontWeight: "700", color: "#333" },

  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  selector: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  selectorText: { fontSize: 16, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
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
  checkboxText: { flex: 1 },
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
  optionSelected: { backgroundColor: "#9C6B2F" },
  optionText: { color: "#333" },
  optionTextSelected: { color: "#fff" },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  submitButton: {
    backgroundColor: "#9C6B2F",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  radioRow: { flexDirection: "row", alignItems: "center", padding: 16 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#999",
    marginRight: 12,
  },
  radioSelected: { backgroundColor: "#9C6B2F", borderColor: "#9C6B2F" },
  radioText: { fontSize: 16, color: "#333" },
});
