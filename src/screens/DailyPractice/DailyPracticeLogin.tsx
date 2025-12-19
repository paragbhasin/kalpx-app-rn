// screens/Tracker/ConfirmDailyPractices.tsx

import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View
} from "react-native";

import Colors from "../../components/Colors";
import Header from "../../components/Header";
import TextComponent from "../../components/TextComponent";

const DailyPracticeLogin = ({ route }) => {
  const navigation: any = useNavigation();

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

            <ScrollView  keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={{alignItems:"center",marginHorizontal:12}}>
      <TextComponent type="DailyDetailheaderText" style={{marginTop:20,marginBottom:10}}>How would you like to begin?</TextComponent>
      <TextComponent type="subText" style={{textAlign:"center"}}>KalpX supports both daily grounding and long-term growth — choose what feels right today.</TextComponent>
      <View style={{borderColor:"#CC9B2F",borderWidth:1,borderRadius:10,width:"100%",marginVertical:20}}>
   <Image
              source={require("../../../assets/decorative_BG.png")}
              style={{ alignSelf:"flex-end" ,width:72,height:72}}
              resizeMode="contain"
            />
            <View style={{marginTop:-70,alignItems:"center"}}>
               <Image
              source={require("../../../assets/DailyOm.png")}
              style={{width:37,height:37,alignSelf:"center" }}
              resizeMode="contain"
            />
            <TextComponent type="DailyboldText" style={{marginVertical:6}}>Try a Vedic Practice Today</TextComponent>
            <TextComponent type="subText" style={{textAlign:"center"}}>A mantra, sankalp, or reflection to bring clarity and balance today.</TextComponent>
           <TouchableOpacity onPress={() => navigation.navigate("DailyPracticeMantra")} style={{backgroundColor:"#CC9B2F",padding:8,borderRadius:5,paddingHorizontal:40,marginTop:12}}>
            <TextComponent type="headerSubBoldText" style={{color:Colors.Colors.white}}>Begin Today’s Practice →</TextComponent>
            </TouchableOpacity>
            <TextComponent type="subDailyText" style={{color:"#1B1EBB",marginTop:6,marginBottom:20}}>Small gentle steps to big shifts.</TextComponent>
            </View>
      </View>
          <View style={{borderColor:"#CC9B2F",borderWidth:1,borderRadius:10,width:"100%"}}>
   <Image
              source={require("../../../assets/decorative_BG.png")}
              style={{ alignSelf:"flex-end" ,width:72,height:72}}
              resizeMode="contain"
            />
            <View style={{marginTop:-70,alignItems:"center"}}>
               <Image
              source={require("../../../assets/DailyBird.png")}
              style={{width:37,height:37,alignSelf:"center" }}
              resizeMode="contain"
            />
            <TextComponent type="DailyboldText" style={{marginVertical:6}}>Start a Growth Path</TextComponent>
            <TextComponent type="subText" style={{textAlign:"center"}}>Follow a guided routine to build consistency over time.</TextComponent>
            <TouchableOpacity onPress={() => navigation.navigate("DailyPracticeList")} style={{backgroundColor:"#CC9B2F",padding:8,borderRadius:5,paddingHorizontal:40,marginTop:12}}>
            <TextComponent type="headerSubBoldText" style={{color:Colors.Colors.white}}>Explore Growth Paths →</TextComponent>
            </TouchableOpacity>
            <TextComponent type="subDailyText" style={{color:"#1B1EBB",marginTop:6,marginBottom:20}}>For long-term personal growth</TextComponent>
            </View>
      </View>
      <TextComponent type="subText" style={{textAlign:"center",marginTop:10}}>This is your journey. You can explore at your own pace.</TextComponent>
      <View style={{backgroundColor:"#F7F0DD",height:2.5,width:"100%",marginTop:10}}/>
      </View>
      </ScrollView>
      {/* </ImageBackground> */}
    </SafeAreaView>
  );
};

export default DailyPracticeLogin;
