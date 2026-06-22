/**
 * ProgramCodeEntryRow — Gate 3 MOB-2.
 *
 * Decision 10: "Have an invite code?" always visible on Home when
 * the user has no active program. Shown without any interaction.
 *
 * On submit: navigates to ProgramInviteClaimScreen with code pre-filled.
 */
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fonts } from "../../theme/fonts";

export default function ProgramCodeEntryRow() {
  const navigation = useNavigation<any>();
  const [code, setCode] = useState("");

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    Keyboard.dismiss();
    if (trimmed) {
      await AsyncStorage.setItem("pending_program_code", trimmed);
      await AsyncStorage.setItem("pending_program_source", "home");
      navigation.navigate("ProgramInviteClaimScreen" as any, {
        code: trimmed,
        source: "home",
      });
    } else {
      // Empty tap → just open claim screen for manual entry
      navigation.navigate("ProgramInviteClaimScreen" as any, { source: "home" });
    }
  };

  return (
    <View style={styles.container} accessibilityLabel="Have an invite code?">
      <Text style={styles.label}>Have an invite code?</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="Enter code"
          placeholderTextColor="#9A7548"
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={handleJoin}
          accessibilityLabel="Invite code"
        />
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleJoin}
          style={styles.joinBtn}
          accessibilityLabel="Join with invite code"
        >
          <Text style={styles.joinBtnText}>Join</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    backgroundColor: "#FFF8EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    gap: 8,
  },
  label: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#7B6545",
  },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: {
    flex: 1,
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    letterSpacing: 0.06,
    color: "#432104",
    backgroundColor: "#FAF7F2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  joinBtn: {
    backgroundColor: "#C99317",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  joinBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 14,
    color: "#fff",
  },
});
