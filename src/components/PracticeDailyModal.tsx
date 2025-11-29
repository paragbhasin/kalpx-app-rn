import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Modal from "react-native-modal";
import { getTranslatedPractice } from "../utils/getTranslatedPractice";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

interface Practice {
  id?: string;
  practice_id?: string;
  name: string;
  icon: string;
  source?: string;
  details?: any;
}

interface PracticeDailyModalProps {
  visible: boolean;
  date: string;
  dailyPractice: {
    active_practices: Practice[];
    completed_today: any[]; // array of objects from API
    status: string;
  };
  onClose: () => void;
}

const PracticeDailyModal: React.FC<PracticeDailyModalProps> = ({
  visible,
  date,
  dailyPractice,
  onClose,
}) => {

  console.log("Daily Practice Modal Data:", JSON.stringify(dailyPractice));

  const { active_practices, completed_today } = dailyPractice;
  const { t } = useTranslation();

  /**
   * FIXED:
   * completed_today from API = Array of OBJECTS
   * We must extract IDs before comparing
   */
  const completedIds = completed_today.map((item: any) => item.id);

  // Completed list
  const completed = active_practices.filter((p: any) => {
    const pid = p.id || p.practice_id;
    return completedIds.includes(pid);
  });

  // Not done list
  const notDone = active_practices.filter((p: any) => {
    const pid = p.id || p.practice_id;
    return !completedIds.includes(pid);
  });

  // Render item
  const renderPracticeItem = (item: Practice) => {
    let displayName = "";

    if (item.source === "custom") {
      displayName = item.name?.trim() || "Custom Practice";
    } else {
      const translated = getTranslatedPractice(item.details || item, t);
      displayName = translated.name || item.name || "Unnamed Practice";
    }

    return (
      <View style={styles.itemContainer}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 8,
            backgroundColor: Colors.Colors.App_theme,
          }}
        />
        <TextComponent type="cardText" style={styles.name}>
          {item.icon} {displayName}
        </TextComponent>
      </View>
    );
  };

  return (
    <Modal
      isVisible={visible}
      backdropOpacity={0.6}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
      style={{ margin: 0, justifyContent: "center", alignItems: "center" }}
    >
      <View style={styles.modalContent}>
        <View style={{width:"100%",backgroundColor:"#FDF5E9",padding:20,borderTopRightRadius:16,borderTopLeftRadius:16}}>
        <TextComponent type="headerText" style={styles.title}>
          {t("streakScreen.practiceText")} {date}
        </TextComponent>
</View>
        {/* Scrollable content */}
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled
        >
          <View style={{marginHorizontal:16}}>
          {/* Completed */}
          {completed.length > 0 && (
            <>
              <TextComponent type="cardText" style={styles.subTitle}>
                {t("streakScreen.CompletedText")}
              </TextComponent>
              <FlatList
                data={completed}
                keyExtractor={(item: any) => item.id || item.practice_id}
                renderItem={({ item }) => renderPracticeItem(item)}
                scrollEnabled={false}
              />
            </>
          )}

          {/* Not Done */}
          {notDone.length > 0 && (
            <>
              <TextComponent type="cardText" style={styles.subTitle}>
                {t("streakScreen.notDoneText")}
              </TextComponent>
              <FlatList
                data={notDone}
                keyExtractor={(item: any) => item.id || item.practice_id}
                renderItem={({ item }) => renderPracticeItem(item)}
                scrollEnabled={false}
              />
            </>
          )}
          </View>
        </ScrollView>

        {/* Close Button */}
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <TextComponent type="cardText" style={styles.closeBtnText}>
            {t("streakScreen.Close")}
          </TextComponent>
        </Pressable>
      </View>
    </Modal>
  );
};

export default PracticeDailyModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: Colors.Colors.white,
    borderRadius: 16,
    // padding: 20,
    alignItems: "center",
    maxHeight: "80%",
    width: "90%",
  },
  title: {
    alignSelf: "center",
    marginVertical: 6,
    // color: Colors.Colors.BLACK,
    // fontSize: 16,
  },
  subTitle: {
    alignSelf: "flex-start",
    marginTop: 10,
    fontSize: 16,
  },
  scrollArea: {
    width: "100%",
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    paddingVertical: 6,
    alignItems: "center",
  },
  name: {
    marginLeft: 12,
    color: Colors.Colors.BLACK,
    fontSize: 14,
  },
  closeBtn: {
    // width: "100%",
    backgroundColor: Colors.Colors.App_theme,
    padding: 10,
    borderRadius: 14,
    borderColor: "#FAD38C",
    borderWidth: 1,
    alignItems: "center",
    marginVertical: 20,
  },
  closeBtnText: {
    color: Colors.Colors.white,
    paddingHorizontal:6
  },
});








// import React from "react";
// import { useTranslation } from "react-i18next";
// import { FlatList, Pressable, ScrollView, StyleSheet, View } from "react-native";
// import Modal from "react-native-modal";
// import { getTranslatedPractice } from "../utils/getTranslatedPractice";
// import Colors from "./Colors";
// import TextComponent from "./TextComponent";

