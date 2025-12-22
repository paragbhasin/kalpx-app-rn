import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import TextComponent from "./TextComponent";

export default function ConfirmDiscardModal({
  visible,
  onCancel,
  onViewCart,
  onLeave,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            backgroundColor: "#FFF",
            borderRadius: 12,
            padding: 22,
          }}
        >
          <TextComponent
            type="headerBoldText"
            style={{ textAlign: "center", marginBottom: 10 }}
          >
            Unsaved Practices
          </TextComponent>

          <TextComponent style={{ textAlign: "center", marginBottom: 25 }}>
            Are you sure you want to leave this page without submitting your
            practices?
          </TextComponent>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                padding: 12,
                borderWidth: 1,
                borderColor: "#D4A017",
                borderRadius: 8,
                marginRight: 8,
                alignItems: "center",
              }}
              onPress={onViewCart}
            >
              <TextComponent style={{ color: "#D4A017" }}>
                View Cart
              </TextComponent>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                padding: 12,
                backgroundColor: "#D4A017",
                borderRadius: 8,
                marginLeft: 8,
                alignItems: "center",
              }}
              onPress={onLeave}
            >
              <TextComponent style={{ color: "#FFF" }}>
                Leave
              </TextComponent>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
