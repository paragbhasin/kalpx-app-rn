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
      { count: 3, label: "Micro Calm" },
      { count: 9, label: "Calm Now" },
      { count: 27, label: "Ease Stress" },
      { count: 54, label: "Deep Calm" },
      { count: 108, label: "Soft Peace" },
    ],
  },

  focus: {
    category: "Focus & Motivation",
    options: [
      { count: 3, label: "Micro Focus" },
      { count: 9, label: "Quick Focus" },
      { count: 27, label: "Mind Clear" },
      { count: 54, label: "Stay Sharp" },
      { count: 108, label: "Full Focus" },
    ],
  },

  healing: {
    category: "Emotional Healing",
    options: [
      { count: 3, label: "Tiny Heal" },
      { count: 9, label: "Gentle Heal" },
      { count: 27, label: "Emotional Ease" },
      { count: 54, label: "Heart Heal" },
      { count: 108, label: "Inner Renew" },
    ],
  },

  gratitude: {
    category: "Gratitude & Positivity",
    options: [
      { count: 3, label: "Micro Thanks" },
      { count: 9, label: "Quick Thanks" },
      { count: 27, label: "Feel Good" },
      { count: 54, label: "Joy Rise" },
      { count: 108, label: "Bright Mind" },
    ],
  },

  "spiritual-growth": {
    category: "Spiritual Growth",
    options: [
      { count: 3, label: "Tiny Lift" },
      { count: 9, label: "Spirit Lift" },
      { count: 27, label: "Divine Touch" },
      { count: 54, label: "Inner Light" },
      { count: 108, label: "Soul Align" },
    ],
  },

  health: {
    category: "Health & Well-Being",
    options: [
      { count: 3, label: "Mini Boost" },
      { count: 9, label: "Vital Boost" },
      { count: 27, label: "Body Heal" },
      { count: 54, label: "Deep Heal" },
      { count: 108, label: "Life Renew" },
    ],
  },

  career: {
    category: "Career & Prosperity",
    options: [
      { count: 3, label: "Mini Boost" },
      { count: 9, label: "Quick Boost" },
      { count: 27, label: "Goal Flow" },
      { count: 54, label: "Prosper Path" },
      { count: 108, label: "Wealth Rise" },
    ],
  },
};


// const categoryChantOptions = {
//   "peace-calm": {
//     category: "Peace & Stress Relief",
//     options: [
//       { count: 9, label: "Calm Now" }, // 7 chars
//       { count: 27, label: "Ease Stress" }, // 11 chars
//       { count: 54, label: "Deep Calm" }, // 9 chars
//       { count: 108, label: "Soft Peace" }, // 10 chars
//     ],
//   },

//   focus: {
//     category: "Focus & Motivation",
//     options: [
//       { count: 9, label: "Quick Focus" }, // 11 chars
//       { count: 27, label: "Mind Clear" }, // 10 chars
//       { count: 54, label: "Stay Sharp" }, // 10 chars
//       { count: 108, label: "Full Focus" }, // 10 chars
//     ],
//   },

//   healing: {
//     category: "Emotional Healing",
//     options: [
//       { count: 9, label: "Gentle Heal" }, // 11 chars
//       { count: 27, label: "Emotional Ease" }, // 11 chars
//       { count: 54, label: "Heart Heal" }, // 10 chars
//       { count: 108, label: "Inner Renew" }, // 11 chars
//     ],
//   },

//   gratitude: {
//     category: "Gratitude & Positivity",
//     options: [
//       { count: 9, label: "Quick Thanks" }, // 11 chars
//       { count: 27, label: "Feel Good" }, // 9 chars
//       { count: 54, label: "Joy Rise" }, // 7 chars
//       { count: 108, label: "Bright Mind" }, // 11 chars
//     ],
//   },

//   "spiritual-growth": {
//     category: "Spiritual Growth",
//     options: [
//       { count: 9, label: "Spirit Lift" }, // 10 chars
//       { count: 27, label: "Divine Touch" }, // 12 chars
//       { count: 54, label: "Inner Light" }, // 11 chars
//       { count: 108, label: "Soul Align" }, // 10 chars
//     ],
//   },

//   health: {
//     category: "Health & Well-Being",
//     options: [
//       { count: 9, label: "Vital Boost" }, // 11 chars
//       { count: 27, label: "Body Heal" }, // 9 chars
//       { count: 54, label: "Deep Heal" }, // 9 chars
//       { count: 108, label: "Life Renew" }, // 10 chars
//     ],
//   },

//   career: {
//     category: "Career & Prosperity",
//     options: [
//       { count: 9, label: "Quick Boost" }, // 11 chars
//       { count: 27, label: "Goal Flow" }, // 8 chars
//       { count: 54, label: "Prosper Path" }, // 12 chars
//       { count: 108, label: "Wealth Rise" }, // 11 chars
//     ],
//   },
// };

