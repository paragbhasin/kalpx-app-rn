import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, View } from "react-native";
import { Card } from "react-native-paper";
import Colors from "../../components/Colors";
import DailyPracticeMantraCard from "../../components/DailyPracticeMantraCard";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import LoadingButton from "../../components/LoadingButton";
import TextComponent from "../../components/TextComponent";
import i18n from "../../config/i18n";
import styles from "./DailyPracticeSelectListStyles";


const categories = [
  {
    category: "Peace & Stress Relief",
    options: [
      { count: 9, label: "Quick Calm" },
      { count: 27, label: "Stress Release" },
      { count: 54, label: "Deep Peace" },
      { count: 108, label: "Inner Serenity" },
    ],
  },
  {
    category: "Focus & Motivation",
    options: [
      { count: 9, label: "Quick Focus" },
      { count: 27, label: "Mental Clarity" },
      { count: 54, label: "Steady Concentration" },
      { count: 108, label: "Unshakable Focus" },
    ],
  },
  {
    category: "Emotional Healing",
    options: [
      { count: 9, label: "Gentle Relief" },
      { count: 27, label: "Emotional Balance" },
      { count: 54, label: "Heart Healing" },
      { count: 108, label: "Inner Renewal" },
    ],
  }
];

const arrowIcon = require("../../../assets/arrow_home.png");

const backIcon = require("../../../assets/C_Arrow_back.png");

const filterByPrefix = (obj, prefix) => {
  return Object.values(obj).filter((item: any) => item?.id?.startsWith(prefix));
};

const DailyPracticeSelectList = () => {
  const { t } = useTranslation();

  const [mantraIndex, setMantraIndex] = useState(0);
  const [sankalpIndex, setSankalpIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);

  // get full translation dataset
const allData = i18n.getResourceBundle(i18n.language, "translation");


  const mantraList = filterByPrefix(allData, "mantra.");
  const sankalpList = filterByPrefix(allData, "sankalp.");
  const practiceList = filterByPrefix(allData, "practice.");

  const nextMantra = () => setMantraIndex(prev => (prev + 1) % mantraList.length);
  const nextSankalp = () => setSankalpIndex(prev => (prev + 1) % sankalpList.length);
  const nextPractice = () => setPracticeIndex(prev => (prev + 1) % practiceList.length);


  return (
    <View style={styles.container}>
      <Header />
      <View style={{marginHorizontal:16}}>
 <Image
                  source={backIcon}
                  style={styles.backIcon}
                  resizeMode="contain"
                />
                 <TextComponent
          type="loginHeaderText"
          style={{
            marginTop: -15,
            color: Colors.Colors.Daily_black,
            alignSelf: "center",
          }}
        >
       Peace & Stress Relief
        </TextComponent>
          <TextComponent
          type="streakSadanaText"
          style={{ marginVertical:6, alignSelf: "center" }}
        >
     Wisdom lies in remaining still amid turmoil
        </TextComponent>
      </View>
      <Card style={styles.card2}>
<View style={{width:FontSize.CONSTS.DEVICE_WIDTH *0.82}}>
      <DailyPracticeMantraCard 
      data={mantraList[mantraIndex]}
      onChange={nextMantra}
      tag="Mantra"
    />

    <DailyPracticeMantraCard 
      data={sankalpList[sankalpIndex]}
      onChange={nextSankalp}
      tag="Sankalp"
    />

    <DailyPracticeMantraCard 
      data={practiceList[practiceIndex]}
      onChange={nextPractice}
      tag="Practice"
    />
  </View>
  </Card>
     <LoadingButton
                      loading={false}
                      text="Confirm"
                      onPress={() => {}}
                      disabled={false}
                      style={styles.button}
                      textStyle={styles.buttonText}
                      showGlobalLoader={true}
                    />
    </View>
  );
};

export default DailyPracticeSelectList;
