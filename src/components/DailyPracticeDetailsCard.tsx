import React, { useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "./Colors";
import FontSize from "./FontSize";
import MantraPronunciationModal from "./MantraPronunciationModal";
import TextComponent from "./TextComponent";

const categoryChantOptions = {
  "peace-calm": {
    category: "Peace & Stress Relief",
    options: [
      { count: 9, label: "Calm Now" }, // 7 chars
      { count: 27, label: "Ease Stress" }, // 11 chars
      { count: 54, label: "Deep Calm" }, // 9 chars
      { count: 108, label: "Soft Peace" }, // 10 chars
    ],
  },

  focus: {
    category: "Focus & Motivation",
    options: [
      { count: 9, label: "Quick Focus" }, // 11 chars
      { count: 27, label: "Mind Clear" }, // 10 chars
      { count: 54, label: "Stay Sharp" }, // 10 chars
      { count: 108, label: "Full Focus" }, // 10 chars
    ],
  },

  healing: {
    category: "Emotional Healing",
    options: [
      { count: 9, label: "Gentle Heal" }, // 11 chars
      { count: 27, label: "Emotional Ease" }, // 11 chars
      { count: 54, label: "Heart Heal" }, // 10 chars
      { count: 108, label: "Inner Renew" }, // 11 chars
    ],
  },

  gratitude: {
    category: "Gratitude & Positivity",
    options: [
      { count: 9, label: "Quick Thanks" }, // 11 chars
      { count: 27, label: "Feel Good" }, // 9 chars
      { count: 54, label: "Joy Rise" }, // 7 chars
      { count: 108, label: "Bright Mind" }, // 11 chars
    ],
  },

  "spiritual-growth": {
    category: "Spiritual Growth",
    options: [
      { count: 9, label: "Spirit Lift" }, // 10 chars
      { count: 27, label: "Divine Touch" }, // 12 chars
      { count: 54, label: "Inner Light" }, // 11 chars
      { count: 108, label: "Soul Align" }, // 10 chars
    ],
  },

  health: {
    category: "Health & Well-Being",
    options: [
      { count: 9, label: "Vital Boost" }, // 11 chars
      { count: 27, label: "Body Heal" }, // 9 chars
      { count: 54, label: "Deep Heal" }, // 9 chars
      { count: 108, label: "Life Renew" }, // 10 chars
    ],
  },

  career: {
    category: "Career & Prosperity",
    options: [
      { count: 9, label: "Quick Boost" }, // 11 chars
      { count: 27, label: "Goal Flow" }, // 8 chars
      { count: 54, label: "Prosper Path" }, // 12 chars
      { count: 108, label: "Wealth Rise" }, // 11 chars
    ],
  },
};

const DownUpIcon = ({ expanded }) => (
  <Ionicons
    name={expanded ? "caret-up" : "caret-down"}
    size={22}
    color={Colors.Colors.BLACK}
  />
);

const ExpandableText = ({ title, text, numberOfLines }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.expandableContainer}>
      {title !== "" && (
        <TextComponent type="DailyboldText" style={styles.titleCenter}>
          {title}
        </TextComponent>
      )}
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <TextComponent
          type="streakSadanaText"
          style={styles.expandText}
          numberOfLines={expanded ? undefined : numberOfLines}
        >
          {Array.isArray(text) ? text.map((t) => "• " + t).join("\n") : text}
        </TextComponent>

        <View style={styles.arrowIconContainer}>
          <DownUpIcon expanded={expanded} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const TagItem = ({ item }) => (
  <View style={styles.tagWrapper}>
    <TextComponent type="streakSadanaText" style={styles.tagText}>
      {item}
    </TextComponent>
  </View>
);

const ChantOptionItem = ({ item, onSelect, selected }) => (
  <TouchableOpacity onPress={() => onSelect(item)} style={styles.chantRow}>
    <Ionicons
      name={
        selected?.count === item.count ? "radio-button-on" : "radio-button-off"
      }
      size={22}
      color={Colors.Colors.App_theme}
    />
    <TextComponent type="streakSadanaText" style={styles.chantLabel}>
      {item.count} X - {item.label}
    </TextComponent>
  </TouchableOpacity>
);



const DailyPracticeDetailsCard = ({
  data,
  item,
  onChange,
  onBackPress,
  isLocked,
}) => {
  const [selectedChant, setSelectedChant] = useState(null);
  const [showPronunciation, setShowPronunciation] = useState(false);
  const [isDevanagariLong, setIsDevanagariLong] = useState(false);
  const [showDevanagariModal, setShowDevanagariModal] = useState(false);

    const slideAnim = useRef(new Animated.Value(0)).current;

  const handleSwipeChange = () => {
    // 1. Slide OUT to LEFT
    Animated.timing(slideAnim, {
      toValue: -400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // 2. Update index (parent logic)
      onChange && onChange();

      // 3. Reset card to RIGHT offscreen
      slideAnim.setValue(400);

      // 4. Slide IN to CENTER
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };
  

  return (
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
    <Card style={styles.cardContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <ImageBackground
          source={require("../../assets/CardBG.png")}
          style={styles.headerImage}
          imageStyle={styles.headerImageInside}
        >
          <View style={styles.headerIcons}>
            {!isLocked && (
              <Ionicons
                name="repeat-outline"
                size={30}
                color="#D4A017"
                onPress={handleSwipeChange}
                // onPress={onChange}
              />
            )}
            <Ionicons
              name="close"
              size={30}
              color="#000000"
              onPress={onBackPress}
            />
          </View>
          <TextComponent
            type="DailyDetailheaderText"
            style={styles.headerTitle}
          >
            {data?.title}
          </TextComponent>
          {data?.tags && (
            <View style={styles.tagsCenterWrapper}>
              {data?.tags?.map((item) => (
                <TagItem key={item} item={item} />
              ))}
            </View>
          )}
          {data?.line && (
            <TextComponent
              type="headerText"
              style={{
                color: "#D79239",
                textAlign: "center",
                marginHorizontal: 20,
              }}
              ellipsizeMode="tail"
            >
              {data?.line}
            </TextComponent>
          )}
          {data?.devanagari && (
            <View style={styles.devanagariRow}>
              <TextComponent
                type="headerText"
                style={styles.devanagariText}
                numberOfLines={2}
                ellipsizeMode="tail"
                onTextLayout={(e) => {
                  if (e.nativeEvent.lines.length > 2) {
                    setIsDevanagariLong(true);
                  }
                }}
              >
                {data?.devanagari}
              </TextComponent>
              <TouchableOpacity onPress={() => setShowDevanagariModal(true)}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#D79239"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            </View>
          )}
          {data?.iast && (
            <View style={styles.pronunciationRow}>
              <TextComponent type="cardText" style={styles.pronunciationText}>
                Pronunciation Guide (English)
              </TextComponent>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#D79239"
                style={{ marginLeft: 6 }}
                onPress={() => setShowPronunciation(true)}
              />
            </View>
          )}
        </ImageBackground>
        {data?.summary && (
          <ExpandableText title="" text={data?.summary} numberOfLines={2} />
        )}
        {data?.steps && (
          <Card style={styles.meaningCard}>
            <ExpandableText
              title="Steps"
              text={data?.steps}
              numberOfLines={2}
            />
            {data?.duration && (
              <TextComponent
                type="boldText"
                style={{ ...styles.titleCenter, color: Colors.Colors.BLACK }}
              >
                Time needed : {data?.duration}
              </TextComponent>
            )}
          </Card>
        )}
        {data?.insight && (
          <ExpandableText
            title={
              data?.id?.includes("practice")
                ? "Why This Works"
                : "The Power of Sankalp"
            }
            text={data?.insight}
            numberOfLines={3}
          />
        )}
        {data?.meaning && (
          <Card style={styles.meaningCard}>
            <ExpandableText title="" text={data?.meaning} numberOfLines={2} />
          </Card>
        )}
        {data?.howToLive && (
          <Card style={styles.meaningCard}>
            <ExpandableText
              title="How To Live This Today"
              text={data?.howToLive}
              numberOfLines={3}
            />
          </Card>
        )}
        {/* {data?.essence?.text || data?.essence &&
        <ExpandableText title="Essence" text={data?.essence?.text || data?.essence} numberOfLines={3} />
} */}
        {data?.essence && (
          <ExpandableText
            title="Essence"
            text={
              typeof data.essence === "string"
                ? data.essence
                : data.essence?.text || ""
            }
            numberOfLines={3}
          />
        )}
        {data?.essence && (
          <ExpandableText
            title="Essence"
            text={
              typeof data.essence === "string"
                ? data.essence
                : data.essence?.text || ""
            }
            numberOfLines={3}
          />
        )}

        {data?.benefits && (
          <ExpandableText
            title="Benefits"
            text={data?.benefits}
            numberOfLines={3}
          />
        )}
        {data?.id?.includes("mantra") &&
          item?.key &&
          categoryChantOptions[item.key] && (
            <View style={styles.chantMainWrapper}>
              <TextComponent
                type="DailyboldText"
                style={{ alignSelf: "center" }}
              >
                Count
              </TextComponent>

              <View style={styles.chantGrid}>
                {categoryChantOptions[item.key].options.map((option) => (
                  <ChantOptionItem
                    key={option.count}
                    item={option}
                    selected={selectedChant}
                    onSelect={setSelectedChant}
                  />
                ))}
              </View>
            </View>
          )}

        <MantraPronunciationModal
          visible={showPronunciation}
          onClose={() => setShowPronunciation(false)}
          title={data?.title}
          iast={data?.iast}
        />
        <MantraPronunciationModal
          visible={showDevanagariModal}
          onClose={() => setShowDevanagariModal(false)}
          title={data?.title}
          iast={data?.devanagari}
        />
      </ScrollView>
      {!isLocked && (
        <View style={styles.fixedButtons}>
          <TouchableOpacity style={styles.changeButton} 
                onPress={handleSwipeChange}
          // onPress={onChange}
          >
            <Ionicons
              name="repeat-outline"
              size={22}
              color="#D4A017"
              style={{ marginRight: 10 }}
            />
            <TextComponent type="headerText" style={styles.changeText}>
              Change
            </TextComponent>
          </TouchableOpacity>
          <TouchableOpacity style={styles.selectButton} onPress={onBackPress}>
            <TextComponent type="headerText" style={styles.selectText}>
              Select
            </TextComponent>
          </TouchableOpacity>
        </View>
      )}
    </Card>
    </Animated.View>
  );
};

export default DailyPracticeDetailsCard;

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 6,
    backgroundColor: "#FFFCF7",
    width: FontSize.CONSTS.DEVICE_WIDTH * 0.92,
    borderWidth: 1,
    borderColor: Colors.Colors.App_theme,
    height: "92%",
    marginTop: 25,
    overflow: "hidden",
  },
  headerImage: {
    alignSelf: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: FontSize.CONSTS.DEVICE_WIDTH,
  },
  headerImageInside: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 25,
  },
  headerTitle: {
    color: Colors.Colors.BLACK,
    alignSelf: "center",
    textAlign: "center",
    marginHorizontal: 16,
  },
  tagsContainer: {
    marginVertical: 6,
    alignSelf: "center",
  },
  tagWrapper: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
    marginTop: 4,
  },
  tagText: {
    color: "#1B1EBB",
    alignSelf: "center",
  },
  pronunciationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  pronunciationText: {
    color: "#D79239",
    marginBottom: 6,
    textDecorationLine: "underline",
  },
  expandableContainer: {
    marginTop: 4,
  },
  titleCenter: {
    alignSelf: "center",
  },
  expandText: {
    width: "90%",
    alignSelf: "center",
  },
  arrowIconContainer: {
    alignSelf: "flex-end",
    marginRight: 10,
  },
  meaningCard: {
    backgroundColor: Colors.Colors.white,
    margin: 12,
    padding: 10,
    borderRadius: 10,
  },
  chantMainWrapper: {
    marginTop: 18,
    paddingHorizontal: 12,
  },
  chantGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 6,
  },
  chantRow: {
    width: "48%",
    borderRadius: 8,
    padding: 10,
    marginVertical: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  chantLabel: {
    color: Colors.Colors.BLACK,
    marginLeft: 4,
  },
  fixedButtons: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  changeButton: {
    borderColor: "#D4A017",
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
  },
  changeText: {
    color: "#D4A017",
  },
  selectButton: {
    backgroundColor: "#D4A017",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  selectText: {
    color: "#FFFFFF",
  },
  tagsContent: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    columnGap: 8,
  },
  tagsCenterWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginVertical: 8,
  },
  devanagariRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 4,
  },

  devanagariText: {
    color: "#D79239",
    flexShrink: 1,
    textAlign: "center",
    marginRight: 4,
  },
});
