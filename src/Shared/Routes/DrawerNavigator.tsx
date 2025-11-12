import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import store from "../../store";
import BottomMenu from "./BottomMenu";

const Drawer = createDrawerNavigator();
const { width } = Dimensions.get("window");



export default function AppDrawerNavigator() {
 

  return (
        <SafeAreaView style={{ flex: 1}}>
    <Drawer.Navigator
      id="MainDrawer"
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        drawerPosition: "right",
        drawerStyle: {
          width: width * 0.55, // 👈 40% of screen width
          backgroundColor: "#fff", // you can make it transparent or gradient if needed
          // borderTopLeftRadius: 20,
          // borderBottomLeftRadius: 20,
          overflow: "hidden",
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {/* 👇 Hidden main tab screen */}
      <Drawer.Screen
        name="HomePage"
        component={BottomMenu}
        options={{
          drawerItemStyle: { display: "none" }, // hides from drawer
        }}
      />

      {/* Drawer Menu Screens */}
      {/* <Drawer.Screen name="Travel" component={TravelPlannerScreen} />
      <Drawer.Screen name="Pooja" component={PoojaScreen} />
      <Drawer.Screen name="Retreat" component={RetreatsScreen} />
      <Drawer.Screen name="Classes" component={OnlineclassesScreen} /> */}
    </Drawer.Navigator>
    </SafeAreaView>
  );
}

const CustomDrawerContent = (props: any) => {
   const { t } = useTranslation();

  const categories = [
    {
      id: "1",
      name: t("categories.dharma"),
      title: "Dharma",
      event_type: "click_dharma_card",
      component: "Dharma-card",
      icon: require("../../../assets/Group.png"),
    },
    {
      id: "2",
      name: t("categories.explore"),
      title: "Explore",
      event_type: "click_explore_card",
      component: "Explore-card",
      icon: require("../../../assets/Exploreicon.png"),
    },
    {
      id: "3",
      name: t("categories.travel"),
      title: "Travel",
      event_type: "click_travel_card",
      component: "Travel-card",
      icon: require("../../../assets/darma.png"),
    },
    {
      id: "4",
      name: t("categories.pooja"),
      title: "Pooja",
      event_type: "click_pooja_card",
      component: "Pooja-card",
      icon: require("../../../assets/pooja.png"),
    },
    {
      id: "5",
      name: t("categories.retreat"),
      title: "Retreat",
      event_type: "click_retreat_card",
      component: "Retreat-card",
      icon: require("../../../assets/yoga.png"),
    },
    {
      id: "6",
      name: t("categories.classes"),
      title: "ClassesScreen",
      event_type: "click_classes_card",
      component: "Classes-card",
      icon: require("../../../assets/onlinecion.png"),
    },
  ];

 const handleLogout = async () => {
  await AsyncStorage.clear();
  store.dispatch({ type: "RESET_APP" });
await GoogleSignin.signOut();
await GoogleSignin.revokeAccess();
  const parentNav = props.navigation.getParent();
  parentNav?.reset({
    index: 0,
    routes: [{ name: "Welcome" }],
  });
};

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={{ flexDirection: "row", alignItems: "center", padding: 12 }}
      onPress={() => {
        props.navigation.navigate(item.title);
        props.navigation.closeDrawer();
      }}
    >
      <Image source={item.icon} style={{ width: 24, height: 24, marginRight: 15 }} />
      <Text  allowFontScaling={false} style={{ fontSize: 16, color: "#000" }}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      {/* Close button */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 20 }}>
        <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Drawer items */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
{/* <TextComponent Type="boldText" style={{ fontSize: FontSize.CONSTS.FS_20,color:Colors.Colors.App_theme}}>LogOut</TextComponent> */}
      {/* Optional footer */}
      <View
  style={{
    borderTopWidth: 1,
    borderColor: "#eee",
    marginTop: 20,
    paddingTop: 15,
    alignItems:"center"
  }}
>
  <TouchableOpacity
    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}
     onPress={() =>{handleLogout()}}
  >
    <Ionicons name="log-out-outline" size={22} color="red" />
    <Text  allowFontScaling={false} style={{ marginLeft: 10, color: "red", fontSize: 16 }}>Logout</Text>
  </TouchableOpacity>
</View>
      <View style={{ marginTop: "auto", borderTopWidth: 1, borderColor: "#eee", paddingTop: 15 }}>
        <Text  allowFontScaling={false} style={{ textAlign: "center", color: "#999", fontSize: 12 }}>© 2025 Your App</Text>
      </View>
    </View>
  );
};

// const CustomDrawerContent = (props: any) => {
//   return (
//     <DrawerContentScrollView
//       {...props}
//       contentContainerStyle={{ flex: 1, paddingHorizontal: 15 }}
//     >
//       {/* Header with close button */}
//       <View
//         style={{
//           flexDirection: "row",
//           justifyContent: "flex-end",
//           marginBottom: 20,
//         }}
//       >
//         <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
//           <Ionicons name="close" size={28} color="#000" />
//         </TouchableOpacity>
//       </View>

//       {/* Drawer items */}
//       <DrawerItemList {...props} />

//       {/* Optional footer */}
//       <View
//         style={{
//           marginTop: "auto",
//           borderTopWidth: 1,
//           borderColor: "#eee",
//           paddingTop: 15,
//         }}
//       >
//         <Text style={{ textAlign: "center", color: "#999", fontSize: 12 }}>
//           © 2025 Your App
//         </Text>
//       </View>
//     </DrawerContentScrollView>
//   );
// };

