import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import Modal from "react-native-modal";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

interface Practice {
  practice_id: string;
  name: string;
  description: string;
  icon: string;
}

interface PracticeDailyModalProps {
  visible: boolean;
  date: string;
  dailyPractice: {
    active_practices: Practice[];
    completed_today: string[];
  };
  onClose: () => void;
}

const PracticeDailyModal: React.FC<PracticeDailyModalProps> = ({ visible, date, dailyPractice, onClose }) => {
  const { active_practices, completed_today } = dailyPractice;

  // Completed practices
  const completed = active_practices.filter(p => completed_today.includes(p.practice_id));

  // Not done practices
  const notDone = active_practices.filter(p => !completed_today.includes(p.practice_id));

  const renderPracticeItem = (item: Practice) => (
    <View style={styles.itemContainer}>
        <View style={{width:10,height:10,borderRadius:8,backgroundColor:Colors.Colors.App_theme}}/>
        <TextComponent type='cardText' style={styles.name}>{item.name}</TextComponent>

      {/* <TextComponent style={styles.icon}>{item.icon}</TextComponent>
      <View style={styles.textContainer}>
        <TextComponent type='cardText' style={styles.name}>{item.name}</TextComponent>
        <TextComponent type='cardText' style={styles.description}>{item.description}</TextComponent>
      </View> */}
    </View>
  );

  return (
    <Modal
      isVisible={visible}
      backdropOpacity={0.6}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
    >
      <View style={styles.modalContent}>
        <TextComponent type='boldText' style={styles.title}>Practice Status for {date}</TextComponent>

        {completed.length > 0 && (
          <>
            <TextComponent type='cardText' style={styles.subTitle}>Completed Practices : </TextComponent>
            <FlatList
              data={completed}
              keyExtractor={(item) => item.practice_id}
              renderItem={({ item }) => renderPracticeItem(item)}
              scrollEnabled={false}
            />
          </>
        )}

        {notDone.length > 0 && (
          <>
            <TextComponent type='cardText' style={styles.subTitle}>Not Done Practices : </TextComponent>
            <FlatList
              data={notDone}
              keyExtractor={(item) => item.practice_id}
              renderItem={({ item }) => renderPracticeItem(item)}
              scrollEnabled={false}
            />
          </>
        )}

        <Pressable style={styles.closeBtn} onPress={onClose}>
          <TextComponent type='cardText' style={styles.closeBtnText}>Close</TextComponent>
        </Pressable>
      </View>
    </Modal>
  );
};

export default PracticeDailyModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  title: {
    alignSelf: "center",
    marginVertical: 6,
    color:Colors.Colors.BLACK,
    fontSize:16
  },
  subTitle: {
    alignSelf: "flex-start",
    marginTop: 10,
    fontSize:16
  },
  itemContainer: {
    flexDirection: "row",
    alignSelf:"flex-start",
    paddingVertical: 6,
    alignItems:"center",
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    marginLeft:12
  },
  description: {
    color: "#555",
  },
  closeBtn: {
    width: "100%",
    backgroundColor: Colors.Colors.App_theme,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderColor: "#FAD38C",
    borderWidth: 1,
    alignItems: "center",
    marginTop: 20,
  },
  closeBtnText: {
    color: Colors.Colors.white,
  },
});
