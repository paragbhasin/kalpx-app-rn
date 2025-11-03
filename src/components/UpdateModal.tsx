// components/UpdateModal.js
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const UpdateModal = ({ visible, onUpdateNow, onLater }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>New Update Available!</Text>
          <Text style={styles.message}>
            Please update to the latest version for the best experience.
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.updateButton} onPress={onUpdateNow}>
              <Text style={styles.buttonText}>Update Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterButton} onPress={onLater}>
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default UpdateModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  container: { backgroundColor: "white", borderRadius: 10, padding: 20, width: "80%" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  message: { fontSize: 16, color: "#555", marginBottom: 20 },
  buttons: { flexDirection: "row", justifyContent: "space-between" },
  updateButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 5, flex: 1, marginRight: 10 },
  laterButton: { padding: 10, borderRadius: 5, flex: 1, borderWidth: 1, borderColor: "#ccc" },
  buttonText: { color: "white", textAlign: "center", fontWeight: "600" },
  laterText: { color: "#555", textAlign: "center" },
});
