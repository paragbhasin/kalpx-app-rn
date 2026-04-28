import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
} from "react-native";
import { Fonts } from "../theme/fonts";
import MantraLotus3d from "../../assets/mantra-lotus-3d.svg";

const { width } = Dimensions.get("window");

interface KalpxModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  buttonLabel?: string;
}

const KalpxModal: React.FC<KalpxModalProps> = ({
  visible,
  title,
  message,
  onClose,
  buttonLabel = "OK",
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <View style={styles.lotusHeader}>
             <MantraLotus3d width={60} height={60} />
          </View>
          
          {!!title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(67, 33, 4, 0.4)", // Dark brown tint overlay
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: width * 0.85,
    backgroundColor: "#FAF9F6", // Off-white/Beige
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(232, 197, 135, 0.5)",
    shadowColor: "#432104",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  lotusHeader: {
    marginBottom: 16,
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#432104",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#615247",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 24,
  },
  button: {
    width: "100%",
    backgroundColor: "#CA8A04",
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#CA8A04",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: "#FFF",
    letterSpacing: 1,
  },
});

export default KalpxModal;
