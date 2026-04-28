import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../../components/Colors";
import DailyPracticeDetailsCard from "../../components/DailyPracticeDetailsCard";
import Header from "../../components/Header";
import TextComponent from "../../components/TextComponent";

const DailyPracticeDetailSelectedPractice = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { item, fullList, startingIndex, onUpdateSelection } = route.params;
  const isLocked = route?.params?.isLocked ?? false;

  const [currentIndex, setCurrentIndex] = useState(startingIndex);
  const [selectedCount, setSelectedCount] = useState(null);

  const nextItem = () => {
    const updatedIndex = (currentIndex + 1) % fullList.length;
    setCurrentIndex(updatedIndex);
    onUpdateSelection(updatedIndex);
  };

  const closeScreen = () => {
    onUpdateSelection(currentIndex, selectedCount);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Header />

      {/* FIXED HEADER WITH BACK BUTTON */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 16,
          marginTop: 4,
          paddingVertical: 8,
        }}
      >
        <TouchableOpacity
          onPress={closeScreen}
          style={{
            padding: 6,
            zIndex: 100,
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>

        <TextComponent
          type="loginHeaderText"
          style={{
            color: Colors.Colors.Daily_black,
            flex: 1,
            textAlign: "center",
            marginLeft: -32,
          }}
        >
          {item?.key ? t(`dailyPracticeList.categories.${item.key}.name`) : (item?.name ?? t("confirmDailyPractices.header"))}
        </TextComponent>
      </View>

      <View style={{ marginHorizontal: 16, flex: 1 }}>
        <DailyPracticeDetailsCard
          mode="new"
          data={fullList[currentIndex]}
          item={item}
          onChange={nextItem}
          onBackPress={closeScreen}
          isLocked={isLocked}
          selectedCount={selectedCount}
          onSelectCount={setSelectedCount}
        />
      </View>
    </View>
  );
};

export default DailyPracticeDetailSelectedPractice;
