import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { Linking } from "react-native";

const Privacy = () => {
  const navigation = useNavigation();

  useEffect(() => {
    Linking.openURL("https://kalpx.com/en/privacy");
    navigation.goBack();
  }, [navigation]);

  return null;
};

export default Privacy;
