import React from "react";
import { Image, StyleSheet, View } from "react-native";
import Colors from "./Colors";
import FontSize from "./FontSize";
const  Header = ()=>  {
  return (
    <View style={styles.sectionWrap}>
      <Image source={require("../../assets/KalpXlogo.png")} resizeMode="contain" style={{width:100,height:40}}/>
      {/* <TextComponent type='mediumText' style={styles.sectionTitle}>Kalpx</TextComponent> */}
      {/* <View style={{flexDirection:"row",alignItems:"center",marginRight:12}}> */}
      {/* <Image source={require("../../assets/notifications.png")} resizeMode="cover" style={{marginRight:12}}/>
      <Image source={require("../../assets/menu.png")} resizeMode="cover" /> */}
      {/* </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrap: {
    backgroundColor:Colors.Colors.header_bg,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    paddingVertical:6,
    paddingHorizontal:16
  },
  sectionTitle: {
        color: Colors.Colors.App_theme,
        fontSize: FontSize.CONSTS.FS_30,
  },
});

export default Header;

