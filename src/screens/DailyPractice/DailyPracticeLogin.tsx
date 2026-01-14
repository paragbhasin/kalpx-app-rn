// screens/Tracker/ConfirmDailyPractices.tsx

import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ImageBackground,
  View
} from "react-native";

import Colors from "../../components/Colors";
import Header from "../../components/Header";
import TextComponent from "../../components/TextComponent";

const DailyPracticeLogin = ({ route }) => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar barStyle="dark-content" />
      {/* <ImageBackground
      source={require("../../../assets/Tracker_BG.png")}
      style={{
        flex: 1,
        width: FontSize.CONSTS.DEVICE_WIDTH,
        alignSelf: "center",
        justifyContent: "flex-start",
      }}
      imageStyle={{
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}
    > */}
      <Header />

      <ScrollView keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ alignItems: "center" }}>
          <ImageBackground
            source={require("../../../assets/setup-bg.jpg")}
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "flex-start", // content from top
              paddingTop: 32,               // space from top of image
              paddingBottom: 24,
            }}
            resizeMode="cover"
          >
            <Image
              source={require("../../../assets/DailyOm.png")}
              style={{ width: 37, height: 37, marginBottom: 6 }}
              resizeMode="contain"
            />

            <TextComponent type="DailyboldText" style={{ marginVertical: 6 }}>
              {t('dailyPracticeLogin.title')}
            </TextComponent>

            <TextComponent
              type="subText"
              style={{ textAlign: "center", paddingHorizontal: 20 }}
            >
              {t('dailyPracticeLogin.description')}
            </TextComponent>

            <TouchableOpacity
              onPress={() => navigation.navigate("DailyPracticeMantra")}
              style={{
                backgroundColor: "#CC9B2F",
                paddingVertical: 10,
                paddingHorizontal: 40,
                borderRadius: 5,
                marginTop: 12,
              }}
            >
              <TextComponent type="headerSubBoldText" style={{ color: Colors.Colors.white }}>
                {t('dailyPracticeLogin.tryTodayBtn')}
              </TextComponent>
            </TouchableOpacity>

            <TextComponent
              type="subDailyText"
              style={{ marginTop: 6 }}
            >
              {t('dailyPracticeLogin.simpleVedicText')}
            </TextComponent>
          </ImageBackground>
          <View style={{ paddingHorizontal: 20, paddingVertical: 40 }}>

            <View style={{
              borderRadius: 12,
              padding: 20,
              borderColor: '#FEEBB6',
              borderWidth: 1,


            }}>
              {/* Header */}
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Image
                  source={require("../../../assets/DailyBird.png")}
                  style={{ width: 40, height: 40, marginBottom: 12 }}
                  resizeMode="contain"
                />
                <TextComponent type="DailyboldText" style={{ marginBottom: 8, fontSize: 20 }}>
                  {t('dailyPracticeLogin.startGrowthPath')}
                </TextComponent>
                <TextComponent type="subText" style={{ textAlign: "center", color: "#666", paddingHorizontal: 10 }}>
                  {t('dailyPracticeLogin.guidedRoutineDesc')}
                </TextComponent>
              </View>

              {/* Feature Cards */}
              <TouchableOpacity
                onPress={() => navigation.navigate("DailyPracticeList")}>
                <View style={{ gap: 12, marginBottom: 20 }}>
                  {/* Card 1 */}
                  <View style={{
                    backgroundColor: "#FFF9E6",
                    borderRadius: 8,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "flex-start"
                  }}>
                    <TextComponent style={{ fontSize: 24, marginRight: 12 }}>
                      <Image
                        source={require("../../../assets/sap.png")}
                        style={{ width: 37, height: 37, marginBottom: 6 }}
                        resizeMode="contain"
                      />
                    </TextComponent>
                    <TextComponent type="subText" style={{ flex: 1, color: "#333", lineHeight: 20 }}>
                      {t('dailyPracticeLogin.stepByStepDesc')}
                    </TextComponent>
                  </View>

                  {/* Card 2 */}
                  <View style={{
                    backgroundColor: "#FFF9E6",
                    borderRadius: 8,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "flex-start"
                  }}>
                    <TextComponent style={{ fontSize: 24, marginRight: 12 }}>
                      <Image
                        source={require("../../../assets/setup-yoga.png")}
                        style={{ width: 37, height: 37, marginBottom: 6 }}
                        resizeMode="contain"
                      />
                    </TextComponent>
                    <View style={{ flex: 1 }}>
                      <TextComponent type="subText" style={{ color: "#333", lineHeight: 20 }}>
                        {t('dailyPracticeLogin.buildHabitsDesc')}
                      </TextComponent>
                    </View>
                  </View>

                  {/* Card 3 */}
                  <View style={{
                    backgroundColor: "#FFF9E6",
                    borderRadius: 8,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "flex-start"
                  }}>
                    <TextComponent style={{ fontSize: 24, marginRight: 12 }}>
                      <Image
                        source={require("../../../assets/growth-graph.png")}
                        style={{ width: 37, height: 37, marginBottom: 6 }}
                        resizeMode="contain"
                      />
                    </TextComponent>
                    <TextComponent type="subText" style={{ flex: 1, color: "#333", lineHeight: 20 }}>
                      {t('dailyPracticeLogin.mindfulPracticeDesc')}
                    </TextComponent>
                  </View>
                </View>
              </TouchableOpacity>
              {/* Button */}
              <TouchableOpacity
                onPress={() => navigation.navigate("DailyPracticeList")}
                style={{
                  borderWidth: 2,
                  borderColor: "#CC9B2F",
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  marginBottom: 12
                }}
              >
                <TextComponent type="headerSubBoldText" style={{ color: "#CC9B2F" }}>
                  {t('dailyPracticeLogin.exploreGrowthPathsBtn')}
                </TextComponent>
              </TouchableOpacity>

              {/* Subtitle */}
              <TextComponent type="subDailyText" style={{ color: "#1B1EBB", textAlign: "center" }}>
                {t('dailyPracticeLogin.longTermGrowth')}
              </TextComponent>


            </View>
            <TextComponent type="subDailyText" style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
              {t('dailyPracticeLogin.consistencyQuote')}
            </TextComponent>
          </View>


        </View>
      </ScrollView>
      {/* </ImageBackground> */}
    </SafeAreaView>
  );
};

export default DailyPracticeLogin;
