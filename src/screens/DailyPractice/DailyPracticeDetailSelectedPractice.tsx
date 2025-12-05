import { useState } from "react";
import { View } from "react-native";
import DailyPracticeDetailsCard from "../../components/DailyPracticeDetailsCard";
import Header from "../../components/Header";

const DailyPracticeDetailSelectedPractice = ({ route, navigation }) => {
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
    onUpdateSelection(currentIndex,selectedCount);
    navigation.goBack();
  };

  return (
    <View style={{ marginHorizontal: 16 }}>
      <Header />
      <DailyPracticeDetailsCard
      mode="new"
        data={fullList[currentIndex]}
        item={item}
        onChange={nextItem}
        onBackPress={closeScreen}
        isLocked={isLocked}
        selectedCount={selectedCount}       // ⬅️ parent → child
        onSelectCount={setSelectedCount}    // ⬅️ child → parent
      />
    </View>
  );
};

export default DailyPracticeDetailSelectedPractice;
