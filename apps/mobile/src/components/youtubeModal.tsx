import React, { useMemo } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Modal from "react-native-modal";
import YoutubePlayer from "react-native-youtube-iframe"; // ✅ added
import Colors from "./Colors";

interface YoutubeModalProps {
  visible: boolean;
  onClose: () => void;
  youtubeUrl: string; // ✅ new prop
}

const YoutubeModal: React.FC<YoutubeModalProps> = ({ visible, onClose, youtubeUrl }) => {
  // ✅ Extract video ID safely
  const videoId = useMemo(() => {
    if (!youtubeUrl) return null;
    const regex = /(?:v=|\/)([0-9A-Za-z_-]{11}).*/;
    const match = youtubeUrl.match(regex);
    return match ? match[1] : null;
  }, [youtubeUrl]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      backdropOpacity={0.6}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
    >
      <View style={styles.modalContent}>
        {/* Close Button */}
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Image
            source={require("../../assets/Cross.png")}
            style={styles.closeIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* ✅ YouTube Video Player */}
        {videoId ? (
          <View style={styles.playerContainer}>
            <YoutubePlayer
              height={230}
              width={"100%"}
              play={true}
              videoId={videoId}
              onChangeState={(state) => {
                if (state === "ended") handleClose();
              }}
            />
          </View>
        ) : null}
      </View>
    </Modal>
  );
};

export default YoutubeModal;

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    width: width * 0.94,
    alignSelf: "center",
    alignItems: "center",
  },
  playerContainer: {
    width: "100%",
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  closeButton: {
    backgroundColor: Colors.Colors.App_theme,
    alignSelf: "flex-end",
    padding: 10,
    borderRadius: 18,
  },
  closeIcon: {
    width: 16,
    height: 16,
    tintColor: "#fff",
  },
});