const ExpandableText = ({ title, text }) => {
  return (
    <View style={styles.expandableContainer}>
      {title !== "" && (
        <TextComponent type="DailyboldText" style={styles.titleCenter}>
          {title}
        </TextComponent>
      )}

      <TextComponent
        type="streakSadanaText"
        style={styles.expandText}
      >
        {Array.isArray(text) ? text.map((t) => "• " + t).join("\n") : text}
      </TextComponent>
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
  selectedCount,
  onSelectCount,
  mode
}) => {
  const [selectedChant, setSelectedChant] = useState(null);
  const [showPronunciation, setShowPronunciation] = useState(false);
  const [isDevanagariLong, setIsDevanagariLong] = useState(false);
  const [showDevanagariModal, setShowDevanagariModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);


  console.log("DailyPracticeDetailsCard rendered with data:", data, "and item:", item);

  // Normalize chantOptions
  const getNormalizedChantOptions = (options) => {
    if (!options || options.length === 0) return [];
    return typeof options[0] === "number"
      ? options.map((n) => ({ count: n, label: `${n} chants` }))
      : options;
  };

  const normalizedOptions = React.useMemo(
    () => getNormalizedChantOptions(data?.chantOptions),
    [data?.chantOptions]
  );

  // lowest count
  const getDefaultChant = (options) =>
    options.length
      ? options.reduce((min, c) => (c.count < min.count ? c : min))
      : null;

  React.useEffect(() => {
    const lowest = getDefaultChant(normalizedOptions);
    setSelectedChant(lowest);
    onSelectCount?.(lowest?.count);
  }, [normalizedOptions]);

  // Sync with parent when parent changes
  React.useEffect(() => {
    if (selectedCount) {
      const found = normalizedOptions.find(o => o.count === selectedCount);
      if (found) setSelectedChant(found);
    }
  }, [selectedCount, normalizedOptions]);

  const handleSwipeChange = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
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

  const categoryKey =
    item?.key ||
    data?.category_key ||
    data?.category ||
    null;


  // Full category options (always source of truth for label)
  const fullCategoryOptions = categoryKey
    ? categoryChantOptions[categoryKey]?.options || []
    : [];


  // Filter category options based on API counts (if any)
  const chantOptions = React.useMemo(() => {
    if (!data?.chantOptions || data.chantOptions.length === 0) {
      return fullCategoryOptions; // fallback to full list
    }

    // API may send [count] or [{count, label}]
    const apiCounts = data.chantOptions.map(c =>
      typeof c === "number" ? c : c.count
    );

    return fullCategoryOptions.filter(opt => apiCounts.includes(opt.count));
  }, [data?.chantOptions, item?.key]);

  React.useEffect(() => {
    if (chantOptions.length > 0) {
      const lowest = chantOptions.reduce(
        (min, o) => (o.count < min.count ? o : min),
        chantOptions[0]
      );

      setSelectedChant(lowest);
      onSelectCount?.(lowest.count);
    }
  }, [chantOptions]);


  return (
    <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
      <Card style={styles.cardContainer}>
        <ScrollView
          ref={scrollRef}
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
              {data?.title || data?.text || data?.name || data?.short_text}
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
            {(data?.devanagari || data?.mantra) && (
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
                  {data?.devanagari || data?.mantra}
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
            {(data?.iast || data?.name) && (
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
            <ExpandableText title="" text={data?.summary} />
          )}
          {data?.suggested_practice && (
            <ExpandableText title="" text={data?.suggested_practice} />
          )}
          {data?.steps && (
            <Card style={styles.meaningCard}>
              <ExpandableText
                title="Steps"
                text={data?.steps}
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
            />
          )}
          {data?.meaning && (
            <Card style={styles.meaningCard}>
              <ExpandableText title="" text={data?.meaning} />
            </Card>
          )}
          {data?.howToLive && (
            <Card style={styles.meaningCard}>
              <ExpandableText
                title="How To Live This Today"
                text={data?.howToLive}
              />
            </Card>
          )}
          {/* {data?.essence?.text || data?.essence &&
        <ExpandableText title="Essence" text={data?.essence?.text || data?.essence} numberOfLines={3} />
} */}
          {/* {data?.essence && (
          <ExpandableText
            title="Essence"
            text={
              typeof data.essence === "string"
                ? data.essence
                : data.essence?.text || ""
            }
            numberOfLines={3}
          />
        )} */}
          {data?.essence && (
            <ExpandableText
              title="Essence"
              text={
                typeof data.essence === "string"
                  ? data.essence
                  : data.essence?.text || ""
              }
            />
          )}

          {data?.benefits && (
            <ExpandableText
              title="Benefits"
              text={data?.benefits}
            />
          )}
          {/* {data?.id?.includes("mantra") && mode === "new" &&
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
                  {chantOptions.map((option) => (
                    <ChantOptionItem
                      key={option.count}
                      item={option}
                      selected={selectedChant}
                      onSelect={(opt) => {
                        setSelectedChant(opt);
                        onSelectCount(opt.count);
                      }}
                    />
                  ))}
           
                </View>
              </View>
            )} */}

          {/* <MantraPronunciationModal
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
          /> */}
        </ScrollView>
        <View style={styles.fixedButtons}>
          {!isLocked && (
            <>
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
       
          {mode === "new" && (
            <TouchableOpacity style={mode === "new" ? styles.selectButton : styles.selectNewButton} onPress={onBackPress}>
              <TextComponent type="headerText" style={styles.selectText}>
                Select
              </TextComponent>
            </TouchableOpacity>
          )}
          </>
             )}
        </View>

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
    marginTop: 10,
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
  selectNewButton: {
    backgroundColor: "#D4A017",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-end"
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
