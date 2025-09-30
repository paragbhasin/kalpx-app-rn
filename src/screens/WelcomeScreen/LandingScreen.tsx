import { useTranslation } from "react-i18next";
import {
    ImageBackground,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import styles from "./styles";

export default function LandingScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f1ebdf"
      />
      <ImageBackground
          source={require("../../../assets/hoomepagebg.jpg")}
        style={styles.image}
        resizeMode="contain"
      >

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{t("welcome.getStarted")}</Text>
      </TouchableOpacity>

      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.skipText}>{t("welcome.skip")}</Text>
        </TouchableOpacity>
      </View>
      </ImageBackground>
    </View>
  );
}


