import { useTranslation } from "react-i18next";
import {
  ImageBackground,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import styles from "./styles";

export default function WelcomeScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f1ebdf"
      />
      <ImageBackground
        source={require("../../../assets/kalpx-Recovered.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("LandingScreen")}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{t("welcome.getStarted")}</Text>
      </TouchableOpacity>

      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("LandingScreen")}>
          <Text style={styles.skipText}>{t("welcome.skip")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


