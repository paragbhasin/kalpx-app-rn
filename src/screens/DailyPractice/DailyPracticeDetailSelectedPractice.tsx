import { useState } from "react";
import { View } from "react-native";
import DailyPracticeDetailsCard from "../../components/DailyPracticeDetailsCard";

const DailyPracticeDetailSelectedPractice = ({ route, navigation }) => {
  const { item, fullList, startingIndex, onUpdateSelection } = route.params;
  const isLocked = route?.params?.isLocked ?? false;
  const [currentIndex, setCurrentIndex] = useState(startingIndex);

  const nextItem = () => {
    const updatedIndex = (currentIndex + 1) % fullList.length;
    setCurrentIndex(updatedIndex);
    onUpdateSelection(updatedIndex);
  };

  const closeScreen = () => {
    onUpdateSelection(currentIndex);
    navigation.goBack();
  };

  return (
    <View style={{ marginHorizontal: 16 }}>
      <DailyPracticeDetailsCard
        data={fullList[currentIndex]}
        item={item}
        onChange={nextItem}
        onBackPress={closeScreen}
        isLocked={isLocked}
      />
    </View>
  );
};

export default DailyPracticeDetailSelectedPractice;
