import moment from "moment";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

interface ClassDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  details: {
    className: string;
    status: string;
    start: string;
    end: string;
    price: string;
    trial: string;
    groupSize: string;
    note: string;
  };
}

const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({
  visible,
  details,
  onClose,
}) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose} // ❌ disable closing on backdrop
      onBackButtonPress={onClose} // ❌ disable Android back button
      backdropOpacity={0.6}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
    >
      <View style={styles.modalContent}>
        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            backgroundColor: Colors.Colors.App_theme,
            alignSelf: "flex-end",
            padding: 10,
            borderRadius: 18,
          }}
        >
          <Image
            source={require("../../assets/Cross.png")}
            style={styles.closeIcon}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Details Rows */}
        <View style={styles.row}>
          <TextComponent type="semiBoldText" style={styles.label}>
            Class
          </TextComponent>
          <TextComponent type="semiBoldText" style={styles.value}>
            {details.className}
          </TextComponent>
        </View>

        <View style={styles.row}>
          <TextComponent type="semiBoldText" style={styles.label}>
            Status
          </TextComponent>
          <TextComponent type="semiBoldText" style={styles.value}>
            {details.status}
          </TextComponent>
        </View>

        <View style={styles.row}>
          <TextComponent type="semiBoldText" style={styles.label}>
            Start
          </TextComponent>
          <TextComponent type="semiBoldText" style={styles.value}>
            {moment(details.start).format("MMM DD, YYYY h:mm a")}
          </TextComponent>
        </View>

        <View style={styles.row}>
          <TextComponent type="semiBoldText" style={styles.label}>
            End
          </TextComponent>
          <TextComponent type="semiBoldText" style={styles.value}>
            {moment(details.end).format("MMM DD, YYYY h:mm a")}
          </TextComponent>
        </View>

        <View style={styles.row}>
          <TextComponent type="semiBoldText" style={styles.label}>
            Price
          </TextComponent>
          <TextComponent type="semiBoldText" style={styles.value}>
            {details.price}
          </TextComponent>
        </View>

        <View style={styles.row}>
          <TextComponent type="semiBoldText" style={styles.label}>
            Trial
          </TextComponent>
          <TextComponent type="semiBoldText" style={styles.value}>
            {details.trial}
          </TextComponent>
        </View>

        <View style={styles.row}>
          <TextComponent type="semiBoldText" style={styles.label}>
            Group Size
          </TextComponent>
          <TextComponent type="semiBoldText" style={styles.value}>
            {details.groupSize}
          </TextComponent>
        </View>

        <View style={styles.row}>
          <TextComponent type="semiBoldText" style={styles.label}>
            Note
          </TextComponent>
          <TextComponent type="semiBoldText" style={styles.value}>
            {details.note}
          </TextComponent>
        </View>
      </View>
    </Modal>
  );
};

export default ClassDetailsModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    alignSelf: "center",
  },
  closeIcon: {
    // width: 30,
    // height: 30,
    // alignSelf: "flex-end",
    // marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginVertical: 6,
  },
  label: {
    color: Colors.Colors.Light_black,
    width: 100, // ✅ fixed width for alignment
  },
  value: {
    color: Colors.Colors.Light_black,
    flex: 1,
  },
});
