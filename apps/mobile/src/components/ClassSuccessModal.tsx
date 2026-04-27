import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import Modal from "react-native-modal";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

interface SuccessModalProps {
  visible: boolean;
  title?: string;
  subTitle?: string;
  onClose: () => void;
}

const ClassSuccessModal: React.FC<SuccessModalProps> = ({ visible, title, subTitle, onClose }) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={() => {}} 
      onBackButtonPress={() => {}}
      backdropOpacity={0.6}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
    >
      <View style={styles.modalContent}>
        <View style={{backgroundColor:Colors.Colors.App_theme,padding:6,borderRadius:25}}>
             <Image
                    source={require("../../assets/Tick.png")}
                    style={{ width: 20, height: 20, resizeMode: "contain" }}
                  />
        </View>
        <TextComponent type='cardText' style={styles.title}>{title}</TextComponent>
        {subTitle ? <TextComponent type='mediumText' style={styles.subTitle}>{subTitle}</TextComponent> : null}

        <Pressable style={styles.closeBtn} onPress={onClose}>
          <TextComponent type='cardText' style={styles.closeBtnText}>Done</TextComponent>
        </Pressable>
      </View>
    </Modal>
  );
};

export default ClassSuccessModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  title: {
    alignSelf:"center",
    marginVertical: 6,
  },
  subTitle: {
    alignSelf:"center",
    marginVertical: 6,
    textAlign:"center"
  },
  closeBtn: {
    width: "100%",
    backgroundColor: Colors.Colors.App_theme,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderColor:"#FAD38C",
    borderWidth:1,
    alignItems:"center",
    marginTop:20
  },
  closeBtnText: {
    color: Colors.Colors.white,
  },
});
