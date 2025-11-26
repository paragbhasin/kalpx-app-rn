import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-paper";
import Colors from "../../components/Colors";
import DailyPracticeMantraCard from "../../components/DailyPracticeMantraCard";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import LoadingButton from "../../components/LoadingButton";
import TextComponent from "../../components/TextComponent";
import i18n from "../../config/i18n";
import styles from "./DailyPracticeSelectListStyles";

const backIcon = require("../../../assets/C_Arrow_back.png");

const DailyPracticeSelectList = ({ route }) => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();

  const isLocked = route?.params?.isLocked ?? false;

  const categoryItem = route?.params?.item;
  const selectedCategory = categoryItem?.key;

  const allData = i18n.getResourceBundle(i18n.language, "translation");

  // Filter with category + type
  const mantraList = useMemo(() => {
    return Object.values(allData).filter(
      (item: any) =>
        item?.category === selectedCategory && item?.id?.startsWith("mantra.")
    );
  }, [selectedCategory]);

  const sankalpList = useMemo(() => {
    return Object.values(allData).filter(
      (item: any) =>
        item?.category === selectedCategory && item?.id?.startsWith("sankalp.")
    );
  }, [selectedCategory]);

  const practiceList = useMemo(() => {
    return Object.values(allData).filter(
      (item: any) =>
        item?.category === selectedCategory && item?.id?.startsWith("practice.")
    );
  }, [selectedCategory]);

  // Rotating indexes
  const [mantraIndex, setMantraIndex] = useState(0);
  const [sankalpIndex, setSankalpIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);

  const nextMantra = () =>
    setMantraIndex((prev) => (prev + 1) % mantraList.length);

  const nextSankalp = () =>
    setSankalpIndex((prev) => (prev + 1) % sankalpList.length);

  const nextPractice = () =>
    setPracticeIndex((prev) => (prev + 1) % practiceList.length);

  return (
    <View style={styles.container}>
      <Header />

      <View style={{ marginHorizontal: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={backIcon}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TextComponent
          type="loginHeaderText"
          style={{
            marginTop: -15,
            color: Colors.Colors.Daily_black,
            alignSelf: "center",
          }}
        >
          {categoryItem?.name}
        </TextComponent>

        <TextComponent
          type="streakSadanaText"
          style={{ marginVertical: 6, alignSelf: "center" }}
        >
          {categoryItem?.description}
        </TextComponent>
      </View>

      <Card style={styles.card2}>
        <View style={{ width: FontSize.CONSTS.DEVICE_WIDTH * 0.82 }}>
          {mantraList.length > 0 && (
            <DailyPracticeMantraCard
              data={mantraList[mantraIndex]}
              onChange={isLocked ? undefined : nextMantra}
              tag="Mantra"
              showIcons={!isLocked}
              onPress={() =>
                navigation.navigate("DailyPracticeDetailSelectedPractice", {
                  item: categoryItem,
                  selectedType: "mantra",
                  fullList: mantraList,
                  startingIndex: mantraIndex,
                  onUpdateSelection: (newIndex) => setMantraIndex(newIndex),
                  isLocked: isLocked, // ⭐ ADD THIS
                })
              }
            />
          )}
          {sankalpList.length > 0 && (
            <DailyPracticeMantraCard
              data={sankalpList[sankalpIndex]}
              onChange={isLocked ? undefined : nextSankalp}
              tag="Sankalp"
              showIcons={!isLocked}
              onPress={() =>
                navigation.navigate("DailyPracticeDetailSelectedPractice", {
                  item: categoryItem,
                  selectedType: "sankalp",
                  fullList: sankalpList,
                  startingIndex: sankalpIndex,
                  onUpdateSelection: (newIndex) => setSankalpIndex(newIndex),
                  isLocked: isLocked, // ⭐ ADD THIS
                })
              }
            />
          )}
          {practiceList.length > 0 && (
            <DailyPracticeMantraCard
              data={practiceList[practiceIndex]}
              onChange={isLocked ? undefined : nextPractice}
              tag="Practice"
              showIcons={!isLocked}
              onPress={() =>
                navigation.navigate("DailyPracticeDetailSelectedPractice", {
                  item: categoryItem,
                  selectedType: "practice",
                  fullList: practiceList,
                  startingIndex: practiceIndex,
                  onUpdateSelection: (newIndex) => setPracticeIndex(newIndex),
                  isLocked: isLocked, // ⭐ ADD THIS
                })
              }
            />
          )}
        </View>
      </Card>
      
      <LoadingButton
        loading={false}
         text={isLocked ? "Confirm" : "Submit"}
        onPress={() => {
          if (!isLocked) {
      navigation.setParams({ isLocked: true }); 
    } else {
      console.log("CONFIRM API CALL");
    }
        }}
        disabled={false}
        style={styles.button}
        textStyle={styles.buttonText}
        showGlobalLoader={true}
      />
    </View>
  );
};

export default DailyPracticeSelectList;
