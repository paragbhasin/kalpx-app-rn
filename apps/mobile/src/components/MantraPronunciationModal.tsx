import React from "react";
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import Modal from "react-native-modal";
import TextComponent from "./TextComponent";

const DEVICE_WIDTH = Dimensions.get("window").width;

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  iast: string;
}

const MantraPronunciationModal: React.FC<Props> = ({
  visible,
  onClose,
  title,
  iast,
}) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.6}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
    >
      <View style={styles.modalContainer}>
        <ImageBackground
          source={require("../../assets/mantraBG.png")}
          style={styles.bgImage}
          imageStyle={styles.bgImageStyle}
        >
          {/* CLOSE BUTTON */}
          {/* <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Image
              source={require("../../assets/Cross.png")}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity> */}

          {/* TITLE */}
          <TextComponent type="DailyboldText" style={styles.title}>
            {title}
          </TextComponent>

          {/* SCROLLABLE IAST TEXT */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollArea}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <TextComponent type="headerSubBoldText" style={styles.iastText}>
              {iast}
            </TextComponent>
          </ScrollView>
        </ImageBackground>
      </View>
    </Modal>
  );
};

export default MantraPronunciationModal;

/* =======================================================
                        STYLES BELOW
========================================================= */

const styles = StyleSheet.create({
  modalContainer: {
    width: DEVICE_WIDTH*0.98,  // ⭐ 95% of device width
    alignSelf: "center",
    backgroundColor: "transparent",
  },

  bgImage: {
    width: DEVICE_WIDTH*0.98,
    paddingVertical: 30,
    paddingHorizontal: 18,
    position: "relative", // ⭐ Needed so absolute X stays inside parchment
  },

  bgImageStyle: {
    resizeMode: "stretch",
    borderRadius: 12,
  },

  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 6,
    zIndex: 999,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
  },

  title: {
    color: "#A94D01",
    textAlign: "center",
    marginTop: 38,   // ⭐ Push title below cross
    marginBottom: 10,
    textDecorationLine:"underline"
  },

  scrollArea: {
    maxHeight: 400, // ⭐ Supports tall mantras with internal scrolling
    marginTop: 10,
  },

  iastText: {
    color: "#A94D01",
    textAlign: "center",
    // lineHeight: 26,
    paddingHorizontal: 50,
  },
});