// interface Practice {
//   practice_id: string;
//   name: string;
//   icon: string;
//   source?: string;
//   details?: any;
// }

// interface PracticeDailyModalProps {
//   visible: boolean;
//   date: string;
//   dailyPractice: {
//     active_practices: Practice[];
//     completed_today: string[];
//     status: string;
//   };
//   onClose: () => void;
// }

// const PracticeDailyModal: React.FC<PracticeDailyModalProps> = ({
//   visible,
//   date,
//   dailyPractice,
//   onClose,
// }) => {
//   const { active_practices, completed_today } = dailyPractice;
//   const { t } = useTranslation();

//   // ✅ Separate completed and not done
//   const completed = active_practices.filter((p) =>
//     completed_today.includes(p.practice_id)
//   );
//   const notDone = active_practices.filter(
//     (p) => !completed_today.includes(p.practice_id)
//   );

//   // ✅ Render each item — only name (no description)
//   const renderPracticeItem = (item: Practice) => {
//     let displayName = "";

//     if (item.source === "custom") {
//       displayName = item.name?.trim() || "Custom Practice";
//     } else {
//       const translated = getTranslatedPractice(item.details || item, t);
//       displayName = translated.name || item.name || "Unnamed Practice";
//     }

//     return (
//       <View style={styles.itemContainer}>
//         <View
//           style={{
//             width: 10,
//             height: 10,
//             borderRadius: 8,
//             backgroundColor: Colors.Colors.App_theme,
//           }}
//         />
//         <TextComponent type="cardText" style={styles.name}>
//           {item.icon} {displayName}
//         </TextComponent>
//       </View>
//     );
//   };

//   return (
//     <Modal
//       isVisible={visible}
//       backdropOpacity={0.6}
//       animationIn="zoomIn"
//       animationOut="zoomOut"
//       useNativeDriver
//       style={{ margin: 0, justifyContent: "center", alignItems: "center" }}
//     >
//       <View style={styles.modalContent}>
//         <TextComponent type="boldText" style={styles.title}>
//           {t("streakScreen.practiceText")} {date}
//         </TextComponent>

//         {/* ✅ Scrollable content area */}
//         <ScrollView
//           style={styles.scrollArea}
//           showsVerticalScrollIndicator={true}
//           nestedScrollEnabled
//         >
//           {completed.length > 0 && (
//             <>
//               <TextComponent type="cardText" style={styles.subTitle}>
//                 {t("streakScreen.CompletedText")}
//               </TextComponent>
//               <FlatList
//                 data={completed}
//                 keyExtractor={(item) => item.practice_id}
//                 renderItem={({ item }) => renderPracticeItem(item)}
//                 scrollEnabled={false}
//               />
//             </>
//           )}

//           {notDone.length > 0 && (
//             <>
//               <TextComponent type="cardText" style={styles.subTitle}>
//                 {t("streakScreen.notDoneText")}
//               </TextComponent>
//               <FlatList
//                 data={notDone}
//                 keyExtractor={(item) => item.practice_id}
//                 renderItem={({ item }) => renderPracticeItem(item)}
//                 scrollEnabled={false}
//               />
//             </>
//           )}
//         </ScrollView>

//         {/* ✅ Close Button */}
//         <Pressable style={styles.closeBtn} onPress={onClose}>
//           <TextComponent type="cardText" style={styles.closeBtnText}>
//             {t("streakScreen.Close")}
//           </TextComponent>
//         </Pressable>
//       </View>
//     </Modal>
//   );
// };

// export default PracticeDailyModal;

// const styles = StyleSheet.create({
//   modalContent: {
//     backgroundColor: Colors.Colors.white,
//     borderRadius: 16,
//     padding: 20,
//     alignItems: "center",
//     maxHeight: "80%", // ✅ Prevents overflow
//     width: "90%",
//   },
//   title: {
//     alignSelf: "center",
//     marginVertical: 6,
//     color: Colors.Colors.BLACK,
//     fontSize: 16,
//   },
//   subTitle: {
//     alignSelf: "flex-start",
//     marginTop: 10,
//     fontSize: 16,
//   },
//   scrollArea: {
//     width: "100%",
//     marginTop: 10,
//   },
//   itemContainer: {
//     flexDirection: "row",
//     alignSelf: "flex-start",
//     paddingVertical: 6,
//     alignItems: "center",
//   },
//   name: {
//     marginLeft: 12,
//     color: Colors.Colors.BLACK,
//     fontSize: 14,
//   },
//   closeBtn: {
//     width: "100%",
//     backgroundColor: Colors.Colors.App_theme,
//     paddingVertical: 10,
//     borderRadius: 14,
//     borderColor: "#FAD38C",
//     borderWidth: 1,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   closeBtnText: {
//     color: Colors.Colors.white,
//   },
// });
