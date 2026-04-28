// components/Privacy.js
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  ScrollView,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import TextComponent from "../../components/TextComponent";

const Privacy = ({ onClose }) => {
  const [visible, setVisible] = useState(true);
  const { t } = useTranslation();
  const navigation = useNavigation();

  const closeModal = useCallback(() => {
    setVisible(false);
    setTimeout(() => onClose?.(), 200);
  }, [onClose]);

  useEffect(() => {
    const backAction = () => {
      if (visible) {
        closeModal();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [visible, closeModal]);

  return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* Header */}
        <Header/>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
          }}
        >
          <TextComponent type="semiBoldText" style={{  fontSize: FontSize.CONSTS.FS_18, color: Colors.Colors.BLACK, }}>{t("privacy.title")}</TextComponent>
          <TouchableOpacity onPress={() => {navigation.goBack()}}>
            <Ionicons name="close" size={26} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Scrollable Privacy Policy Text */}
        <ScrollView style={{ padding: 16 }}>
          <TextComponent type="semiBoldText" style={{ marginBottom: 8 , fontSize: FontSize.CONSTS.FS_16, color: Colors.Colors.BLACK, }}>{t("privacy.effectiveDate")}</TextComponent>
          {/* <Text style={{ marginBottom: 8 }}>{t("privacy.effectiveDate")}</Text> */}
          <TextComponent type="mediumText" style={{ marginBottom: 16,fontSize: FontSize.CONSTS.FS_14, color: Colors.Colors.BLACK, }}>{t("privacy.intro")}</TextComponent>

          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={{ marginBottom: 16 }}>
          <TextComponent type="semiBoldText" style={{ marginBottom: 4, fontSize: FontSize.CONSTS.FS_16, color: Colors.Colors.BLACK, }}>  {t(`privacy.section${i + 1}Title`)}</TextComponent>
          <TextComponent type="mediumText" style={{ marginBottom: 8,fontSize: FontSize.CONSTS.FS_14, color: Colors.Colors.BLACK, }}>{t(`privacy.section${i + 1}Content`)}</TextComponent>

            </View>
          ))}
        </ScrollView>
      </View>
  );
};

export default Privacy;




// // components/Privacy.js (or screens/Privacy.js)
// import React, { useCallback, useEffect, useState } from "react";
// import { BackHandler, Modal, Text, TouchableOpacity, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { WebView } from "react-native-webview";

// const Privacy = ({ onClose }) => {
//   const [visible, setVisible] = useState(true);

//   const closeModal = useCallback(() => {
//     setVisible(false);
//     setTimeout(() => onClose?.(), 200);
//   }, [onClose]);

//   useEffect(() => {
//     const backAction = () => {
//       if (visible) {
//         closeModal();
//         return true; // prevent default back behavior
//       }
//       return false;
//     };

//     const backHandler = BackHandler.addEventListener(
//       "hardwareBackPress",
//       backAction
//     );
//     return () => backHandler.remove();
//   }, [visible, closeModal]);

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       onRequestClose={closeModal}
//       transparent={false}
//     >
//     <SafeAreaView style={{flex:1}}>

//       {/* Header */}
//       <View
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           justifyContent: "space-between",
//           paddingHorizontal: 16,
//           paddingVertical: 12,
//           backgroundColor: "#fff",
//           borderBottomWidth: 1,
//           borderBottomColor: "#eee",
//         }}
//       >
//         <Text style={{ fontSize: 18, fontWeight: "600" }}>Privacy Policy</Text>
//         <TouchableOpacity onPress={closeModal}>
//           <Ionicons name="close" size={26} color="#000" />
//         </TouchableOpacity>
//       </View>

//       {/* WebView for Privacy Policy */}
//       <WebView source={{ uri: "https://kalpx.com/en/privacy" }} style={{ flex: 1 }} />
//     </SafeAreaView>
//     </Modal>
//   );
// };

// export default Privacy;
